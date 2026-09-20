@extends('layouts.app')
@section('title', 'Ajouter une matière')
@section('page-title', 'Nouvelle matière')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('matieres.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Ajouter une matière</h5></div>
    <form method="POST" action="{{ route('matieres.store') }}">@csrf
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom *</label><input type="text" name="Nom_Matiere" class="form-control" value="{{ old('Nom_Matiere') }}" required></div>
            <div class="col-md-6"><label class="form-label">Code</label><input type="text" name="Code_Matiere" class="form-control" value="{{ old('Code_Matiere') }}"></div>
            <div class="col-md-6"><label class="form-label">Coefficient</label><input type="number" step="0.5" name="Coefficient_Matiere" class="form-control" value="{{ old('Coefficient_Matiere') }}"></div>
            <div class="col-md-6"><label class="form-label">Heures / semaine</label><input type="number" name="Heures_Semaine" class="form-control" value="{{ old('Heures_Semaine') }}"></div>
            <div class="col-12"><label class="form-label">Description</label><textarea name="Description_Matiere" class="form-control" rows="3">{{ old('Description_Matiere') }}</textarea></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button><a href="{{ route('matieres.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
