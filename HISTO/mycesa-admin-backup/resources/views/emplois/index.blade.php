@extends('layouts.app')
@section('title', 'Emplois du temps — MyCESA')
@section('page-title', 'Emplois du temps')
@section('page-subtitle', 'Planning des cours par classe')
@section('content')

@php
$jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
$classeSelectionnee = request('classe');
$emploisFiltres = $classeSelectionnee
    ? array_filter($emplois, fn($e) => ($e['Id_Classe'] ?? '') == $classeSelectionnee)
    : $emplois;
@endphp

<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-calendar3 text-primary me-2"></i>Planning des cours</h6>
        <form method="GET" class="d-flex gap-2">
            <select name="classe" class="form-select" style="width:200px;" onchange="this.form.submit()">
                <option value="">Toutes les classes</option>
                @foreach($classes as $c)
                    <option value="{{ $c['Id_Classe'] ?? '' }}" {{ $classeSelectionnee == ($c['Id_Classe'] ?? '') ? 'selected' : '' }}>
                        {{ $c['Nom_Classe'] ?? '' }}
                    </option>
                @endforeach
            </select>
        </form>
    </div>
    @if(count($emploisFiltres) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Jour</th><th>Heure début</th><th>Heure fin</th><th>Matière</th><th>Professeur</th><th>Classe</th><th>Salle</th></tr></thead>
            <tbody>
                @foreach($emploisFiltres as $e)
                <tr>
                    <td><span class="badge bg-primary bg-opacity-10 text-primary">{{ $e['Jour'] ?? '—' }}</span></td>
                    <td class="fw-semibold">{{ $e['Heure_Debut'] ?? '—' }}</td>
                    <td class="fw-semibold">{{ $e['Heure_Fin'] ?? '—' }}</td>
                    <td>{{ $e['Nom_Matiere'] ?? '—' }}</td>
                    <td class="text-muted">{{ ($e['Nom_Prof'] ?? '') . ' ' . ($e['Prenoms_Prof'] ?? '') }}</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">{{ $e['Nom_Classe'] ?? '—' }}</span></td>
                    <td class="text-muted small">{{ $e['Salle'] ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-calendar3"></i><p>Aucun emploi du temps trouvé</p></div>@endif
</div>
@endsection
