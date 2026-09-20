import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function EtudiantsPage() {
  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [etudiantsRes, classesRes, cyclesRes, filieresRes] = await Promise.all([
        api.get('/etudiants'),
        api.get('/classes'),
        api.get('/cycles'),
        api.get('/filieres'),
      ]);
      setEtudiants(etudiantsRes.data);
      setFilteredEtudiants(etudiantsRes.data);
      setClasses(classesRes.data);
      setCycles(cyclesRes.data || []);
      setFilieres(filieresRes.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) { setFilteredEtudiants(etudiants); setCurrentPage(1); return; }
    const filtered = etudiants.filter(
      (e) =>
        e.Nom_Etudiant?.toLowerCase().includes(query.toLowerCase()) ||
        e.Prenoms_Etudiant?.toLowerCase().includes(query.toLowerCase()) ||
        e.Matricule_Etudiant?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEtudiants(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredEtudiants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage);

  const handleAdd = () => { setSelectedEtudiant(null); setFormData({}); setShowModal(true); };
  const handleEdit = (e) => { setSelectedEtudiant(e); setFormData(e); setShowModal(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      try {
        await api.delete(`/etudiants/${id}`);
        toast.success('Étudiant supprimé');
        fetchAll();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedEtudiant) {
        await api.put(`/etudiants/${selectedEtudiant.Id_ETUDIANT}`, formData);
        toast.success('Étudiant modifié');
      } else {
        await api.post('/etudiants', formData);
        toast.success('Étudiant ajouté');
      }
      setShowModal(false);
      fetchAll();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const columns = [
    { key: 'Matricule_Etudiant', label: 'Matricule' },
    { key: 'Nom_Etudiant', label: 'Nom' },
    { key: 'Prenoms_Etudiant', label: 'Prénoms' },
    { key: 'Genre_Etudiant', label: 'Genre' },
    { key: 'Email_Etudiant', label: 'Email' },
    { key: 'Tel_Etudiant', label: 'Téléphone' },
    { key: 'Quartier_Etudiant', label: 'Quartier' },
    { key: 'Nom_Classe', label: 'Classe' },
    { key: 'Nom_Filiere', label: 'Filière' },
    { key: 'Lib_Cycle', label: 'Cycle' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Étudiants</h1>
        <button onClick={handleAdd}
          className="px-6 py-2 text-white rounded-lg font-semibold shadow-md"
          style={{ background: '#2E7D32' }}>
          + Ajouter étudiant
        </button>
      </div>
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom ou matricule..." />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={paginatedData}
          actions={(row) => (
            <>
              <button onClick={() => handleEdit(row)}
                className="font-semibold text-sm" style={{ color: '#2E7D32' }}>
                ✏️ Modifier
              </button>
              <button onClick={() => handleDelete(row.Id_ETUDIANT)}
                className="font-semibold text-sm ml-2" style={{ color: '#D84315' }}>
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <Modal isOpen={showModal}
        title={selectedEtudiant ? 'Modifier étudiant' : 'Ajouter étudiant'}
        onClose={() => setShowModal(false)} onSubmit={handleSave}>
        <div className="max-h-96 overflow-y-auto space-y-6 p-2">
          {/* Section Identité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">👤 Identité</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Matricule</label>
                <input type="text" placeholder="Matricule"
                  value={formData.Matricule_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Matricule_Etudiant: e.target.value })}
                  disabled={selectedEtudiant}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Genre</label>
                <select value={formData.Genre_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Genre_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Sélectionner</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                <input type="text" placeholder="Nom de l'étudiant"
                  value={formData.Nom_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Nom_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Prénoms</label>
                <input type="text" placeholder="Prénoms"
                  value={formData.Prenoms_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Prenoms_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">📞 Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" placeholder="Email"
                  value={formData.Email_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Email_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
                <input type="tel" placeholder="+243 ..."
                  value={formData.Tel_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Tel_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Quartier</label>
                <input type="text" placeholder="Quartier de résidence"
                  value={formData.Quartier_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Quartier_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section Naissance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">🎂 Naissance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de naissance</label>
                <input type="date"
                  value={formData.Date_Naissance_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Date_Naissance_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Lieu de naissance</label>
                <input type="text" placeholder="Ville/Région"
                  value={formData.Lieu_Naissance_Etudiant || ''}
                  onChange={(e) => setFormData({ ...formData, Lieu_Naissance_Etudiant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Section Académique */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-300">🎓 Académique</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cycle</label>
                <select value={formData.Id_CYCLE || ''}
                  onChange={(e) => setFormData({ ...formData, Id_CYCLE: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Sélectionner un cycle</option>
                  {cycles.map(cyc => <option key={cyc.Id_CYCLE} value={cyc.Id_CYCLE}>{cyc.Lib_Cycle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Filière</label>
                <select value={formData.Id_FILIERE || ''}
                  onChange={(e) => setFormData({ ...formData, Id_FILIERE: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Sélectionner une filière</option>
                  {filieres.map(fil => <option key={fil.Id_FILIERE} value={fil.Id_FILIERE}>{fil.Nom_Filiere}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Classe</label>
                <select value={formData.Id_CLASSE || ''}
                  onChange={(e) => setFormData({ ...formData, Id_CLASSE: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => <option key={c.Id_CLASSE} value={c.Id_CLASSE}>{c.Nom_Classe}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}