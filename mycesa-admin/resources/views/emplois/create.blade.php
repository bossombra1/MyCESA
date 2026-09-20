@extends('layouts.app')
@section('title', 'Remplir les créneaux — MyCESA')
@section('page-title', 'Emploi du temps — ' . ucfirst(request('periode', 'semaine')))
@section('page-subtitle', 'Remplir les créneaux de cours')

@section('content')

@php
$periode       = request('periode', 'semaine');
$classeDefaut  = request('classe_defaut', '');
$couleurs = [
    'Lundi'    => '#3b82f6', 'Mardi'    => '#10b981',
    'Mercredi' => '#f59e0b', 'Jeudi'    => '#8b5cf6',
    'Vendredi' => '#ef4444', 'Samedi'   => '#0ea5e9',
];

$nbSemaines = count($semaines);
@endphp

{{-- Barre d'info + actions --}}
<div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
    <div class="d-flex align-items-center gap-2">
        <a href="{{ route('emplois-temps.create') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
            <i class="bi bi-calendar-week me-1"></i>
            Planning {{ $periode == 'semaine' ? 'hebdomadaire' : ($periode == 'mois' ? 'mensuel' : 'annuel') }}
        </span>
    </div>
    <div class="d-flex gap-2">
        <form method="POST" action="{{ route('emplois-temps.import') }}" enctype="multipart/form-data" class="d-flex gap-2 align-items-center">
            @csrf
            <input type="file" name="planning_file" accept=".xlsx,.xls,.csv,.docx,.pdf" class="form-control form-control-sm" required>
            <button type="submit" class="btn btn-outline-primary btn-sm" title="Importer un modèle structuré">
                <i class="bi bi-upload me-1"></i> Importer
            </button>
        </form>
        <button type="button" class="btn btn-light btn-sm" onclick="ajouterLigne()">
            <i class="bi bi-plus-lg me-1"></i> Ajouter une ligne
        </button>
    </div>
</div>

<form method="POST" action="{{ route('emplois-temps.store') }}" id="formCreneaux">
@csrf
<input type="hidden" name="periode" value="{{ $periode }}">

@foreach($semaines as $semaineIndex => $joursSemaine)
@php $semaine = $semaineIndex + 1; @endphp
<div class="table-card mb-4">
    <div class="table-header">
        <h6 class="table-title">
            <i class="bi bi-calendar-week text-primary me-2"></i>
            @if($periode == 'semaine')
                Semaine du {{ \Carbon\Carbon::parse($joursSemaine[0]['date'])->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($joursSemaine[5]['date'])->format('d/m/Y') }}
            @elseif($periode == 'mois')
                Semaine {{ $semaine }} du mois
            @else
                Semaine {{ $semaine }} / {{ $nbSemaines }}
            @endif
        </h6>
        <button type="button" class="btn btn-light btn-sm" onclick="ajouterLigne({{ $semaine }})">
            <i class="bi bi-plus-lg me-1"></i> Ajouter un cours
        </button>
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
                @foreach($joursSemaine as $jourIndex => $jour)
                @php $idx = ($semaine - 1) * 6 + $jourIndex; @endphp
                @php $import = $importedRows[$idx] ?? []; @endphp
                <tr class="ligne-creneau" data-semaine="{{ $semaine }}">
                    <td>
                        <input type="text" name="creneaux[{{ $idx }}][Jour_Semaine]" class="form-control form-control-sm"
                               value="{{ $import['Jour_Semaine'] ?? $jour['nom'] }}" readonly>
                    </td>
                    <td>
                        <input type="date" name="creneaux[{{ $idx }}][Date_Debut]"
                               class="form-control form-control-sm" value="{{ $import['Date_Debut'] ?? $jour['date'] }}">
                    </td>
                    <td>
                        <input type="time" name="creneaux[{{ $idx }}][Heure_Debut]"
                               class="form-control form-control-sm" placeholder="08:00" value="{{ $import['Heure_Debut'] ?? '' }}">
                    </td>
                    <td>
                        <input type="time" name="creneaux[{{ $idx }}][Heure_Fin]"
                               class="form-control form-control-sm" placeholder="10:00" value="{{ $import['Heure_Fin'] ?? '' }}">
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_CLASSE]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($classes as $c)
                                <option value="{{ $c['Id_CLASSE'] ?? '' }}"
                                    {{ (($import['Id_CLASSE'] ?? '') == ($c['Id_CLASSE'] ?? '') && !empty($import)) || ($classeDefaut == ($c['Id_CLASSE'] ?? '') && empty($import)) ? 'selected' : '' }}>
                                    {{ $c['Nom_Classe'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_MATIERE]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($matieres as $m)
                                <option value="{{ $m['Id_MATIERE'] ?? $m['Id_Matiere'] ?? '' }}" {{ ($import['matiere_label'] ?? '') === ($m['Nom_Matiere'] ?? '') ? 'selected' : '' }}>
                                    {{ $m['Nom_Matiere'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_PROFESSEUR]" class="form-select form-select-sm">
                            <option value="">--</option>
                                        @foreach($profs as $p)
                                            <option value="{{ $p['Id_PROFESSEUR'] ?? '' }}" data-matiere-ids="{{ collect($p['MatieresArray'] ?? [])->map(fn ($matiere) => $matiere['id'] ?? $matiere['Id_MATIERE'] ?? '')->filter()->implode(',') }}" {{ ($import['professeur_label'] ?? '') === ($p['Nom_Prenoms_Profe'] ?? '') ? 'selected' : '' }}>
                                    {{ $p['Nom_Prenoms_Profe'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
                    </td>
                    <td>
                        <select name="creneaux[{{ $idx }}][Id_SALLE]" class="form-select form-select-sm">
                            <option value="">--</option>
                            @foreach($salles as $salle)
                                <option value="{{ $salle['Id_SALLE'] ?? '' }}" {{ ($import['Id_SALLE'] ?? '') == ($salle['Id_SALLE'] ?? '') ? 'selected' : '' }}>
                                    {{ $salle['Nom_Salle'] ?? '' }}
                                </option>
                            @endforeach
                        </select>
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
@endforeach

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
    const firstRow = tbody.querySelector('tr');
    const dateParDefaut = firstRow?.querySelector('input[name$="[Date_Debut]"]')?.value || '';
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
        .map(o => `<option value="${o.value}" data-matiere-ids="${o.dataset.matiereIds || ''}">${o.text}</option>`).join('');
    const sallesOptions = [...document.querySelectorAll(`#table-semaine-${semaine} tbody tr:first-child select[name$="[Id_SALLE]"] option`)]
        .map(o => `<option value="${o.value}">${o.text}</option>`).join('');

    tbody.insertAdjacentHTML('beforeend', `
        <tr class="ligne-creneau" data-semaine="${semaine}">
            <td><select name="creneaux[${idx}][Jour_Semaine]" class="form-select form-select-sm">${joursOptions}</select></td>
            <td><input type="date" name="creneaux[${idx}][Date_Debut]" class="form-control form-control-sm" value="${dateParDefaut}"></td>
            <td><input type="time" name="creneaux[${idx}][Heure_Debut]" class="form-control form-control-sm" placeholder="08:00"></td>
            <td><input type="time" name="creneaux[${idx}][Heure_Fin]" class="form-control form-control-sm" placeholder="10:00"></td>
            <td><select name="creneaux[${idx}][Id_CLASSE]" class="form-select form-select-sm"><option value="">--</option>${classesOptions}</select></td>
            <td><select name="creneaux[${idx}][Id_MATIERE]" class="form-select form-select-sm"><option value="">--</option>${matieresOptions}</select></td>
            <td><select name="creneaux[${idx}][Id_PROFESSEUR]" class="form-select form-select-sm"><option value="">--</option>${profsOptions}</select></td>
            <td><select name="creneaux[${idx}][Id_SALLE]" class="form-select form-select-sm">${sallesOptions}</select></td>
            <td><button type="button" class="btn btn-sm btn-light text-danger" onclick="supprimerLigne(this)"><i class="bi bi-x-lg"></i></button></td>
        </tr>
    `);

    const newMatiere = tbody.lastElementChild.querySelector('select[name$="[Id_MATIERE]"]');
    newMatiere.addEventListener('change', () => filtrerProfesseurs(newMatiere));
}

function supprimerLigne(btn) {
    btn.closest('tr').remove();
}

function filtrerProfesseurs(matiereSelect) {
    const row = matiereSelect.closest('tr');
    const profSelect = row.querySelector('select[name$="[Id_PROFESSEUR]"]');
    const matiereId = matiereSelect.value;
    if (!profSelect) return;

    [...profSelect.options].forEach((option) => {
        if (!option.value) {
            option.hidden = false;
            return;
        }
        const matiereIds = (option.dataset.matiereIds || '').split(',').filter(Boolean);
        option.hidden = !matiereIds.includes(String(matiereId));
    });

    if (profSelect.selectedOptions[0]?.hidden) profSelect.value = '';
}

document.querySelectorAll('select[name$="[Id_MATIERE]"]').forEach((select) => {
    select.addEventListener('change', () => filtrerProfesseurs(select));
    if (select.value) filtrerProfesseurs(select);
});
</script>
@endpush
