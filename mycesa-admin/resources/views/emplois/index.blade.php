@extends('layouts.app')
@section('title', 'Emplois du temps — MyCESA')
@section('page-title', 'Emplois du temps')
@section('page-subtitle', 'Planning des cours')
@section('content')

@php
$jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
$couleurs = [
    'Lundi'    => ['bg'=>'#eff6ff','color'=>'#3b82f6'],
    'Mardi'    => ['bg'=>'#f0fdf4','color'=>'#10b981'],
    'Mercredi' => ['bg'=>'#fffbeb','color'=>'#f59e0b'],
    'Jeudi'    => ['bg'=>'#f5f3ff','color'=>'#8b5cf6'],
    'Vendredi' => ['bg'=>'#fef2f2','color'=>'#ef4444'],
    'Samedi'   => ['bg'=>'#f0f9ff','color'=>'#0ea5e9'],
];
@endphp

<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-calendar3 text-primary me-2"></i>Planning des cours
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($emplois) }}</span>
        </h6>
        <div class="d-flex gap-2 flex-wrap align-items-center">
            <form method="GET" class="d-flex gap-2 flex-wrap">
                <select name="classe" class="form-select" style="width:180px;" onchange="this.form.submit()">
                    <option value="">Toutes les classes</option>
                    @foreach($classes as $c)
                        <option value="{{ $c['Id_CLASSE'] ?? '' }}" {{ request('classe') == ($c['Id_CLASSE'] ?? '') ? 'selected' : '' }}>
                            {{ $c['Nom_Classe'] ?? '' }}
                        </option>
                    @endforeach
                </select>
                <select name="jour" class="form-select" style="width:150px;" onchange="this.form.submit()">
                    <option value="">Tous les jours</option>
                    @foreach($jours as $j)
                        <option value="{{ $j }}" {{ request('jour') == $j ? 'selected' : '' }}>{{ $j }}</option>
                    @endforeach
                </select>
                @if(request('classe') || request('jour'))
                    <a href="{{ route('emplois-temps.index') }}" class="btn btn-light"><i class="bi bi-x"></i></a>
                @endif
            </form>
            <a href="{{ route('emplois-temps.create') }}" class="btn btn-primary">
                <i class="bi bi-plus-lg me-1"></i> Créer un emploi du temps
            </a>
        </div>
    </div>

    @if(count($emplois) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Jour</th>
                    <th>Date</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Classe</th>
                    <th>Matière</th>
                    <th>Professeur</th>
                    <th>Salle</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($emplois as $e)
                @php
                    $jour = $e['Jour_Semaine'] ?? '—';
                    $c    = $couleurs[$jour] ?? ['bg'=>'#f1f5f9','color'=>'#64748b'];
                @endphp
                <tr>
                    <td>
                        <span class="badge fw-semibold" style="background:{{ $c['bg'] }};color:{{ $c['color'] }};">
                            {{ $jour }}
                        </span>
                    </td>
                    <td class="text-muted small">
                        {{ isset($e['date_']) ? \Carbon\Carbon::parse($e['date_'])->format('d/m/Y') : '—' }}
                    </td>
                    <td class="fw-semibold">{{ substr($e['Heure_Debut'] ?? '—', 0, 5) }}</td>
                    <td class="fw-semibold">{{ substr($e['Heure_Fin'] ?? '—', 0, 5) }}</td>
                    <td>
                        <span class="badge bg-success bg-opacity-10 text-success">
                            {{ $e['Nom_Classe'] ?? '—' }}
                        </span>
                    </td>
                    <td>{{ $e['Nom_Matiere'] ?? '—' }}</td>
                    <td class="text-muted">{{ $e['Nom_Professeur'] ?? '—' }}</td>
                    <td class="text-muted small">{{ $e['Nom_Salle'] ?? '—' }}</td>
                    <td class="text-end">
                        <form method="POST" action="{{ route('emplois-temps.destroy', $e['IdEmploi'] ?? 0) }}"
                              onsubmit="return confirm('Supprimer ce créneau ?')">
                            @csrf @method('DELETE')
                            <button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state">
            <i class="bi bi-calendar3"></i>
            <p>Aucun créneau trouvé</p>
            <a href="{{ route('emplois-temps.create') }}" class="btn btn-primary mt-2">Créer le premier emploi du temps</a>
        </div>
    @endif
</div>
@endsection
