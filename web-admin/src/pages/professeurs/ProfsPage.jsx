import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function ProfsPage() {
  const [profs, setProfs] = useState([]);
  const [filteredProfs, setFilteredProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfs();
  }, []);

  const fetchProfs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professeurs');
      setProfs(response.data);
      setFilteredProfs(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des professeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredProfs(profs);
      setCurrentPage(1);
      return;
    }

    const filtered = profs.filter(
      (p) =>
        p.Nom_Prof?.toLowerCase().includes(query.toLowerCase()) ||
        p.Prenom_Prof?.toLowerCase().includes(query.toLowerCase()) ||
        p.Email_Prof?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProfs(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredProfs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProfs.length / itemsPerPage);

  const handleAdd = () => {
    setSelectedProf(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (prof) => {
    setSelectedProf(prof);
    setFormData(prof);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur?')) {
      try {
        await api.delete(`/professeurs/${id}`);
        toast.success('Professeur supprimé');
        fetchProfs();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedProf) {
        await api.put(`/professeurs/${selectedProf.Id_Prof}`, formData);
        toast.success('Professeur modifié');
      } else {
        await api.post('/professeurs', formData);
        toast.success('Professeur ajouté');
      }
      setShowModal(false);
      fetchProfs();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const columns = [
    { key: 'Nom_Prof', label: 'Nom' },
    { key: 'Prenom_Prof', label: 'Prénom' },
    { key: 'Email_Prof', label: 'Email' },
    { key: 'Matière_Prof', label: 'Matière' },
    { key: 'Telephone_Prof', label: 'Téléphone' },
  ];

  if (loading)
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Chargement...</div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Professeurs</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter professeur
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom ou email..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={paginatedData}
          actions={(row) => (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(row.Id_Prof)}
                className="text-red-600 hover:text-red-800 text-sm ml-2"
              >
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={showModal}
        title={selectedProf ? 'Modifier professeur' : 'Ajouter professeur'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            value={formData.Nom_Prof || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Prof: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Prénom"
            value={formData.Prenom_Prof || ''}
            onChange={(e) => setFormData({ ...formData, Prenom_Prof: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.Email_Prof || ''}
            onChange={(e) => setFormData({ ...formData, Email_Prof: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Matière enseignée"
            value={formData.Matière_Prof || ''}
            onChange={(e) => setFormData({ ...formData, Matière_Prof: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={formData.Telephone_Prof || ''}
            onChange={(e) => setFormData({ ...formData, Telephone_Prof: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
