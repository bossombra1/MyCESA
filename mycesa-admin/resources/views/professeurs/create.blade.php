@extends('layouts.app')
@section('title', 'Ajouter un professeur — MyCESA')
@section('page-title', 'Nouveau professeur')
@section('page-subtitle', 'Remplir le formulaire')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4">
        <a href="{{ route('profs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <h5 class="mb-0 fw-bold">Ajouter un professeur</h5>
    </div>
    <form method="POST" action="{{ route('profs.store') }}">@csrf
        <div class="row g-3">
            <div class="col-md-12">
                <label class="form-label">Nom & Prénoms *</label>
                <input type="text" name="Nom_Prenoms_Profe" class="form-control" value="{{ old('Nom_Prenoms_Profe') }}" placeholder="Ex: Diabaté Marie" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" name="email_Profe" class="form-control" value="{{ old('email_Profe') }}">
            </div>
            <div class="col-md-6">
                <label class="form-label">Téléphone</label>
                <input type="text" name="Tel_Profe" class="form-control" value="{{ old('Tel_Profe') }}" placeholder="Ex: 0705060708">
            </div>
            <div class="col-md-6">
                <label class="form-label">Quartier</label>
                <input type="text" name="Quartier_Profe" class="form-control" value="{{ old('Quartier_Profe') }}" placeholder="Ex: Cocody">
            </div>
            <div class="col-md-6">
                <label class="form-label">Date de naissance</label>
                <input type="date" name="Date_Naissance" class="form-control" value="{{ old('Date_Naissance') }}">
            </div>
        </div>
        <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button>
            <a href="{{ route('profs.index') }}" class="btn btn-light">Annuler</a>
        </div>
    </form>
</div></div></div>
@endsection
