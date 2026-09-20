import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, GraduationCap } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { classesService, etudiantsService, filieresService } from '../../services';
import CrudModal from '../components/CrudModal';

export default function Etudiants() {
  const { data: etudiants, loading, error, reload } = useApiData<any[]>(etudiantsService.getAll, []);
  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieresDisponibles } = useApiData<any[]>(filieresService.getAll, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('Tous');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filieres = Array.from(new Set(etudiants.map((etudiant) => etudiant.filiere).filter(Boolean))).sort();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = [etudiant.nom, etudiant.prenoms, etudiant.matricule, etudiant.email, etudiant.telephone]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesFiliere = selectedFiliere === 'Tous' || etudiant.filiere === selectedFiliere;
    return matchesSearch && matchesFiliere;
  });

  const openCreate = () => { setEditing(null); setSubmitError(''); setModal('create'); };
  const openEdit = (etudiant: any) => { setEditing(etudiant); setSubmitError(''); setModal('edit'); };
  const saveEtudiant = async (values: Record<string, string>) => {
    setSubmitting(true); setSubmitError('');
    try {
      // Validation alignee sur EtudiantController@store (Laravel) :
      // matricule, nom, prenoms, genre, email et classe/filiere sont requis.
      if (!values.matricule.trim()) throw new Error('Le matricule est obligatoire.');
      if (!values.nom.trim()) throw new Error('Le nom est obligatoire.');
      if (!values.prenoms.trim()) throw new Error('Les prénoms sont obligatoires.');
      if (!values.genre) throw new Error('Le genre est obligatoire.');
      if (!values.email.trim()) throw new Error('L’email est obligatoire.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) throw new Error('L’adresse email n’est pas valide.');
      if (!values.classeId) throw new Error('La classe est obligatoire.');
      if (!values.filiereId) throw new Error('La filière est obligatoire.');
      const payload = {
        matricule: values.matricule.trim(),
        nom: values.nom.trim(),
        prenoms: values.prenoms.trim(),
        genre: values.genre || null,
        telephone: values.telephone.trim() || null,
        email: values.email.trim() || null,
        dateNaissance: values.dateNaissance || null,
        lieuNaissance: values.lieuNaissance.trim() || null,
        quartier: values.quartier.trim() || null,
        classeId: values.classeId ? Number(values.classeId) : null,
        filiereId: values.filiereId ? Number(values.filiereId) : null,
      };
      if (modal === 'edit') await etudiantsService.update(editing.id, payload); else await etudiantsService.create(payload);
      setModal(null); await reload();
    } catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || requestError?.message || 'Impossible d’enregistrer l’étudiant.'); }
    finally { setSubmitting(false); }
  };
  const removeEtudiant = async (etudiant: any) => {
    if (!window.confirm(`Supprimer l’étudiant « ${etudiant.nom} ${etudiant.prenoms} » ?`)) return;
    try { await etudiantsService.delete(etudiant.id); await reload(); }
    catch (requestError: any) { setSubmitError(requestError?.response?.data?.error || 'Impossible de supprimer l’étudiant.'); }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Étudiants</h1>
          <p className="mt-2 text-gray-600">Gérez les informations des étudiants inscrits</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvel étudiant
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total étudiants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{etudiants.length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Étudiants actifs</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{etudiants.filter(e => e.classeId).length}</p>
            </div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec filière</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{etudiants.filter(e => e.filiereId).length}</p>
            </div>
            <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou matricule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedFiliere}
              onChange={(e) => setSelectedFiliere(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              {filieres.map((filiere) => <option key={filiere}>{filiere}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des étudiants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Filière / Classe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEtudiants.map((etudiant) => (
                <tr key={etudiant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {etudiant.nom.charAt(0)}{etudiant.prenoms.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{etudiant.nom} {etudiant.prenoms}</div>
                        <div className="text-sm text-gray-500">{etudiant.genre || 'Genre non renseigné'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900">{etudiant.matricule}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{etudiant.filiere}</div>
                    <div className="text-sm text-gray-500">{etudiant.classe}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {etudiant.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {etudiant.telephone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(etudiant)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Modifier">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => removeEtudiant(etudiant)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEtudiants.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
      {modal && <CrudModal
        key={modal}
        title={modal === 'edit' ? 'Modifier l’étudiant' : 'Nouvel étudiant'}
        initialValues={{
          matricule: editing?.matricule || '',
          nom: editing?.nom || '',
          prenoms: editing?.prenoms || '',
          genre: editing?.genre || '',
          telephone: editing?.telephone || '',
          email: editing?.email || '',
          dateNaissance: editing?.dateNaissance || '',
          lieuNaissance: editing?.lieuNaissance || '',
          quartier: editing?.quartier || '',
          classeId: String(editing?.classeId || ''),
          filiereId: String(editing?.filiereId || ''),
        }}
        fields={[
          { name: 'matricule', label: 'Matricule *', required: true, disabled: modal === 'edit', placeholder: 'Ex : ETU2026001' },
          { name: 'genre', label: 'Genre *', type: 'select', required: true, options: [{ value: 'Masculin', label: 'Masculin' }, { value: 'Feminin', label: 'Féminin' }] },
          { name: 'nom', label: 'Nom *', required: true },
          { name: 'prenoms', label: 'Prénoms *', required: true },
          { name: 'dateNaissance', label: 'Date de naissance', type: 'date' },
          { name: 'lieuNaissance', label: 'Lieu de naissance', placeholder: 'Ex : Abidjan' },
          { name: 'quartier', label: 'Quartier', placeholder: 'Ex : Cocody' },
          { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'Ex : etudiant@mycesa.ci' },
          { name: 'telephone', label: 'Téléphone', placeholder: 'Ex : 0701020304' },
          { name: 'classeId', label: 'Classe *', type: 'select', required: true, options: classes.map((classe) => ({ value: String(classe.id), label: classe.nom })) },
          { name: 'filiereId', label: 'Filière *', type: 'select', required: true, options: filieresDisponibles.map((filiere) => ({ value: String(filiere.id), label: filiere.nom })) },
        ]}
        error={submitError}
        submitting={submitting}
        onClose={() => setModal(null)}
        onSubmit={saveEtudiant}
      />}
    </div>
  );
}
