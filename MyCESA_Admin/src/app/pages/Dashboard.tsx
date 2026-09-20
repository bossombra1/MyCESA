import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, School, BookOpen, Layers, Building2,
  BarChart3, DollarSign,
} from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import {
  statistiquesService,
  statsParFiliereService,
  statsParCycleService,
  statsParClasseService,
  statsParGenreService,
  statsParRoleService,
} from '../../services';
import { formatFcfa } from '../components/crud';

const STATS_VIDE = {
  etudiants: 0, professeurs: 0, classes: 0, matieres: 0,
  filieres: 0, cycles: 0, salles: 0, utilisateurs: 0,
  evenements: 0, absences: 0, notes: 0, creneaux: 0,
  versements: 0, montantVerse: 0,
};

type ChartData = { label: string; value: number }[];

export default function Dashboard() {
  const { data: stats, loading: loadingStats } = useApiData<typeof STATS_VIDE>(
    () => statistiquesService.get() as any,
    STATS_VIDE,
  );
  const { data: parFiliere, loading: loadingFiliere } = useApiData<ChartData>(statsParFiliereService.get, []);
  const { data: parCycle, loading: loadingCycle } = useApiData<ChartData>(statsParCycleService.get, []);
  const { data: parGenre, loading: loadingGenre } = useApiData<ChartData>(statsParGenreService.get, []);
  const { data: parRole, loading: loadingRole } = useApiData<ChartData>(statsParRoleService.get, []);
  const { data: parClasse, loading: loadingClasse } = useApiData<ChartData>(statsParClasseService.get, []);

  const isLoading = loadingStats || loadingFiliere || loadingCycle || loadingGenre || loadingRole || loadingClasse;
  const maxValue = (data: ChartData) => Math.max(...data.map(d => d.value), 1);

  const renderBarChart = (data: ChartData, color: string, title: string) => {
    if (!data || data.length === 0) return null;
    const max = maxValue(data);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.slice(0, 8).map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-28 text-xs text-gray-600 truncate" title={item.label}>{item.label}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${(item.value / max) * 100}%` }} />
              </div>
              <span className="w-16 text-right text-xs font-semibold text-gray-700">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de l'établissement scolaire</p>
      </div>

      {/* Grille des indicateurs clés */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Étudiants" value={isLoading ? '…' : stats.etudiants} icon={Users} color="text-blue-600 bg-blue-50" subtitle="inscrits" />
        <StatCard label="Professeurs" value={isLoading ? '…' : stats.professeurs} icon={GraduationCap} color="text-green-600 bg-green-50" subtitle="enseignants" />
        <StatCard label="Classes" value={isLoading ? '…' : stats.classes} icon={School} color="text-purple-600 bg-purple-50" subtitle="actives" />
        <StatCard label="Filières" value={isLoading ? '…' : stats.filieres} icon={Layers} color="text-indigo-600 bg-indigo-50" subtitle="proposées" />
        <StatCard label="Notes" value={isLoading ? '…' : stats.notes} icon={BookOpen} color="text-orange-600 bg-orange-50" subtitle="saisies" />
        <StatCard label="Encaissé" value={isLoading ? '…' : formatFcfa(stats.montantVerse)} icon={DollarSign} color="text-emerald-600 bg-emerald-50" subtitle="total versé" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderBarChart(parFiliere, 'bg-blue-500', 'Étudiants par Filière')}
        {renderBarChart(parCycle, 'bg-emerald-500', 'Étudiants par Cycle')}
        {renderBarChart(parGenre, 'bg-purple-500', 'Étudiants par Genre')}
        {renderBarChart(parRole, 'bg-amber-500', 'Comptes par Rôle')}
      </div>

      {/* Tableau des classes */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Effectifs par Classe
        </h3>
        {loadingClasse ? (
          <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border">Chargement...</div>
        ) : parClasse && parClasse.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Classe</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Effectif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parClasse.map((classe) => (
                  <tr key={classe.label} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{classe.label}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{classe.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border">Aucune donnée</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subtitle }: {
  label: string; value: string | number; icon: any; color: string; subtitle: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}