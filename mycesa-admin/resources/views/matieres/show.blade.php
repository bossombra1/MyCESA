@extends('layouts.app')
@section('title', 'Détail matière')
@section('page-title', 'Détail matière')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3"><a href="{{ route('matieres.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">{{ $matiere['Nom_Matiere'] ?? 'Matière' }}</h5></div>
        <a href="{{ route('matieres.edit', $matiere['Id_MATIERE'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil me-1"></i> Modifier</a>
    </div>
    <div class="row g-3">
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">Identifiant</div><div class="fw-semibold">{{ $matiere['Id_MATIERE'] ?? '—' }}</div></div></div>
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">Nom</div><div class="fw-semibold">{{ $matiere['Nom_Matiere'] ?? '—' }}</div></div></div>
    </div>
</div></div></div>
@endsection
