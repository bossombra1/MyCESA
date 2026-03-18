import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const EMPTY_PROF = {
  Nom_Prenoms_Profe: '',
  email_Profe: '',
  Tel_Profe: '',
  Quartier_Profe: '',
  selectedMatieres: [], // Tableau des IDs de matières sélectionnées pour ajout
  existingMatieres: [], // Tableau des matières existantes {id, nom}
};

export default function ProfsPage() {
  const [profs, setProfs] = useState([]);
  const [filteredProfs, setFilteredProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PROF);
  const [matieres, setMatieres] = useState([]); // Liste des matières pour la liste déroulante

  useEffect(() => {
    fetchProfs();
    fetchMatieres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professeurs');
      const data = Array.isArray(response.data) ? response.data : [];

      // Normalisation : Matieres (string) + MatieresArray (tableau)
      const normalized = data.map((p) => {
        let matArray = [];

        // Priorité sur MatieresJSON (tableau d'objets {id, nom})
        if (Array.isArray(p.MatieresJSON) && p.MatieresJSON.length) {
          matArray = p.MatieresJSON.map((m) => (typeof m === 'string' ? m : m.nom));
        } else if (Array.isArray(p.MatieresArray) && p.MatieresArray.length) {
          matArray = p.MatieresArray.map((m) => (typeof m === 'string' ? m : m.nom || m));
        } else if (p.Matieres && typeof p.Matieres === 'string') {
          matArray = p.Matieres.split(',').map((s) => s.trim()).filter(Boolean);
        }

        return {
          ...p,
          Matieres: p.Matieres || matArray.join(', '),
          MatieresArray: matArray,
        };
      });

      setProfs(normalized);
      setFilteredProfs(normalized);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des professeurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatieres = async () => {
    try {
      const response = await api.get('/matieres');
      setMatieres(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des matières');
    }
  };

  const handleEdit = (prof) => {
    // Charger les matières existantes
    let existingMatieres = [];
    if (Array.isArray(prof.MatieresJSON) && prof.MatieresJSON.length) {
      existingMatieres = prof.MatieresJSON.map(m => ({ id: m.id, nom: m.nom }));
    } else if (Array.isArray(prof.MatieresArray) && prof.MatieresArray.length) {
      existingMatieres = prof.MatieresArray.map((nom, index) => ({ id: `temp-${index}`, nom }));
    } else if (prof.Matieres) {
      const noms = prof.Matieres.split(',').map(s => s.trim()).filter(Boolean);
      existingMatieres = noms.map((nom, index) => ({ id: `temp-${index}`, nom }));
    }
    setSelectedProf(prof);
    setFormData({ ...EMPTY_PROF, ...prof, selectedMatieres: [], existingMatieres });
    setShowModal(true);
  };

  const handleRemoveExistingMatiere = (matiereId) => {
    setFormData({
      ...formData,
      existingMatieres: formData.existingMatieres.filter(m => m.id !== matiereId),
    });
  };

  const handleAddSelectedMatieres = () => {
    // Ajouter les matières sélectionnées aux existantes
    const newMatieres = formData.selectedMatieres.map(id => {
      const matiere = matieres.find(m => m.Id_MATIERE == id);
      return { id: matiere.Id_MATIERE, nom: matiere.Nom_Matiere };
    });
    setFormData({
      ...formData,
      existingMatieres: [...formData.existingMatieres, ...newMatieres],
      selectedMatieres: [], // Reset sélection
    });
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredProfs(profs);
      return;
    }
    const q = query.toLowerCase();
    const filtered = profs.filter((p) => {
      const name = (p.Nom_Prenoms_Profe || '').toLowerCase();
      const email = (p.email_Profe || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
    setFilteredProfs(filtered);
  };

  const handleAdd = () => {
    setSelectedProf(null);
    setFormData(EMPTY_PROF);
    setShowModal(true);
  };

  const handleMatiereChanges = async (profId, newMatieres) => {
    // Récupérer les matières actuelles du prof
    const currentMatieres = Array.isArray(selectedProf.MatieresJSON) ? selectedProf.MatieresJSON.map(m => m.id) : [];
    const newMatiereIds = newMatieres.map(m => m.id);

    // Matières à supprimer (présentes avant, absentes maintenant)
    const toRemove = currentMatieres.filter(id => !newMatiereIds.includes(id));
    // Matières à ajouter (absentes avant, présentes maintenant)
    const toAdd = newMatiereIds.filter(id => !currentMatieres.includes(id));

    for (const matiereId of toRemove) {
      await api.delete('/enseigner', { data: { Id_PROFESSEUR: profId, Id_MATIERE: matiereId } });
    }
    for (const matiereId of toAdd) {
      await api.post('/enseigner', { Id_PROFESSEUR: profId, Id_MATIERE: matiereId });
    }
    if (toRemove.length > 0 || toAdd.length > 0) {
      toast.success('Matières mises à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Identifiant du professeur introuvable');
      return;
    }
    const confirm = window.confirm('Êtes-vous sûr de vouloir supprimer ce professeur?');
    if (!confirm) return;

    try {
      setActionLoading(true);
      await api.delete(`/professeurs/${id}`);
      toast.success('Professeur supprimé');
      await fetchProfs();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  const validateForm = (data) => {
    if (!data.Nom_Prenoms_Profe?.trim()) {
      toast.error('Le nom est requis');
      return false;
    }
    if (data.email_Profe && !/^\S+@\S+\.\S+$/.test(data.email_Profe)) {
      toast.error('Email invalide');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm(formData)) return;

    try {
      setActionLoading(true);
      // Préparer payload : si Matieres est string, on peut laisser tel quel ou transformer en tableau
      const payload = { ...formData };
      if (typeof payload.Matieres === 'string') {
        // optionnel : transformer en tableau si ton backend attend un tableau
        // payload.Matieres = payload.Matieres.split(',').map(m => m.trim()).filter(Boolean);
      }

      if (selectedProf && selectedProf.Id_PROFESSEUR) {
        await api.put(`/professeurs/${selectedProf.Id_PROFESSEUR}`, payload);
        toast.success('Professeur modifié');
        // Gérer les matières : supprimer celles retirées, ajouter les nouvelles
        await handleMatiereChanges(selectedProf.Id_PROFESSEUR, formData.existingMatieres);
      } else {
        const res = await api.post('/professeurs', payload);
        const profId = res.data.insertId;
        toast.success('Professeur ajouté');
        // Ajouter les matières sélectionnées
        for (const matiere of formData.existingMatieres) {
          await api.post('/enseigner', { Id_PROFESSEUR: profId, Id_MATIERE: matiere.id });
        }
        toast.success('Matières attribuées au professeur');
      }
      setShowModal(false);
      await fetchProfs();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'Nom_Prenoms_Profe', label: 'Nom & Prénoms' },
    { key: 'email_Profe', label: 'Email' },
    { key: 'Tel_Profe', label: 'Téléphone' },
    { key: 'Quartier_Profe', label: 'Quartier' },
    {
      key: 'Matieres',
      label: 'Matières enseignées',
      render: (row) => {
        if (!row) return '—';
        if (Array.isArray(row.MatieresArray) && row.MatieresArray.length) {
          return row.MatieresArray.join(', ');
        }
        return row.Matieres || '—';
      },
    },
  ];

  if (loading) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Professeurs</h1>
        <button
          onClick={handleAdd}
          className="px-6 py-2 text-white rounded-lg font-semibold shadow-md"
          style={{ background: '#2E7D32' }}
          disabled={actionLoading}
        >
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
              <button
                onClick={() => handleEdit(row)}
                className="font-semibold text-sm"
                style={{ color: '#2E7D32' }}
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => handleDelete(row.Id_PROFESSEUR)}
                className="font-semibold text-sm ml-2"
                style={{ color: '#D84315' }}
                disabled={actionLoading}
              >
                🗑️ Supprimer
              </button>
            </>
          )}
        />
      </div>

      <Modal
        isOpen={showModal}
        title={selectedProf ? 'Modifier professeur' : 'Ajouter professeur'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSave}
        submitLabel={actionLoading ? 'En cours...' : 'Enregistrer'}
        disabled={actionLoading}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom et prénoms"
            value={formData.Nom_Prenoms_Profe || ''}
            onChange={(e) => setFormData({ ...formData, Nom_Prenoms_Profe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email_Profe || ''}
            onChange={(e) => setFormData({ ...formData, email_Profe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={formData.Tel_Profe || ''}
            onChange={(e) => setFormData({ ...formData, Tel_Profe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Quartier"
            value={formData.Quartier_Profe || ''}
            onChange={(e) => setFormData({ ...formData, Quartier_Profe: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />

          {/* Matières existantes */}
          {selectedProf && (
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase mb-2">
                Matières actuelles
              </label>
              <div className="space-y-2">
                {formData.existingMatieres.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{m.nom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingMatiere(m.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sélection de nouvelles matières */}
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-2">
              Ajouter des matières
            </label>
            <select
              multiple
              value={formData.selectedMatieres}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, selectedMatieres: selected });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {matieres
                .filter(m => !formData.existingMatieres.some(em => em.id == m.Id_MATIERE))
                .map((m) => (
                  <option key={m.Id_MATIERE} value={m.Id_MATIERE}>
                    {m.Nom_Matiere}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddSelectedMatieres}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Ajouter les sélectionnées
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
