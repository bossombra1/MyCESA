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
        n.Matière?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  const columns = [
    { key: 'Matricule_Etudiant', label: 'Matricule' },
    { key: 'Nom_Etudiant', label: 'Étudiant' },
    { key: 'Matière', label: 'Matière' },
    { key: 'Note_Semestre1', label: 'S1', render: (row) => row.Note_Semestre1?.toFixed(2) || '-' },
    { key: 'Note_Semestre2', label: 'S2', render: (row) => row.Note_Semestre2?.toFixed(2) || '-' },
    { key: 'Moyenne', label: 'Moyenne', render: (row) => {
      const moyenne = (row.Note_Semestre1 + row.Note_Semestre2) / 2;
      return moyenne.toFixed(2);
    } },
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
