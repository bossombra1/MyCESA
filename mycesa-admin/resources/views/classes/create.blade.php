@extends('layouts.app')
@section('title', 'Ajouter une classe — MyCESA')
@section('page-title', 'Nouvelle classe')
@section('page-subtitle', 'Remplir le formulaire')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('classes.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Ajouter une classe</h5>
    </div>
    <form method="POST" action="{{ route('classes.store') }}">@csrf
        <div class="row g-3">
            <div class="col-md-12">
                <label class="form-label">Nom de la classe *</label>
                <input type="text" name="Nom_Classe" class="form-control @error('Nom_Classe') is-invalid @enderror"
                       value="{{ old('Nom_Classe') }}" placeholder="Ex: L1 INFO A" required>
                @error('Nom_Classe')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <div class="col-md-6">
                <label class="form-label">Filière *</label>
                <select name="Id_FILIERE" class="form-select @error('Id_FILIERE') is-invalid @enderror" required>
                    <option value="">-- Choisir une filière --</option>
                    @foreach($filieres as $f)
                        <option value="{{ $f['Id_FILIERE'] ?? '' }}" {{ old('Id_FILIERE') == ($f['Id_FILIERE'] ?? '') ? 'selected' : '' }}>
                            {{ $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '' }}
                        </option>
                    @endforeach
                </select>
                @error('Id_FILIERE')<div class="invalid-feedback">{{ $message }}</div>@enderror
            </div>
            <div class="col-md-6">
                <label class="form-label">Effectif prévu</label>
                <input type="number" name="Effectif_Prevu_Etudiant" class="form-control"
                       value="{{ old('Effectif_Prevu_Etudiant') }}" placeholder="Ex: 40" min="0">
            </div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('classes.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div></div></div>
@endsection
