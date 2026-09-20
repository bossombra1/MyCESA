<?php
namespace App\Http\Controllers;

class NoteController extends ApiController
{
    public function index()
    {
        $notes     = $this->getData('/notes');
        $etudiants = $this->getData('/etudiants');
        $matieres  = $this->getData('/matieres');
        return view('notes.index', compact('notes', 'etudiants', 'matieres'));
    }
}
