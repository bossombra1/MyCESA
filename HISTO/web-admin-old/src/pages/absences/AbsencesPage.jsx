import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function AbsencesPage() {
  const [absences, setAbsences] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formData, setFormData] = useState({
    Id_ETUDIANT: '',
    Date_absence: new Date().toISOString().split('T')[0],
    Nbre_heure: 1,
    Justifiee: 0,
  });

  useEffect(() => {
    fetchAbsences();
    fetchEtudiants();
  }, [selectedDate]);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/absences/jour/${selectedDate}`);
      setAbsences(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setLoading(false);
    }
  };

  const fetchEtudiants = async () => {
    try {
      const response = await api.get('/etudiants');
      setEtudiants(response.data);
    } catch (error) {
      console.error('Erreur chargement étudiants');
    }
  };

  const handleAdd = () => {
    setFormData({
      Id_ETUDIANT: '',
      Date_absence: selectedDate,
      Nbre_heure: 1,
      Justifiee: 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.Id_ETUDIANT) {
      toast.error('Veuillez sélectionner un étudiant !');
      return;
    }
    try {
      await api.post('/absences', formData);
      toast.success('Absence enregistrée !');
      setShowModal(false);
      fetchAbsences();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleJustifier = async (absence) => {
  try {
    const date = new Date(absence.Date_absence).toISOString().split('T')[0];
    await api.put('/absences/justifier', {
      Id_ETUDIANT: absence.Id_ETUDIANT,
      Date_absence: date,
      Id_UTILISATEUR: absence.Id_UTILISATEUR,
    });
    toast.success('Absence justifiée !');
    fetchAbsences();
  } catch (error) {
    toast.error('Erreur lors de la justification');
  }
};
  const handleDelete = async (absence) => {
  if (window.confirm('Supprimer cette absence ?')) {
    try {
      const date = new Date(absence.Date_absence).toISOString().split('T')[0];
      await api.delete('/absences', {
        data: {
          Id_ETUDIANT: absence.Id_ETUDIANT,
          Date_absence: date,
          Id_UTILISATEUR: absence.Id_UTILISATEUR,
        }
      });
      toast.success('Absence supprimée !');
      fetchAbsences();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  }
};
  const columns = [
    { key: 'Matricule_Etudiant', label: 'Matricule' },
    { key: 'Nom_Etudiant', label: 'Étudiant', render: (row) => `${row.Nom_Etudiant} ${row.Prenoms_Etudiant || ''}` },
    { key: 'Nom_Classe', label: 'Classe' },
    { key: 'Nbre_heure', label: 'Heures', render: (row) => `${row.Nbre_heure}h` },
    { key: 'Justifiee', label: 'Statut', render: (row) => (
      <Badge variant={row.Justifiee ? 'success' : 'danger'}>
        {row.Justifiee ? '✅ Justifiée' : '❌ Non justifiée'}
      </Badge>
    )},
  ];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Absences</h1>
        <button onClick={handleAdd}
          className="px-6 py-2 text-white rounded-xl font-bold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
          + Enregistrer absence
        </button>
      </div>

      {/* Filtre par date */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center space-x-4">
        <label className="font-semibold text-gray-700">📅 Date :</label>
        <input type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border-2 rounded-xl font-semibold focus:outline-none"
          style={{ borderColor: '#2E7D32', color: '#2E7D32' }} />
        <span className="text-gray-500 text-sm">
          {absences.length} absence(s) ce jour
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table
          columns={columns}
          data={absences}
          actions={(row) => (
            <>
              {!row.Justifiee && (
                <button onClick={() => handleJustifier(row)}
                  className="font-semibold text-sm"
                  style={{ color: '#2E7D32' }}>
                  ✅ Justifier
                </button>
              )}
              <button onClick={() => handleDelete(row)}
                className="font-semibold text-sm ml-2"
                style={{ color: '#D84315' }}>
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} title="Enregistrer une absence"
        onClose={() => setShowModal(false)} onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Étudiant</label>
            <select value={formData.Id_ETUDIANT}
              onChange={(e) => setFormData({ ...formData, Id_ETUDIANT: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1">
              <option value="">Sélectionner un étudiant</option>
              {etudiants.map(e => (
                <option key={e.Id_ETUDIANT} value={e.Id_ETUDIANT}>
                  {e.Nom_Etudiant} {e.Prenoms_Etudiant} - {e.Matricule_Etudiant}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Date</label>
            <input type="date" value={formData.Date_absence}
              onChange={(e) => setFormData({ ...formData, Date_absence: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Nombre d'heures</label>
            <input type="number" min="1" max="8" value={formData.Nbre_heure}
              onChange={(e) => setFormData({ ...formData, Nbre_heure: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1" />
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" id="justifiee"
              checked={formData.Justifiee === 1}
              onChange={(e) => setFormData({ ...formData, Justifiee: e.target.checked ? 1 : 0 })}
              className="w-4 h-4" />
            <label htmlFor="justifiee" className="text-sm font-semibold text-gray-700">
              Absence justifiée
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}