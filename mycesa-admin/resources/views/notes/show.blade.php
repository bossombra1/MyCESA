@extends('layouts.app')
@section('title', 'Bulletin — ' . $nomComplet)
@section('page-title', 'Bulletin de notes')
@section('page-subtitle', $nomComplet . ' — ' . $matricule)

@section('content')

@php
// Préparer les données de chaque semestre pour JS
$semestresData = [];
foreach ($stats as $sem => $s) {
    $moy      = $s['moyenne_generale'];
    $mention  = $s['mention']['txt'] ?? null;
    $couleur  = $moy !== null ? ($moy >= 14 ? '#4ade80' : ($moy >= 10 ? '#fbbf24' : '#f87171')) : '#60a5fa';
    $semestresData[] = [
        'id'      => 'sem-' . Str::slug($sem),
        'label'   => $sem,
        'moy'     => $moy,
        'mention' => $mention,
        'couleur' => $couleur,
    ];
}
$premierSem = $semestresData[0] ?? null;

// Moyenne globale passée depuis le controller
$couleurGlobale = '#60a5fa';
if ($moyGlobale !== null) {
    if ($moyGlobale >= 16)      $couleurGlobale = '#4ade80';
    elseif ($moyGlobale >= 14)  $couleurGlobale = '#4ade80';
    elseif ($moyGlobale >= 12)  $couleurGlobale = '#fbbf24';
    elseif ($moyGlobale >= 10)  $couleurGlobale = '#fbbf24';
    else                        $couleurGlobale = '#f87171';
}
$mentionGlobale = null;
if ($moyGlobale !== null) {
    if ($moyGlobale >= 16)      $mentionGlobale = 'Très Bien';
    elseif ($moyGlobale >= 14)  $mentionGlobale = 'Bien';
    elseif ($moyGlobale >= 12)  $mentionGlobale = 'Assez Bien';
    elseif ($moyGlobale >= 10)  $mentionGlobale = 'Passable';
    else                        $mentionGlobale = 'Insuffisant';
}

$totalNotes = count($notesEtudiant);
$reussies   = count(array_filter($notesEtudiant, fn($n) => floatval($n['Note_Evaluation'] ?? 0) >= 10));
$echouees   = $totalNotes - $reussies;
@endphp

