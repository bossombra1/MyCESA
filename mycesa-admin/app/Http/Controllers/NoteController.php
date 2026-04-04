<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NoteController extends ApiController
{
    public function index(Request $request)
    {
        $notes = $this->getData('/notes');

        if ($search = $request->get('search')) {
            $s = strtolower($search);
            $notes = array_filter($notes, fn($n) =>
                str_contains(strtolower($n['Nom_Complet'] ?? ''), $s) ||
                str_contains(strtolower($n['Matricule_Etudiant'] ?? ''), $s)
            );
        }

        // Grouper par étudiant
        $parEtudiant = [];
        foreach ($notes as $n) {
            $mat = $n['Matricule_Etudiant'] ?? 'inconnu';
            if (!isset($parEtudiant[$mat])) {
                $parEtudiant[$mat] = [
                    'matricule'   => $mat,
                    'nom_complet' => $n['Nom_Complet'] ?? '—',
                    'notes'       => [],
                ];
            }
            $parEtudiant[$mat]['notes'][] = $n;
        }

        // Moyenne par étudiant = moyenne pondérée par coef de TOUTES ses notes
        foreach ($parEtudiant as &$etudiant) {
            $etudiant['nb_notes'] = count($etudiant['notes']);
            $etudiant['moyenne']  = $this->moyennePonderee($etudiant['notes']);
        }

        return view('notes.index', compact('parEtudiant'));
    }

    public function show($matricule)
    {
        $notes         = $this->getData('/notes');
        $notesEtudiant = array_values(array_filter($notes, fn($n) =>
            ($n['Matricule_Etudiant'] ?? '') === $matricule
        ));

        if (empty($notesEtudiant)) {
            return back()->with('error', 'Aucune note trouvée pour cet étudiant.');
        }

        $nomComplet = $notesEtudiant[0]['Nom_Complet'] ?? '—';

        // Grouper par semestre puis matière
        $parSemestre = [];
        foreach ($notesEtudiant as $n) {
            $sem     = $n['Semestre'] ?? 'Semestre 1';
            $matiere = $n['Nom_Matiere'] ?? 'Matière inconnue';
            $parSemestre[$sem][$matiere][] = $n;
        }

        // Calculer stats par semestre
        // Moyenne semestre = moyenne pondérée de TOUTES les notes du semestre (même méthode que index)
        $stats = [];
        foreach ($parSemestre as $sem => $matieres) {
            $moyennesParMatiere = [];

            foreach ($matieres as $mat => $notesM) {
                $moyennesParMatiere[$mat] = $this->moyennePonderee($notesM);
            }

            // Toutes les notes du semestre pour la moyenne générale
            $toutesNotesSem = array_merge(...array_values($matieres));
            $moyGen         = $this->moyennePonderee($toutesNotesSem);

            $stats[$sem] = [
                'moyennes_par_matiere' => $moyennesParMatiere,
                'moyenne_generale'     => $moyGen,
                'mention'              => $this->getMention($moyGen),
            ];
        }

        // Moyenne globale = moyenne pondérée de TOUTES les notes
        $moyGlobale = $this->moyennePonderee($notesEtudiant);

        return view('notes.show', compact(
            'notesEtudiant', 'parSemestre', 'stats',
            'nomComplet', 'matricule', 'moyGlobale'
        ));
    }

    /**
     * Calcule la moyenne pondérée par coefficient d'une liste de notes.
     * C'est la seule méthode de calcul utilisée partout.
     */
    private function moyennePonderee(array $notes): ?float
    {
        $totalPts  = 0;
        $totalCoef = 0;
        foreach ($notes as $n) {
            $val  = floatval($n['Note_Evaluation'] ?? 0);
            $coef = floatval($n['Coef_Evaluation'] ?? 1);
            if ($val > 0 || isset($n['Note_Evaluation'])) {
                $totalPts  += $val * $coef;
                $totalCoef += $coef;
            }
        }
        return $totalCoef > 0 ? round($totalPts / $totalCoef, 2) : null;
    }

    private function getMention($note): array
    {
        if ($note === null) return [];
        if ($note >= 16) return ['txt' => 'Très Bien',   'color' => 'success'];
        if ($note >= 14) return ['txt' => 'Bien',        'color' => 'success'];
        if ($note >= 12) return ['txt' => 'Assez Bien',  'color' => 'warning'];
        if ($note >= 10) return ['txt' => 'Passable',    'color' => 'warning'];
        return              ['txt' => 'Insuffisant',     'color' => 'danger'];
    }
}
