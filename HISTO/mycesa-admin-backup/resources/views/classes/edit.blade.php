@extends('layouts.app')
@section('title', 'Modifier classe')
@section('page-title', 'Modifier classe')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('classes.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier la classe</h5></div>
    <form method="POST" action="{{ route('classes.update', $classe['Id_Classe'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom *</label><input type="text" name="Nom_Classe" class="form-control" value="{{ old('Nom_Classe', $classe['Nom_Classe'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Niveau</label><input type="text" name="Niveau_Classe" class="form-control" value="{{ old('Niveau_Classe', $classe['Niveau_Classe'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Filière</label><input type="text" name="Filiere" class="form-control" value="{{ old('Filiere', $classe['Filiere'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Cycle</label><input type="text" name="Cycle" class="form-control" value="{{ old('Cycle', $classe['Cycle'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Capacité</label><input type="number" name="Capacite_Classe" class="form-control" value="{{ old('Capacite_Classe', $classe['Capacite_Classe'] ?? '') }}"></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button><a href="{{ route('classes.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
