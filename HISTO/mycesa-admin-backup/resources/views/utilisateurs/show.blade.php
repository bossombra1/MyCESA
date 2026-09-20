@extends('layouts.app')
@section('title', 'Fiche utilisateur')
@section('page-title', 'Fiche utilisateur')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center gap-3"><a href="{{ route('utilisateurs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Fiche utilisateur</h5></div>
        <a href="{{ route('utilisateurs.edit', $utilisateur['Id_User'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil me-1"></i> Modifier</a>
    </div>
    <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style="background:#f8fafc;">
        <div style="width:56px;height:56px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">{{ strtoupper(substr($utilisateur['Nom_User'] ?? 'U', 0, 1)) }}</div>
        <div><h5 class="mb-0">{{ $utilisateur['Nom_User'] ?? '—' }}</h5><span class="badge bg-primary bg-opacity-10 text-primary">{{ ($utilisateur['Id_ROLE'] ?? 2) == 1 ? 'Administrateur' : 'Utilisateur' }}</span></div>
    </div>
    <div class="row g-3">
        @foreach(['Login' => $utilisateur['Login_User'] ?? '—', 'Email' => $utilisateur['Email_User'] ?? '—'] as $l => $v)
        <div class="col-md-6"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">{{ $l }}</div><div class="fw-semibold">{{ $v }}</div></div></div>
        @endforeach
    </div>
</div></div></div>
@endsection
