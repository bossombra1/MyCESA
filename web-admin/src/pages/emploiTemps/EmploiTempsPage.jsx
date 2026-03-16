import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function EmploiTempsPage() {
  const [emploiTemps, setEmploiTemps] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [classes, setClasses] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCreneau, setCurrentCreneau] = useState(null);
  const [formData, setFormData] = useState({
    Id_PROFESSEUR: '',
    Id_SALLE: '',
    Id_MATIERE: '',
    Id_CLASSE: '',
    Jour_Semaine: '',
    Heure_Debut: '',
    Heure_Fin: '',
    date_: '', // Nouveau champ date
  });

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  const heuresFin = ['09:00', '10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (selectedClasse) fetchEmploiTemps(); }, [selectedClasse]);

  const fetchAll = async () => {
    try {
      const [classesRes, profsRes, matieresRes, sallesRes] = await Promise.all([
        api.get('/classes'),
        api.get('/professeurs'),
        api.get('/matieres'),
        api.get('/salles'),
      ]);
      setClasses(classesRes.data);
      setProfesseurs(profsRes.data);
      setMatieres(matieresRes.data);
      setSalles(sallesRes.data);
      if (classesRes.data.length > 0) {
        setSelectedClasse(classesRes.data[0].Id_CLASSE);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmploiTemps = async () => {
    try {
      const response = await api.get(`/emploiTemps?classe=${selectedClasse}`);
      setEmploiTemps(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getCreneau = (jour, heure) => {
    return emploiTemps.find(
      (c) => c.Jour_Semaine === jour && c.Heure_Debut?.substring(0, 5) === heure
    );
  };

  // Clic sur case vide → ajout avec jour et heure pré-remplis
  const handleCaseVide = (jour, heure) => {
    const heureIndex = heures.indexOf(heure);
    setEditMode(false);
    setCurrentCreneau(null);
    setFormData({
      Id_PROFESSEUR: '',
      Id_SALLE: '',
      Id_MATIERE: '',
      Id_CLASSE: selectedClasse,
      Jour_Semaine: jour,
      Heure_Debut: heure,
      Heure_Fin: heuresFin[heureIndex] || '',
      date_: '', // Laisser vide par défaut
    });
    setShowModal(true);
  };

  // Clic sur créneau existant → modification
  const handleCreneauClick = (creneau) => {
    setEditMode(true);
    setCurrentCreneau(creneau);
    setFormData({
      Id_PROFESSEUR: creneau.Id_PROFESSEUR,
      Id_SALLE: creneau.Id_SALLE,
      Id_MATIERE: creneau.Id_MATIERE,
      Id_CLASSE: creneau.Id_CLASSE,
      Jour_Semaine: creneau.Jour_Semaine,
      Heure_Debut: creneau.Heure_Debut?.substring(0, 5),
      Heure_Fin: creneau.Heure_Fin?.substring(0, 5),
      date_: creneau.date_ ? creneau.date_.substring(0, 10) : '', // Extraire YYYY-MM-DD
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.Id_PROFESSEUR || !formData.Id_SALLE || !formData.Id_MATIERE) {
        toast.error('Veuillez remplir tous les champs !');
        return;
      }

      if (editMode && currentCreneau) {
        // ✅ On utilise currentCreneau pour supprimer EXACTEMENT l'ancien créneau
        await api.delete('/emploiTemps', {
          data: {
            Id_PROFESSEUR: currentCreneau.Id_PROFESSEUR,
            Id_SALLE: currentCreneau.Id_SALLE,
            Id_MATIERE: currentCreneau.Id_MATIERE,
            Id_CLASSE: currentCreneau.Id_CLASSE,
            Jour_Semaine: currentCreneau.Jour_Semaine, // Précision indispensable
            Heure_Debut: currentCreneau.Heure_Debut   // Précision indispensable
          }
        });
        await api.post('/emploiTemps', formData);
        toast.success('Créneau modifié !');
      } else {
        await api.post('/emploiTemps', formData);
        toast.success('Créneau ajouté !');
      }

      setShowModal(false);
      fetchEmploiTemps();
    } catch (error) {
      const msg = error.response?.data?.error || "Erreur lors de la sauvegarde";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!currentCreneau) return;
    if (window.confirm('Supprimer ce créneau ?')) {
      try {
        await api.delete('/emploiTemps', {
          data: {
            Id_PROFESSEUR: currentCreneau.Id_PROFESSEUR,
            Id_SALLE: currentCreneau.Id_SALLE,
            Id_MATIERE: currentCreneau.Id_MATIERE,
            Id_CLASSE: currentCreneau.Id_CLASSE,
            Jour_Semaine: currentCreneau.Jour_Semaine, // Précision indispensable
            Heure_Debut: currentCreneau.Heure_Debut   // Précision indispensable
          }
        });
        toast.success('Créneau supprimé !');
        setShowModal(false);
        fetchEmploiTemps();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emploi du temps</h1>
          <p className="text-sm text-gray-500 mt-1">💡 Cliquez sur une case vide pour ajouter, sur un cours pour modifier</p>
        </div>
        <select
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
          className="px-4 py-2 border-2 rounded-xl font-semibold focus:outline-none"
          style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
        >
          {classes.map((classe) => (
            <option key={classe.Id_CLASSE} value={classe.Id_CLASSE}>
              {classe.Nom_Classe}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: 'linear-gradient(to right, #1B5E20, #2E7D32)' }}>
              <th className="px-4 py-3 text-left text-sm font-bold text-white w-20">Horaire</th>
              {jours.map((jour) => (
                <th key={jour} className="px-4 py-3 text-center text-sm font-bold text-white">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heures.map((heure, idx) => (
              <tr key={heure} style={{ background: idx % 2 === 0 ? '#F9FBF9' : 'white' }}>
                <td className="px-4 py-3 text-sm font-bold" style={{ color: '#2E7D32' }}>
                  {heure}
                </td>
                {jours.map((jour) => {
                  const creneau = getCreneau(jour, heure);
                  return (
                    <td key={`${jour}-${heure}`}
                      className="px-2 py-2 text-sm text-center border-r border-gray-100">
                      {creneau ? (
                        <div
                          onClick={() => handleCreneauClick(creneau)}
                          className="p-2 rounded-xl text-left shadow-sm cursor-pointer transition-all hover:shadow-md"
                          style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '3px solid #2E7D32' }}
                          title="Cliquer pour modifier"
                        >
                          <p className="font-bold text-xs" style={{ color: '#1B5E20' }}>
                            📚 {creneau.Nom_Matiere}
                          </p>
                          <p className="text-xs mt-1" style={{ color: '#388E3C' }}>
                            👨‍🏫 {creneau.Nom_Professeur}
                          </p>
                          <p className="text-xs" style={{ color: '#555' }}>
                            🏫 {creneau.Nom_Salle}
                          </p>
                          <p className="text-xs font-semibold mt-1" style={{ color: '#D84315' }}>
                            ✏️ Modifier
                          </p>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleCaseVide(jour, heure)}
                          className="h-16 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                          style={{ border: '2px dashed #C8E6C9' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F1F8E9'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          title="Cliquer pour ajouter un cours"
                        >
                          <span style={{ color: '#A5D6A7', fontSize: '20px' }}>+</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={editMode ? '✏️ Modifier le créneau' : '➕ Ajouter un créneau'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
        submitText={editMode ? 'Modifier' : 'Ajouter'}
      >
        <div className="space-y-4">
          {/* Jour et heures en lecture seule si ajout depuis case */}
          <div className="p-3 rounded-xl flex items-center space-x-4"
            style={{ background: '#E8F5E9' }}>
            <div>
              <p className="text-xs text-gray-500">Jour</p>
              <p className="font-bold" style={{ color: '#1B5E20' }}>{formData.Jour_Semaine}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Heure début</p>
              <p className="font-bold" style={{ color: '#1B5E20' }}>{formData.Heure_Debut}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Heure fin</p>
              <select value={formData.Heure_Fin}
                onChange={(e) => setFormData({ ...formData, Heure_Fin: e.target.value })}
                className="font-bold border rounded px-2 py-1 text-sm"
                style={{ color: '#1B5E20', borderColor: '#2E7D32' }}>
                {heuresFin.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Matière</label>
            <select value={formData.Id_MATIERE}
              onChange={(e) => setFormData({ ...formData, Id_MATIERE: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1">
              <option value="">Sélectionner une matière</option>
              {matieres.map(m => <option key={m.Id_MATIERE} value={m.Id_MATIERE}>{m.Nom_Matiere}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Professeur</label>
            <select value={formData.Id_PROFESSEUR}
              onChange={(e) => setFormData({ ...formData, Id_PROFESSEUR: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1">
              <option value="">Sélectionner un professeur</option>
              {professeurs.map(p => <option key={p.Id_PROFESSEUR} value={p.Id_PROFESSEUR}>{p.Nom_Prenoms_Profe}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Salle</label>
            <select value={formData.Id_SALLE}
              onChange={(e) => setFormData({ ...formData, Id_SALLE: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1">
              <option value="">Sélectionner une salle</option>
              {salles.map(s => <option key={s.Id_SALLE} value={s.Id_SALLE}>{s.Nom_Salle}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Date spécifique (optionnel) 
              <span className="text-xs text-gray-500 ml-2">Laissez vide pour cours récurrent</span>
            </label>
            <input
              type="date"
              value={formData.date_}
              onChange={(e) => setFormData({ ...formData, date_: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
              placeholder="YYYY-MM-DD"
            />
          </div>

          {editMode && (
            <button onClick={handleDelete}
              className="w-full py-2 rounded-xl font-semibold text-white text-sm"
              style={{ background: '#D84315' }}>
              🗑️ Supprimer ce créneau
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}