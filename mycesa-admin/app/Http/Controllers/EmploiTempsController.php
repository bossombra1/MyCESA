<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory as SpreadsheetIOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as SpreadsheetDate;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class EmploiTempsController extends ApiController
{
    public function index(Request $request)
    {
        $fichiers = $this->getData('/emplois-du-temps');
        $classes  = $this->getData('/classes');
        return view('emplois.index', compact('fichiers', 'classes'));
    }

    public function edit(array $emploi)
    {
        $classes = $this->getData('/classes');
        $profs = $this->getData('/professeurs');
        $matieres = $this->getData('/matieres');
        $salles = $this->getData('/salles');
        return view('emplois.edit', compact('emploi', 'classes', 'profs', 'matieres', 'salles'));
    }

    public function update(Request $request)
    {
        try {
            $ancien = [
                'Id_PROFESSEUR' => $request->input('ancien_Id_PROFESSEUR'),
                'Id_SALLE' => $request->input('ancien_Id_SALLE'),
                'Id_MATIERE' => $request->input('ancien_Id_MATIERE'),
                'Id_CLASSE' => $request->input('ancien_Id_CLASSE'),
                'Jour_Semaine' => $request->input('ancien_Jour_Semaine'),
                'Heure_Debut' => $request->input('ancien_Heure_Debut'),
            ];
            $nouveau = $request->only(['Id_PROFESSEUR','Id_SALLE','Id_MATIERE','Id_CLASSE','Jour_Semaine','Date_Debut','Heure_Debut','Heure_Fin']);
            $response = $this->api()->put('/emploiTemps/slot', compact('ancien', 'nouveau'));
            if ($response->successful()) return redirect()->route('emplois-temps.index')->with('success', 'Créneau modifié et archivé.');
            return back()->with('error', $response->json()['error'] ?? 'Modification impossible.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier le créneau'); }
    }

    public function archive(Request $request)
    {
        $archive = $this->getData('/emploiTemps/archive?classe=' . urlencode((string) $request->get('classe', '')));
        $classes = $this->getData('/classes');
        return view('emplois.archive', compact('archive', 'classes'));
    }

    public function create(Request $request)
    {
        $classes = $this->getData('/classes');
        return view('emplois.create-fichier', compact('classes'));

        /* Legacy structured editor kept below for existing callers. */
        $periode  = $request->get('periode');
        $reference = $request->get('mois_reference');
        $referenceDate = $reference ? \Carbon\Carbon::createFromFormat('Y-m', $reference) : now();
        $mois     = max(1, min(12, (int) $request->get('mois', $referenceDate->month)));
        $annee    = max(2020, min(2100, (int) $request->get('annee', $referenceDate->year)));
        $classes  = $this->getData('/classes');
        $profs    = $this->getData('/professeurs');
        $matieres = $this->getData('/matieres');
        $salles   = $this->getData('/salles');
        $importedRows = session('emploi_import_rows', []);

        if (!$periode) {
            return view('emplois.choix-periode', compact('classes'));
        }

        $debut = $periode === 'semaine'
            ? now()->startOfWeek()
            : \Carbon\Carbon::create($annee, $mois, 1)->startOfWeek();
        $fin = $periode === 'annee'
            ? \Carbon\Carbon::create($annee, 12, 31)
            : \Carbon\Carbon::create($annee, $mois, 1)->endOfMonth();

        $semaines = [];
        for ($semaine = 0; $debut->lte($fin) && ($periode !== 'semaine' || $semaine === 0); $semaine++) {
            $jours = [];
            for ($jour = 0; $jour < 6; $jour++) {
                $date = $debut->copy()->addDays($jour);
                $jours[] = [
                    'nom' => ucfirst($date->locale('fr')->dayName),
                    'date' => $date->format('Y-m-d'),
                ];
            }
            $semaines[] = $jours;
            $debut->addWeek();
        }

        // Un import peut contenir plusieurs cours le même jour. Dans ce cas,
        // reconstruire les lignes à partir des dates importées pour ne rien perdre.
        if ($importedRows) {
            $importDates = array_map(fn ($row) => [
                'nom' => $row['Jour_Semaine'] ?? '',
                'date' => $row['Date_Debut'] ?? now()->format('Y-m-d'),
            ], $importedRows);
            $semaines = array_chunk($importDates, 6);
        }

        return view('emplois.create', compact(
            'periode', 'mois', 'annee', 'semaines', 'importedRows', 'classes', 'profs', 'matieres', 'salles'
        ));
    }

    public function import(Request $request)
    {
        $request->validate([
            'planning_file' => 'required|file|mimes:xlsx,xls,csv,docx,pdf|max:10240',
        ]);

        $file = $request->file('planning_file');
        $extension = strtolower($file->getClientOriginalExtension());
        $rows = [];

        if (in_array($extension, ['xlsx', 'xls', 'csv'], true)) {
            $sheet = SpreadsheetIOFactory::load($file->getRealPath())->getActiveSheet();
            $rawRows = $sheet->toArray(null, true, true, false);
            $headers = array_map(fn($header) => $this->normalizeImportHeader((string) $header), array_shift($rawRows) ?? []);
            foreach ($rawRows as $rawRow) {
                $row = array_combine($headers, array_pad($rawRow, count($headers), null));
                if ($row && array_filter($row)) $rows[] = $this->normalizeImportedRow($row);
            }
        } else {
            $text = $extension === 'docx'
                ? $this->readDocxText($file->getRealPath())
                : (new PdfParser())->parseFile($file->getRealPath())->getText();
            foreach (preg_split('/\r\n|\r|\n/', $text) as $line) {
                $columns = preg_split('/\t+|\s{2,}/', trim($line));
                if (count($columns) >= 7) {
                    $rows[] = $this->normalizeImportedRow(array_combine(
                        ['date', 'debut', 'fin', 'classe', 'matiere', 'professeur', 'salle'],
                        array_slice($columns, 0, 7)
                    ));
                }
            }
        }

        if (!$rows) {
            return back()->with('error', 'Aucune ligne exploitable. Utilisez les colonnes Date, Début, Fin, Classe, Matière, Professeur, Salle.');
        }

        $classes = $this->getData('/classes');
        $matieres = $this->getData('/matieres');
        $profs = $this->getData('/professeurs');
        $salles = $this->getData('/salles');
        foreach ($rows as &$row) {
            $row['Id_CLASSE'] = $this->findId($classes, 'Id_CLASSE', 'Nom_Classe', $row['classe_label']);
            $row['Id_MATIERE'] = $this->findId($matieres, 'Id_MATIERE', 'Nom_Matiere', $row['matiere_label']);
            $row['Id_PROFESSEUR'] = $this->findId($profs, 'Id_PROFESSEUR', 'Nom_Prenoms_Profe', $row['professeur_label']);
            $row['Id_SALLE'] = $this->findId($salles, 'Id_SALLE', 'Nom_Salle', $row['salle_label']);
        }
        unset($row);

        session(['emploi_import_rows' => $rows]);
        return redirect()->route('emplois-temps.create', ['periode' => 'semaine'])
            ->with('success', count($rows) . ' ligne(s) importée(s). Vérifiez-les avant enregistrement.');
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'classe_id' => 'required|integer',
            'fichier' => 'required|file|mimes:jpg,jpeg,png,pdf,xlsx,xls,docx,doc|max:20480',
        ]);

        try {
            $file = $request->file('fichier');
            $mimeType = $file->getClientMimeType() ?: $file->getMimeType() ?: 'application/octet-stream';

            // apiMultipart() : indispensable, l'envoi doit rester en
            // multipart/form-data (voir ApiController::apiMultipart()).
            $response = $this->apiMultipart()
                ->attach('file', fopen($file->getRealPath(), 'r'), $file->getClientOriginalName(), [
                    'Content-Type' => $mimeType,
                ])
                ->post('/emplois-du-temps/upload', ['classe_id' => $request->integer('classe_id')]);

            if (!$response->successful()) {
                $message = $response->json('error') ?? $response->json('message')
                    ?? 'Publication impossible (code HTTP ' . $response->status() . ').';
                return back()->with('error', $message)->withInput();
            }

            return redirect()->route('emplois-temps.index')->with('success', 'Emploi du temps publié.');
        } catch (\Exception $e) {
            report($e);
            return back()->with('error', 'Impossible de publier le fichier : ' . $e->getMessage())->withInput();
        }
    }

    public function downloadFile($id)
    {
        try {
            $response = $this->api()->get("/emplois-du-temps/{$id}/download");
            if (!$response->successful()) {
                return back()->with('error', $response->json('error') ?? 'Fichier introuvable.');
            }

            return response($response->body(), 200, [
                'Content-Type' => $response->header('Content-Type') ?: 'application/octet-stream',
                'Content-Disposition' => $response->header('Content-Disposition') ?: 'attachment',
                'Content-Length' => $response->header('Content-Length') ?: strlen($response->body()),
            ]);
        } catch (\Exception $e) {
            report($e);
            return back()->with('error', 'Téléchargement impossible : API injoignable.');
        }
    }

    /**
     * Aperçu d'un fichier déjà publié : renvoie le document en « inline »
     * afin que le navigateur l'affiche (image, PDF) au lieu de le télécharger.
     */
    public function previewFile($id)
    {
        try {
            $response = $this->api()->get("/emplois-du-temps/{$id}/download", ['inline' => 1]);
            if (!$response->successful()) {
                abort($response->status() >= 400 ? $response->status() : 404, 'Fichier introuvable.');
            }

            return response($response->body(), 200, [
                'Content-Type' => $response->header('Content-Type') ?: 'application/octet-stream',
                'Content-Disposition' => $response->header('Content-Disposition') ?: 'inline',
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            abort(502, 'Aperçu indisponible : API injoignable.');
        }
    }

    public function destroyFile($id)
    {
        $response = $this->api()->delete("/emplois-du-temps/{$id}");
        if (!$response->successful()) return back()->with('error', $response->json('error') ?? 'Suppression impossible.');
        return back()->with('success', 'Fichier supprimé.');
    }

    private function normalizeImportHeader(string $header): string
    {
        $header = mb_strtolower(trim(iconv('UTF-8', 'ASCII//TRANSLIT', $header)));
        return match (true) {
            str_contains($header, 'date') => 'date',
            str_contains($header, 'debut'), str_contains($header, 'start') => 'debut',
            str_contains($header, 'fin'), str_contains($header, 'end') => 'fin',
            str_contains($header, 'classe') => 'classe',
            str_contains($header, 'matiere'), str_contains($header, 'cours') => 'matiere',
            str_contains($header, 'prof') => 'professeur',
            str_contains($header, 'salle'), str_contains($header, 'room') => 'salle',
            default => $header,
        };
    }

    private function normalizeImportedRow(array $row): array
    {
        $date = $row['date'] ?? null;
        if (is_numeric($date)) {
            $date = SpreadsheetDate::excelToDateTimeObject((float) $date)->format('Y-m-d');
        }
        if ($date && preg_match('/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/', trim((string) $date), $match)) {
            $date = sprintf('%04d-%02d-%02d', $match[3], $match[2], $match[1]);
        }
        $dateObject = $date ? \Carbon\Carbon::parse($date) : now();
        return [
            'Jour_Semaine' => ucfirst($dateObject->locale('fr')->dayName),
            'Date_Debut' => $dateObject->format('Y-m-d'),
            'Heure_Debut' => trim((string) ($row['debut'] ?? '')),
            'Heure_Fin' => trim((string) ($row['fin'] ?? '')),
            'classe_label' => trim((string) ($row['classe'] ?? '')),
            'matiere_label' => trim((string) ($row['matiere'] ?? '')),
            'professeur_label' => trim((string) ($row['professeur'] ?? '')),
            'salle_label' => trim((string) ($row['salle'] ?? '')),
        ];
    }

    private function findId(array $items, string $idKey, string $labelKey, string $label): ?int
    {
        foreach ($items as $item) {
            if (mb_strtolower(trim((string) ($item[$labelKey] ?? ''))) === mb_strtolower(trim($label))) {
                return (int) $item[$idKey];
            }
        }
        return null;
    }

    private function readDocxText(string $path): string
    {
        $document = WordIOFactory::load($path);
        $text = '';
        foreach ($document->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) $text .= $element->getText() . "\n";
            }
        }
        return $text;
    }

    public function store(Request $request)
    {
        $creneaux = $request->input('creneaux', []);
        $success  = 0;
        $errors   = [];

        foreach ($creneaux as $creneau) {
            if (empty($creneau['Heure_Debut'])) continue;
            if (empty($creneau['Id_PROFESSEUR']) || empty($creneau['Id_MATIERE']) || empty($creneau['Id_CLASSE']) || empty($creneau['Id_SALLE'])) {
                $errors[] = 'Ligne ignorée : classe, matière, professeur, salle et horaires sont obligatoires.';
                continue;
            }

            try {
                $r = $this->api()->post('/emploiTemps', [
                    'Id_PROFESSEUR'    => $creneau['Id_PROFESSEUR'] ?? null,
                    'Id_SALLE'         => $creneau['Id_SALLE'] ?? null,
                    'Id_MATIERE'       => $creneau['Id_MATIERE'] ?? null,
                    'Id_CLASSE'        => $creneau['Id_CLASSE'] ?? null,
                    'Date_Debut'      => $creneau['Date_Debut'] ?? null,
                    'Heure_Debut'      => $creneau['Heure_Debut'] ?? null,
                    'Heure_Fin'        => $creneau['Heure_Fin'] ?? null,
                    'Jour_Semaine'     => $creneau['Jour_Semaine'] ?? null,
                ]);
                if ($r->successful()) $success++;
                else $errors[] = $r->json()['error'] ?? $r->json()['message'] ?? 'Erreur créneau';
            } catch (\Exception $e) {
                $errors[] = $e->getMessage();
            }
        }

        if ($success > 0) {
            session()->forget('emploi_import_rows');
            $msg = "$success créneau(x) enregistré(s).";
            if (!empty($errors)) $msg .= ' (' . count($errors) . ' erreur(s))';
            return redirect()->route('emplois-temps.index')->with('success', $msg);
        }

        return back()->with('error', 'Aucun créneau enregistré. ' . implode(', ', $errors));
    }

    public function destroy($id)
    {
        try {
            $response = $this->api()->delete('/emploiTemps/slot', ['Id_PROFESSEUR' => request('Id_PROFESSEUR'), 'Id_SALLE' => request('Id_SALLE'), 'Id_MATIERE' => request('Id_MATIERE'), 'Id_CLASSE' => request('Id_CLASSE'), 'Jour_Semaine' => request('Jour_Semaine'), 'Heure_Debut' => request('Heure_Debut')]);
            if (!$response->successful()) return back()->with('error', $response->json()['error'] ?? 'Suppression impossible.');
            return redirect()->route('emplois-temps.index')->with('success', 'Créneau supprimé.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer le créneau');
        }
    }
}
