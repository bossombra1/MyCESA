@extends('layouts.app')
@section('title', 'Modifier une filière')
@section('page-title', 'Modifier filière')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('filieres.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier une filière</h5></div>
    <form method="POST" action="{{ route('filieres.update', $filiere['Id_FILIERE'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom de la filière *</label><input type="text" name="Nom_Filiere" class="form-control" value="{{ old('Nom_Filiere', $filiere['Nom_Filiere'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Cycle</label><select name="Id_CYCLE" class="form-select"><option value="">(Aucun)</option>@foreach($cycles as $cycle)<option value="{{ $cycle['Id_CYCLE'] }}" {{ old('Id_CYCLE', $filiere['Id_CYCLE'] ?? '') == $cycle['Id_CYCLE'] ? 'selected' : '' }}>{{ $cycle['Lib_Cycle'] ?? $cycle['Id_CYCLE'] }}</option>@endforeach</select></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary">Enregistrer</button><a href="{{ route('filieres.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
