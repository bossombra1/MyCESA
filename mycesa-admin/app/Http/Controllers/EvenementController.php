<?php
namespace App\Http\Controllers;
class EvenementController extends ApiController
{
    public function index()
    {
        $evenements = $this->getData('/evenements') ?: [];
        $filieres = $this->getData('/filieres') ?: [];
        $classes  = $this->getData('/classes') ?: [];

        $filiereNames = [];
        foreach ($filieres as $filiere) {
            if (isset($filiere['Id_FILIERE'])) {
                $filiereNames[$filiere['Id_FILIERE']] = $filiere['Nom_Filiere'] ?? 'Filière '.$filiere['Id_FILIERE'];
            }
        }

        $classeNames = [];
        foreach ($classes as $classe) {
            if (isset($classe['Id_CLASSE'])) {
                $classeNames[$classe['Id_CLASSE']] = $classe['Nom_Classe'] ?? 'Classe '.$classe['Id_CLASSE'];
            }
        }

        // Tri chronologique (les plus récents en premier)
        usort($evenements, fn($a, $b) =>
            strcmp($b['Date_Evenement'] ?? '', $a['Date_Evenement'] ?? '')
        );

        return view('evenements.index', compact('evenements', 'filieres', 'classes', 'filiereNames', 'classeNames'));
    }
}
