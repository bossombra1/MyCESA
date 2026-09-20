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

  useEffect(() => { fetchPaiements(); }, []);

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
    if (!query) { setFilteredPaiements(paiements); return; }
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
    return <Badge variant={statusMap[status] || 'default'}>{status || 'Payé'}</Badge>;
  };

  const columns = [
    { key: 'Matricule_Etudiant', label: 'Matricule' },
    { key: 'Nom_Etudiant', label: 'Étudiant', render: (row) => `${row.Nom_Etudiant} ${row.Prenoms_Etudiant || ''}` },
    { key: 'Lib_Versement', label: 'Libellé' },
    { key: 'Montant', label: 'Montant', render: (row) => `${parseFloat(row.Montant).toLocaleString()} FCFA` },
    { key: 'Date_Versement', label: 'Date', render: (row) => new Date(row.Date_Versement).toLocaleDateString('fr-FR') },
    { key: 'Statut', label: 'Statut', render: (row) => getStatusBadge(row.Statut) },
  ];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
        <div className="px-4 py-2 rounded-xl text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
          💰 Total : {paiements.reduce((sum, p) => sum + parseFloat(p.Montant || 0), 0).toLocaleString()} FCFA
        </div>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par matricule ou nom..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table columns={columns} data={filteredPaiements} />
      </div>
    </div>
  );
}