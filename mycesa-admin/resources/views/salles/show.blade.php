@extends('layouts.app')
@section('title', 'Fiche salle')
@section('page-title', 'Fiche salle')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4"><div class="d-flex align-items-center gap-3"><a href="{{ route('salles.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Fiche salle</h5></div><a href="{{ route('salles.edit', $salle['Id_SALLE'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil"></i> Modifier</a></div>
    <div class="row g-3">
        @foreach(['Nom' => $salle['Nom_Salle'] ?? '—', 'Localisation' => $salle['Localisation_Salle'] ?? '—', 'Superficie' => $salle['Superficie_Salle'] ?? '—'] as $label => $value)
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">{{ $label }}</div><div class="fw-semibold">{{ $value }}</div></div></div>
        @endforeach
    </div>
</div></div></div>
@endsection
