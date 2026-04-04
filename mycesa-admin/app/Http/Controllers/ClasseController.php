<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ClasseController extends ApiController
{
    public function index()
    {
        $classes  = $this->getData('/classes');
        $filieres = $this->getData('/filieres');
        return view('classes.index', compact('classes', 'filieres'));
    }

    public function create()
    {
        $filieres = $this->getData('/filieres');
        return view('classes.create', compact('filieres'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'Nom_Classe'              => 'required|string|max:100',
            'Id_FILIERE'              => 'required|integer',
            'Effectif_Prevu_Etudiant' => 'nullable|integer',
        ]);
        try {
            $r = $this->api()->post('/classes', $request->except('_token'));
            if ($r->successful()) return redirect()->route('classes.index')->with('success', 'Classe ajoutee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'ajouter la classe'); }
    }

    public function show($id)
    {
        $classe   = $this->getOneFromList('/classes', 'Id_CLASSE', $id);
        $filieres = $this->getData('/filieres');
        return view('classes.show', compact('classe', 'filieres'));
    }

    public function edit($id)
    {
        $classe   = $this->getOneFromList('/classes', 'Id_CLASSE', $id);
        $filieres = $this->getData('/filieres');
        return view('classes.edit', compact('classe', 'filieres'));
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/classes/' . $id, $request->except(['_token', '_method']));
            if ($r->successful()) return redirect()->route('classes.index')->with('success', 'Classe modifiee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier la classe'); }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/classes/' . $id);
            return redirect()->route('classes.index')->with('success', 'Classe supprimee.');
        } catch (\Exception $e) { return $this->handleApiError($e, 'supprimer la classe'); }
    }
}
