@extends('layouts.app')

@section('title', 'Tableau de bord — MyCESA')
@section('page-title', 'Tableau de bord')
@section('page-subtitle', 'Vue d\'ensemble de l\'établissement')

@section('content')

{{-- Stats cards --}}
<div class="row g-3 mb-4">
    @php
    $cards = [
        ['label'=>'Étudiants',    'value'=>$stats['total_etudiants'],   'icon'=>'bi-people-fill',           'color'=>'#3b82f6','bg'=>'#eff6ff', 'route'=>'etudiants.index'],
        ['label'=>'Professeurs',  'value'=>$stats['total_professeurs'], 'icon'=>'bi-person-workspace',       'color'=>'#10b981','bg'=>'#f0fdf4', 'route'=>'profs.index'],
        ['label'=>'Classes',      'value'=>$stats['total_classes'],     'icon'=>'bi-building',               'color'=>'#8b5cf6','bg'=>'#f5f3ff', 'route'=>'classes.index'],
        ['label'=>'Matières',     'value'=>$stats['total_matieres'],    'icon'=>'bi-book-fill',              'color'=>'#f59e0b','bg'=>'#fffbeb', 'route'=>'matieres.index'],
    ];
    @endphp

    @foreach($cards as $card)
    <div class="col-xl-3 col-md-6">
        <a href="{{ route($card['route']) }}" class="text-decoration-none">
            <div class="stat-card d-flex align-items-center gap-3">
                <div class="stat-icon" style="background:{{ $card['bg'] }}; color:{{ $card['color'] }};">
                    <i class="bi {{ $card['icon'] }}"></i>
                </div>
                <div>
                    <div class="stat-value">{{ $card['value'] }}</div>
                    <div class="stat-label">{{ $card['label'] }}</div>
                </div>
            </div>
        </a>
    </div>
    @endforeach
</div>

{{-- Charts row --}}
<div class="row g-3 mb-4">
    <div class="col-lg-5">
        <div class="table-card h-100">
            <div class="table-header">
                <h6 class="table-title"><i class="bi bi-pie-chart-fill text-primary me-2"></i>Répartition par genre</h6>
            </div>
            <div class="p-3">
                @if(!empty($stats['etudiants_par_genre']))
                    <canvas id="genreChart" height="220"></canvas>
                @else
                    <div class="empty-state"><i class="bi bi-pie-chart"></i><p>Aucune donnée</p></div>
                @endif
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <div class="table-card h-100">
            <div class="table-header">
                <h6 class="table-title"><i class="bi bi-bar-chart-fill text-success me-2"></i>Étudiants par classe</h6>
            </div>
            <div class="p-3">
                @if(!empty($stats['etudiants_par_classe']))
                    <canvas id="classeChart" height="220"></canvas>
                @else
                    <div class="empty-state"><i class="bi bi-bar-chart"></i><p>Aucune donnée</p></div>
                @endif
            </div>
        </div>
    </div>
</div>

{{-- Actions rapides --}}
<div class="row g-3 mb-4">
    <div class="col-12">
        <div class="table-card">
            <div class="table-header">
                <h6 class="table-title"><i class="bi bi-lightning-fill text-warning me-2"></i>Actions rapides</h6>
            </div>
            <div class="p-3">
                <div class="row g-2">
                    <div class="col-md-3 col-6">
                        <a href="{{ route('etudiants.create') }}" class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-person-plus-fill fs-5"></i>
                            <small>Ajouter étudiant</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('profs.create') }}" class="btn btn-outline-success w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-person-plus-fill fs-5"></i>
                            <small>Ajouter professeur</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('classes.create') }}" class="btn btn-outline-purple w-100 d-flex flex-column align-items-center gap-1 py-3" style="color:#8b5cf6;border-color:#8b5cf6;">
                            <i class="bi bi-building fs-5"></i>
                            <small>Ajouter classe</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('matieres.create') }}" class="btn btn-outline-warning w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-book-fill fs-5"></i>
                            <small>Ajouter matière</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('filieres.create') }}" class="btn btn-outline-info w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-diagram-3 fs-5"></i>
                            <small>Ajouter filière</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('salles.create') }}" class="btn btn-outline-warning w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-building fs-5"></i>
                            <small>Ajouter salle</small>
                        </a>
                    </div>
                    <div class="col-md-3 col-6">
                        <a href="{{ route('cycles.create') }}" class="btn btn-outline-danger w-100 d-flex flex-column align-items-center gap-1 py-3">
                            <i class="bi bi-calendar3 fs-5"></i>
                            <small>Ajouter cycle</small>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Derniers étudiants --}}
@if(!empty($derniers_etudiants))
<div class="table-card">
    <div class="table-header">
        <h6 class="table-title"><i class="bi bi-clock-history text-primary me-2"></i>Derniers étudiants</h6>
        <a href="{{ route('etudiants.index') }}" class="btn btn-sm btn-light">Voir tout</a>
    </div>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Classe</th>
                    <th>Genre</th>
                    <th>Email</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @foreach($derniers_etudiants as $e)
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm {{ ($e['Genre_Etudiant'] ?? '') == 'Masculin' ? 'bg-primary' : 'bg-warning' }} text-white">
                                {{ strtoupper(substr($e['Nom_Etudiant'] ?? 'E', 0, 1)) }}
                            </div>
                            <div>
                                <div class="fw-600">{{ $e['Nom_Etudiant'] ?? '' }} {{ $e['Prenoms_Etudiant'] ?? '' }}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">{{ $e['Nom_Classe'] ?? 'N/A' }}</span></td>
                    <td><span class="badge bg-light text-secondary">{{ $e['Genre_Etudiant'] ?? 'N/A' }}</span></td>
                    <td class="text-muted small">{{ $e['Email_Etudiant'] ?? '' }}</td>
                    <td>
                        <a href="{{ route('etudiants.show', $e['Id_Etudiant'] ?? 0) }}" class="btn btn-sm btn-light">
                            <i class="bi bi-eye"></i>
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endif

@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {

    @if(!empty($stats['etudiants_par_genre']))
    new Chart(document.getElementById('genreChart'), {
        type: 'doughnut',
        data: {
            labels: @json(array_keys($stats['etudiants_par_genre'])),
            datasets: [{
                data: @json(array_values($stats['etudiants_par_genre'])),
                backgroundColor: ['#3b82f6','#f59e0b','#10b981','#8b5cf6'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } }
        }
    });
    @endif

    @if(!empty($stats['etudiants_par_classe']))
    new Chart(document.getElementById('classeChart'), {
        type: 'bar',
        data: {
            labels: @json(array_keys($stats['etudiants_par_classe'])),
            datasets: [{
                label: 'Étudiants',
                data: @json(array_values($stats['etudiants_par_classe'])),
                backgroundColor: '#3b82f6',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });
    @endif
});
</script>
@endpush
