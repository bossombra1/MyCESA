import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data);
      setFilteredNotes(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(
  (n) =>
    n.Matricule_Etudiant?.toLowerCase().includes(query.toLowerCase()) ||
    n.Nom_Matiere?.toLowerCase().includes(query.toLowerCase())
);
    setFilteredNotes(filtered);
  };

  const columns = [
  { key: 'Matricule_Etudiant', label: 'Matricule' },
  { key: 'Nom_Complet', label: 'Étudiant' },
  { key: 'Nom_Matiere', label: 'Matière' },
  { key: 'Semestre', label: 'Semestre' },
  { key: 'Type_Evaluation', label: 'Type' },
  { key: 'Note_Evaluation', label: 'Note', render: (row) => parseFloat(row.Note_Evaluation).toFixed(2) },
  { key: 'Coef_Evaluation', label: 'Coeff', render: (row) => parseFloat(row.Coef_Evaluation).toFixed(2) },
];

  if (loading)
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Chargement...</div>
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notes</h1>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Chercher par matricule ou matière..." />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={filteredNotes}
        />
      </div>
    </div>
  );
}
