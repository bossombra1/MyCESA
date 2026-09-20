@extends('layouts.app')
@section('title', 'Absences — MyCESA')
@section('page-title', 'Absences')
@section('page-subtitle', 'Suivi des absences des étudiants')
@section('content')

@php
$nbJustifiees   = collect($absences)->where('Statut_Absence', 'Justifiée')->count() + collect($absences)->where('Justifie', true)->count();
$nbInjustifiees = count($absences) - $nbJustifiees;
@endphp

<div class="row g-3 mb-4">
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#fef2f2;color:#ef4444;"><i class="bi bi-calendar-x-fill"></i></div>
            <div><div class="stat-value" style="font-size:1.4rem;">{{ count($absences) }}</div><div class="stat-label">Total absences</div></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#f0fdf4;color:#10b981;"><i class="bi bi-check-circle-fill"></i></div>
            <div><div class="stat-value" style="font-size:1.4rem;">{{ $nbJustifiees }}</div><div class="stat-label">Justifiées</div></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#fef2f2;color:#ef4444;"><i class="bi bi-x-circle-fill"></i></div>
            <div><div class="stat-value" style="font-size:1.4rem;">{{ $nbInjustifiees }}</div><div class="stat-label">Non justifiées</div></div>
        </div>
    </div>
</div>

<div class="table-card">
    <div class="table-header">
        <h6 class="table-title"><i class="bi bi-calendar-x-fill text-danger me-2"></i>Registre des absences</h6>
    </div>
    @if(count($absences) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Étudiant</th><th>Date</th><th>Matière</th><th>Motif</th><th>Statut</th></tr></thead>
            <tbody>
                @foreach($absences as $a)
                @php $justifie = ($a['Statut_Absence'] ?? '') == 'Justifiée' || ($a['Justifie'] ?? false); @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm bg-danger text-white" style="opacity:.8;">{{ strtoupper(substr($a['Nom_Etudiant'] ?? 'E', 0, 1)) }}</div>
                            <span class="fw-semibold">{{ ($a['Nom_Etudiant'] ?? '') . ' ' . ($a['Prenoms_Etudiant'] ?? '') }}</span>
                        </div>
                    </td>
                    <td class="text-muted small">{{ isset($a['Date_Absence']) ? \Carbon\Carbon::parse($a['Date_Absence'])->format('d/m/Y') : '—' }}</td>
                    <td>{{ $a['Nom_Matiere'] ?? '—' }}</td>
                    <td class="text-muted small">{{ $a['Motif_Absence'] ?? $a['Motif'] ?? '—' }}</td>
                    <td>
                        <span class="badge {{ $justifie ? 'bg-success' : 'bg-danger' }} bg-opacity-10 {{ $justifie ? 'text-success' : 'text-danger' }}">
                            {{ $justifie ? 'Justifiée' : 'Non justifiée' }}
                        </span>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-calendar-check"></i><p>Aucune absence enregistrée</p></div>@endif
</div>
@endsection
