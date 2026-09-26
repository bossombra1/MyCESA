import { useMemo, useState } from 'react';
import { Plus, Search, Download, UserX, TrendingDown, AlertTriangle, CheckCircle, Trash2, Loader2, Smartphone } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import AbsenceFormModal, { type AbsenceFormValues } from '../components/AbsenceFormModal';
import { absencesService, classesService, etudiantsService, filieresService } from '../../services';

// Qui a signalé l'absence. Le backend renvoie `Saisie_Par` (nom de
// l'utilisateur qui a créé l'absence), mappé en `saisiePar` par le service,
// éventuellement enrichi du rôle. On dégrade proprement si le backend ne
// renvoie que la chaîne.
const infosCreateur = (absence: any): { nom: string; role?: string; viaMobile?: boolean } => {
  const c = absence.creePar ?? absence.saisiePar;
  if (!c) return { nom: '—' };
  if (typeof c === 'string') return { nom: c, role: absence.roleCreePar || undefined };
  const nom = [c.nom, c.prenoms].filter(Boolean).join(' ') || c.nomComplet || c.email || '—';
  const role = c.role || c.fonction || absence.roleCreePar || undefined;
  const viaMobile = Boolean(c.source === 'mobile' || c.via === 'mobile' || absence.source === 'mobile');
  return { nom, role, viaMobile };
};

// Extrait le message d'erreur réel de l'API au lieu d'un texte générique,
// pour comprendre pourquoi une action échoue (route absente, validation...).
const extraireMessageErreur = (e: any, repli: string) => {
  const data = e?.response?.data;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(', ');
  if (e?.response?.status) return `${repli} (code ${e.response.status})`;
  if (e?.message) return `${repli} (${e.message})`;
  return repli;
};

// Formate 'YYYY-MM-DD' en jj/mm/aaaa sans passer par Date (évite les
// décalages de fuseau horaire sur les dates renvoyées par l'API).
const formatDate = (v: string) => {
  const s = String(v || '').slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : new Date(v).toLocaleDateString('fr-FR');
};

