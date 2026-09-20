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
      (m) => m.Nom_Matiere?.toLowerCase().includes(query.toLowerCase())
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
        await api.put(`/matieres/${selectedMatiere.Id_MATIERE}`, formData);
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
    { key: 'Id_MATIERE', label: 'ID' },
    { key: 'Nom_Matiere', label: 'Nom de la matière' },
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
          className="px-6 py-2 text-white rounded-lg font-semibold shadow-md"
          style={{ background: '#2E7D32' }}
        >
          + Ajouter matière
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredMatieres}
          actions={(row) => (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="font-semibold text-sm transition-colors"
                style={{ color: '#2E7D32' }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(row.Id_MATIERE)}
                className="font-semibold text-sm ml-2"
                style={{ color: '#D84315' }}
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
        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nom de la matière</label>
            <input
              type="text"
              placeholder="Ex: Mathématiques"
              value={formData.Nom_Matiere || ''}
              onChange={(e) => setFormData({ ...formData, Nom_Matiere: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}