@extends('layouts.app')
@section('title', 'Modifier matière')
@section('page-title', 'Modifier matière')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('matieres.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier la matière</h5></div>
    <form method="POST" action="{{ route('matieres.update', $matiere['Id_Matiere'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom</label><input type="text" name="Nom_Matiere" class="form-control" value="{{ old('Nom_Matiere', $matiere['Nom_Matiere'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Code</label><input type="text" name="Code_Matiere" class="form-control" value="{{ old('Code_Matiere', $matiere['Code_Matiere'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Coefficient</label><input type="number" step="0.5" name="Coefficient_Matiere" class="form-control" value="{{ old('Coefficient_Matiere', $matiere['Coefficient_Matiere'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Heures / semaine</label><input type="number" name="Heures_Semaine" class="form-control" value="{{ old('Heures_Semaine', $matiere['Heures_Semaine'] ?? '') }}"></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button><a href="{{ route('matieres.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
