import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { StatsChart, NotesChart } from '../../components/charts/Charts';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEtudiants: 0,
    totalProfs: 0,
    totalClasses: 0,
    paiementsMois: 0,
  });
  const [statsChart, setStatsChart] = useState([]);
  const [notesChart, setNotesChart] = useState([]);
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

      // Données pour les graphiques
      setStatsChart([
        { name: 'Étudiants', value: etudiantsRes.data.length || 0 },
        { name: 'Professeurs', value: profsRes.data.length || 0 },
        { name: 'Classes', value: classesRes.data.length || 0 },
      ]);

      setNotesChart([
        { name: 'Classe A', moyenne: 15.5, min: 8, max: 19 },
        { name: 'Classe B', moyenne: 14.2, min: 7, max: 18 },
        { name: 'Classe C', moyenne: 16.1, min: 9, max: 20 },
      ]);
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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsChart data={statsChart} title="Statistiques générales" />
        <NotesChart data={notesChart} title="Moyennes par classe" />
      </div>
    </div>
  );
}
