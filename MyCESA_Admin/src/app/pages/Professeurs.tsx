import { useState } from 'react';
import { Plus, Search, Mail, Phone, Users, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { professeursService } from '../../services';
import CrudModal from '../components/CrudModal';

export default function Professeurs() {
  const { data: professeurs, loading, error, reload } = useApiData<any[]>(professeursService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProfesseurs = professeurs.filter(prof =>
    [prof.nom, prof.email, prof.telephone, prof.quartier].some((value) => String(value || '').toLowerCase().includes(normalizedQuery))
  );

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (prof: any) => { setEditing(prof); setSubmitError(''); setModal('edit'); };
  const saveProfesseur = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      if (!values.nom.trim()) throw new Error('Le nom du professeur est obligatoire.');
      const payload = { nom: values.nom.trim(), telephone: values.telephone.trim(), quartier: values.quartier.trim(), email: values.email.trim(), dateNaissance: values.dateNaissance || null };
      if (modal === 'edit') await professeursService.update(editing.id, payload); else await professeursService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer le professeur.'); }
    finally { setSubmitting(false); }
  };
  const removeProfesseur = async (prof: any) => {
    if (!window.confirm(`Supprimer le professeur « ${prof.nom} » ?`)) return;
    try { await professeursService.delete(prof.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer le professeur.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Professeurs</h1>
          <p className="mt-2 text-gray-600">Gérez le personnel enseignant</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouveau professeur
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total professeurs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{professeurs.length}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec email</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {professeurs.filter(p => p.email).length}
              </p>
            </div>
            <Mail className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12 text-gray-500">Chargement...</div>
        ) : filteredProfesseurs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun professeur trouvé</p>
          </div>
        ) : (
          filteredProfesseurs.map((prof) => (
            <div key={prof.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {prof.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{prof.nom}</h3>
                    <p className="text-sm text-gray-500">{prof.email || 'Sans email'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {prof.telephone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {prof.telephone}
                    </div>
                  )}
                  {prof.quartier && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      {prof.quartier}
                    </div>
                  )}
                  {prof.matieres && prof.matieres.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Matières:</p>
                      <div className="flex flex-wrap gap-1">
                        {prof.matieres.map((m, i) => (
                          <span key={i} className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {m.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2 border-t border-gray-200 pt-3">
                  <button type="button" onClick={() => openEdit(prof)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"><Edit className="h-4 w-4" />Modifier</button>
                  <button type="button" onClick={() => removeProfesseur(prof)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" />Supprimer</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {modal && <CrudModal
        title={modal === 'edit' ? 'Modifier le professeur' : 'Nouveau professeur'}
        initialValues={{ nom: editing?.nom || '', telephone: editing?.telephone || '', quartier: editing?.quartier || '', email: editing?.email || '', dateNaissance: editing?.dateNaissance || '' }}
        fields={[
          { name: 'nom', label: 'Nom et prénoms', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'telephone', label: 'Téléphone' },
          { name: 'quartier', label: 'Quartier' },
          { name: 'dateNaissance', label: 'Date de naissance', type: 'text', placeholder: 'AAAA-MM-JJ' },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveProfesseur}
      />}
    </div>
  );
}