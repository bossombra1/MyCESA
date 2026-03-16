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
      const [etudiantsRes, classesRes] = await Promise.all([
        api.get('/etudiants'),
        api.get('/classes'),
      ]);
      setEtudiants(etudiantsRes.data);
      setFilteredEtudiants(etudiantsRes.data);
      setClasses(classesRes.data);
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
    { key: 'Email_Etudiant', label: 'Email' },
    { key: 'Nom_Classe', label: 'Classe' },
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
        <div className="space-y-4">
          <input type="text" placeholder="Matricule"
            value={formData.Matricule_Etudiant || ''}
            onChange={(e) => setFormData({ ...formData, Matricule_Etudiant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Nom"
            value={formData.Nom_Etudiant || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Etudiant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Prénoms"
            value={formData.Prenoms_Etudiant || ''}
            onChange={(e) => setFormData({ ...formData, Prenoms_Etudiant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="email" placeholder="Email"
            value={formData.Email_Etudiant || ''}
            onChange={(e) => setFormData({ ...formData, Email_Etudiant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="tel" placeholder="Téléphone"
            value={formData.Tel_Etudiant || ''}
            onChange={(e) => setFormData({ ...formData, Tel_Etudiant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <select value={formData.Id_CLASSE || ''}
            onChange={(e) => setFormData({ ...formData, Id_CLASSE: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Sélectionner une classe</option>
            {classes.map(c => <option key={c.Id_CLASSE} value={c.Id_CLASSE}>{c.Nom_Classe}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}