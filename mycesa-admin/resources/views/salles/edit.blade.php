@extends('layouts.app')
@section('title', 'Modifier une salle')
@section('page-title', 'Modifier salle')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('salles.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier une salle</h5></div>
    <form method="POST" action="{{ route('salles.update', $salle['Id_SALLE'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom de la salle *</label><input type="text" name="Nom_Salle" class="form-control" value="{{ old('Nom_Salle', $salle['Nom_Salle'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Localisation</label><input type="text" name="Localisation_Salle" class="form-control" value="{{ old('Localisation_Salle', $salle['Localisation_Salle'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Superficie</label><input type="text" name="Superficie_Salle" class="form-control" value="{{ old('Superficie_Salle', $salle['Superficie_Salle'] ?? '') }}"></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary">Enregistrer</button><a href="{{ route('salles.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
