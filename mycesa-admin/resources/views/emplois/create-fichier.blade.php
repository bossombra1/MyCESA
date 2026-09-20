@extends('layouts.app')
@section('title', 'Publier un emploi du temps — MyCESA')
@section('page-title', 'Publier un emploi du temps')
@section('page-subtitle', 'Choisir une classe et son fichier')
@section('content')
<div class="table-card">
    <div class="table-header"><h6 class="table-title"><i class="bi bi-cloud-arrow-up text-primary me-2"></i>Nouveau fichier</h6></div>
    <form method="POST" action="{{ route('emplois-temps.upload-file') }}" enctype="multipart/form-data" class="p-4">
        @csrf
        <div class="mb-3"><label class="form-label fw-semibold" for="classe_id">Classe</label><select id="classe_id" name="classe_id" class="form-select" required><option value="">Sélectionner une classe</option>@foreach($classes as $classe)<option value="{{ $classe['Id_CLASSE'] ?? '' }}">{{ $classe['Nom_Classe'] ?? '' }}</option>@endforeach</select></div>
        <div class="mb-3"><label class="form-label fw-semibold" for="fichier">Fichier de l’emploi du temps</label><input id="fichier" name="fichier" type="file" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls,.docx,.doc" required><div class="form-text">JPG, PNG, PDF, Excel ou Word, 20 Mo maximum.</div></div>
        <div class="d-flex justify-content-end gap-2"><a href="{{ route('emplois-temps.index') }}" class="btn btn-light">Annuler</a><button class="btn btn-primary" type="submit"><i class="bi bi-upload me-1"></i> Publier</button></div>
    </form>
</div>
@endsection
