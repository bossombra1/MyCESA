<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MatiereController extends ApiController
{
    public function index()
    {
        return view('matieres.index', ['matieres' => $this->getData('/matieres')]);
    }

    public function create() { return view('matieres.create'); }

    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/matieres', $request->except('_token'));
            if ($r->successful()) return redirect()->route('matieres.index')->with('success', 'Matiere ajoutee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'ajouter la matiere'); }
    }

    public function show($id)
    {
        return view('matieres.show', ['matiere' => $this->getOne('/matieres/' . $id)]);
    }

    public function edit($id)
    {
        return view('matieres.edit', ['matiere' => $this->getOne('/matieres/' . $id)]);
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/matieres/' . $id, $request->except(['_token', '_method']));
            if ($r->successful()) return redirect()->route('matieres.index')->with('success', 'Matiere modifiee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier la matiere'); }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/matieres/' . $id);
            return redirect()->route('matieres.index')->with('success', 'Matiere supprimee.');
        } catch (\Exception $e) { return $this->handleApiError($e, 'supprimer la matiere'); }
    }
}
