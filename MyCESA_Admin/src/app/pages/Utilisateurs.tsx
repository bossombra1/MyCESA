import { useState } from 'react';
import { Plus, Search, Users, Shield, Lock, Edit, Trash2 } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import UtilisateurFormModal from '../components/UtilisateurFormModal';
import { profilsLiablesService, utilisateursService } from '../../services';

export default function Utilisateurs() {
  const { data: utilisateurs, loading, error, reload } = useApiData<any[]>(utilisateursService.getAll, []);
  const { data: profilsLiables } = useApiData<any>(profilsLiablesService.getAll, { professeurs: [], etudiants: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUtilisateurs = utilisateurs.filter(user =>
    [user.nom, user.login, user.email, user.role].some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
  );

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (user: any) => { setEditing(user); setSubmitError(''); setModal('edit'); };
  const saveUser = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      const payload = { nom: values.nom, login: values.login, email: values.email, password: values.password, roleId: values.roleId ? Number(values.roleId) : 1 };
      if (modal === 'edit') await utilisateursService.update(editing.id, payload); else await utilisateursService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer l’utilisateur.'); }
    finally { setSubmitting(false); }
  };
  const removeUser = async (user: any) => {
    if (!window.confirm(`Supprimer l’utilisateur « ${user.nom} » ?`)) return;
    try { await utilisateursService.delete(user.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer l’utilisateur.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-2 text-gray-600">Gérez les comptes et permissions</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvel utilisateur
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec email</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{utilisateurs.filter(u => u.email).length}</p>
            </div>
            <Lock className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, login ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Chargement...
                  </div>
                </td>
              </tr>
            ) : filteredUtilisateurs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun utilisateur trouvé</p>
                </td>
              </tr>
            ) : (
              filteredUtilisateurs.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.login}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Administrateur'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(user)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label="Modifier"><Edit className="h-4 w-4" /></button>
                      <button type="button" onClick={() => removeUser(user)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {modal && <UtilisateurFormModal
        mode={modal}
        user={editing}
        profilsLiables={profilsLiables}
        utilisateurs={utilisateurs}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveUser}
      />}
    </div>
  );
}