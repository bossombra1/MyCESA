@extends('layouts.app')
@section('title', 'Absences — MyCESA')
@section('page-title', 'Absences')
@section('page-subtitle', 'Suivi des absences des étudiants')
@section('content')

@php
$nbJustifiees   = collect($absences)->where('Statut_Absence', 'Justifiée')->count() + collect($absences)->where('Justifiee', 1)->count();
$nbInjustifiees = count($absences) - $nbJustifiees;
@endphp

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif
@if(session('error'))
    <div class="alert alert-danger">{{ session('error') }}</div>
@endif
@if($errors->any())
    <div class="alert alert-danger"><ul class="mb-0">@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
@endif

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
    <div class="table-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h6 class="table-title"><i class="bi bi-calendar-x-fill text-danger me-2"></i>Registre des absences</h6>
        <a class="btn btn-primary btn-sm" data-bs-toggle="collapse" href="#absenceForm" role="button" aria-expanded="false" aria-controls="absenceForm">
            <i class="bi bi-plus-circle"></i> Ajouter une absence
        </a>
    </div>

    <div class="collapse mb-3" id="absenceForm">
        <div class="card card-body">
            <form method="POST" action="{{ route('absences.store') }}" class="row g-3">
                @csrf
                <div class="col-md-3">
                    <label class="form-label">Étudiant</label>
                    <select name="Id_ETUDIANT" class="form-select" required>
                        <option value="">Sélectionnez un étudiant</option>
                        @foreach($etudiants as $etudiant)
                            <option value="{{ $etudiant['Id_ETUDIANT'] }}"
                                {{ old('Id_ETUDIANT') == $etudiant['Id_ETUDIANT'] ? 'selected' : '' }}>
                                {{ $etudiant['Matricule_Etudiant'] }} - {{ $etudiant['Nom_Etudiant'] }} {{ $etudiant['Prenoms_Etudiant'] }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Date</label>
                    <input type="date" name="Date_absence" value="{{ old('Date_absence', $date ?? now()->format('Y-m-d')) }}" class="form-control" required>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Heures</label>
                    <input type="number" step="0.5" min="0.5" name="Nbre_heure" value="{{ old('Nbre_heure', 1) }}" class="form-control" required>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="justifiee" name="Justifiee" value="1" {{ old('Justifiee') ? 'checked' : '' }}>
                        <label class="form-check-label" for="justifiee">Justifiée</label>
                    </div>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button class="btn btn-success w-100" type="submit"><i class="bi bi-save"></i> Enregistrer</button>
                </div>
            </form>
        </div>
    </div>
    @if(count($absences) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Étudiant</th><th>Date</th><th>Heures</th><th>Justifiée</th><th>Créé par</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($absences as $a)
                @php $justifie = ($a['Statut_Absence'] ?? '') == 'Justifiée' || ($a['Justifiee'] ?? false); @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm bg-danger text-white" style="opacity:.8;">{{ strtoupper(substr($a['Nom_Etudiant'] ?? 'E', 0, 1)) }}</div>
                            <span class="fw-semibold">{{ ($a['Nom_Etudiant'] ?? '') . ' ' . ($a['Prenoms_Etudiant'] ?? '') }}</span>
                        </div>
                    </td>
                    <td class="text-muted small">{{ isset($a['Date_absence']) ? \Carbon\Carbon::parse($a['Date_absence'])->format('d/m/Y') : '—' }}</td>
                    <td>{{ $a['Nbre_heure'] ?? '—' }}</td>
                    <td>{{ $a['Justifiee'] ? 'Oui' : 'Non' }}</td>
                    <td>{{ $a['Saisie_Par'] ?? ($a['Nom_User'] ?? '—') }}</td>
                    <td class="text-end">
                        @if(!$justifie)
                            <form method="POST" action="{{ route('absences.justify') }}" class="d-inline">
                                @csrf
                                <input type="hidden" name="Id_ETUDIANT" value="{{ $a['Id_ETUDIANT'] }}">
                                <input type="hidden" name="Date_absence" value="{{ $a['Date_absence'] }}">
                                <input type="hidden" name="Id_UTILISATEUR" value="{{ $a['Id_UTILISATEUR'] }}">
                                <button type="submit" class="btn btn-sm btn-success me-1">Justifier</button>
                            </form>
                        @endif
                        <form method="POST" action="{{ route('absences.destroy') }}" class="d-inline" onsubmit="return confirm('Supprimer cette absence ?');">
                            @csrf
                            @method('DELETE')
                            <input type="hidden" name="Id_ETUDIANT" value="{{ $a['Id_ETUDIANT'] }}">
                            <input type="hidden" name="Date_absence" value="{{ $a['Date_absence'] }}">
                            <input type="hidden" name="Id_UTILISATEUR" value="{{ $a['Id_UTILISATEUR'] }}">
                            <button type="submit" class="btn btn-sm btn-danger">Supprimer</button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-calendar-check"></i><p>Aucune absence enregistrée</p></div>@endif
</div>
@endsection
