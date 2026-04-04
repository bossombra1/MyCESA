@extends('layouts.app')
@section('title', 'Remplir les créneaux — MyCESA')
@section('page-title', 'Emploi du temps — ' . ucfirst(request('periode', 'semaine')))
@section('page-subtitle', 'Remplir les créneaux de cours')

@section('content')

@php
$periode       = request('periode', 'semaine');
$classeDefaut  = request('classe_defaut', '');
$jours         = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
$couleurs = [
    'Lundi'    => '#3b82f6', 'Mardi'    => '#10b981',
    'Mercredi' => '#f59e0b', 'Jeudi'    => '#8b5cf6',
    'Vendredi' => '#ef4444', 'Samedi'   => '#0ea5e9',
];

// Nombre de semaines selon période
$nbSemaines = match($periode) {
    'mois'  => 4,
    'annee' => 10,
    default => 1,
};
@endphp

<form method="POST" action="{{ route('emplois-temps.store') }}" id="formCreneaux">
@csrf
<input type="hidden" name="periode" value="{{ $periode }}">

{{-- Barre d'info + bouton submit --}}
<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
    <div class="d-flex align-items-center gap-2">
        <a href="{{ route('emplois-temps.create') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
            <i class="bi bi-calendar-week me-1"></i>
            Planning {{ $periode == 'semaine' ? 'hebdomadaire' : ($periode == 'mois' ? 'mensuel' : 'annuel') }}
        </span>
    </div>
    <div class="d-flex gap-2">
        <button type="button" class="btn btn-light btn-sm" onclick="ajouterLigne()">
            <i class="bi bi-plus-lg me-1"></i> Ajouter une ligne
        </button>
        <button type="submit" class="btn btn-primary">
            <i class="bi bi-check-lg me-1"></i> Enregistrer tous les créneaux
        </button>
    </div>
</div>

@for($semaine = 1; $semaine <= $nbSemaines; $semaine++)
<div class="table-card mb-4">
    <div class="table-header">
        <h6 class="table-title">
            <i class="bi bi-calendar-week text-primary me-2"></i>
            @if($periode == 'semaine')
                Semaine courante
            @elseif($periode == 'mois')
                Semaine {{ $semaine }} du mois
            @else
                Semaine {{ $semaine }} / {{ $nbSemaines }}
            @endif
        </h6>
        @if($periode != 'semaine')
            <button type="button" class="btn btn-light btn-sm" onclick="ajouterLigne({{ $semaine }})">
                <i class="bi bi-plus-lg me-1"></i> Ajouter
            </button>
        @endif
    </div>

    <div class="table-responsive">
        <table class="table" id="table-semaine-{{ $semaine }}">
            <thead>
                <tr>
                    <th style="width:120px;">Jour</th>
                    <th style="width:130px;">Date</th>
                    <th style="width:100px;">Début</th>
                    <th style="width:100px;">Fin</th>
                    <th>Classe</th>
                    <th>Matière</th>
                    <th>Professeur</th>
                    <th style="width:80px;">Salle</th>
                    <th style="width:40px;"></th>
                </tr>
            </thead>
            <tbody>
                @foreach($jours as $jour)
                @php $idx = ($semaine - 1) * 6 + $loop->index; @endphp
                <tr class="ligne-creneau" data-semaine="{{ $semaine }}">
                    <td>
                        <select name="creneaux[{{ $idx }}][Jour_Semaine]" class="form-select form-select-sm">
                            @foreach($jours as $j)
                                <option value="{{ $j }}" {{ $j == $jour ? 'selected' : '' }}
                                    style="color:{{ $couleurs[$j] ?? '#333' }};">{{ $j }}</option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <input type="date" name="creneaux[{{ $idx }}][date_Heure_Debut]"
                               class="form-control form-control-sm">
                    </td>
                    <td>
                        <input type="time" name="creneaux[{{ $idx }}][Heure_Debut]"
                               class="form-control form-control-sm" placeholder="08:00">
                    </td>
                    <td>
                        <input type="time" name="creneaux[{{ $idx }}][Heure_Fin]"
                               class="form-control form-control-sm" placeholder="10:00">
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_CLASSE]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($classes as $c)
                                <option value="{{ $c['Id_CLASSE'] ?? '' }}"
                                    {{ $classeDefaut == ($c['Id_CLASSE'] ?? '') ? 'selected' : '' }}>
                                    {{ $c['Nom_Classe'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_MATIERE]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($matieres as $m)
                                <option value="{{ $m['Id_MATIERE'] ?? $m['Id_Matiere'] ?? '' }}">
                                    {{ $m['Nom_Matiere'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_PROFESSEUR]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($profs as $p)
                                <option value="{{ $p['Id_PROFESSEUR'] ?? '' }}">
                                    {{ $p['Nom_Prenoms_Profe'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <input type="text" name="creneaux[{{ $idx }}][Id_SALLE]"
                               class="form-control form-control-sm" placeholder="Salle">
                    </td>
                    <td>
                        <button type="button" class="btn btn-sm btn-light text-danger"
                                onclick="supprimerLigne(this)" title="Supprimer">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endfor

<div class="d-flex justify-content-end gap-2 mb-4">
    <a href="{{ route('emplois-temps.index') }}" class="btn btn-light">Annuler</a>
    <button type="submit" class="btn btn-primary btn-lg">
        <i class="bi bi-check-lg me-1"></i> Enregistrer tous les créneaux
    </button>
</div>

</form>
@endsection

@push('scripts')
<script>
let compteurLignes = {{ $nbSemaines * 6 }};

function ajouterLigne(semaine = 1) {
    const tbody = document.querySelector(`#table-semaine-${semaine} tbody`);
    const idx   = compteurLignes++;
    const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

    // Options classes
    const classes  = document.querySelectorAll('select[name^="creneaux[0][Id_CLASSE]"] option');
    const matieres = document.querySelectorAll('select[name^="creneaux[0][Id_MATIERE]"] option');
    const profs    = document.querySelectorAll('select[name^="creneaux[0][Id_PROFESSEUR]"] option');

    const joursOptions = jours.map(j => `<option value="${j}">${j}</option>`).join('');
    const classesOptions = [...document.querySelectorAll(`#table-semaine-${semaine} tbody tr:first-child select[name$="[Id_CLASSE]"] option`)]
        .map(o => `<option value="${o.value}">${o.text}</option>`).join('');
    const matieresOptions = [...document.querySelectorAll(`#table-semaine-${semaine} tbody tr:first-child select[name$="[Id_MATIERE]"] option`)]
        .map(o => `<option value="${o.value}">${o.text}</option>`).join('');
    const profsOptions = [...document.querySelectorAll(`#table-semaine-${semaine} tbody tr:first-child select[name$="[Id_PROFESSEUR]"] option`)]
        .map(o => `<option value="${o.value}">${o.text}</option>`).join('');

    tbody.insertAdjacentHTML('beforeend', `
        <tr class="ligne-creneau" data-semaine="${semaine}">
            <td><select name="creneaux[${idx}][Jour_Semaine]" class="form-select form-select-sm">${joursOptions}</select></td>
            <td><input type="date" name="creneaux[${idx}][date_Heure_Debut]" class="form-control form-control-sm"></td>
            <td><input type="time" name="creneaux[${idx}][Heure_Debut]" class="form-control form-control-sm" placeholder="08:00"></td>
            <td><input type="time" name="creneaux[${idx}][Heure_Fin]" class="form-control form-control-sm" placeholder="10:00"></td>
            <td><select name="creneaux[${idx}][Id_CLASSE]" class="form-select form-select-sm"><option value="">--</option>${classesOptions}</select></td>
            <td><select name="creneaux[${idx}][Id_MATIERE]" class="form-select form-select-sm"><option value="">--</option>${matieresOptions}</select></td>
            <td><select name="creneaux[${idx}][Id_PROFESSEUR]" class="form-select form-select-sm"><option value="">--</option>${profsOptions}</select></td>
            <td><input type="text" name="creneaux[${idx}][Id_SALLE]" class="form-control form-control-sm" placeholder="Salle"></td>
            <td><button type="button" class="btn btn-sm btn-light text-danger" onclick="supprimerLigne(this)"><i class="bi bi-x-lg"></i></button></td>
        </tr>
    `);
}

function supprimerLigne(btn) {
    btn.closest('tr').remove();
}
</script>
@endpush
