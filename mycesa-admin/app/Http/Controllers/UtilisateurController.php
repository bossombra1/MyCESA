<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UtilisateurController extends ApiController
{
    public function index()
    {
        return view('utilisateurs.index', ['utilisateurs' => $this->getData('/utilisateurs')]);
    }

    public function create() { return view('utilisateurs.create'); }

    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/utilisateurs', $request->except('_token'));
            if ($r->successful()) return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur ajoute.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'ajouter l\'utilisateur'); }
    }

    public function show($id)
    {
        return view('utilisateurs.show', ['utilisateur' => $this->getOne('/utilisateurs/' . $id)]);
    }

    public function edit($id)
    {
        return view('utilisateurs.edit', ['utilisateur' => $this->getOne('/utilisateurs/' . $id)]);
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/utilisateurs/' . $id, $request->except(['_token', '_method']));
            if ($r->successful()) return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur modifie.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier l\'utilisateur'); }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/utilisateurs/' . $id);
            return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur supprime.');
        } catch (\Exception $e) { return $this->handleApiError($e, 'supprimer l\'utilisateur'); }
    }
}
