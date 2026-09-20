import { useState } from 'react';
import { Plus, Search, Filter, Bell, Send, Trash2, CheckCircle, Clock } from 'lucide-react';

const notifications = [
  {
    id: 1,
    titre: 'Rappel : Examen de Programmation Web',
    message: 'L\'examen de Programmation Web aura lieu demain à 08h00 dans l\'Amphi A. Soyez à l\'heure.',
    destinataires: 'L3 SI',
    type: 'Urgent',
    date: '2026-06-02 14:30',
    statut: 'Envoyée',
    nombreVues: 42,
    auteur: 'Admin User'
  },
  {
    id: 2,
    titre: 'Nouveau cours ajouté - Base de Données Avancées',
    message: 'Un nouveau cours de Base de Données Avancées a été ajouté à votre emploi du temps pour le semestre S5.',
    destinataires: 'L3 SI',
    type: 'Information',
    date: '2026-06-01 10:15',
    statut: 'Envoyée',
    nombreVues: 38,
    auteur: 'Admin User'
  },
  {
    id: 3,
    titre: 'Réunion pédagogique - Tous les professeurs',
    message: 'Réunion pédagogique le mercredi 10 juin à 14h00 en salle de réunion. Présence obligatoire.',
    destinataires: 'Professeurs',
    type: 'Important',
    date: '2026-05-31 16:45',
    statut: 'Envoyée',
    nombreVues: 15,
    auteur: 'Admin User'
  },
  {
    id: 4,
    titre: 'Sortie culturelle - Musée National',
    message: 'Une sortie au Musée National est organisée pour la classe L1 LSH le 20 juin. Inscription obligatoire.',
    destinataires: 'L1 LSH',
    type: 'Événement',
    date: '2026-05-30 09:00',
    statut: 'Envoyée',
    nombreVues: 28,
    auteur: 'Admin User'
  },
  {
    id: 5,
    titre: 'Rappel : Paiement des frais de scolarité',
    message: 'Les frais de scolarité doivent être réglés avant le 30 septembre 2026. Veuillez régulariser votre situation.',
    destinataires: 'Tous les étudiants',
    type: 'Urgent',
    date: '2026-05-29 11:20',
    statut: 'Programmée',
    nombreVues: 0,
    auteur: 'Admin User'
  },
  {
    id: 6,
    titre: 'Modification emploi du temps',
    message: 'Le cours de Chimie Organique du mardi est déplacé au jeudi à 14h00. Nouvelle salle : Labo Chimie 1.',
    destinataires: 'L2 SN',
    type: 'Important',
    date: '2026-05-28 13:00',
    statut: 'Envoyée',
    nombreVues: 35,
    auteur: 'Admin User'
  },
  {
    id: 7,
    titre: 'Journée portes ouvertes',
    message: 'L\'établissement organise une journée portes ouvertes le samedi 25 juin. Participation appréciée.',
    destinataires: 'Tous',
    type: 'Information',
    date: '2026-05-27 08:30',
    statut: 'Brouillon',
    nombreVues: 0,
    auteur: 'Admin User'
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Urgent': return 'bg-red-100 text-red-800 border-red-300';
    case 'Important': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Événement': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Information': return 'bg-blue-100 text-blue-800 border-blue-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'Envoyée': return 'bg-green-100 text-green-800';
    case 'Programmée': return 'bg-yellow-100 text-yellow-800';
    case 'Brouillon': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Notifications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedStatut, setSelectedStatut] = useState('Tous');

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'Tous' || notif.type === selectedType;
    const matchesStatut = selectedStatut === 'Tous' || notif.statut === selectedStatut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const totalEnvoyees = notifications.filter(n => n.statut === 'Envoyée').length;
  const totalProgrammees = notifications.filter(n => n.statut === 'Programmée').length;
  const totalVues = notifications.reduce((sum, n) => sum + n.nombreVues, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Notifications</h1>
          <p className="mt-2 text-gray-600">Envoyez et gérez les notifications aux utilisateurs</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Plus className="h-5 w-5" />
          Nouvelle notification
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total notifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Envoyées</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totalEnvoyees}</p>
            </div>
            <Send className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programmées</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{totalProgrammees}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total vues</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalVues}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une notification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              <option>Urgent</option>
              <option>Important</option>
              <option>Événement</option>
              <option>Information</option>
            </select>
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>Tous</option>
              <option>Envoyée</option>
              <option>Programmée</option>
              <option>Brouillon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => (
          <div key={notif.id} className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${getTypeColor(notif.type)}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{notif.titre}</h3>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(notif.type)}`}>
                    {notif.type}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatutColor(notif.statut)}`}>
                    {notif.statut}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{notif.message}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bell className="h-4 w-4" />
                    <span>Destinataires: <strong>{notif.destinataires}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{notif.date}</span>
                  </div>
                  {notif.statut === 'Envoyée' && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">{notif.nombreVues} vues</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">par {notif.auteur}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {notif.statut === 'Brouillon' && (
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                )}
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
