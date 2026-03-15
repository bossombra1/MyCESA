import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      setClasses(response.data);
      setFilteredClasses(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredClasses(classes);
      return;
    }

    const filtered = classes.filter(
      (c) =>
        c.Nom_Classe?.toLowerCase().includes(query.toLowerCase()) ||
        c.Filière_Classe?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const handleAdd = () => {
    setSelectedClass(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (classe) => {
    setSelectedClass(classe);
    setFormData(classe);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe?')) {
      try {
        await api.delete(`/classes/${id}`);
        toast.success('Classe supprimée');
        fetchClasses();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (selectedClass) {
        await api.put(`/classes/${selectedClass.Id_Classe}`, formData);
        toast.success('Classe modifiée');
      } else {
        await api.post('/classes', formData);
        toast.success('Classe ajoutée');
      }
      setShowModal(false);
      fetchClasses();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const columns = [
    { key: 'Nom_Classe', label: 'Nom' },
    { key: 'Filière_Classe', label: 'Filière' },
    { key: 'Cycle_Classe', label: 'Cycle' },
    { key: 'Effectif_Classe', label: 'Effectif' },
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
        <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Ajouter classe
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom ou filière..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredClasses}
          actions={(row) => (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(row.Id_Classe)}
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
        title={selectedClass ? 'Modifier classe' : 'Ajouter classe'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom de classe"
            value={formData.Nom_Classe || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Classe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Filière"
            value={formData.Filière_Classe || ''}
            onChange={(e) => setFormData({ ...formData, Filière_Classe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Cycle"
            value={formData.Cycle_Classe || ''}
            onChange={(e) => setFormData({ ...formData, Cycle_Classe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Effectif"
            value={formData.Effectif_Classe || ''}
            onChange={(e) => setFormData({ ...formData, Effectif_Classe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
