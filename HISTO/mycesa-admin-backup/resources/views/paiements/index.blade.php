@extends('layouts.app')
@section('title', 'Paiements — MyCESA')
@section('page-title', 'Paiements')
@section('page-subtitle', 'Suivi des paiements et versements')
@section('content')

@php
$total = collect($paiements)->sum(fn($p) => $p['Montant_Paiement'] ?? $p['Montant'] ?? 0);
$nbPaye = collect($paiements)->where('Statut_Paiement', 'Payé')->count() + collect($paiements)->where('Statut_Paiement', 'paye')->count();
@endphp

<div class="row g-3 mb-4">
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#f0fdf4;color:#10b981;"><i class="bi bi-cash-stack"></i></div>
            <div><div class="stat-value" style="font-size:1.3rem;">{{ number_format($total, 0, ',', ' ') }} FCFA</div><div class="stat-label">Total encaissé</div></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#eff6ff;color:#3b82f6;"><i class="bi bi-receipt"></i></div>
            <div><div class="stat-value" style="font-size:1.3rem;">{{ count($paiements) }}</div><div class="stat-label">Total paiements</div></div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:#f0fdf4;color:#10b981;"><i class="bi bi-check-circle-fill"></i></div>
            <div><div class="stat-value" style="font-size:1.3rem;">{{ $nbPaye }}</div><div class="stat-label">Paiements validés</div></div>
        </div>
    </div>
</div>

<div class="table-card">
    <div class="table-header">
        <h6 class="table-title"><i class="bi bi-credit-card-fill text-success me-2"></i>Historique des paiements</h6>
    </div>
    @if(count($paiements) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Étudiant</th><th>Montant</th><th>Type</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
                @foreach($paiements as $p)
                @php $statut = $p['Statut_Paiement'] ?? '—'; $isPaye = in_array(strtolower($statut), ['payé','paye','paid']); @endphp
                <tr>
                    <td class="fw-semibold">{{ ($p['Nom_Etudiant'] ?? '') . ' ' . ($p['Prenoms_Etudiant'] ?? '') ?: ($p['Id_Etudiant'] ?? '—') }}</td>
                    <td class="fw-bold text-success">{{ number_format($p['Montant_Paiement'] ?? $p['Montant'] ?? 0, 0, ',', ' ') }} FCFA</td>
                    <td class="text-muted small">{{ $p['Type_Paiement'] ?? $p['Libelle'] ?? '—' }}</td>
                    <td><span class="badge {{ $isPaye ? 'bg-success' : 'bg-warning' }} bg-opacity-10 {{ $isPaye ? 'text-success' : 'text-warning' }}">{{ $statut }}</span></td>
                    <td class="text-muted small">{{ isset($p['Date_Paiement']) ? \Carbon\Carbon::parse($p['Date_Paiement'])->format('d/m/Y') : '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-credit-card"></i><p>Aucun paiement enregistré</p></div>@endif
</div>
@endsection