<div class="row justify-content-center">
<div class="col-lg-10">

    {{-- HEADER --}}
    <div class="page-card mb-4" style="background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;border:none;position:relative;overflow:hidden;">
        <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.05);top:-60px;right:-40px;"></div>
        <div style="position:absolute;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.04);bottom:-30px;left:-20px;"></div>

        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3" style="position:relative;">
            <div class="d-flex align-items-center gap-3">
                <a href="{{ route('notes.index') }}" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;border:none;">
                    <i class="bi bi-arrow-left"></i>
                </a>
                <div style="width:60px;height:60px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;flex-shrink:0;">
                    {{ strtoupper(substr($nomComplet, 0, 1)) }}
                </div>
                <div>
                    <h4 class="mb-1 fw-bold" style="color:#fff;">📝 {{ $nomComplet }}</h4>
                    <div class="d-flex gap-2 flex-wrap">
                        <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;">{{ $matricule }}</span>
                        {{-- Label semestre actif --}}
                        <span class="badge" id="header-sem-label" style="background:rgba(255,255,255,.15);color:#fff;">
                            {{ $premierSem ? $premierSem['label'] : 'Année 2025-2026' }}
                        </span>
                    </div>
                </div>
            </div>

            {{-- Moyenne affichée dans l'en-tête = semestre actif --}}
            <div id="header-moy-box" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:16px 24px;text-align:center;min-width:140px;">
                <div id="header-moy-val" style="font-size:2.5rem;font-weight:900;line-height:1;color:{{ $premierSem ? $premierSem['couleur'] : $couleurGlobale }};">
                    {{ $premierSem ? ($premierSem['moy'] ?? '—') : ($moyGlobale ?? '—') }}
                </div>
                <div style="color:rgba(255,255,255,.6);font-size:.8rem;">/ 20 — Moy. Semestre</div>
                <div id="header-mention" style="margin-top:8px;background:rgba(255,255,255,.15);border-radius:8px;padding:4px 10px;font-size:.78rem;font-weight:700;color:#fff;{{ !($premierSem && $premierSem['mention']) ? 'display:none;' : '' }}">
                    🎓 {{ $premierSem ? $premierSem['mention'] : '' }}
                </div>
            </div>
        </div>

        {{-- Stats rapides --}}
        <div class="row g-2 mt-3" style="position:relative;">
            @foreach([
                ['Total notes',  $totalNotes,        '#60a5fa'],
                ['Réussies ≥10', $reussies,           '#4ade80'],
                ['Échouées <10', $echouees,           '#f87171'],
                ['Semestres',    count($parSemestre), '#a78bfa'],
            ] as [$label, $val, $color])
            <div class="col-6 col-md-3">
                <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,.1);">
                    <div style="font-size:1.6rem;font-weight:900;color:{{ $color }};">{{ $val }}</div>
                    <div style="font-size:.72rem;color:rgba(255,255,255,.5);margin-top:2px;">{{ $label }}</div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    {{-- ONGLETS --}}
    @if(count($semestresData) > 0)
    <div class="mb-4">
        <div class="d-flex gap-2 flex-wrap">
            @foreach($semestresData as $i => $sd)
            <button type="button"
                    class="btn onglet-sem"
                    data-sem="{{ $sd['id'] }}"
                    data-moy="{{ $sd['moy'] }}"
                    data-mention="{{ $sd['mention'] }}"
                    data-couleur="{{ $sd['couleur'] }}"
                    data-label="{{ $sd['label'] }}"
                    onclick="changerSemestre(this)"
                    style="border:2px solid {{ $i === 0 ? $sd['couleur'] : '#e2e8f0' }};
                           background:{{ $i === 0 ? $sd['couleur'].'18' : '#fff' }};
                           color:{{ $i === 0 ? $sd['couleur'] : '#64748b' }};
                           font-weight:700;border-radius:12px;padding:10px 20px;transition:all .2s;">
                📅 {{ $sd['label'] }}
                @if($sd['moy'] !== null)
                    <span class="ms-2" style="font-size:.78rem;opacity:.8;">{{ $sd['moy'] }}/20</span>
                @endif
            </button>
            @endforeach
        </div>
    </div>

    {{-- CONTENUS PAR SEMESTRE --}}
    @foreach($parSemestre as $semestre => $matieres)
    @php
        $statSem    = $stats[$semestre] ?? [];
        $moyGenSem  = $statSem['moyenne_generale'] ?? null;
        $mentionSem = $statSem['mention'] ?? [];
        $couleurSem = '#3b82f6';
        if ($moyGenSem !== null) {
            $couleurSem = $moyGenSem >= 14 ? '#10b981' : ($moyGenSem >= 10 ? '#f59e0b' : '#ef4444');
        }
        $slug = 'sem-' . Str::slug($semestre);
    @endphp

    <div id="{{ $slug }}" class="contenu-semestre" style="{{ !$loop->first ? 'display:none;' : '' }}">

        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div class="d-flex align-items-center gap-2">
                <div style="width:4px;height:28px;background:{{ $couleurSem }};border-radius:4px;"></div>
                <h5 class="mb-0 fw-bold">📅 {{ $semestre }}</h5>
            </div>
            @if($moyGenSem !== null)
            <div class="d-flex align-items-center gap-2">
                <span class="fw-bold" style="font-size:1.1rem;color:{{ $couleurSem }};">Moy. {{ $moyGenSem }}/20</span>
                @if(!empty($mentionSem))
                    <span class="badge bg-{{ $mentionSem['color'] }} bg-opacity-15 text-{{ $mentionSem['color'] }}">{{ $mentionSem['txt'] }}</span>
                @endif
            </div>
            @endif
        </div>

        @if($moyGenSem !== null)
        <div style="height:6px;background:#f1f5f9;border-radius:99px;overflow:hidden;margin-bottom:20px;">
            <div style="height:100%;width:{{ ($moyGenSem/20)*100 }}%;background:{{ $couleurSem }};border-radius:99px;"></div>
        </div>
        @endif

        <div class="d-flex flex-column gap-3 mb-4">
            @foreach($matieres as $matiere => $notesMatiere)
            @php
                $moyMat     = $statSem['moyennes_par_matiere'][$matiere] ?? null;
                $couleurMat = '#3b82f6';
                $mentionMat = '';
                if ($moyMat !== null) {
                    if ($moyMat >= 16)      { $couleurMat = '#10b981'; $mentionMat = 'Très Bien'; }
                    elseif ($moyMat >= 14)  { $couleurMat = '#10b981'; $mentionMat = 'Bien'; }
                    elseif ($moyMat >= 12)  { $couleurMat = '#f59e0b'; $mentionMat = 'Assez Bien'; }
                    elseif ($moyMat >= 10)  { $couleurMat = '#f59e0b'; $mentionMat = 'Passable'; }
                    else                    { $couleurMat = '#ef4444'; $mentionMat = 'Insuffisant'; }
                }
            @endphp
            <div class="page-card" style="border-left:4px solid {{ $couleurMat }};padding:0;overflow:hidden;">
                <div style="padding:16px 20px;background:{{ $couleurMat }}12;border-bottom:1px solid {{ $couleurMat }}20;">
                    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div>
                            <div class="fw-bold" style="font-size:1rem;color:#0f172a;">{{ $matiere }}</div>
                            <div class="text-muted" style="font-size:.78rem;">{{ count($notesMatiere) }} évaluation(s)</div>
                        </div>
                        @if($moyMat !== null)
                        <div style="text-align:center;background:{{ $couleurMat }}20;border:1.5px solid {{ $couleurMat }};border-radius:12px;padding:8px 16px;">
                            <div style="font-size:1.6rem;font-weight:900;color:{{ $couleurMat }};line-height:1;">{{ $moyMat }}</div>
                            <div style="font-size:.7rem;color:{{ $couleurMat }}AA;">/20</div>
                            @if($mentionMat)<div style="font-size:.68rem;font-weight:700;color:{{ $couleurMat }};margin-top:4px;">{{ $mentionMat }}</div>@endif
                        </div>
                        @endif
                    </div>
                    @if($moyMat !== null)
                    <div style="height:4px;background:rgba(0,0,0,.08);border-radius:99px;overflow:hidden;margin-top:10px;">
                        <div style="height:100%;width:{{ ($moyMat/20)*100 }}%;background:{{ $couleurMat }};border-radius:99px;"></div>
                    </div>
                    @endif
                </div>

                <div style="padding:12px 20px;">
                    <div class="d-flex flex-column gap-2">
                        @foreach($notesMatiere as $n)
                        @php
                            $val  = floatval($n['Note_Evaluation'] ?? 0);
                            $coef = floatval($n['Coef_Evaluation'] ?? 1);
                            $cn   = $val >= 14 ? '#10b981' : ($val >= 10 ? '#f59e0b' : '#ef4444');
                            $pctN = ($val / 20) * 100;
                        @endphp
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;">
                            <div class="d-flex align-items-center justify-content-between gap-2">
                                <div>
                                    <div class="d-flex gap-2 flex-wrap mb-1">
                                        <span class="badge" style="background:#eff6ff;color:#3b82f6;font-size:.72rem;">{{ $n['Type_Evaluation'] ?? 'Devoir' }}</span>
                                        @if($coef != 1)
                                        <span class="badge" style="background:#f5f3ff;color:#8b5cf6;font-size:.72rem;">Coef. {{ $coef }}</span>
                                        @endif
                                    </div>
                                    <div class="text-muted" style="font-size:.75rem;">
                                        📅 {{ isset($n['Date_Evaluation']) ? \Carbon\Carbon::parse($n['Date_Evaluation'])->format('d/m/Y') : 'N/A' }}
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <span style="font-size:1.4rem;font-weight:900;color:{{ $cn }};">{{ number_format($val, 2) }}</span>
                                    <span style="color:#94a3b8;font-size:.8rem;">/20</span>
                                </div>
                            </div>
                            <div style="height:4px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:8px;">
                                <div style="height:100%;width:{{ $pctN }}%;background:{{ $cn }};border-radius:99px;"></div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>

                @if($moyMat !== null)
                <div style="padding:10px 20px;border-top:1px solid {{ $couleurMat }}20;background:{{ $couleurMat }}08;text-align:center;">
                    <span style="font-size:.85rem;font-weight:700;color:#475569;">
                        Moyenne : <span style="color:{{ $couleurMat }};font-size:.95rem;">{{ $moyMat }}/20</span>
                        @if($mentionMat) &nbsp;·&nbsp; {{ $mentionMat }} @endif
                    </span>
                </div>
                @endif
            </div>
            @endforeach
        </div>

        @if($moyGenSem !== null)
        @php
            $notesduSem  = array_merge(...array_values($matieres));
            $reussiesSem = count(array_filter($notesduSem, fn($n) => floatval($n['Note_Evaluation'] ?? 0) >= 10));
            $echoueesSem = count($notesduSem) - $reussiesSem;
        @endphp
        <div class="page-card mb-4" style="background:linear-gradient(135deg,{{ $couleurSem }}15,{{ $couleurSem }}05);border:1.5px solid {{ $couleurSem }}30;">
            <div class="fw-bold mb-3" style="font-size:.9rem;">📊 Récapitulatif — {{ $semestre }}</div>
            <div class="row g-2">
                @foreach([
                    ['Matières',      count($matieres),       $couleurSem],
                    ['Notes ≥10',     $reussiesSem,           '#10b981'],
                    ['Notes <10',     $echoueesSem,           '#ef4444'],
                    ['Moy. Générale', $moyGenSem.'/20',       $couleurSem],
                ] as [$lbl, $val, $col])
                <div class="col-6 col-md-3">
                    <div style="background:{{ $col }}12;border-radius:10px;padding:10px;text-align:center;">
                        <div style="font-size:1.1rem;font-weight:900;color:{{ $col }};">{{ $val }}</div>
                        <div style="font-size:.7rem;color:#64748b;margin-top:2px;">{{ $lbl }}</div>
                    </div>
                </div>
                @endforeach
            </div>
            @if(!empty($mentionSem))
            <div class="mt-3" style="background:{{ $couleurSem }}15;border:1.5px solid {{ $couleurSem }}40;border-radius:10px;padding:12px;text-align:center;">
                <span style="font-size:.95rem;font-weight:800;color:{{ $couleurSem }};">
                    🎓 Mention : {{ $mentionSem['txt'] }} — {{ $moyGenSem }}/20
                </span>
            </div>
            @endif
        </div>
        @endif

    </div>
    @endforeach
    @endif

</div>
</div>
@endsection

@push('scripts')
<script>
// Données des semestres injectées depuis PHP
const semestresData = @json($semestresData);

function changerSemestre(btn) {
    // Masquer tous les contenus
    document.querySelectorAll('.contenu-semestre').forEach(el => el.style.display = 'none');

    // Réinitialiser tous les onglets
    document.querySelectorAll('.onglet-sem').forEach(el => {
        el.style.border     = '2px solid #e2e8f0';
        el.style.background = '#fff';
        el.style.color      = '#64748b';
    });

    // Activer l'onglet cliqué
    const c = btn.getAttribute('data-couleur');
    btn.style.border     = '2px solid ' + c;
    btn.style.background = c + '18';
    btn.style.color      = c;

    // Afficher le contenu correspondant
    document.getElementById(btn.getAttribute('data-sem')).style.display = 'block';

    // ── Mettre à jour l'en-tête ──
    const moy     = btn.getAttribute('data-moy');
    const mention = btn.getAttribute('data-mention');
    const label   = btn.getAttribute('data-label');

    document.getElementById('header-moy-val').textContent = moy !== 'null' && moy ? moy : '—';
    document.getElementById('header-moy-val').style.color = c;
    document.getElementById('header-sem-label').textContent = label;

    const mentionEl = document.getElementById('header-mention');
    if (mention && mention !== 'null' && mention !== '') {
        mentionEl.textContent = '🎓 ' + mention;
        mentionEl.style.display = 'block';
    } else {
        mentionEl.style.display = 'none';
    }
}
</script>
@endpush
