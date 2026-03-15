import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    cible: 'tous', // tous, etudiants, profs
  });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!formData.titre || !formData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);
    try {
      await api.post('/notifications/envoyer', {
        Titre_Notification: formData.titre,
        Contenu_Notification: formData.message,
        Cible: formData.cible,
        Date_Notification: new Date().toISOString(),
      });
      toast.success('Notification envoyée avec succès!');
      setShowModal(false);
      setFormData({ titre: '', message: '', cible: 'tous' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Envoyer notification
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 text-lg">📬 Aucune notification actuellement</p>
        <p className="text-gray-500 mt-2">Envoyez des notifications aux utilisateurs de l'application</p>
      </div>

      <Modal
        isOpen={showModal}
        title="Envoyer une notification"
        onClose={() => setShowModal(false)}
        onSubmit={handleSend}
        submitText={sending ? 'Envoi en cours...' : 'Envoyer'}
        cancelText="Fermer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <select
              value={formData.cible}
              onChange={(e) => setFormData({ ...formData, cible: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="tous">Tous les utilisateurs</option>
              <option value="etudiants">Étudiants uniquement</option>
              <option value="profs">Professeurs uniquement</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Titre de la notification"
            value={formData.titre}
            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />

          <textarea
            placeholder="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          ></textarea>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            <p>💡 La notification sera envoyée immédiatement à l'application mobile.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
