<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EtudiantController extends ApiController
{
    public function index(Request $request)
    {
        $etudiants = $this->getData('/etudiants');
        $classes   = $this->getData('/classes');

        if ($search = $request->get('search')) {
            $s = strtolower($search);
            $etudiants = array_filter($etudiants, fn($e) =>
                str_contains(strtolower($e['Nom_Etudiant'] ?? ''), $s) ||
                str_contains(strtolower($e['Prenoms_Etudiant'] ?? ''), $s) ||
                str_contains(strtolower($e['Matricule_Etudiant'] ?? ''), $s) ||
                str_contains(strtolower($e['Email_Etudiant'] ?? ''), $s)
            );
        }

        return view('etudiants.index', compact('etudiants', 'classes'));
    }

    public function create()
    {
        $classes  = $this->getData('/classes');
        $filieres = $this->getData('/filieres');
        return view('etudiants.create', compact('classes', 'filieres'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'Matricule_Etudiant'      => 'required|string|max:50',
            'Nom_Etudiant'            => 'required|string|max:100',
            'Prenoms_Etudiant'        => 'required|string|max:150',
            'Genre_Etudiant'          => 'required|in:Masculin,Feminin',
            'Email_Etudiant'          => 'required|email',
            'Tel_Etudiant'            => 'nullable|string|max:20',
            'Date_Naissance_Etudiant' => 'nullable|date',
            'Lieu_Naissance_Etudiant' => 'nullable|string|max:100',
            'Quartier_Etudiant'       => 'nullable|string|max:100',
            'Id_CLASSE'               => 'required|integer',
            'Id_FILIERE'              => 'required|integer',
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
        $etudiants = $this->getData('/etudiants');
        $etudiant = collect($etudiants)->firstWhere('Id_ETUDIANT', $id);
        if (!$etudiant) {
            abort(404, 'Étudiant introuvable');
        }
        $filieres = $this->getData('/filieres');
        return view('etudiants.show', compact('etudiant', 'filieres'));
    }

    public function edit($id)
    {
        $etudiants = $this->getData('/etudiants');
        $etudiant = collect($etudiants)->firstWhere('Id_ETUDIANT', $id);
        if (!$etudiant) {
            abort(404, 'Étudiant introuvable');
        }
        $classes  = $this->getData('/classes');
        $filieres = $this->getData('/filieres');
        return view('etudiants.edit', compact('etudiant', 'classes', 'filieres'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'Matricule_Etudiant'      => 'required|string|max:50',
            'Nom_Etudiant'            => 'required|string|max:100',
            'Prenoms_Etudiant'        => 'required|string|max:150',
            'Genre_Etudiant'          => 'required|in:Masculin,Feminin',
            'Email_Etudiant'          => 'required|email',
            'Tel_Etudiant'            => 'nullable|string|max:20',
            'Date_Naissance_Etudiant' => 'nullable|date',
            'Lieu_Naissance_Etudiant' => 'nullable|string|max:100',
            'Quartier_Etudiant'       => 'nullable|string|max:100',
            'Id_CLASSE'               => 'required|integer',
            'Id_FILIERE'              => 'required|integer',
        ]);

        try {
            $response = $this->api()->put('/etudiants/' . $id, $request->except(['_token', '_method']));
            if ($response->successful()) {
                return redirect()->route('etudiants.index')->with('success', 'Etudiant modifie avec succes.');
            }
            $etudiant = $this->getOne('/etudiants/' . $id);
            $classes  = $this->getData('/classes');
            $filieres = $this->getData('/filieres');
            return back()->with('error', $response->json()['message'] ?? 'Erreur lors de la modification.')->withInput()->with(compact('etudiant', 'classes', 'filieres'));
        } catch (\Exception $e) {
            $etudiant = $this->getOne('/etudiants/' . $id);
            $classes  = $this->getData('/classes');
            $filieres = $this->getData('/filieres');
            return back()->with('error', 'Impossible de modifier l\'etudiant. Verifiez que l\'API est disponible.')->withInput()->with(compact('etudiant', 'classes', 'filieres'));
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
