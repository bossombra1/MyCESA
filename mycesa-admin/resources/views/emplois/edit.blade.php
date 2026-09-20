@extends('layouts.app')
@section('title', 'Modifier le créneau')
@section('page-title', 'Modifier le créneau')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('emplois-temps.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier le créneau</h5></div>
    <form method="POST" action="{{ route('emplois-temps.update') }}">@csrf @method('PUT')
        @foreach(['Id_PROFESSEUR','Id_SALLE','Id_MATIERE','Id_CLASSE','Jour_Semaine','Heure_Debut'] as $key)
            <input type="hidden" name="ancien_{{ $key }}" value="{{ $emploi[$key] ?? '' }}">
        @endforeach
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Date</label><input type="date" name="Date_Debut" class="form-control" value="{{ isset($emploi['date_']) ? \Carbon\Carbon::parse($emploi['date_'])->format('Y-m-d') : '' }}" required></div>
            <div class="col-md-3"><label class="form-label">Début</label><input type="time" name="Heure_Debut" class="form-control" value="{{ substr($emploi['Heure_Debut'] ?? '', 0, 5) }}" required></div>
            <div class="col-md-3"><label class="form-label">Fin</label><input type="time" name="Heure_Fin" class="form-control" value="{{ substr($emploi['Heure_Fin'] ?? '', 0, 5) }}" required></div>
            <div class="col-md-6"><label class="form-label">Classe</label><select name="Id_CLASSE" class="form-select" required>@foreach($classes as $item)<option value="{{ $item['Id_CLASSE'] }}" {{ ($emploi['Id_CLASSE'] ?? '') == $item['Id_CLASSE'] ? 'selected' : '' }}>{{ $item['Nom_Classe'] }}</option>@endforeach</select></div>
            <div class="col-md-6"><label class="form-label">Matière</label><select name="Id_MATIERE" class="form-select" required>@foreach($matieres as $item)<option value="{{ $item['Id_MATIERE'] }}" {{ ($emploi['Id_MATIERE'] ?? '') == $item['Id_MATIERE'] ? 'selected' : '' }}>{{ $item['Nom_Matiere'] }}</option>@endforeach</select></div>
            <div class="col-md-6"><label class="form-label">Professeur</label><select name="Id_PROFESSEUR" class="form-select" required>@foreach($profs as $item)<option value="{{ $item['Id_PROFESSEUR'] }}" {{ ($emploi['Id_PROFESSEUR'] ?? '') == $item['Id_PROFESSEUR'] ? 'selected' : '' }}>{{ $item['Nom_Prenoms_Profe'] }}</option>@endforeach</select></div>
            <div class="col-md-6"><label class="form-label">Salle</label><select name="Id_SALLE" class="form-select" required>@foreach($salles as $item)<option value="{{ $item['Id_SALLE'] }}" {{ ($emploi['Id_SALLE'] ?? '') == $item['Id_SALLE'] ? 'selected' : '' }}>{{ $item['Nom_Salle'] }}</option>@endforeach</select></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button class="btn btn-primary"><i class="bi bi-check-lg me-1"></i>Enregistrer</button><a href="{{ route('emplois-temps.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
