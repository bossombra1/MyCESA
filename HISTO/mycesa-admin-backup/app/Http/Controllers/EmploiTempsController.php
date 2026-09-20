<?php
namespace App\Http\Controllers;
class EmploiTempsController extends ApiController
{
    public function index()
    {
        $emplois = $this->getData('/emplois-temps');
        $classes = $this->getData('/classes');
        return view('emplois.index', compact('emplois', 'classes'));
    }
}
