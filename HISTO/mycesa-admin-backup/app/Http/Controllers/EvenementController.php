<?php
namespace App\Http\Controllers;
class EvenementController extends ApiController
{
    public function index()
    {
        $evenements = $this->getData('/evenements');
        return view('evenements.index', compact('evenements'));
    }
}
