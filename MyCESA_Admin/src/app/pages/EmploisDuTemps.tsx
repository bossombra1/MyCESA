import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, Download, Eye, File, FileImage, FileSpreadsheet, FileText,
  Loader2, RefreshCw, Trash2, Upload, X,
} from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { classesService, emploisDuTempsService } from '../../services';
import { IconButton, Notice, PageHeader, StatCard } from '../components/crud';

/**
 * Emplois du temps -- MyCESA_Admin
 *
 * Cette page reproduit la logique de l'administration Laravel
 * (mycesa-admin : EmploiTempsController::index / create / destroyFile) :
 * un emploi du temps est un FICHIER publie pour une classe (PDF / image /
 * tableur / document), l'ancien fichier restant consultable dans l'historique.
 *
 * La saisie structuree de creneaux (table EMPLOI_TEMPS) n'est volontairement
 * plus exposee ici : cote Laravel elle est deja du code mort (la methode
 * create() retourne la vue "create-fichier" avant d'atteindre l'editeur
 * structure), et le mobile ne consomme que les fichiers publies
 * (GET /emplois-du-temps) ainsi que /emploiTemps en lecture seule.
 */

type EmploiFile = {
  id: number;
  classe_id: number;
  nom_fichier_original: string;
  type_mime: string;
  created_at: string;
};

type FileGroup = {
  classe_id: number;
  nom_classe?: string;
  actif: EmploiFile | null;
  historique: EmploiFile[];
};

type ApercuFichier = { url: string; mime: string; nom: string };

const ACCEPTED = '.jpg,.jpeg,.png,.pdf,.xlsx,.xls,.docx,.doc';
const MAX_SIZE_MO = 20;

/** Un apercu integre n'est possible que pour les formats affichables par le navigateur. */
const peutApercu = (mime = '') => mime.startsWith('image/') || mime === 'application/pdf';

const fileIcon = (mime = '') => {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('spreadsheet') || mime.includes('excel')) return FileSpreadsheet;
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('document')) return FileText;
  return File;
};

