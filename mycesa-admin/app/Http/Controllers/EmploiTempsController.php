<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EmploiTempsController extends ApiController
{
    public function index(Request $request)
    {
        $emplois  = $this->getData('/emploiTemps');
        $classes  = $this->getData('/classes');
        $profs    = $this->getData('/professeurs');
        $matieres = $this->getData('/matieres');

        $classeSelectionnee = $request->get('classe');
        if ($classeSelectionnee) {
            $emplois = array_filter($emplois, fn($e) =>
                (string)($e['Id_CLASSE'] ?? '') === (string)$classeSelectionnee
            );
        }

        $jourSelectionne = $request->get('jour');
        if ($jourSelectionne) {
            $emplois = array_filter($emplois, fn($e) =>
                ($e['Jour_Semaine'] ?? '') === $jourSelectionne
            );
        }

        $ordreJours = ['Lundi'=>1,'Mardi'=>2,'Mercredi'=>3,'Jeudi'=>4,'Vendredi'=>5,'Samedi'=>6];
        usort($emplois, fn($a, $b) =>
            ($ordreJours[$a['Jour_Semaine'] ?? ''] ?? 9) <=> ($ordreJours[$b['Jour_Semaine'] ?? ''] ?? 9)
        );

        return view('emplois.index', compact('emplois', 'classes', 'profs', 'matieres'));
    }

    public function create(Request $request)
    {
        $periode  = $request->get('periode');
        $classes  = $this->getData('/classes');
        $profs    = $this->getData('/professeurs');
        $matieres = $this->getData('/matieres');
        $salles   = $this->getData('/salles');

        if (!$periode) {
            return view('emplois.choix-periode', compact('classes'));
        }

        return view('emplois.create', compact('periode', 'classes', 'profs', 'matieres', 'salles'));
    }

    public function store(Request $request)
    {
        $creneaux = $request->input('creneaux', []);
        $success  = 0;
        $errors   = [];

        foreach ($creneaux as $creneau) {
            if (empty($creneau['Id_PROFESSEUR']) && empty($creneau['Heure_Debut'])) continue;

            try {
                $r = $this->api()->post('/emploiTemps', [
                    'Id_PROFESSEUR'    => $creneau['Id_PROFESSEUR'] ?? null,
                    'Id_SALLE'         => $creneau['Id_SALLE'] ?? null,
                    'Id_MATIERE'       => $creneau['Id_MATIERE'] ?? null,
                    'Id_CLASSE'        => $creneau['Id_CLASSE'] ?? null,
                    'date_Heure_Debut' => $creneau['date_Heure_Debut'] ?? null,
                    'Heure_Debut'      => $creneau['Heure_Debut'] ?? null,
                    'Heure_Fin'        => $creneau['Heure_Fin'] ?? null,
                    'Jour_Semaine'     => $creneau['Jour_Semaine'] ?? null,
                ]);
                if ($r->successful()) $success++;
                else $errors[] = $r->json()['message'] ?? 'Erreur créneau';
            } catch (\Exception $e) {
                $errors[] = $e->getMessage();
            }
        }

        if ($success > 0) {
            $msg = "$success créneau(x) enregistré(s).";
            if (!empty($errors)) $msg .= ' (' . count($errors) . ' erreur(s))';
            return redirect()->route('emplois-temps.index')->with('success', $msg);
        }

        return back()->with('error', 'Aucun créneau enregistré. ' . implode(', ', $errors));
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/emploiTemps', ['IdEmploi' => $id]);
            return redirect()->route('emplois-temps.index')->with('success', 'Créneau supprimé.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer le créneau');
        }
    }
}
