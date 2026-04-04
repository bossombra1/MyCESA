@extends('layouts.app')
@section('title', 'Modifier classe — MyCESA')
@section('page-title', 'Modifier classe')
@section('page-subtitle', 'Mise à jour des informations')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('classes.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Modifier — {{ $classe['Nom_Classe'] ?? '' }}</h5>
    </div>
    <form method="POST" action="{{ route('classes.update', $classe['Id_CLASSE'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-12">
                <label class="form-label">Nom de la classe *</label>
                <input type="text" name="Nom_Classe" class="form-control"
                       value="{{ old('Nom_Classe', $classe['Nom_Classe'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Filière *</label>
                <select name="Id_FILIERE" class="form-select" required>
                    <option value="">-- Choisir une filière --</option>
                    @foreach($filieres as $f)
                        <option value="{{ $f['Id_FILIERE'] ?? '' }}"
                            {{ (string)($classe['Id_FILIERE'] ?? '') === (string)($f['Id_FILIERE'] ?? '') ? 'selected' : '' }}>
                            {{ $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '' }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label">Effectif prévu</label>
                <input type="number" name="Effectif_Prevu_Etudiant" class="form-control"
                       value="{{ old('Effectif_Prevu_Etudiant', $classe['Effectif_Prevu_Etudiant'] ?? '') }}" min="0">
            </div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('classes.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div></div></div>
@endsection
