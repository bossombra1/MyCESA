@extends('layouts.app')
@section('title', 'Fiche étudiant — MyCESA')
@section('page-title', 'Fiche étudiant')
@section('page-subtitle', 'Informations complètes')

@section('content')
<div class="row justify-content-center">
<div class="col-lg-9">

    <div class="page-card mb-3">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
                <a href="{{ route('etudiants.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>

                @php
                    $imgPath = $etudiant['Image_Etudiant'] ?? null;
                    // L'image est servie par Node.js — on reconstruit l'URL complète
                    if ($imgPath) {
                        $nodeBase = rtrim(str_replace('/api', '', env('NODE_API_URL', 'http://localhost:3000')), '/');
                        $imgUrl   = str_starts_with($imgPath, 'http') ? $imgPath : $nodeBase . $imgPath;
                    }
                @endphp

                @if($imgPath)
                    <img src="{{ $imgUrl }}" alt="Photo"
                         style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #e2e8f0;">
                @else
                    <div style="width:64px;height:64px;border-radius:50%;background:{{ in_array($etudiant['Genre_Etudiant'] ?? '', ['Masculin']) ? '#3b82f6' : '#f59e0b' }};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;flex-shrink:0;">
                        {{ strtoupper(substr($etudiant['Nom_Etudiant'] ?? 'E', 0, 1)) }}
                    </div>
                @endif

                <div>
                    <h5 class="mb-1 fw-bold">{{ ($etudiant['Nom_Etudiant'] ?? '') . ' ' . ($etudiant['Prenoms_Etudiant'] ?? '') }}</h5>
                    <div class="d-flex gap-2 flex-wrap">
                        <span class="badge bg-primary bg-opacity-10 text-primary">{{ $etudiant['Matricule_Etudiant'] ?? 'N/A' }}</span>
                        <span class="badge bg-success bg-opacity-10 text-success">{{ $etudiant['Nom_Classe'] ?? 'N/A' }}</span>
                        <span class="badge bg-info bg-opacity-10 text-info">{{ $etudiant['Lib_Cycle'] ?? '' }}</span>
                        <span class="badge bg-light text-secondary">{{ $etudiant['Genre_Etudiant'] ?? '' }}</span>
                    </div>
                </div>
            </div>
            <a href="{{ route('etudiants.edit', $etudiant['Id_ETUDIANT'] ?? 0) }}" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil me-1"></i> Modifier
            </a>
        </div>
    </div>

    <div class="row g-3">
        <div class="col-lg-6">
            <div class="page-card h-100">
                <h6 class="fw-bold mb-3 pb-2 border-bottom">
                    <i class="bi bi-person-fill text-primary me-2"></i>Informations personnelles
                </h6>
                <div class="d-flex flex-column gap-3">
                    @foreach([
                        ['bi-credit-card','Matricule',        $etudiant['Matricule_Etudiant'] ?? '—'],
                        ['bi-gender-ambiguous','Genre',       $etudiant['Genre_Etudiant'] ?? '—'],
                        ['bi-calendar','Date de naissance',   isset($etudiant['Date_Naissance_Etudiant']) ? \Carbon\Carbon::parse($etudiant['Date_Naissance_Etudiant'])->format('d/m/Y') : '—'],
                        ['bi-geo-alt','Lieu de naissance',    $etudiant['Lieu_Naissance_Etudiant'] ?? '—'],
                        ['bi-house','Quartier',               $etudiant['Quartier_Etudiant'] ?? '—'],
                    ] as [$icon, $label, $value])
                    <div class="d-flex align-items-start gap-3">
                        <div style="width:32px;height:32px;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class="bi {{ $icon }} text-muted" style="font-size:.85rem;"></i>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">{{ $label }}</div>
                            <div class="fw-semibold" style="font-size:.9rem;">{{ $value }}</div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="col-lg-6 d-flex flex-column gap-3">
            <div class="page-card">
                <h6 class="fw-bold mb-3 pb-2 border-bottom">
                    <i class="bi bi-envelope-fill text-success me-2"></i>Coordonnées
                </h6>
                <div class="d-flex flex-column gap-3">
                    @foreach([
                        ['bi-envelope','Email',     $etudiant['Email_Etudiant'] ?? '—'],
                        ['bi-phone','Téléphone',    $etudiant['Tel_Etudiant'] ?? '—'],
                    ] as [$icon, $label, $value])
                    <div class="d-flex align-items-start gap-3">
                        <div style="width:32px;height:32px;border-radius:8px;background:#f0fdf4;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class="bi {{ $icon }} text-success" style="font-size:.85rem;"></i>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">{{ $label }}</div>
                            <div class="fw-semibold" style="font-size:.9rem;">{{ $value }}</div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>

            <div class="page-card">
                <h6 class="fw-bold mb-3 pb-2 border-bottom">
                    <i class="bi bi-mortarboard-fill text-warning me-2"></i>Informations académiques
                </h6>
                <div class="d-flex flex-column gap-3">
                    @php
                    $filiereName = $etudiant['Nom_Filiere'] ?? null;
                    if (!$filiereName) {
                        foreach($filieres as $f) {
                            if ((string)($f['Id_FILIERE'] ?? '') === (string)($etudiant['Id_FILIERE'] ?? '')) {
                                $filiereName = $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '—';
                                break;
                            }
                        }
                    }
                    $filiereName = $filiereName ?? '—';
                    @endphp
                    @foreach([
                        ['bi-building',    '#eff6ff', 'text-primary', 'Classe',  $etudiant['Nom_Classe'] ?? '—'],
                        ['bi-diagram-3',   '#fffbeb', 'text-warning', 'Filière', $filiereName],
                        ['bi-mortarboard', '#f5f3ff', 'text-info',    'Cycle',   $etudiant['Lib_Cycle'] ?? '—'],
                    ] as [$icon, $bg, $color, $label, $value])
                    <div class="d-flex align-items-start gap-3">
                        <div style="width:32px;height:32px;border-radius:8px;background:{{ $bg }};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class="bi {{ $icon }} {{ $color }}" style="font-size:.85rem;"></i>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:600;">{{ $label }}</div>
                            <div class="fw-semibold" style="font-size:.9rem;">{{ $value ?? '—' }}</div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

</div>
</div>
@endsection
