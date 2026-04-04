<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class CycleController extends ApiController
{
    public function index()
    {
        return view('cycles.index', ['cycles' => $this->getData('/cycles')]);
    }

    public function create()
    {
        return view('cycles.create');
    }

    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/cycles', $request->except('_token'));
            if ($r->successful()) return redirect()->route('cycles.index')->with('success', 'Cycle ajouté.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'ajouter le cycle');
        }
    }

    public function show($id)
    {
        return view('cycles.show', ['cycle' => $this->getData('/cycles/'.$id)]);
    }

    public function edit($id)
    {
        return view('cycles.edit', ['cycle' => $this->getData('/cycles/'.$id)]);
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/cycles/'.$id, $request->except(['_token','_method']));
            if ($r->successful()) return redirect()->route('cycles.index')->with('success', 'Cycle modifié.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'modifier le cycle');
        }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/cycles/'.$id);
            return redirect()->route('cycles.index')->with('success', 'Cycle supprimé.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer le cycle');
        }
    }
}
