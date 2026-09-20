@extends('layouts.app')
@section('title', 'Modifier étudiant — MyCESA')
@section('page-title', 'Modifier étudiant')
@section('content')
<div class="row justify-content-center">
<div class="col-lg-8">
<div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('etudiants.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Modifier l'étudiant</h5>
    </div>
    <form method="POST" action="{{ route('etudiants.update', $etudiant['Id_Etudiant'] ?? 0) }}">
        @csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Nom</label>
                <input type="text" name="Nom_Etudiant" class="form-control" value="{{ old('Nom_Etudiant', $etudiant['Nom_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Prénoms</label>
                <input type="text" name="Prenoms_Etudiant" class="form-control" value="{{ old('Prenoms_Etudiant', $etudiant['Prenoms_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" name="Email_Etudiant" class="form-control" value="{{ old('Email_Etudiant', $etudiant['Email_Etudiant'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input type="text" name="Tel_Etudiant" class="form-control" value="{{ old('Tel_Etudiant', $etudiant['Tel_Etudiant'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Classe</label>
                <select name="Id_Classe" class="form-select">
                    @foreach($classes as $c)
                        <option value="{{ $c['Id_Classe'] ?? '' }}" {{ ($etudiant['Id_Classe'] ?? '') == ($c['Id_Classe'] ?? '') ? 'selected' : '' }}>
                            {{ $c['Nom_Classe'] ?? '' }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Genre</label>
                <select name="Genre_Etudiant" class="form-select">
                    <option value="Masculin" {{ ($etudiant['Genre_Etudiant'] ?? '') == 'Masculin' ? 'selected' : '' }}>Masculin</option>
                    <option value="Feminin" {{ ($etudiant['Genre_Etudiant'] ?? '') == 'Feminin' ? 'selected' : '' }}>Féminin</option>
                </select>
            </div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('etudiants.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div>
</div>
</div>
@endsection
