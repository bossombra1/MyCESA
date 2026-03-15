import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState([]);
  const [filteredPaiements, setFilteredPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/versements');
      setPaiements(response.data);
      setFilteredPaiements(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredPaiements(paiements);
      return;
    }

    const filtered = paiements.filter(
      (p) =>
        p.Matricule_Etudiant?.toLowerCase().includes(query.toLowerCase()) ||
        p.Nom_Etudiant?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPaiements(filtered);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Payé': 'success',
      'Partiel': 'warning',
      'Impayé': 'danger',
    };
    return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    { key: 'Matricule_Etudiant', label: 'Matricule' },
    { key: 'Nom_Etudiant', label: 'Étudiant' },
    { key: 'Montant_Versement', label: 'Montant', render: (row) => `${row.Montant_Versement} DZD` },
    { key: 'Date_Versement', label: 'Date', render: (row) => new Date(row.Date_Versement).toLocaleDateString() },
    { key: 'Statut_Versement', label: 'Statut', render: (row) => getStatusBadge(row.Statut_Versement) },
  ];

  if (loading)
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Chargement...</div>
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des paiements</h1>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par matricule ou nom..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredPaiements}
        />
      </div>
    </div>
  );
}
