@extends('layouts.app')
@section('title', 'Suivi paiement — ' . ($etudiant['Nom_Etudiant'] ?? ''))
@section('page-title', 'Suivi de paiement')
@section('page-subtitle', ($etudiant['Nom_Etudiant'] ?? '') . ' — ' . ($etudiant['Matricule_Etudiant'] ?? ''))

@section('content')
<div class="row justify-content-center">
<div class="col-lg-10">

    {{-- HEADER --}}
    @php
        $total      = $stats['totalDû'] ?? 0;
        $paye       = $stats['totalPayé'] ?? 0;
        $reste      = $stats['reste'] ?? 0;
        $pct        = $stats['pourcentage'] ?? 0;
        $couleur    = $pct >= 100 ? '#10b981' : ($pct >= 50 ? '#f59e0b' : '#ef4444');
        $statut     = $pct >= 100 ? 'Soldé' : ($pct > 0 ? 'En cours' : 'Non payé');
    @endphp

    <div class="page-card mb-4" style="background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;border:none;position:relative;overflow:hidden;">
        <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.05);top:-60px;right:-40px;"></div>
        <div style="position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.04);bottom:-30px;left:-20px;"></div>

        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3" style="position:relative;">
            <div class="d-flex align-items-center gap-3">
                <a href="{{ route('paiements.index') }}" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;border:none;">
                    <i class="bi bi-arrow-left"></i>
                </a>
                <div style="width:60px;height:60px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;flex-shrink:0;">
                    {{ strtoupper(substr($etudiant['Nom_Etudiant'] ?? 'E', 0, 1)) }}
                </div>
                <div>
                    <h4 class="mb-1 fw-bold" style="color:#fff;">
                        💰 {{ ($etudiant['Nom_Etudiant'] ?? '') . ' ' . ($etudiant['Prenoms_Etudiant'] ?? '') }}
                    </h4>
                    <div class="d-flex gap-2 flex-wrap">
                        <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;">{{ $etudiant['Matricule_Etudiant'] ?? '' }}</span>
                        <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;">{{ $etudiant['Nom_Classe'] ?? '' }}</span>
                    </div>
                </div>
            </div>

            {{-- Progression --}}
            <div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:16px 24px;text-align:center;min-width:180px;">
                <div style="font-size:2.2rem;font-weight:900;color:{{ $couleur }};line-height:1;">{{ $pct }}%</div>
                <div style="color:rgba(255,255,255,.6);font-size:.8rem;margin-top:4px;">Progression</div>
                <div style="height:6px;background:rgba(255,255,255,.15);border-radius:99px;overflow:hidden;margin-top:8px;">
                    <div style="height:100%;width:{{ $pct }}%;background:{{ $couleur }};border-radius:99px;transition:width .5s;"></div>
                </div>
                <div style="margin-top:8px;background:rgba(255,255,255,.15);border-radius:8px;padding:4px 10px;font-size:.78rem;font-weight:700;color:#fff;">
                    {{ $statut }}
                </div>
            </div>
        </div>

        {{-- Stats --}}
        <div class="row g-2 mt-3" style="position:relative;">
            @foreach([
                ['Total dû',  number_format($total, 0,',', ' ').' FCFA', '#60a5fa'],
                ['Payé',      number_format($paye,  0,',', ' ').' FCFA', '#4ade80'],
                ['Reste',     number_format($reste, 0,',', ' ').' FCFA', $reste > 0 ? '#f87171' : '#4ade80'],
                ['Versements', count($paiements),                         '#a78bfa'],
            ] as [$label, $val, $color])
            <div class="col-6 col-md-3">
                <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,.1);">
                    <div style="font-size:1.1rem;font-weight:900;color:{{ $color }};">{{ $val }}</div>
                    <div style="font-size:.72rem;color:rgba(255,255,255,.5);margin-top:2px;">{{ $label }}</div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    {{-- AJOUTER UN VERSEMENT --}}
    <div class="page-card mb-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
                <div style="width:4px;height:28px;background:#3b82f6;border-radius:4px;"></div>
                <h5 class="mb-0 fw-bold">Ajouter un versement</h5>
            </div>
            <button class="btn btn-primary btn-sm" type="button" data-bs-toggle="collapse" data-bs-target="#addVersement">
                <i class="bi bi-plus-lg"></i>
            </button>
        </div>
        <div class="collapse" id="addVersement">
            <form method="POST" action="{{ route('paiements.store') }}">
                @csrf
                <input type="hidden" name="Id_ETUDIANT" value="{{ $etudiant['Id_ETUDIANT'] ?? '' }}">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Type de versement *</label>
                        <input type="text" name="Lib_Versement" class="form-control"
                               placeholder="Ex: Frais de scolarité S2" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Montant payé (FCFA) *</label>
                        <input type="number" step="500" min="0" name="Montant" class="form-control" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Montant total dû</label>
                        <input type="number" step="500" min="0" name="Montant_Total" class="form-control"
                               value="{{ $total > 0 ? $total : '' }}">
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button type="submit" class="btn btn-success w-100">
                            <i class="bi bi-save me-1"></i> Enregistrer
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    {{-- LISTE DES VERSEMENTS --}}
    <div class="page-card mb-4">
        <div class="d-flex align-items-center gap-2 mb-3">
            <div style="width:4px;height:28px;background:#10b981;border-radius:4px;"></div>
            <h5 class="mb-0 fw-bold">📋 Versements effectués</h5>
        </div>

        @if(count($paiements) > 0)
        <div class="d-flex flex-column gap-2">
            @foreach($paiements as $p)
            @php
                $isPaye    = ($p['Statut'] ?? 'Payé') === 'Payé';
                $coulPaye  = $isPaye ? '#10b981' : '#f59e0b';
                $montDu    = floatval($p['Montant_Total'] ?? 0);
                $montPaye  = floatval($p['Montant'] ?? 0);
                $pctPaye   = $montDu > 0 ? min(100, round(($montPaye / $montDu) * 100)) : 0;
            @endphp
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;background:#fafafa;">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div style="flex:1;min-width:150px;">
                        <div class="fw-bold" style="color:#0f172a;">{{ $p['Lib_Versement'] ?? '—' }}</div>
                        <div class="text-muted" style="font-size:.75rem;">
                            📅 {{ \Carbon\Carbon::parse($p['Date_Versement'] ?? $p['Date_Paiement'] ?? now())->format('d/m/Y') }}
                        </div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:.75rem;color:#64748b;">Montant dû</div>
                        <div style="font-size:1rem;font-weight:700;">{{ number_format($montDu, 0, ',', ' ') }} FCFA</div>
                    </div>
                    <div style="width:1px;height:40px;background:#e2e8f0;"></div>
                    <div style="text-align:center;">
                        <div style="font-size:.75rem;color:#64748b;">Payé</div>
                        <div style="font-size:1rem;font-weight:900;color:{{ $coulPaye }};">{{ number_format($montPaye, 0, ',', ' ') }} FCFA</div>
                    </div>
                    <div style="width:1px;height:40px;background:#e2e8f0;"></div>
                    <div>
                        <span class="badge {{ $isPaye ? 'bg-success text-success' : 'bg-warning text-warning' }} bg-opacity-10">
                            {{ $p['Statut'] ?? 'Payé' }}
                        </span>
                    </div>
                    <div class="d-flex gap-1">
                        {{-- Modifier --}}
                        <button class="btn btn-sm btn-light" data-bs-toggle="modal"
                                data-bs-target="#editModal{{ $p['Id_VERSEMENT'] ?? $loop->index }}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        {{-- Supprimer --}}
                        <form method="POST" action="{{ route('paiements.destroy', $p['Id_VERSEMENT'] ?? 0) }}"
                              onsubmit="return confirm('Supprimer ce versement ?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button>
                        </form>
                    </div>
                </div>

                {{-- Barre de progression versement --}}
                @if($montDu > 0)
                <div style="margin-top:10px;">
                    <div style="height:6px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:{{ $pctPaye }}%;background:{{ $coulPaye }};border-radius:99px;"></div>
                    </div>
                    <div style="font-size:.7rem;color:#94a3b8;margin-top:3px;">{{ $pctPaye }}% payé</div>
                </div>
                @endif
            </div>

            {{-- Modal modifier --}}
            <div class="modal fade" id="editModal{{ $p['Id_VERSEMENT'] ?? $loop->index }}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Modifier le versement</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form method="POST" action="{{ route('paiements.update', $p['Id_VERSEMENT'] ?? 0) }}">
                            @csrf @method('PUT')
                            <input type="hidden" name="Id_ETUDIANT" value="{{ $etudiant['Id_ETUDIANT'] ?? '' }}">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Type de versement</label>
                                    <input type="text" name="Lib_Versement" class="form-control" value="{{ $p['Lib_Versement'] ?? '' }}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Montant payé (FCFA)</label>
                                    <input type="number" step="500" name="Montant" class="form-control" value="{{ $p['Montant'] ?? 0 }}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Montant total dû</label>
                                    <input type="number" step="500" name="Montant_Total" class="form-control" value="{{ $p['Montant_Total'] ?? 0 }}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Statut</label>
                                    <select name="Statut" class="form-select">
                                        <option value="Payé"               {{ ($p['Statut'] ?? '') === 'Payé'               ? 'selected' : '' }}>Payé</option>
                                        <option value="En attente"         {{ ($p['Statut'] ?? '') === 'En attente'         ? 'selected' : '' }}>En attente</option>
                                        <option value="Partiellement payé" {{ ($p['Statut'] ?? '') === 'Partiellement payé' ? 'selected' : '' }}>Partiellement payé</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Annuler</button>
                                <button type="submit" class="btn btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @else
            <div class="empty-state"><i class="bi bi-credit-card"></i><p>Aucun versement enregistré</p></div>
        @endif
    </div>

    {{-- HISTORIQUE --}}
    @if(count($historique) > 0)
    <div class="page-card">
        <div class="d-flex align-items-center gap-2 mb-3">
            <div style="width:4px;height:28px;background:#8b5cf6;border-radius:4px;"></div>
            <h5 class="mb-0 fw-bold">📊 Historique des actions</h5>
        </div>
        <div class="d-flex flex-column gap-1">
            @foreach($historique as $h)
            <div style="border-left:3px solid #8b5cf6;padding:8px 0 8px 12px;border-bottom:1px solid #f1f5f9;">
                <div class="fw-semibold" style="font-size:.875rem;color:#0f172a;">{{ $h['Action_Histo'] ?? '—' }}</div>
                <div class="text-muted" style="font-size:.75rem;">
                    {{ isset($h['Date_Histo']) ? \Carbon\Carbon::parse($h['Date_Histo'])->format('d/m/Y à H:i') : '' }}
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endif

</div>
</div>
@endsection
