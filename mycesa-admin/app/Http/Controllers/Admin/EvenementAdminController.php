<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;

class EvenementAdminController extends ApiController
{
    /**
     * Liste tous les événements (admin).
     */
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

        return view('admin.evenements.index', compact('evenements', 'filieres', 'classes', 'filiereNames', 'classeNames'));
    }

    /**
     * Enregistre un nouvel événement.
     */
    public function store(Request $request)
    {
        $request->validate([
            'Titre'          => 'required|string|max:255',
            'Date_Evenement' => 'required|date',
            'Type'           => 'required|string',
        ]);

        $payload = [
            'Titre'          => $request->input('Titre'),
            'Description'    => $request->input('Description', ''),
            'Date_Evenement' => $request->input('Date_Evenement'),
            'Type'           => $request->input('Type'),
            'Pour_Tous'      => $request->has('Pour_Tous') ? 1 : 0,
            'Id_Filiere'     => $request->filled('Id_Filiere') ? $request->input('Id_Filiere') : null,
            'Id_Classe'      => $request->filled('Id_Classe')  ? $request->input('Id_Classe')  : null,
        ];

        // Si Pour_Tous, on efface les cibles spécifiques
        if ($payload['Pour_Tous']) {
            $payload['Id_Filiere'] = null;
            $payload['Id_Classe']  = null;
        }

        $this->postData('/evenements', $payload);

        return redirect()->route('admin.evenements.index')
                         ->with('success', 'Événement créé avec succès.');
    }

    /**
     * Met à jour un événement existant.
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'Titre'          => 'required|string|max:255',
            'Date_Evenement' => 'required|date',
            'Type'           => 'required|string',
        ]);

        $payload = [
            'Titre'          => $request->input('Titre'),
            'Description'    => $request->input('Description', ''),
            'Date_Evenement' => $request->input('Date_Evenement'),
            'Type'           => $request->input('Type'),
            'Pour_Tous'      => $request->has('Pour_Tous') ? 1 : 0,
            'Id_Filiere'     => $request->filled('Id_Filiere') ? $request->input('Id_Filiere') : null,
            'Id_Classe'      => $request->filled('Id_Classe')  ? $request->input('Id_Classe')  : null,
        ];

        if ($payload['Pour_Tous']) {
            $payload['Id_Filiere'] = null;
            $payload['Id_Classe']  = null;
        }

        $this->putData("/evenements/{$id}", $payload);

        return redirect()->route('admin.evenements.index')
                         ->with('success', 'Événement mis à jour.');
    }

    /**
     * Supprime un événement.
     */
    public function destroy(int $id)
    {
        $this->deleteData("/evenements/{$id}");

        return redirect()->route('admin.evenements.index')
                         ->with('success', 'Événement supprimé.');
    }
}