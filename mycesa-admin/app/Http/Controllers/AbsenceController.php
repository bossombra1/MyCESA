<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AbsenceController extends ApiController
{
    public function index(Request $request)
    {
        $date      = $request->get('date', date('Y-m-d'));
        $absences  = $this->getData('/absences');
        $etudiants = $this->getData('/etudiants');
        $utilisateurs = $this->getData('/utilisateurs');

        return view('absences.index', compact('absences', 'etudiants', 'utilisateurs', 'date'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Id_ETUDIANT' => 'required',
            'Date_absence' => 'required|date',
            'Nbre_heure'  => 'required|numeric|min:0.5',
            'Justifiee'   => 'nullable|boolean',
        ]);

        $payload = [
            'Id_ETUDIANT' => $validated['Id_ETUDIANT'],
            'Date_absence' => $validated['Date_absence'],
            'Nbre_heure'  => $validated['Nbre_heure'],
            'Justifiee'   => $request->has('Justifiee') ? 1 : 0,
        ];

        $response = $this->api()->post('/absences', $payload);

        if (!$response->successful()) {
            return redirect()->back()->with('error', $response->json('error', 'Impossible d\'enregistrer l\'absence.'));
        }

        return redirect()->route('absences.index')->with('success', 'Absence enregistrée avec succès.');
    }

    public function justify(Request $request)
    {
        $request->validate([
            'Id_ETUDIANT' => 'required',
            'Date_absence' => 'required|date',
            'Id_UTILISATEUR' => 'required',
        ]);

        $payload = $request->only(['Id_ETUDIANT', 'Date_absence', 'Id_UTILISATEUR']);
        $response = $this->api()->put('/absences/justifier', $payload);

        if (!$response->successful()) {
            return redirect()->back()->with('error', $response->json('error', 'Impossible de justifier.'));
        }

        return redirect()->route('absences.index')->with('success', 'Absence justifiée.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'Id_ETUDIANT' => 'required',
            'Date_absence' => 'required|date',
            'Id_UTILISATEUR' => 'required',
        ]);

        $payload = $request->only(['Id_ETUDIANT', 'Date_absence', 'Id_UTILISATEUR']);
        $response = $this->api()->delete('/absences', $payload);

        if (!$response->successful()) {
            return redirect()->back()->with('error', $response->json('error', 'Impossible de supprimer.'));
        }

        return redirect()->route('absences.index')->with('success', 'Absence supprimée.');
    }
}
