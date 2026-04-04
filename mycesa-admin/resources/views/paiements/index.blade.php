@extends('layouts.app')
@section('title', 'Paiements — MyCESA')
@section('page-title', 'Paiements')
@section('page-subtitle', 'Gestion des scolarités et versements')

@section('content')

{{-- STATS --}}
<div class="row g-3 mb-4">
    @php
    $statCards = [
        ['Étudiants suivis',  $stats['total_etudiants'], 'bi-people-fill',       '#eff6ff','#3b82f6'],
        ['Total encaissé',    number_format($stats['total_paye'],0,',',' ').' FCFA', 'bi-cash-stack', '#f0fdf4','#10b981'],
        ['Soldés',            $stats['soldes'],           'bi-check-circle-fill', '#f0fdf4','#10b981'],
        ['Partiels',          $stats['en_cours'],         'bi-clock-fill',        '#fffbeb','#f59e0b'],
        ['Non payés',         $stats['non_payes'],        'bi-x-circle-fill',     '#fef2f2','#ef4444'],
    ];
    @endphp
    @foreach($statCards as [$label, $val, $icon, $bg, $color])
    <div class="col-6 col-md">
        <div class="stat-card d-flex align-items-center gap-3">
            <div class="stat-icon" style="background:{{ $bg }};color:{{ $color }};"><i class="bi {{ $icon }}"></i></div>
            <div>
                <div class="stat-value" style="font-size:1.1rem;">{{ $val }}</div>
                <div class="stat-label">{{ $label }}</div>
            </div>
        </div>
    </div>
    @endforeach
</div>

{{-- FORMULAIRE AJOUT (collapse) --}}
<div class="table-card mb-4">
    <div class="table-header">
        <h6 class="table-title"><i class="bi bi-plus-circle text-primary me-2"></i>Enregistrer un paiement</h6>
        <button class="btn btn-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#formPaiement">
            <i class="bi bi-plus-lg me-1"></i> Nouveau paiement
        </button>
    </div>
    <div class="collapse" id="formPaiement">
        <div style="padding:1.25rem;border-top:1px solid #f1f5f9;">
            <form method="POST" action="{{ route('paiements.store') }}">
                @csrf
                <div class="row g-3">
                    {{-- Recherche étudiant avec filtre rapide --}}
                    <div class="col-md-4">
                        <label class="form-label">Étudiant *</label>
                        <select name="Id_ETUDIANT" class="form-select" required id="selectEtudiant">
                            <option value="">-- Rechercher un étudiant --</option>
                            @foreach($etudiants as $e)
                            <option value="{{ $e['Id_ETUDIANT'] ?? '' }}"
                                    data-filiere="{{ $e['Id_FILIERE'] ?? '' }}"
                                    {{ old('Id_ETUDIANT') == ($e['Id_ETUDIANT'] ?? '') ? 'selected' : '' }}>
                                {{ $e['Matricule_Etudiant'] ?? '' }} — {{ $e['Nom_Etudiant'] ?? '' }} {{ $e['Prenoms_Etudiant'] ?? '' }}
                            </option>
                            @endforeach
                        </select>
                        <small class="text-muted">Tapez pour filtrer par matricule ou nom</small>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Type de versement *</label>
                        <input type="text" name="Lib_Versement" class="form-control"
                               placeholder="Ex: Frais de scolarité S1"
                               value="{{ old('Lib_Versement') }}" required>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Montant payé (FCFA) *</label>
                        <input type="number" step="500" min="0" name="Montant" class="form-control"
                               placeholder="Ex: 150000" value="{{ old('Montant') }}" required>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Montant total dû</label>
                        <input type="number" step="500" min="0" name="Montant_Total" class="form-control"
                               placeholder="Scolarité totale" value="{{ old('Montant_Total') }}"
                               id="montantTotal">
                        <small class="text-muted">Auto selon filière si vide</small>
                    </div>
                    <div class="col-md-1 d-flex align-items-end">
                        <button type="submit" class="btn btn-success w-100">
                            <i class="bi bi-save"></i>
                        </button>
                    </div>
                </div>

                {{-- Grille de scolarités par filière --}}
                @if(count($filieres) > 0)
                <div class="mt-3 p-3 rounded-3" style="background:#f8fafc;border:1px solid #e2e8f0;">
                    <div class="fw-semibold mb-2" style="font-size:.8rem;color:#64748b;">
                        <i class="bi bi-info-circle me-1"></i> Scolarités de référence par filière — cliquez pour pré-remplir
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        @foreach($filieres as $f)
                        @php $scol = $f['Scolarite_Base'] ?? $f['Montant_Scolarite'] ?? null; @endphp
                        @if($scol)
                        <button type="button" class="btn btn-sm btn-outline-primary"
                                onclick="document.getElementById('montantTotal').value='{{ $scol }}'">
                            {{ $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '' }} :
                            {{ number_format($scol, 0, ',', ' ') }} FCFA
                        </button>
                        @endif
                        @endforeach
                    </div>
                </div>
                @endif
            </form>
        </div>
    </div>
</div>

