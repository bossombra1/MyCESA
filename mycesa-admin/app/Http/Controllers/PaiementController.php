<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaiementController extends ApiController
{
    public function index(Request $request)
    {
        $versements = $this->getData('/versements');
        $etudiants  = $this->getData('/etudiants');
        $filieres   = $this->getData('/filieres');
        $cycles     = $this->getData('/cycles');

        // --- Filtres ---
        $search        = $request->get('search', '');
        $filtreFiliere = $request->get('filiere', '');
        $filtreCycle   = $request->get('cycle', '');
        $filtreStatut  = $request->get('statut', '');

        // Grouper versements par étudiant (1 ligne par étudiant)
        $parEtudiant = [];
        foreach ($versements as $v) {
            $idEtu = $v['Id_ETUDIANT'] ?? null;
            if (!$idEtu) continue;
            if (!isset($parEtudiant[$idEtu])) {
                $parEtudiant[$idEtu] = [
                    'Id_ETUDIANT'        => $idEtu,
                    'Nom_Etudiant'       => $v['Nom_Etudiant'] ?? '—',
                    'Prenoms_Etudiant'   => $v['Prenoms_Etudiant'] ?? '',
                    'Matricule_Etudiant' => $v['Matricule_Etudiant'] ?? '—',
                    'Id_FILIERE'         => $v['Id_FILIERE'] ?? null,
                    'Id_CYCLE'           => $v['Id_CYCLE'] ?? $v['Id_Cycle'] ?? null,
                    'versements'         => [],
                    'total_paye'         => 0,
                    'montant_total'      => 0,
                ];
            }
            $parEtudiant[$idEtu]['versements'][] = $v;
            $parEtudiant[$idEtu]['total_paye'] += floatval($v['Montant'] ?? 0);
            $parEtudiant[$idEtu]['montant_total'] = max(
                $parEtudiant[$idEtu]['montant_total'],
                floatval($v['Montant_Total'] ?? 0)
            );
        }

        // Calculer pourcentage et statut par étudiant
        foreach ($parEtudiant as &$e) {
            $mt = $e['montant_total'];
            $mp = $e['total_paye'];
            $e['pourcentage'] = $mt > 0 ? min(100, round(($mp / $mt) * 100)) : 0;
            $e['statut'] = $e['pourcentage'] >= 100 ? 'Soldé'
                       : ($e['pourcentage'] > 0 ? 'Partiel' : 'Non payé');
        }
        unset($e);

        // --- Appliquer les filtres ---
        if ($search) {
            $s = strtolower($search);
            $parEtudiant = array_filter($parEtudiant, fn($e) =>
                str_contains(strtolower($e['Nom_Etudiant'] ?? ''), $s) ||
                str_contains(strtolower($e['Prenoms_Etudiant'] ?? ''), $s) ||
                str_contains(strtolower($e['Matricule_Etudiant'] ?? ''), $s)
            );
        }
        if ($filtreFiliere) {
            $parEtudiant = array_filter($parEtudiant, fn($e) =>
                (string)($e['Id_FILIERE'] ?? '') === (string)$filtreFiliere
            );
        }
        if ($filtreCycle) {
            $parEtudiant = array_filter($parEtudiant, fn($e) =>
                (string)($e['Id_CYCLE'] ?? '') === (string)$filtreCycle
            );
        }
        if ($filtreStatut) {
            $parEtudiant = array_filter($parEtudiant, fn($e) =>
                ($e['statut'] ?? '') === $filtreStatut
            );
        }

        // Stats globales
        $stats = [
            'total_etudiants' => count($parEtudiant),
            'total_paye'      => array_sum(array_column($parEtudiant, 'total_paye')),
            'soldes'          => count(array_filter($parEtudiant, fn($e) => $e['statut'] === 'Soldé')),
            'en_cours'        => count(array_filter($parEtudiant, fn($e) => $e['statut'] === 'Partiel')),
            'non_payes'       => count(array_filter($parEtudiant, fn($e) => $e['statut'] === 'Non payé')),
        ];

        return view('paiements.index', compact('parEtudiant', 'etudiants', 'filieres', 'cycles', 'stats'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'Id_ETUDIANT'   => 'required',
            'Lib_Versement' => 'required|string',
            'Montant'       => 'required|numeric|min:0',
        ]);

        try {
            $r = $this->api()->post('/versements', $request->except('_token'));
            if ($r->successful()) {
                return redirect()->route('paiements.index')->with('success', 'Paiement enregistré.');
            }
            return back()->with('error', $r->json()['message'] ?? 'Erreur.')->withInput();
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'enregistrer le paiement');
        }
    }

    public function show($idEtudiant)
    {
        $response = $this->api()->get('/versements/etudiant/detail/' . $idEtudiant);

        if (!$response->successful()) {
            return redirect()->route('paiements.index')->with('error', 'Étudiant non trouvé.');
        }

        $data = $response->json();
        $etudiant = $data['etudiant'] ?? [];
        $paiements = $data['paiements'] ?? [];
        $historique = $data['historique'] ?? [];
        $stats = $data['stats'] ?? [];

        if (empty($etudiant)) {
            return redirect()->route('paiements.index')->with('error', 'Étudiant introuvable.');
        }

        return view('paiements.show', compact('etudiant', 'paiements', 'historique', 'stats'));
    }

    public function update(Request $request, $id)
    {
        try {
            $r = $this->api()->put('/versements/' . $id, $request->except(['_token', '_method']));
            if ($r->successful()) {
                return redirect()->back()->with('success', 'Paiement modifié.');
            }
            return back()->with('error', $r->json()['message'] ?? 'Erreur.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'modifier le paiement');
        }
    }

    public function destroy($id)
    {
        try {
            $this->api()->delete('/versements/' . $id);
            return redirect()->route('paiements.index')->with('success', 'Paiement supprimé.');
        } catch (\Exception $e) {
            return $this->handleApiError($e, 'supprimer le paiement');
        }
    }
}
