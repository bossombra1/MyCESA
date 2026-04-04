@extends('layouts.app')
@section('title', 'Modifier étudiant — MyCESA')
@section('page-title', 'Modifier étudiant')
@section('page-subtitle', 'Mise à jour des informations')

@section('content')
<div class="row justify-content-center">
<div class="col-lg-9">
<div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('etudiants.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Modifier l'étudiant</h5>
    </div>
    <form method="POST" action="{{ route('etudiants.update', $etudiant['Id_ETUDIANT'] ?? 0) }}">
        @csrf @method('PUT')

        <div class="mb-3 pb-2 border-bottom">
            <small class="text-uppercase fw-bold text-muted" style="letter-spacing:.08em;"><i class="bi bi-person me-1"></i> Informations personnelles</small>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <label class="form-label">Matricule *</label>
                <input type="text" name="Matricule_Etudiant" class="form-control" value="{{ old('Matricule_Etudiant', $etudiant['Matricule_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Genre *</label>
                <select name="Genre_Etudiant" class="form-select" required>
                    <option value="Masculin" {{ ($etudiant['Genre_Etudiant'] ?? '') == 'Masculin' ? 'selected' : '' }}>Masculin</option>
                    <option value="Feminin" {{ ($etudiant['Genre_Etudiant'] ?? '') == 'Feminin' ? 'selected' : '' }}>Féminin</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Nom *</label>
                <input type="text" name="Nom_Etudiant" class="form-control" value="{{ old('Nom_Etudiant', $etudiant['Nom_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Prénoms *</label>
                <input type="text" name="Prenoms_Etudiant" class="form-control" value="{{ old('Prenoms_Etudiant', $etudiant['Prenoms_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Date de naissance</label>
                <input type="date" name="Date_Naissance_Etudiant" class="form-control" value="{{ old('Date_Naissance_Etudiant', $etudiant['Date_Naissance_Etudiant'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Lieu de naissance</label>
                <input type="text" name="Lieu_Naissance_Etudiant" class="form-control" value="{{ old('Lieu_Naissance_Etudiant', $etudiant['Lieu_Naissance_Etudiant'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Quartier</label>
                <input type="text" name="Quartier_Etudiant" class="form-control" value="{{ old('Quartier_Etudiant', $etudiant['Quartier_Etudiant'] ?? '') }}">
            </div>
        </div>

        <div class="mb-3 pb-2 border-bottom">
            <small class="text-uppercase fw-bold text-muted" style="letter-spacing:.08em;"><i class="bi bi-envelope me-1"></i> Coordonnées</small>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <label class="form-label">Email *</label>
                <input type="email" name="Email_Etudiant" class="form-control" value="{{ old('Email_Etudiant', $etudiant['Email_Etudiant'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input type="text" name="Tel_Etudiant" class="form-control" value="{{ old('Tel_Etudiant', $etudiant['Tel_Etudiant'] ?? '') }}">
            </div>
        </div>

        <div class="mb-3 pb-2 border-bottom">
            <small class="text-uppercase fw-bold text-muted" style="letter-spacing:.08em;"><i class="bi bi-mortarboard me-1"></i> Informations académiques</small>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <label class="form-label">Classe *</label>
                <select name="Id_CLASSE" class="form-select" required>
                    <option value="">-- Choisir une classe --</option>
                    @foreach($classes as $c)
                        <option value="{{ $c['Id_CLASSE'] ?? '' }}" {{ ($etudiant['Id_CLASSE'] ?? '') == ($c['Id_CLASSE'] ?? '') ? 'selected' : '' }}>
                            {{ $c['Nom_Classe'] ?? '' }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Filière *</label>
                <select name="Id_FILIERE" class="form-select" required>
                    <option value="">-- Choisir une filière --</option>
                    @forelse($filieres as $f)
                        <option value="{{ $f['Id_FILIERE'] ?? '' }}" {{ (old('Id_FILIERE', $etudiant['Id_FILIERE'] ?? '')) == ($f['Id_FILIERE'] ?? '') ? 'selected' : '' }}>
                            {{ $f['Nom_Filiere'] ?? '' }}
                        </option>
                    @empty
                        <option value="" disabled>Aucune filière disponible</option>
                    @endforelse
                </select>
            </div>
        </div>

        <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer les modifications</button>
            <a href="{{ route('etudiants.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div>
</div>
</div>
@endsection