export default function Absences() {
  const { data: absences, loading, error, reload } = useApiData<any[]>(absencesService.getAll, []);
  const { data: etudiants } = useApiData<any[]>(etudiantsService.getAll, []);
  const { data: classes } = useApiData<any[]>(classesService.getAll, []);
  const { data: filieres } = useApiData<any[]>(filieresService.getAll, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filtreJustifiee, setFiltreJustifiee] = useState<'toutes' | 'justifiees' | 'non-justifiees'>('toutes');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAbsences = absences.filter((absence) => {
    const matchesSearch = [absence.etudiant, absence.matricule]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
    const matchesFiltre = filtreJustifiee === 'toutes'
      || (filtreJustifiee === 'justifiees' ? absence.justifiee : !absence.justifiee);
    return matchesSearch && matchesFiltre;
  });

  const totalHeuresAbsence = absences.reduce((sum, a) => sum + (Number(a.heures) || 0), 0);
  const absencesNonJustifiees = absences.filter((a) => !a.justifiee).length;
  const absencesJustifiees = absences.filter((a) => a.justifiee).length;

  const alertes = useMemo(() => {
    const map = new Map<string, { nom: string; matricule: string; count: number }>();
    absences.filter((a) => !a.justifiee).forEach((a) => {
      const cle = String(a.etudiantId ?? a.matricule ?? a.etudiant);
      if (!map.has(cle)) map.set(cle, { nom: a.etudiant || 'Étudiant', matricule: a.matricule || '', count: 0 });
      map.get(cle)!.count += 1;
    });
    return Array.from(map.values()).filter((v) => v.count >= 2).sort((a, b) => b.count - a.count);
  }, [absences]);

  const saveAbsence = async (values: AbsenceFormValues) => {
    setSubmitting(true); setSubmitError('');
    const echecs: string[] = [];
    try {
      await Promise.all(values.etudiantIds.map(async (id) => {
        try {
          await absencesService.create({
            etudiantId: Number(id),
            date: values.date,
            heures: Number(values.heures),
            justifiee: values.justifiee === 'true',
          });
        } catch (requestError: any) {
          const etu = etudiants.find((e) => String(e.id) === id);
          echecs.push(etu ? `${etu.nom} ${etu.prenoms}` : id);
        }
      }));
      await reload();
      if (echecs.length > 0) setSubmitError(`Absence non enregistrée pour : ${echecs.join(', ')}.`);
      else setModalOpen(false);
    } finally { setSubmitting(false); }
  };

  const marquerBusy = (cle: string, busy: boolean) => {
    setBusyKeys((prev) => {
      const next = new Set(prev);
      if (busy) next.add(cle); else next.delete(cle);
      return next;
    });
  };

  const justifierAbsence = async (absence: any, cle: string) => {
    setActionError(''); marquerBusy(cle, true);
    try { await absencesService.justifier({ etudiantId: absence.etudiantId ?? absence.id, date: absence.date, utilisateurId: absence.utilisateurId }); await reload(); }
    catch (e: any) { setActionError(extraireMessageErreur(e, 'Impossible de justifier cette absence.')); }
    finally { marquerBusy(cle, false); }
  };

  const supprimerAbsence = async (absence: any, cle: string) => {
    const libelle = absence.etudiant ? `de ${absence.etudiant}` : 'sélectionnée';
    if (!window.confirm(`Supprimer l’absence ${libelle} du ${formatDate(absence.date)} ?`)) return;
    setActionError(''); marquerBusy(cle, true);
    try { await absencesService.delete({ etudiantId: absence.etudiantId ?? absence.id, date: absence.date, utilisateurId: absence.utilisateurId }); await reload(); }
    catch (e: any) { setActionError(extraireMessageErreur(e, 'Impossible de supprimer cette absence.')); }
    finally { marquerBusy(cle, false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Absences</h1>
          <p className="mt-2 text-gray-600">Suivez et justifiez les absences des étudiants</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            <Download className="h-5 w-5" />Exporter
          </button>
          <button type="button" onClick={() => { setSubmitError(''); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
            <Plus className="h-5 w-5" />Signaler absence
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total absences</p><p className="mt-1 text-2xl font-bold text-gray-900">{absences.length}</p></div>
            <UserX className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Heures perdues</p><p className="mt-1 text-2xl font-bold text-orange-600">{totalHeuresAbsence}h</p></div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Non justifiées</p><p className="mt-1 text-2xl font-bold text-red-600">{absencesNonJustifiees}</p></div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Justifiées</p><p className="mt-1 text-2xl font-bold text-green-600">{absencesJustifiees}</p></div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un étudiant (nom, matricule)…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            {([
              { value: 'toutes', label: 'Toutes' },
              { value: 'non-justifiees', label: 'Non justifiées' },
              { value: 'justifiees', label: 'Justifiées' },
            ] as const).map((opt) => (
              <button key={opt.value} type="button" onClick={() => setFiltreJustifiee(opt.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filtreJustifiee === opt.value ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{actionError}</div>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Chargement...</div>
        ) : filteredAbsences.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <UserX className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>{absences.length === 0 ? 'Aucune absence enregistrée' : 'Aucune absence ne correspond à la recherche'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Étudiant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">Heures</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Justifiée</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Créé par</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAbsences.map((absence) => {
                  // ABSENTER n'a pas d'identifiant unique : la clé stable est la
                  // clé composite (étudiant, utilisateur, date) renvoyée par le
                  // service. Elle garantit l'unicité et reste cohérente avec les
                  // routes justifier/supprimer du backend.
                  const cle = `${absence.etudiantId ?? absence.id ?? 'abs'}-${absence.utilisateurId ?? 'u'}-${absence.date ?? 'd'}`;
                  const occupe = busyKeys.has(cle);
                  const createur = infosCreateur(absence);
                  return (
                    <tr key={cle} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{absence.etudiant || '—'}</div>
                        <div className="font-mono text-sm text-gray-500">{absence.matricule}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(absence.date)}</td>
                      <td className="px-6 py-4 text-center"><span className="text-sm font-semibold text-gray-900">{absence.heures}h</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${absence.justifiee ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{createur.nom}</div>
                        {(createur.role || createur.viaMobile) && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            {createur.viaMobile && <Smartphone className="h-3 w-3" />}
                            {createur.role || 'Via mobile'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {!absence.justifiee && (
                            <button type="button" onClick={() => justifierAbsence(absence, cle)} disabled={occupe}
                              title="Marquer cette absence comme justifiée"
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:border-green-500 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50">
                              {occupe ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              Justifier
                            </button>
                          )}
                          <button type="button" onClick={() => supprimerAbsence(absence, cle)} disabled={occupe}
                            title="Supprimer cette absence"
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:border-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {alertes.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-orange-600" />
            <div className="space-y-1">
              <h3 className="mb-1 font-semibold text-orange-900">Étudiants à surveiller</h3>
              {alertes.slice(0, 3).map((a) => (
                <p key={a.matricule || a.nom} className="text-sm text-orange-800">
                  <strong>{a.nom}{a.matricule ? ` (${a.matricule})` : ''}</strong> a accumulé <strong>{a.count} absences non justifiées</strong>. Intervention recommandée.
                </p>
              ))}
              {alertes.length > 3 && <p className="text-xs text-orange-700">+{alertes.length - 3} autre(s) étudiant(s) concerné(s).</p>}
            </div>
          </div>
        </div>
      )}

      {modalOpen && <AbsenceFormModal
        etudiants={etudiants}
        filieres={filieres}
        classes={classes}
        error={submitError}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={saveAbsence}
      />}
    </div>
  );
}