import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEtudiants: 0,
    totalProfs: 0,
    totalClasses: 0,
    paiementsMois: 0,
  });
  const [recentEtudiants, setRecentEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [etudiantsRes, profsRes, classesRes, paiementsRes] = await Promise.all([
        api.get('/etudiants'),
        api.get('/professeurs'),
        api.get('/classes'),
        api.get('/versements'),
      ]);

      setStats({
        totalEtudiants: etudiantsRes.data.length || 0,
        totalProfs: profsRes.data.length || 0,
        totalClasses: classesRes.data.length || 0,
        paiementsMois: paiementsRes.data.length || 0,
      });

      // Get 5 most recent students (assuming the array is already sorted or we just take the last 5 reversed)
      const recent = [...etudiantsRes.data].reverse().slice(0, 5);
      setRecentEtudiants(recent);

    } catch (error) {
      toast.error('Erreur lors du chargement du tableau de bord');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-light-bg min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <Card
          title="Total Étudiants"
          value={stats.totalEtudiants}
          icon="👨‍🎓"
          color="primary"
        />
        <Card
          title="Total Professeurs"
          value={stats.totalProfs}
          icon="👨‍🏫"
          color="success"
        />
        <Card
          title="Total Classes"
          value={stats.totalClasses}
          icon="🏫"
          color="secondary"
        />
        <Card
          title="Paiements ce mois"
          value={stats.paiementsMois}
          icon="💳"
          color="warning"
        />
      </div>

      {/* Actions et Récents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions Rapides */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col">
          <div className="mb-6 flex items-center space-x-3">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xl">⚡</span>
            <h2 className="text-xl font-bold text-gray-800">Actions Rapides</h2>
          </div>
          
          <div className="flex-1 grid grid-cols-1 gap-4">
            <Link to="/etudiants" className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:scale-110 transition-transform">
                🎓
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Gérer les Étudiants</h3>
                <p className="text-sm text-gray-500">Ajouter ou modifier</p>
              </div>
            </Link>

            <Link to="/profs" className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl group-hover:scale-110 transition-transform">
                👨‍🏫
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Gérer les Professeurs</h3>
                <p className="text-sm text-gray-500">Recrutement et suivi</p>
              </div>
            </Link>

            <Link to="/paiements" className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl group-hover:scale-110 transition-transform">
                💳
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Enregistrer un Paiement</h3>
                <p className="text-sm text-gray-500">Scolarité et frais</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Derniers Étudiants */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-0 border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-green-50 text-green-600 rounded-lg text-xl">🆕</span>
              <h2 className="text-xl font-bold text-gray-800">Derniers Étudiants Inscrits</h2>
            </div>
            <Link to="/etudiants" className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline">
              Voir tout →
            </Link>
          </div>
          
          <div className="p-2 flex-1">
            {recentEtudiants.length > 0 ? (
              <Table
                columns={[
                  { key: 'Matricule_Etudiant', label: 'Matricule' },
                  { key: 'Nom_Etudiant', label: 'Nom' },
                  { key: 'Prenoms_Etudiant', label: 'Prénoms' },
                  { key: 'Nom_Classe', label: 'Classe' },
                ]}
                data={recentEtudiants}
                actions={() => null} // No actions needed for this summary view
              />
            ) : (
              <div className="p-8 text-center text-gray-500">Aucun étudiant trouvé.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
