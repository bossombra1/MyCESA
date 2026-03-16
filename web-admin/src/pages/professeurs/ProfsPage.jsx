import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function ProfsPage() {
  const [profs, setProfs] = useState([]);
  const [filteredProfs, setFilteredProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchProfs(); }, []);

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
    if (!query) { setFilteredProfs(profs); return; }
    const filtered = profs.filter(
      (p) =>
        p.Nom_Prenoms_Profe?.toLowerCase().includes(query.toLowerCase()) ||
        p.email_Profe?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProfs(filtered);
  };

  const handleAdd = () => { setSelectedProf(null); setFormData({}); setShowModal(true); };
  const handleEdit = (prof) => { setSelectedProf(prof); setFormData(prof); setShowModal(true); };

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
        await api.put(`/professeurs/${selectedProf.Id_PROFESSEUR}`, formData);
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
  { key: 'Nom_Prenoms_Profe', label: 'Nom & Prénoms' },
  { key: 'email_Profe', label: 'Email' },
  { key: 'Tel_Profe', label: 'Téléphone' },
  { key: 'Quartier_Profe', label: 'Quartier' },
  { key: 'Matieres', label: 'Matières enseignées' },
];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Professeurs</h1>
        <button onClick={handleAdd} className="px-6 py-2 text-white rounded-lg font-semibold shadow-md"
          style={{ background: '#2E7D32' }}>
          + Ajouter professeur
        </button>
      </div>
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom ou email..." />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredProfs}
          actions={(row) => (
            <>
              <button onClick={() => handleEdit(row)} className="font-semibold text-sm" style={{ color: '#2E7D32' }}>
                ✏️ Modifier
              </button>
              <button onClick={() => handleDelete(row.Id_PROFESSEUR)} className="font-semibold text-sm ml-2" style={{ color: '#D84315' }}>
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>
      <Modal isOpen={showModal} title={selectedProf ? 'Modifier professeur' : 'Ajouter professeur'}
        onClose={() => setShowModal(false)} onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nom et prénoms</label>
            <input type="text" placeholder="Ex: Jean Martin"
              value={formData.Nom_Prenoms_Profe || ''}
              onChange={(e) => setFormData({ ...formData, Nom_Prenoms_Profe: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Email</label>
            <input type="email" placeholder="jean.martin@example.com"
              value={formData.email_Profe || ''}
              onChange={(e) => setFormData({ ...formData, email_Profe: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Téléphone</label>
            <input type="tel" placeholder="N° de téléphone"
              value={formData.Tel_Profe || ''}
              onChange={(e) => setFormData({ ...formData, Tel_Profe: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Quartier</label>
            <input type="text" placeholder="Quartier de résidence"
              value={formData.Quartier_Profe || ''}
              onChange={(e) => setFormData({ ...formData, Quartier_Profe: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}