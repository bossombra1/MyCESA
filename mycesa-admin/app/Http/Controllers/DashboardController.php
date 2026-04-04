<?php

namespace App\Http\Controllers;

class DashboardController extends ApiController
{
    public function index()
    {
        $stats = [
            'total_etudiants'   => 0,
            'total_professeurs' => 0,
            'total_classes'     => 0,
            'total_matieres'    => 0,
            'total_notes'       => 0,
            'total_paiements'   => 0,
            'total_absences'    => 0,
            'total_evenements'  => 0,
        ];

        $endpoints = [
            'etudiants'   => 'total_etudiants',
            'professeurs' => 'total_professeurs',
            'classes'     => 'total_classes',
            'matieres'    => 'total_matieres',
        ];

        foreach ($endpoints as $endpoint => $key) {
            $data          = $this->getData('/' . $endpoint);
            $stats[$key]   = count($data);
        }

        $etudiants = $this->getData('/etudiants');

        // Repartition par genre
        $parGenre = [];
        foreach ($etudiants as $e) {
            $genre = $e['Genre_Etudiant'] ?? 'Non defini';
            $parGenre[$genre] = ($parGenre[$genre] ?? 0) + 1;
        }
        $stats['etudiants_par_genre'] = $parGenre;

        // Repartition par classe
        $parClasse = [];
        foreach ($etudiants as $e) {
            $classe = $e['Nom_Classe'] ?? 'Non defini';
            $parClasse[$classe] = ($parClasse[$classe] ?? 0) + 1;
        }
        $stats['etudiants_par_classe'] = $parClasse;

        $derniers_etudiants = array_slice($etudiants, 0, 5);

        return view('dashboard', compact('stats', 'derniers_etudiants'));
    }
}
