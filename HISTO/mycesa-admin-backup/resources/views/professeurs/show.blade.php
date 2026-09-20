@extends('layouts.app')
@section('title', 'Fiche professeur')
@section('page-title', 'Fiche professeur')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3">
            <a href="{{ route('profs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
            <h5 class="mb-0 fw-bold">Fiche professeur</h5>
        </div>
        <a href="{{ route('profs.edit', $professeur['Id_Prof'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil me-1"></i> Modifier</a>
    </div>
    <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style="background:#f8fafc;">
        <div style="width:56px;height:56px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">{{ strtoupper(substr($professeur['Nom_Prof'] ?? 'P', 0, 1)) }}</div>
        <div>
            <h5 class="mb-0">{{ ($professeur['Nom_Prof'] ?? '') . ' ' . ($professeur['Prenoms_Prof'] ?? '') }}</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary">{{ $professeur['Specialite_Prof'] ?? 'N/A' }}</span>
        </div>
    </div>
    <div class="row g-3">
        @foreach(['Email' => $professeur['Email_Prof'] ?? '—', 'Téléphone' => $professeur['Tel_Prof'] ?? '—', 'Grade' => $professeur['Grade_Prof'] ?? '—', 'Spécialité' => $professeur['Specialite_Prof'] ?? '—'] as $l => $v)
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">{{ $l }}</div><div class="fw-semibold">{{ $v }}</div></div></div>
        @endforeach
    </div>
</div></div></div>
@endsection
