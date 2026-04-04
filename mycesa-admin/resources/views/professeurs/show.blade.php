@extends('layouts.app')
@section('title', 'Fiche professeur — MyCESA')
@section('page-title', 'Fiche professeur')
@section('page-subtitle', 'Informations complètes')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8">

    <div class="page-card mb-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
                <a href="{{ route('profs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
                <div style="width:64px;height:64px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;flex-shrink:0;">
                    {{ strtoupper(substr($professeur['Nom_Prenoms_Profe'] ?? 'P', 0, 1)) }}
                </div>
                <div>
                    <h5 class="mb-1 fw-bold">{{ $professeur['Nom_Prenoms_Profe'] ?? '—' }}</h5>
                    <span class="badge bg-success bg-opacity-10 text-success">#{{ $professeur['Id_PROFESSEUR'] ?? '' }}</span>
                </div>
            </div>
            <a href="{{ route('profs.edit', $professeur['Id_PROFESSEUR'] ?? 0) }}" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil me-1"></i> Modifier
            </a>
        </div>
    </div>

    <div class="page-card">
        <h6 class="fw-bold mb-3 pb-2 border-bottom">
            <i class="bi bi-person-fill text-success me-2"></i>Informations
        </h6>
        <div class="row g-3">
            @foreach([
                ['bi-envelope',  '#f0fdf4', 'text-success', 'Email',            $professeur['email_Profe'] ?? '—'],
                ['bi-phone',     '#f0fdf4', 'text-success', 'Téléphone',        $professeur['Tel_Profe'] ?? '—'],
                ['bi-house',     '#f1f5f9', 'text-muted',   'Quartier',         $professeur['Quartier_Profe'] ?? '—'],
                ['bi-calendar',  '#eff6ff', 'text-primary', 'Date de naissance', isset($professeur['Date_Naissance']) ? \Carbon\Carbon::parse($professeur['Date_Naissance'])->format('d/m/Y') : '—'],
            ] as [$icon, $bg, $color, $label, $value])
            <div class="col-md-6">
                <div class="d-flex align-items-start gap-3 p-3 rounded-3 border">
                    <div style="width:36px;height:36px;border-radius:8px;background:{{ $bg }};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="bi {{ $icon }} {{ $color }}"></i>
                    </div>
                    <div>
                        <div class="text-muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">{{ $label }}</div>
                        <div class="fw-semibold">{{ $value }}</div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

</div></div>
@endsection
