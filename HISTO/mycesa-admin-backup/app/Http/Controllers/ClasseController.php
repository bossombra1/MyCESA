<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ClasseController extends ApiController
{
    public function index()
    {
        $classes = $this->getData('/classes');
        return view('classes.index', compact('classes'));
    }
    public function create() { return view('classes.create'); }
    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/classes', $request->except('_token'));
            if ($r->successful()) return redirect()->route('classes.index')->with('success', 'Classe ajoutee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'ajouter la classe'); }
    }
    public function show($id) { return view('classes.show', ['classe' => $this->getData('/classes/'.$id)]); }
    public function edit($id) { return view('classes.edit', ['classe' => $this->getData('/classes/'.$id)]); }
    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/classes/'.$id, $request->except(['_token','_method']));
            if ($r->successful()) return redirect()->route('classes.index')->with('success', 'Classe modifiee.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier la classe'); }
    }
    public function destroy($id)
    {
        try { $this->api()->delete('/classes/'.$id); return redirect()->route('classes.index')->with('success', 'Classe supprimee.'); }
        catch (\Exception $e) { return $this->handleApiError($e, 'supprimer la classe'); }
    }
}
