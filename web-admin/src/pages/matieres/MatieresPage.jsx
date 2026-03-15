import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function MatieresPage() {
  const [matieres, setMatieres] = useState([]);
  const [filteredMatieres, setFilteredMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matieres');
      setMatieres(response.data);
      setFilteredMatieres(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des matières');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredMatieres(matieres);
      return;
    }

    const filtered = matieres.filter(
      (m) =>
        m.Nom_Matière?.toLowerCase().includes(query.toLowerCase()) ||
        m.Code_Matière?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMatieres(filtered);
  };

  const handleAdd = () => {
    setSelectedMatiere(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (matiere) => {
    setSelectedMatiere(matiere);
    setFormData(matiere);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière?')) {
      try {
        await api.delete(`/matieres/${id}`);
        toast.success('Matière supprimée');
        fetchMatieres();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedMatiere) {
        await api.put(`/matieres/${selectedMatiere.Id_Matière}`, formData);
        toast.success('Matière modifiée');
      } else {
        await api.post('/matieres', formData);
        toast.success('Matière ajoutée');
      }
      setShowModal(false);
      fetchMatieres();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const columns = [
    { key: 'Code_Matière', label: 'Code' },
    { key: 'Nom_Matière', label: 'Nom' },
    { key: 'Coefficient_Matière', label: 'Coefficient' },
    { key: 'Volume_Horaire', label: 'Volume horaire' },
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
        <h1 className="text-3xl font-bold text-gray-900">Matières</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter matière
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom ou code..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredMatieres}
          actions={(row) => (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(row.Id_Matière)}
                className="text-red-600 hover:text-red-800 text-sm ml-2"
              >
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={showModal}
        title={selectedMatiere ? 'Modifier matière' : 'Ajouter matière'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Code matière"
            value={formData.Code_Matière || ''}
            onChange={(e) => setFormData({ ...formData, Code_Matière: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Nom de la matière"
            value={formData.Nom_Matière || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Matière: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Coefficient"
            value={formData.Coefficient_Matière || ''}
            onChange={(e) => setFormData({ ...formData, Coefficient_Matière: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Volume horaire"
            value={formData.Volume_Horaire || ''}
            onChange={(e) => setFormData({ ...formData, Volume_Horaire: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
