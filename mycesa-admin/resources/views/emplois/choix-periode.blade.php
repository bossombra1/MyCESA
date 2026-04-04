@extends('layouts.app')
@section('title', 'Créer un emploi du temps — MyCESA')
@section('page-title', 'Créer un emploi du temps')
@section('page-subtitle', 'Choisir la période et la classe')

@section('content')
<div class="row justify-content-center">
<div class="col-lg-8">

    <div class="page-card">
        <div class="d-flex align-items-center gap-3 mb-4">
            <a href="{{ route('emplois-temps.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a>
            <h5 class="mb-0 fw-bold">Nouvelle planification</h5>
        </div>

        <form method="GET" action="{{ route('emplois-temps.create') }}" id="formChoix">

            {{-- Choix de la période --}}
            <div class="mb-4 pb-2 border-bottom">
                <small class="text-uppercase fw-bold text-muted" style="letter-spacing:.08em;">
                    <i class="bi bi-calendar me-1"></i> Type de planning
                </small>
            </div>

            <div class="row g-3 mb-4">
                @foreach([
                    ['semaine', 'bi-calendar-week', 'Par semaine',   '#eff6ff', '#3b82f6', 'Planifier les cours d\'une semaine (Lundi → Samedi)'],
                    ['mois',    'bi-calendar-month', 'Par mois',     '#f0fdf4', '#10b981', 'Planifier plusieurs semaines sur un mois complet'],
                    ['annee',   'bi-calendar3',      'Par année',    '#fffbeb', '#f59e0b', 'Planifier l\'ensemble de l\'année scolaire'],
                ] as [$val, $icon, $label, $bg, $color, $desc])
                <div class="col-md-4">
                    <label class="d-block cursor-pointer" style="cursor:pointer;">
                        <input type="radio" name="periode" value="{{ $val }}" class="d-none periode-radio">
                        <div class="p-4 rounded-3 border text-center periode-card" data-val="{{ $val }}"
                             style="transition:all .2s;cursor:pointer;"
                             onclick="selectPeriode('{{ $val }}')">
                            <div style="width:56px;height:56px;border-radius:14px;background:{{ $bg }};display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                                <i class="bi {{ $icon }} fs-4" style="color:{{ $color }};"></i>
                            </div>
                            <div class="fw-bold mb-1">{{ $label }}</div>
                            <div class="text-muted" style="font-size:.78rem;">{{ $desc }}</div>
                        </div>
                    </label>
                </div>
                @endforeach
            </div>

            {{-- Classe --}}
            <div class="mb-4 pb-2 border-bottom">
                <small class="text-uppercase fw-bold text-muted" style="letter-spacing:.08em;">
                    <i class="bi bi-building me-1"></i> Classe concernée (optionnel)
                </small>
            </div>
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label">Classe</label>
                    <select name="classe_defaut" class="form-select">
                        <option value="">-- Toutes / à définir par créneau --</option>
                        @foreach($classes as $c)
                            <option value="{{ $c['Id_CLASSE'] ?? '' }}">{{ $c['Nom_Classe'] ?? '' }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <button type="submit" class="btn btn-primary" id="btnSuivant" disabled>
                <i class="bi bi-arrow-right me-1"></i> Suivant — Remplir les créneaux
            </button>
        </form>
    </div>

</div>
</div>
@endsection

@push('scripts')
<script>
function selectPeriode(val) {
    document.querySelectorAll('.periode-card').forEach(el => {
        el.style.border = '1px solid #e2e8f0';
        el.style.background = '#fff';
    });
    const card = document.querySelector(`.periode-card[data-val="${val}"]`);
    card.style.border = '2px solid #3b82f6';
    card.style.background = '#eff6ff';
    document.querySelector(`input[value="${val}"]`).checked = true;
    document.getElementById('btnSuivant').disabled = false;
}
</script>
@endpush
