import { useState } from 'react';
import { Settings, Save, RefreshCw, Building, Globe, Mail, Calendar, Database, Shield } from 'lucide-react';

export default function Configuration() {
  const [etablissement, setEtablissement] = useState({
    nom: 'CESA - Centre d\'Enseignement Supérieur d\'Abidjan',
    sigle: 'CESA',
    email: 'contact@mycesa.edu',
    telephone: '+225 27 XX XX XX XX',
    adresse: 'Abidjan, Côte d\'Ivoire',
    siteWeb: 'www.mycesa.edu'
  });

  const [anneeAcademique, setAnneeAcademique] = useState({
    anneeEnCours: '2025-2026',
    dateDebut: '2025-09-01',
    dateFin: '2026-06-30',
    semestreActuel: 'S1'
  });

  const [notifications, setNotifications] = useState({
    emailActif: true,
    smsActif: false,
    notifPush: true,
    rappelAutoAbsences: true,
    rappelAutoPaiements: true
  });

  const [sauvegardeData, setSauvegardeData] = useState({
    derniereData: '2026-06-02 23:00',
    frequence: 'Quotidienne',
    stockage: 'Cloud + Local'
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration Système</h1>
          <p className="mt-2 text-gray-600">Paramétrez l'application selon vos besoins</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
          <Save className="h-5 w-5" />
          Sauvegarder tout
        </button>
      </div>

      {/* Informations Établissement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Informations de l'établissement</h2>
            <p className="text-sm text-gray-600">Gérez les informations générales de l'établissement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet de l'établissement
            </label>
            <input
              type="text"
              value={etablissement.nom}
              onChange={(e) => setEtablissement({...etablissement, nom: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sigle
            </label>
            <input
              type="text"
              value={etablissement.sigle}
              onChange={(e) => setEtablissement({...etablissement, sigle: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={etablissement.email}
              onChange={(e) => setEtablissement({...etablissement, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={etablissement.telephone}
              onChange={(e) => setEtablissement({...etablissement, telephone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={etablissement.adresse}
              onChange={(e) => setEtablissement({...etablissement, adresse: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site web
            </label>
            <input
              type="text"
              value={etablissement.siteWeb}
              onChange={(e) => setEtablissement({...etablissement, siteWeb: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Save className="h-4 w-4" />
            Sauvegarder les informations
          </button>
        </div>
      </div>

      {/* Année académique */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Année académique</h2>
            <p className="text-sm text-gray-600">Configurez l'année scolaire en cours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année en cours
            </label>
            <input
              type="text"
              value={anneeAcademique.anneeEnCours}
              onChange={(e) => setAnneeAcademique({...anneeAcademique, anneeEnCours: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semestre actuel
            </label>
            <select
              value={anneeAcademique.semestreActuel}
              onChange={(e) => setAnneeAcademique({...anneeAcademique, semestreActuel: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option>S1</option>
              <option>S2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={anneeAcademique.dateDebut}
              onChange={(e) => setAnneeAcademique({...anneeAcademique, dateDebut: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={anneeAcademique.dateFin}
              onChange={(e) => setAnneeAcademique({...anneeAcademique, dateFin: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Save className="h-4 w-4" />
            Sauvegarder l'année académique
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Système de notifications</h2>
            <p className="text-sm text-gray-600">Configurez les canaux de communication</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifications par email</p>
              <p className="text-sm text-gray-600">Envoyer des notifications par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailActif}
                onChange={(e) => setNotifications({...notifications, emailActif: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifications SMS</p>
              <p className="text-sm text-gray-600">Envoyer des notifications par SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.smsActif}
                onChange={(e) => setNotifications({...notifications, smsActif: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifications push</p>
              <p className="text-sm text-gray-600">Envoyer des notifications push dans l'application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.notifPush}
                onChange={(e) => setNotifications({...notifications, notifPush: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Rappels automatiques - Absences</p>
              <p className="text-sm text-gray-600">Notifier automatiquement les absences répétées</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rappelAutoAbsences}
                onChange={(e) => setNotifications({...notifications, rappelAutoAbsences: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Rappels automatiques - Paiements</p>
              <p className="text-sm text-gray-600">Relancer automatiquement les paiements en retard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.rappelAutoPaiements}
                onChange={(e) => setNotifications({...notifications, rappelAutoPaiements: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <Save className="h-4 w-4" />
            Sauvegarder les préférences
          </button>
        </div>
      </div>

      {/* Sauvegarde et maintenance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Database className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sauvegarde et maintenance</h2>
            <p className="text-sm text-gray-600">Gérez les sauvegardes de données</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Dernière sauvegarde</p>
            <p className="font-semibold text-gray-900">{sauvegardeData.derniereData}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Fréquence</p>
            <p className="font-semibold text-gray-900">{sauvegardeData.frequence}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Stockage</p>
            <p className="font-semibold text-gray-900">{sauvegardeData.stockage}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            <RefreshCw className="h-4 w-4" />
            Lancer une sauvegarde maintenant
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Settings className="h-4 w-4" />
            Configurer la sauvegarde
          </button>
        </div>
      </div>
    </div>
  );
}
