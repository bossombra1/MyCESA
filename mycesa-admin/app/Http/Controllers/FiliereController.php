<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class FiliereController extends ApiController
{
    public function index()
    {
        $filieres = $this->getData('/filieres') ?: [];
        $cycles = $this->getData('/cycles') ?: [];
        $cycleLabels = [];
        foreach ($cycles as $cycle) {
            if (isset($cycle['Id_CYCLE'])) {
                $cycleLabels[$cycle['Id_CYCLE']] = $cycle['Lib_Cycle'] ?? 'Cycle '.$cycle['Id_CYCLE'];
            }
        }

        return view('filieres.index', [
            'filieres' => $filieres,
            'cycleLabels' => $cycleLabels,
        ]);
    }

    public function create()
    {
        $cycles = $this->getData('/cycles') ?: [];
        return view('filieres.create', ['cycles' => $cycles]);
    }

    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/filieres', $request->except('_token'));
            if ($r->successful()) return redirect()->route('filieres.index')->with('success', 'Filière ajoutée.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'ajouter la filiere');
        }
    }

    public function show($id)
    {
        $filiere = $this->getData('/filieres/'.$id);
        $cycles = $this->getData('/cycles') ?: [];
        $cycleLabels = [];
        foreach ($cycles as $cycle) {
            if (isset($cycle['Id_CYCLE'])) {
                $cycleLabels[$cycle['Id_CYCLE']] = $cycle['Lib_Cycle'] ?? 'Cycle '.$cycle['Id_CYCLE'];
            }
        }

        return view('filieres.show', [
            'filiere' => $filiere,
            'cycleLabels' => $cycleLabels,
        ]);
    }

    public function edit($id)
    {
        $filiere = $this->getData('/filieres/'.$id);
        $cycles = $this->getData('/cycles') ?: [];
        return view('filieres.edit', ['filiere' => $filiere, 'cycles' => $cycles]);
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/filieres/'.$id, $request->except(['_token','_method']));
            if ($r->successful()) return redirect()->route('filieres.index')->with('success', 'Filière modifiée.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'modifier la filiere');
        }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/filieres/'.$id);
            return redirect()->route('filieres.index')->with('success', 'Filière supprimée.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer la filiere');
        }
    }
}
