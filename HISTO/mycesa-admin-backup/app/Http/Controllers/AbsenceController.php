<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;

class AbsenceController extends ApiController
{
    public function index()
    {
        $absences  = $this->getData('/absences');
        $etudiants = $this->getData('/etudiants');
        return view('absences.index', compact('absences', 'etudiants'));
    }
}
