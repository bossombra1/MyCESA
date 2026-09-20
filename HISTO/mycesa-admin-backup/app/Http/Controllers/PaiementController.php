<?php
namespace App\Http\Controllers;

class PaiementController extends ApiController
{
    public function index()
    {
        $paiements = $this->getData('/paiements');
        $etudiants = $this->getData('/etudiants');
        return view('paiements.index', compact('paiements', 'etudiants'));
    }
}
