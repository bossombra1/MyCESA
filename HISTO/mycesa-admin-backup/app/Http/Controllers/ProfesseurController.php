<?php
// ProfesseurController.php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class ProfesseurController extends ApiController
{
    public function index(Request $request)
    {
        $professeurs = $this->getData('/professeurs');
        if ($search = $request->get('search')) {
            $s = strtolower($search);
            $professeurs = array_filter($professeurs, fn($p) =>
                str_contains(strtolower($p['Nom_Prof'] ?? ''), $s) ||
                str_contains(strtolower($p['Email_Prof'] ?? ''), $s)
            );
        }
        return view('professeurs.index', compact('professeurs'));
    }
    public function create() { return view('professeurs.create'); }
    public function store(Request $request)
    {
        try {
            $r = $this->api()->post('/professeurs', $request->except('_token'));
            if ($r->successful()) return redirect()->route('profs.index')->with('success', 'Professeur ajoute.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'ajouter le professeur'); }
    }
    public function show($id) { return view('professeurs.show', ['professeur' => $this->getData('/professeurs/'.$id)]); }
    public function edit($id) { return view('professeurs.edit', ['professeur' => $this->getData('/professeurs/'.$id)]); }
    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/professeurs/'.$id, $request->except(['_token','_method']));
            if ($r->successful()) return redirect()->route('profs.index')->with('success', 'Professeur modifie.');
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) { return $this->handleApiError($e, 'modifier le professeur'); }
    }
    public function destroy($id)
    {
        try { $this->api()->delete('/professeurs/'.$id); return redirect()->route('profs.index')->with('success', 'Professeur supprime.'); }
        catch (\Exception $e) { return $this->handleApiError($e, 'supprimer le professeur'); }
    }
}
