@extends('layouts.app')
@section('title', 'Modifier professeur — MyCESA')
@section('page-title', 'Modifier professeur')
@section('page-subtitle', 'Mise à jour des informations')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('profs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Modifier — {{ $professeur['Nom_Prenoms_Profe'] ?? '' }}</h5>
    </div>
    <form method="POST" action="{{ route('profs.update', $professeur['Id_PROFESSEUR'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-12">
                <label class="form-label">Nom & Prénoms *</label>
                <input type="text" name="Nom_Prenoms_Profe" class="form-control"
                       value="{{ old('Nom_Prenoms_Profe', $professeur['Nom_Prenoms_Profe'] ?? '') }}" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" name="email_Profe" class="form-control"
                       value="{{ old('email_Profe', $professeur['email_Profe'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input type="text" name="Tel_Profe" class="form-control"
                       value="{{ old('Tel_Profe', $professeur['Tel_Profe'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Quartier</label>
                <input type="text" name="Quartier_Profe" class="form-control"
                       value="{{ old('Quartier_Profe', $professeur['Quartier_Profe'] ?? '') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Date de naissance</label>
                <input type="date" name="Date_Naissance" class="form-control"
                       value="{{ old('Date_Naissance', isset($professeur['Date_Naissance']) ? substr($professeur['Date_Naissance'], 0, 10) : '') }}">
            </div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('profs.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div></div></div>
@endsection
