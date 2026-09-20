@extends('layouts.app')
@section('title', 'Modifier professeur')
@section('page-title', 'Modifier professeur')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('profs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Modifier le professeur</h5>
    </div>
    <form method="POST" action="{{ route('profs.update', $professeur['Id_Prof'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom</label><input type="text" name="Nom_Prof" class="form-control" value="{{ old('Nom_Prof', $professeur['Nom_Prof'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Prénoms</label><input type="text" name="Prenoms_Prof" class="form-control" value="{{ old('Prenoms_Prof', $professeur['Prenoms_Prof'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Email</label><input type="email" name="Email_Prof" class="form-control" value="{{ old('Email_Prof', $professeur['Email_Prof'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Téléphone</label><input type="text" name="Tel_Prof" class="form-control" value="{{ old('Tel_Prof', $professeur['Tel_Prof'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Spécialité</label><input type="text" name="Specialite_Prof" class="form-control" value="{{ old('Specialite_Prof', $professeur['Specialite_Prof'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Grade</label><input type="text" name="Grade_Prof" class="form-control" value="{{ old('Grade_Prof', $professeur['Grade_Prof'] ?? '') }}"></div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('profs.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div></div></div>
@endsection
