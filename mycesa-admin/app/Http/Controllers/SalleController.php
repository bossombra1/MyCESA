<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class SalleController extends ApiController
{
    public function index()
    {
        return view('salles.index', ['salles' => $this->getData('/salles')]);
    }

    public function create()
    {
        return view('salles.create');
    }

    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/salles', $request->except('_token'));
            if ($r->successful()) return redirect()->route('salles.index')->with('success', 'Salle ajoutée.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'ajouter la salle');
        }
    }

    public function show($id)
    {
        return view('salles.show', ['salle' => $this->getData('/salles/'.$id)]);
    }

    public function edit($id)
    {
        return view('salles.edit', ['salle' => $this->getData('/salles/'.$id)]);
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/salles/'.$id, $request->except(['_token','_method']));
            if ($r->successful()) return redirect()->route('salles.index')->with('success', 'Salle modifiée.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'modifier la salle');
        }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/salles/'.$id);
            return redirect()->route('salles.index')->with('success', 'Salle supprimée.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer la salle');
        }
    }
}
