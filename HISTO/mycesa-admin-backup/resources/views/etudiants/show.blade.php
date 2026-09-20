@extends('layouts.app')
@section('title', 'Fiche étudiant — MyCESA')
@section('page-title', 'Fiche étudiant')
@section('content')
<div class="row justify-content-center">
<div class="col-lg-8">
<div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
            <a href="{{ route('etudiants.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
            <h5 class="mb-0 fw-bold">Fiche étudiant</h5>
        </div>
        <a href="{{ route('etudiants.edit', $etudiant['Id_Etudiant'] ?? 0) }}" class="btn btn-primary btn-sm">
            <i class="bi bi-pencil me-1"></i> Modifier
        </a>
    </div>
    <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style="background:#f8fafc;">
        <div class="avatar-sm fs-4" style="width:56px;height:56px;border-radius:50%;background:{{ ($etudiant['Genre_Etudiant'] ?? '') == 'Masculin' ? '#3b82f6' : '#f59e0b' }};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
            {{ strtoupper(substr($etudiant['Nom_Etudiant'] ?? 'E', 0, 1)) }}
        </div>
        <div>
            <h5 class="mb-0">{{ ($etudiant['Nom_Etudiant'] ?? '') . ' ' . ($etudiant['Prenoms_Etudiant'] ?? '') }}</h5>
            <span class="badge bg-success bg-opacity-10 text-success">{{ $etudiant['Nom_Classe'] ?? 'N/A' }}</span>
        </div>
    </div>
    <div class="row g-3">
        @php
        $fields = [
            'Email' => $etudiant['Email_Etudiant'] ?? '—',
            'Téléphone' => $etudiant['Tel_Etudiant'] ?? '—',
            'Genre' => $etudiant['Genre_Etudiant'] ?? '—',
            'Date de naissance' => $etudiant['Date_Naissance_Etudiant'] ?? '—',
            'Lieu de naissance' => $etudiant['Lieu_Naissance_Etudiant'] ?? '—',
        ];
        @endphp
        @foreach($fields as $label => $value)
        <div class="col-md-6">
            <div class="p-3 rounded-3 border">
                <div class="text-muted small mb-1">{{ $label }}</div>
                <div class="fw-semibold">{{ $value }}</div>
            </div>
        </div>
        @endforeach
    </div>
</div>
</div>
</div>
@endsection
