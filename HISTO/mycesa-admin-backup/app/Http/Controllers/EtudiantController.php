<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EtudiantController extends ApiController
{
    public function index(Request $request)
    {
        $etudiants = $this->getData('/etudiants');
        $classes   = $this->getData('/classes');

        // Filtre recherche
        if ($search = $request->get('search')) {
            $search    = strtolower($search);
            $etudiants = array_filter($etudiants, fn($e) =>
                str_contains(strtolower($e['Nom_Etudiant'] ?? ''), $search) ||
                str_contains(strtolower($e['Prenoms_Etudiant'] ?? ''), $search) ||
                str_contains(strtolower($e['Email_Etudiant'] ?? ''), $search)
            );
        }

        return view('etudiants.index', compact('etudiants', 'classes'));
    }

    public function create()
    {
        $classes = $this->getData('/classes');
        return view('etudiants.create', compact('classes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nom_Etudiant'     => 'required|string|max:100',
            'Prenoms_Etudiant' => 'required|string|max:150',
            'Email_Etudiant'   => 'required|email',
            'Id_Classe'        => 'required',
        ]);

        try {
            $response = $this->api()->post('/etudiants', $request->except('_token'));
            if ($response->successful()) {
                return redirect()->route('etudiants.index')->with('success', 'Etudiant ajoute avec succes.');
            }
            return back()->with('error', $response->json()['message'] ?? 'Erreur lors de l\'ajout.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'ajouter l\'etudiant');
        }
    }

    public function show($id)
    {
        $etudiant = $this->getData('/etudiants/' . $id);
        return view('etudiants.show', compact('etudiant'));
    }

    public function edit($id)
    {
        $etudiant = $this->getData('/etudiants/' . $id);
        $classes  = $this->getData('/classes');
        return view('etudiants.edit', compact('etudiant', 'classes'));
    }

    public function update(Request $request, $id)
    {
        try {
            $response = $this->api()->put('/etudiants/' . $id, $request->except(['_token', '_method']));
            if ($response->successful()) {
                return redirect()->route('etudiants.index')->with('success', 'Etudiant modifie avec succes.');
            }
            return back()->with('error', $response->json()['message'] ?? 'Erreur lors de la modification.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'modifier l\'etudiant');
        }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/etudiants/' . $id);
            return redirect()->route('etudiants.index')->with('success', 'Etudiant supprime avec succes.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer l\'etudiant');
        }
    }
}
