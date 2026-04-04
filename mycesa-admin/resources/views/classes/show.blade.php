@extends('layouts.app')
@section('title', 'Détail classe — MyCESA')
@section('page-title', 'Détail classe')
@section('page-subtitle', 'Informations de la classe')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7">

    <div class="page-card mb-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
                <a href="{{ route('classes.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
                <div style="width:56px;height:56px;border-radius:50%;background:#8b5cf6;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;">
                    {{ strtoupper(substr($classe['Nom_Classe'] ?? 'C', 0, 1)) }}
                </div>
                <div>
                    <h5 class="mb-1 fw-bold">{{ $classe['Nom_Classe'] ?? '—' }}</h5>
                    <span class="badge" style="background:#f5f3ff;color:#8b5cf6;">#{{ $classe['Id_CLASSE'] ?? '' }}</span>
                </div>
            </div>
            <a href="{{ route('classes.edit', $classe['Id_CLASSE'] ?? 0) }}" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil me-1"></i> Modifier
            </a>
        </div>
    </div>

    <div class="page-card">
        <h6 class="fw-bold mb-3 pb-2 border-bottom">
            <i class="bi bi-building me-2" style="color:#8b5cf6;"></i>Informations de la classe
        </h6>
        @php
            $filiereName = '—';
            foreach($filieres as $f) {
                if ((string)($f['Id_FILIERE'] ?? '') === (string)($classe['Id_FILIERE'] ?? '')) {
                    $filiereName = $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '—';
                    break;
                }
            }
        @endphp
        <div class="row g-3">
            @foreach([
                ['bi-building',  '#f5f3ff', 'color:#8b5cf6;', 'Nom de la classe',  $classe['Nom_Classe'] ?? '—'],
                ['bi-diagram-3', '#fffbeb', 'color:#f59e0b;', 'Filière',            $filiereName],
                ['bi-people',    '#f0fdf4', 'color:#10b981;', 'Effectif prévu',     ($classe['Effectif_Prevu_Etudiant'] ?? '—') . ' étudiants'],
            ] as [$icon, $bg, $color, $label, $value])
            <div class="col-md-6">
                <div class="d-flex align-items-start gap-3 p-3 rounded-3 border">
                    <div style="width:36px;height:36px;border-radius:8px;background:{{ $bg }};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <i class="bi {{ $icon }}" style="{{ $color }}"></i>
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
