import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchUtilisateurs(); }, []);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/utilisateurs');
      setUtilisateurs(response.data);
      setFilteredUtilisateurs(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) { setFilteredUtilisateurs(utilisateurs); return; }
    const filtered = utilisateurs.filter(
      (u) =>
        u.Login_User?.toLowerCase().includes(query.toLowerCase()) ||
        u.Email_User?.toLowerCase().includes(query.toLowerCase()) ||
        u.Nom_User?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUtilisateurs(filtered);
  };

  const handleAdd = () => { setSelectedUser(null); setFormData({}); setShowModal(true); };
  const handleEdit = (user) => { setSelectedUser(user); setFormData(user); setShowModal(true); };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await api.delete(`/utilisateurs/${id}`);
        toast.success('Utilisateur supprimé');
        fetchUtilisateurs();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await api.post(`/utilisateurs/${id}/reset-password`);
      toast.success('Mot de passe réinitialisé à 123456');
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleSave = async () => {
    try {
      if (selectedUser) {
        await api.put(`/utilisateurs/${selectedUser.Id_UTILISATEUR}`, formData);
        toast.success('Utilisateur modifié');
      } else {
        await api.post('/utilisateurs', formData);
        toast.success('Utilisateur ajouté');
      }
      setShowModal(false);
      fetchUtilisateurs();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getRoleBadge = (role, libRole) => {
    const roleMap = { 1: 'danger', 2: 'warning', 3: 'info', 4: 'success' };
    return <Badge variant={roleMap[role] || 'default'}>{libRole || 'Inconnu'}</Badge>;
  };

  const columns = [
    { key: 'Nom_User', label: 'Nom complet' },
    { key: 'Login_User', label: 'Identifiant' },
    { key: 'Email_User', label: 'Email' },
    { key: 'Id_ROLE', label: 'Rôle', render: (row) => getRoleBadge(row.Id_ROLE, row.Lib_Role) },
  ];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
        <button onClick={handleAdd}
          className="px-6 py-2 text-white rounded-lg font-semibold shadow-md"
          style={{ background: '#2E7D32' }}>
          + Ajouter utilisateur
        </button>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par nom, identifiant ou email..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredUtilisateurs}
          actions={(row) => (
            <>
              <button onClick={() => handleEdit(row)}
                className="font-semibold text-sm" style={{ color: '#2E7D32' }}>
                ✏️ Modifier
              </button>
              <button onClick={() => handleResetPassword(row.Id_UTILISATEUR)}
                className="font-semibold text-sm ml-2" style={{ color: '#F59E0B' }}>
                🔑 Reset
              </button>
              <button onClick={() => handleDelete(row.Id_UTILISATEUR)}
                className="font-semibold text-sm ml-2" style={{ color: '#D84315' }}>
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={showModal}
        title={selectedUser ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
      >
        <div className="space-y-4">
          <input type="text" placeholder="Nom complet"
            value={formData.Nom_User || ''}
            onChange={(e) => setFormData({ ...formData, Nom_User: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Identifiant (login)"
            value={formData.Login_User || ''}
            onChange={(e) => setFormData({ ...formData, Login_User: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="email" placeholder="Email"
            value={formData.Email_User || ''}
            onChange={(e) => setFormData({ ...formData, Email_User: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          {!selectedUser && (
            <input type="password" placeholder="Mot de passe"
              value={formData.Password_User || ''}
              onChange={(e) => setFormData({ ...formData, Password_User: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          )}
          <select value={formData.Id_ROLE || ''}
            onChange={(e) => setFormData({ ...formData, Id_ROLE: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Sélectionner un rôle</option>
            <option value="1">Administrateur</option>
            <option value="2">Secrétaire</option>
            <option value="3">Professeur</option>
            <option value="4">Etudiant</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}