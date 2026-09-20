@extends('layouts.app')
@section('title', 'Détail classe')
@section('page-title', 'Détail classe')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3"><a href="{{ route('classes.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">{{ $classe['Nom_Classe'] ?? 'Classe' }}</h5></div>
        <a href="{{ route('classes.edit', $classe['Id_Classe'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil me-1"></i> Modifier</a>
    </div>
    <div class="row g-3">
        @foreach(['Niveau' => $classe['Niveau_Classe'] ?? '—', 'Filière' => $classe['Filiere'] ?? '—', 'Cycle' => $classe['Cycle'] ?? '—', 'Capacité' => $classe['Capacite_Classe'] ?? '—'] as $l => $v)
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">{{ $l }}</div><div class="fw-semibold">{{ $v }}</div></div></div>
        @endforeach
    </div>
</div></div></div>
@endsection
