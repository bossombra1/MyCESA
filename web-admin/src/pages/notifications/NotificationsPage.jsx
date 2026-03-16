import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    cible: 'tous',
    Id_UTILISATEUR: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUtilisateurs();
    fetchNotifications();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await api.get('/utilisateurs');
      setUtilisateurs(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur chargement notifications');
    }
  };

  const handleSend = async () => {
    if (!formData.titre || !formData.message) {
      toast.error('Veuillez remplir tous les champs !');
      return;
    }
    if (formData.cible === 'individuel' && !formData.Id_UTILISATEUR) {
      toast.error('Veuillez sélectionner un utilisateur !');
      return;
    }
    setSending(true);
    try {
      if (formData.cible === 'tous' || formData.cible === 'etudiants') {
        // Envoyer à tous via annonce
        await api.post('/notifications/annonce', {
          Titre_Notif: formData.titre,
          Message_Notif: formData.message,
        });
        toast.success('Annonce envoyée à tous les étudiants !');
      } else {
        // Envoyer à un utilisateur spécifique
        await api.post('/notifications/send', {
          Id_UTILISATEUR: formData.Id_UTILISATEUR,
          Titre_Notif: formData.titre,
          Message_Notif: formData.message,
        });
        toast.success('Notification envoyée !');
      }
      setShowModal(false);
      setFormData({ titre: '', message: '', cible: 'tous', Id_UTILISATEUR: '' });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <button onClick={() => setShowModal(true)}
          className="px-6 py-2 text-white rounded-xl font-bold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #388E3C)' }}>
          📬 Envoyer notification
        </button>
      </div>

      {/* Liste notifications */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 text-lg">📭 Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.Id_EVENEMENT}
              className="bg-white rounded-xl shadow p-4 flex items-start space-x-4"
              style={{ borderLeft: notif.Lu ? '3px solid #E5E7EB' : '3px solid #2E7D32' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: notif.Lu ? '#F3F4F6' : '#E8F5E9' }}>
                🔔
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{notif.Titre_Notif}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.Message_Notif}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notif.Date_Notif).toLocaleDateString('fr-FR')} à {new Date(notif.Date_Notif).toLocaleTimeString('fr-FR')}
                </p>
              </div>
              {!notif.Lu && (
                <span className="px-2 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: '#2E7D32' }}>
                  Nouveau
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} title="📬 Envoyer une notification"
        onClose={() => setShowModal(false)}
        onSubmit={handleSend}
        submitText={sending ? 'Envoi...' : 'Envoyer'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
            <select value={formData.cible}
              onChange={(e) => setFormData({ ...formData, cible: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="tous">📢 Tous les étudiants</option>
              <option value="individuel">👤 Utilisateur spécifique</option>
            </select>
          </div>

          {formData.cible === 'individuel' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Utilisateur</label>
              <select value={formData.Id_UTILISATEUR}
                onChange={(e) => setFormData({ ...formData, Id_UTILISATEUR: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Sélectionner un utilisateur</option>
                {utilisateurs.map(u => (
                  <option key={u.Id_UTILISATEUR} value={u.Id_UTILISATEUR}>
                    {u.Nom_User} ({u.Lib_Role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label>
            <input type="text" placeholder="Titre de la notification"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea placeholder="Votre message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="p-3 rounded-xl text-sm"
            style={{ background: '#E8F5E9', color: '#1B5E20' }}>
            💡 La notification sera envoyée immédiatement sur l'application mobile.
          </div>
        </div>
      </Modal>
    </div>
  );
}