/** Formatage sur : la colonne created_at peut etre absente ou nulle. */
const formatDate = (valeur?: string) => {
  if (!valeur) return '—';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

/** Verifie qu'un identifiant de fichier est exploitable avant tout appel API. */
const idFichier = (file?: EmploiFile | null) => {
  const id = Number(file?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export default function EmploisDuTemps() {
  const { data: rawClasses } = useApiData<any[]>(classesService.getAll, []);
  const {
    data: groups, loading: loadingFiles, error: errorFichiers, reload: reloadFichiers,
  } = useApiData<FileGroup[]>(emploisDuTempsService.getAll, []);

  const classes = useMemo(() => rawClasses.filter(Boolean), [rawClasses]);
  const fichiers = useMemo(() => (Array.isArray(groups) ? groups : []), [groups]);

  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [apercuFichier, setApercuFichier] = useState<ApercuFichier | null>(null);
  const [chargementApercu, setChargementApercu] = useState<number | null>(null);
  const fichierInputRef = useRef<HTMLInputElement>(null);

  const classeActive = classes.find((classe) => String(classe.id) === selectedClasse) || null;
  const visibleGroups = selectedClasse
    ? fichiers.filter((group) => String(group.classe_id) === selectedClasse)
    : fichiers;

  const fichiersActifs = fichiers.filter((group) => idFichier(group.actif)).length;
  const classesSansFichier = classes.filter(
    (classe) => !fichiers.some((group) => String(group.classe_id) === String(classe.id) && idFichier(group.actif)),
  ).length;

  // Une classe est toujours selectionnee : la publication et l'historique
  // dependent de cette valeur, un etat vide rendrait la page peu lisible.
  useEffect(() => {
    if (!selectedClasse && classes[0]) setSelectedClasse(String(classes[0].id));
  }, [classes, selectedClasse]);

  // Les messages de succes / erreur ne doivent pas rester affiches indefiniment.
  useEffect(() => {
    if (!message && !messageError) return undefined;
    const timer = window.setTimeout(() => { setMessage(''); setMessageError(''); }, 6000);
    return () => window.clearTimeout(timer);
  }, [message, messageError]);

  const fermerApercu = () => {
    if (apercuFichier?.url) URL.revokeObjectURL(apercuFichier.url);
    setApercuFichier(null);
  };

  // Libere l'URL blob si le composant est demonte avec un apercu ouvert.
  useEffect(() => () => {
    setApercuFichier((courant) => {
      if (courant?.url) URL.revokeObjectURL(courant.url);
      return null;
    });
  }, []);

  const choisirClasse = (valeur: string) => {
    setSelectedClasse(valeur);
    setMessage(''); setMessageError('');
  };

  const choisirFichier = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(''); setMessageError('');
    setSelectedFile(event.target.files?.[0] || null);
  };

  const publier = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(''); setMessageError('');

    if (!selectedClasse) return setMessageError('Sélectionnez une classe.');
    if (!selectedFile) return setMessageError('Sélectionnez un fichier à publier.');

    // Le backend refuse au-dela de 20 Mo : on evite un aller-retour inutile.
    if (selectedFile.size > MAX_SIZE_MO * 1024 * 1024) {
      return setMessageError(`Le fichier dépasse la taille maximale de ${MAX_SIZE_MO} Mo.`);
    }

    setSending(true);
    try {
      await emploisDuTempsService.upload(selectedClasse, selectedFile);
      setSelectedFile(null);
      // Reinitialise l'input : sans cela, re-selectionner le meme fichier
      // ne declenche aucun evenement change.
      if (fichierInputRef.current) fichierInputRef.current.value = '';
      setMessage('Emploi du temps publié.');
      await reloadFichiers();
    } catch (requestError: any) {
      setMessageError(requestError?.response?.data?.error || 'Impossible de publier le fichier.');
    } finally {
      setSending(false);
    }
  };

  const telecharger = async (file?: EmploiFile | null) => {
    const id = idFichier(file);
    if (!id) return setMessageError("Ce fichier n'a pas d'identifiant exploitable.");
    setMessage(''); setMessageError('');
    try {
      const response = await emploisDuTempsService.download(id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file?.nom_fichier_original || `emploi-du-temps-${id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError: any) {
      setMessageError(requestError?.response?.data?.error || 'Téléchargement impossible.');
    }
  };

  const previsualiser = async (file?: EmploiFile | null) => {
    const id = idFichier(file);
    if (!id) return setMessageError("Ce fichier n'a pas d'identifiant exploitable.");
    setMessage(''); setMessageError('');
    setChargementApercu(id);
    try {
      const response = await emploisDuTempsService.preview(id);
      fermerApercu();
      setApercuFichier({
        url: URL.createObjectURL(response.data),
        mime: file?.type_mime || response.data?.type || '',
        nom: file?.nom_fichier_original || 'Emploi du temps',
      });
    } catch (requestError: any) {
      setMessageError(requestError?.response?.data?.error || 'Impossible de prévisualiser ce fichier.');
    } finally {
      setChargementApercu(null);
    }
  };

  const remplacer = (classeId: number) => {
    choisirClasse(String(classeId));
    setSelectedFile(null);
    if (fichierInputRef.current) fichierInputRef.current.value = '';
    // L'input est rendu hors de l'ecran : on attend la frame suivante avant
    // de l'ouvrir, sinon le clic programme est ignore par le navigateur.
    requestAnimationFrame(() => fichierInputRef.current?.click());
  };

  const supprimer = async (file?: EmploiFile | null) => {
    const id = idFichier(file);
    if (!id) return setMessageError("Ce fichier n'a pas d'identifiant exploitable.");
    const nom = file?.nom_fichier_original || `fichier #${id}`;
    if (!window.confirm(`Supprimer définitivement « ${nom} » ?`)) return;
    setMessage(''); setMessageError('');
    try {
      await emploisDuTempsService.delete(id);
      setMessage('Fichier supprimé.');
      await reloadFichiers();
    } catch (requestError: any) {
      setMessageError(requestError?.response?.data?.error || 'Impossible de supprimer ce fichier.');
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Emplois du temps" subtitle="Fichiers publiés par classe">
        <button
          type="button"
          onClick={reloadFichiers}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </PageHeader>

      {messageError && <Notice kind="error">{messageError}</Notice>}
      {message && <Notice kind="success">{message}</Notice>}
      {errorFichiers && <Notice kind="error">Fichiers : {errorFichiers}</Notice>}

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Classes" value={classes.length} icon={FileText} color="text-blue-600" />
        <StatCard label="Fichiers actifs" value={loadingFiles ? '…' : fichiersActifs} icon={Upload} color="text-emerald-600" />
        <StatCard label="Classes sans fichier" value={loadingFiles ? '…' : classesSansFichier} icon={AlertCircle} color="text-amber-600" />
      </div>

      {/* Publication d'un fichier */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Publier un emploi du temps</h2>
        <p className="mt-1 text-sm text-gray-500">
          Le fichier publié devient le document actif de la classe ; la version précédente reste consultable dans l’historique.
        </p>

        <form onSubmit={publier} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm font-semibold text-gray-700">
            Classe <span className="text-red-500">*</span>
            <select
              value={selectedClasse}
              required
              onChange={(event) => choisirClasse(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">— Sélectionner —</option>
              {classes.map((classe) => (
                <option key={classe.id} value={String(classe.id)}>
                  {classe.nom}{classe.filiere ? ` — ${classe.filiere}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-gray-700 sm:col-span-2">
            Fichier de l’emploi du temps <span className="text-red-500">*</span>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <input
                ref={fichierInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={choisirFichier}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-600 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={sending || !selectedFile || !selectedClasse}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Publier
              </button>
            </div>
            <span className="mt-1 block text-xs font-normal text-gray-500">
              JPG, PNG, PDF, Excel ou Word — {MAX_SIZE_MO} Mo maximum.
            </span>
          </label>
        </form>

        {classes.length === 0 && (
          <div className="mt-4">
            <Notice kind="info">Créez d’abord au moins une classe pour pouvoir publier un emploi du temps.</Notice>
          </div>
        )}
      </div>


      {/* Fichiers actifs par classe */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fichiers actifs</h2>
            <p className="text-sm text-gray-500">
              {selectedClasse && classeActive
                ? `Documents disponibles pour ${classeActive.nom}`
                : `${fichiersActifs} classe(s) avec un document actif`}
            </p>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Classe affichée
            <select
              value={selectedClasse}
              onChange={(event) => choisirClasse(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
            >
              <option value="">— Toutes les classes —</option>
              {classes.map((classe) => (
                <option key={classe.id} value={String(classe.id)}>
                  {classe.nom}{classe.filiere ? ` — ${classe.filiere}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="divide-y divide-gray-200">
          {loadingFiles ? (
            <div className="flex items-center justify-center gap-2 px-6 py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement des fichiers…
            </div>
          ) : visibleGroups.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <File className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>Aucun emploi du temps trouvé</p>
            </div>
          ) : (
            visibleGroups.map((group) => {
              const actifId = idFichier(group.actif);
              const historique = Array.isArray(group.historique) ? group.historique : [];
              return (
                <div key={group.classe_id} className="px-6 py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {group.nom_classe || `Classe ${group.classe_id}`}
                    </p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      actifId ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {actifId ? 'Document publié' : 'Aucun document'}
                    </span>
                  </div>

                  {group.actif ? (
                    <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                          {(() => { const FileIcon = fileIcon(group.actif?.type_mime); return <FileIcon className="h-5 w-5 text-blue-600" />; })()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{group.actif.nom_fichier_original}</p>
                          <p className="text-sm text-gray-500">
                            Publié le {formatDate(group.actif.created_at)}
                            {peutApercu(group.actif.type_mime) ? ' · Aperçu disponible' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        {peutApercu(group.actif.type_mime) && (
                          <button
                            type="button"
                            onClick={() => previsualiser(group.actif)}
                            disabled={!actifId || chargementApercu === actifId}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                          >
                            {chargementApercu === actifId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                            Aperçu
                          </button>
                        )}
                        <IconButton tone="slate" title="Télécharger" disabled={!actifId} onClick={() => telecharger(group.actif)}>
                          <Download className="h-4 w-4" />
                        </IconButton>
                        <IconButton tone="blue" title="Remplacer par un nouveau fichier" onClick={() => remplacer(group.classe_id)}>
                          <Upload className="h-4 w-4" />
                        </IconButton>
                        <IconButton tone="red" title="Supprimer le fichier actif" disabled={!actifId} onClick={() => supprimer(group.actif)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-gray-300 p-4 sm:flex-row sm:items-center">
                      <p className="text-sm text-gray-500">Aucun document publié pour cette classe.</p>
                      <button
                        type="button"
                        onClick={() => remplacer(group.classe_id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4" /> Publier un fichier
                      </button>
                    </div>
                  )}


                  {historique.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                        Versions précédentes ({historique.length})
                      </p>
                      <div className="space-y-2">
                        {historique.map((file, index) => {
                          const histId = idFichier(file);
                          return (
                            <div key={histId ?? `version-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100">
                                  {(() => { const FileIcon = fileIcon(file?.type_mime); return <FileIcon className="h-4 w-4 text-gray-500" />; })()}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm text-gray-900">{file?.nom_fichier_original || '—'}</p>
                                  <p className="text-xs text-gray-500">{formatDate(file?.created_at)}</p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <IconButton tone="slate" title="Télécharger cette version" disabled={!histId} onClick={() => telecharger(file)}>
                                  <Download className="h-4 w-4" />
                                </IconButton>
                                {peutApercu(file?.type_mime) && (
                                  <IconButton tone="blue" title="Prévisualiser cette version" disabled={!histId || chargementApercu === histId} onClick={() => previsualiser(file)}>
                                    {chargementApercu === histId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                  </IconButton>
                                )}
                                <IconButton tone="red" title="Supprimer cette version" disabled={!histId} onClick={() => supprimer(file)}>
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Apercu plein ecran (PDF / image) */}
      {apercuFichier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && fermerApercu()}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apercu-fichier-title"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <h2 id="apercu-fichier-title" className="truncate font-semibold text-gray-900">{apercuFichier.nom}</h2>
              <button
                type="button"
                onClick={fermerApercu}
                aria-label="Fermer l’aperçu"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 overflow-auto bg-gray-100 p-4">
              {apercuFichier.mime === 'application/pdf' ? (
                <iframe
                  src={`${apercuFichier.url}#toolbar=1&view=FitH`}
                  title={apercuFichier.nom}
                  className="h-[75vh] w-full rounded-lg bg-white"
                />
              ) : (
                <img
                  src={apercuFichier.url}
                  alt={apercuFichier.nom}
                  className="mx-auto max-h-[75vh] w-auto rounded-lg bg-white object-contain shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