{{-- FILTRES --}}
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-credit-card-fill text-success me-2"></i>
            Suivi des paiements
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($parEtudiant) }}</span>
        </h6>
    </div>

    <div style="padding:.75rem 1.25rem;border-bottom:1px solid #f1f5f9;background:#fafafa;">
        <form method="GET" class="row g-2 align-items-end">
            <div class="col-md-4">
                <input type="text" name="search" class="form-control form-control-sm"
                       placeholder="🔍 Nom, prénom ou matricule..."
                       value="{{ request('search') }}">
            </div>
            <div class="col-md-2">
                <select name="filiere" class="form-select form-select-sm">
                    <option value="">Toutes les filières</option>
                    @foreach($filieres as $f)
                    <option value="{{ $f['Id_FILIERE'] ?? '' }}" {{ request('filiere') == ($f['Id_FILIERE'] ?? '') ? 'selected' : '' }}>
                        {{ $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '' }}
                    </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <select name="cycle" class="form-select form-select-sm">
                    <option value="">Tous les cycles</option>
                    @foreach($cycles as $c)
                    <option value="{{ $c['Id_CYCLE'] ?? $c['Id_Cycle'] ?? '' }}" {{ request('cycle') == ($c['Id_CYCLE'] ?? $c['Id_Cycle'] ?? '') ? 'selected' : '' }}>
                        {{ $c['Lib_Cycle'] ?? $c['Nom_Cycle'] ?? '' }}
                    </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <select name="statut" class="form-select form-select-sm">
                    <option value="">Tous les statuts</option>
                    <option value="Soldé"    {{ request('statut') == 'Soldé'    ? 'selected' : '' }}>✅ Soldé</option>
                    <option value="Partiel"  {{ request('statut') == 'Partiel'  ? 'selected' : '' }}>🔶 Partiel</option>
                    <option value="Non payé" {{ request('statut') == 'Non payé' ? 'selected' : '' }}>❌ Non payé</option>
                </select>
            </div>
            <div class="col-md-2 d-flex gap-1">
                <button type="submit" class="btn btn-primary btn-sm flex-grow-1">Filtrer</button>
                @if(request()->hasAny(['search','filiere','cycle','statut']))
                <a href="{{ route('paiements.index') }}" class="btn btn-light btn-sm"><i class="bi bi-x"></i></a>
                @endif
            </div>
        </form>
    </div>

    @if(count($parEtudiant) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Versements</th>
                    <th style="width:220px;">Progression</th>
                    <th>Montant payé</th>
                    <th>Statut</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($parEtudiant as $e)
                @php
                    $pct    = $e['pourcentage'];
                    $statut = $e['statut'];
                    $col    = $statut === 'Soldé' ? '#10b981' : ($statut === 'Partiel' ? '#f59e0b' : '#ef4444');
                    $badgeCls = $statut === 'Soldé' ? 'success' : ($statut === 'Partiel' ? 'warning' : 'danger');
                @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm text-white fw-bold" style="background:{{ $col }};opacity:.85;">
                                {{ strtoupper(substr($e['Nom_Etudiant'], 0, 1)) }}
                            </div>
                            <div>
                                <div class="fw-semibold">{{ $e['Nom_Etudiant'] }} {{ $e['Prenoms_Etudiant'] }}</div>
                                <small class="text-muted">{{ $e['Matricule_Etudiant'] }}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-primary bg-opacity-10 text-primary">
                            {{ count($e['versements']) }} versement(s)
                        </span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div style="flex:1;height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden;">
                                <div style="height:100%;width:{{ $pct }}%;background:{{ $col }};border-radius:99px;"></div>
                            </div>
                            <span style="font-size:.78rem;font-weight:700;color:{{ $col }};min-width:36px;">{{ $pct }}%</span>
                        </div>
                    </td>
                    <td class="fw-bold" style="color:{{ $col }};">
                        {{ number_format($e['total_paye'], 0, ',', ' ') }} FCFA
                        @if($e['montant_total'] > 0)
                        <div class="text-muted fw-normal" style="font-size:.72rem;">/ {{ number_format($e['montant_total'], 0, ',', ' ') }} FCFA</div>
                        @endif
                    </td>
                    <td>
                        <span class="badge bg-{{ $badgeCls }} bg-opacity-10 text-{{ $badgeCls }}">
                            {{ $statut === 'Soldé' ? '✅' : ($statut === 'Partiel' ? '🔶' : '❌') }} {{ $statut }}
                        </span>
                    </td>
                    <td class="text-end">
                        <a href="{{ route('paiements.show', $e['Id_ETUDIANT']) }}" class="btn btn-sm btn-primary">
                            <i class="bi bi-eye me-1"></i> Détails
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state"><i class="bi bi-credit-card"></i><p>Aucun paiement trouvé</p></div>
    @endif
</div>
@endsection

@push('scripts')
<script>
// Recherche en temps réel dans le select étudiant
document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('selectEtudiant');
    if (!select) return;

    // Activer la recherche live dans le select
    select.setAttribute('size', '1');

    // Filtre de recherche rapide au-dessus du select
    const wrapper = select.parentElement;
    const input   = document.createElement('input');
    input.type        = 'text';
    input.placeholder = '🔍 Filtrer par nom ou matricule...';
    input.className   = 'form-control form-control-sm mb-1';

    const allOptions = Array.from(select.options).slice(1); // skip placeholder

    input.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        Array.from(select.options).forEach((opt, i) => {
            if (i === 0) return; // placeholder
            opt.style.display = opt.text.toLowerCase().includes(val) ? '' : 'none';
        });
    });

    wrapper.insertBefore(input, select);
});
</script>
@endpush
