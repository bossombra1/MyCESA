@extends('layouts.admin')
@section('title', 'Gestion des Événements')
@section('page-title', 'Événements')
@section('page-subtitle', 'Créer et gérer les événements de l\'établissement')

@section('content')

{{-- Bouton créer --}}
<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2" style="font-size:.85rem;">
            {{ count($evenements) }} événement(s)
        </span>
    </div>
    <button class="btn btn-primary d-flex align-items-center gap-2"
            data-bs-toggle="modal" data-bs-target="#modalCreer">
        <i class="bi bi-plus-lg"></i> Créer un événement
    </button>
</div>

{{-- Tableau de gestion --}}
<div class="card border-0 shadow-sm" style="border-radius:12px;overflow:hidden;">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead style="background:#f8fafc;">
                <tr>
                    <th class="px-4 py-3 text-muted fw-semibold" style="font-size:.8rem;">TITRE</th>
                    <th class="px-3 py-3 text-muted fw-semibold" style="font-size:.8rem;">TYPE</th>
                    <th class="px-3 py-3 text-muted fw-semibold" style="font-size:.8rem;">DATE</th>
                    <th class="px-3 py-3 text-muted fw-semibold" style="font-size:.8rem;">CIBLE</th>
                    <th class="px-3 py-3 text-muted fw-semibold" style="font-size:.8rem;">STATUT</th>
                    <th class="px-4 py-3 text-muted fw-semibold text-end" style="font-size:.8rem;">ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                @forelse($evenements as $ev)
                @php
                    $date   = $ev['Date_Evenement'] ?? null;
                    $isPast = $date && \Carbon\Carbon::parse($date)->isPast();
                    $type   = strtolower($ev['Type'] ?? 'autre');

                    $typeMap = [
                        'examen'  => ['label' => 'Examen', 'color' => 'danger'],
                        'cours'   => ['label' => 'Cours', 'color' => 'primary'],
                        'reunion' => ['label' => 'Réunion', 'color' => 'info'],
                        'sortie'  => ['label' => 'Sortie', 'color' => 'success'],
                        'autre'   => ['label' => 'Autre', 'color' => 'secondary'],
                    ];

                    $typeLabel  = $typeMap[$type]['label'] ?? ucfirst($type);
                    $badgeColor = $typeMap[$type]['color'] ?? 'secondary';
                    $filiereName = !empty($ev['Id_Filiere']) && isset($filiereNames[$ev['Id_Filiere']])
                        ? $filiereNames[$ev['Id_Filiere']] : null;
                    $classeName  = !empty($ev['Id_Classe']) && isset($classeNames[$ev['Id_Classe']])
                        ? $classeNames[$ev['Id_Classe']] : null;
                @endphp
                <tr>
                    {{-- Titre + description --}}
                    <td class="px-4 py-3">
                        <div class="fw-semibold" style="font-size:.9rem;">
                            {{ $ev['Titre'] ?? '—' }}
                        </div>
                        @if(!empty($ev['Description']))
                        <div class="text-muted" style="font-size:.78rem;">
                            {{ Str::limit($ev['Description'], 50) }}
                        </div>
                        @endif
                    </td>

                    {{-- Type --}}
                    <td class="px-3 py-3">
                        <span class="badge bg-{{ $badgeColor }} bg-opacity-15 text-{{ $badgeColor }}" style="font-size:.75rem;">
                            {{ $typeLabel }}
                        </span>
                    </td>

                    {{-- Date --}}
                    <td class="px-3 py-3" style="font-size:.82rem;">
                        @if($date)
                            <div>{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</div>
                            <div class="text-muted">{{ \Carbon\Carbon::parse($date)->format('H:i') }}</div>
                        @else
                            <span class="text-muted">—</span>
                        @endif
                    </td>

                    {{-- Cible (Pour_Tous / Filière / Classe) --}}
                    <td class="px-3 py-3">
                        @if(!empty($ev['Pour_Tous']))
                            <span class="badge bg-primary bg-opacity-10 text-primary" style="font-size:.75rem;">
                                <i class="bi bi-globe me-1"></i>Tous
                            </span>
                        @else
                            <div class="d-flex flex-column gap-1">
                                @if(!empty($ev['Id_Filiere']))
                                <span class="badge bg-warning bg-opacity-10 text-warning" style="font-size:.75rem;">
                                    Filière {{ $filiereName ?? $ev['Id_Filiere'] }}
                                </span>
                                @endif
                                @if(!empty($ev['Id_Classe']))
                                <span class="badge bg-info bg-opacity-10 text-info" style="font-size:.75rem;">
                                    Classe {{ $classeName ?? $ev['Id_Classe'] }}
                                </span>
                                @endif
                                @if(empty($ev['Id_Filiere']) && empty($ev['Id_Classe']))
                                    <span class="text-muted" style="font-size:.78rem;">Non défini</span>
                                @endif
                            </div>
                        @endif
                    </td>

                    {{-- Statut --}}
                    <td class="px-3 py-3">
                        @if($isPast)
                            <span class="badge bg-secondary bg-opacity-10 text-secondary" style="font-size:.75rem;">Passé</span>
                        @else
                            <span class="badge bg-success bg-opacity-10 text-success" style="font-size:.75rem;">À venir</span>
                        @endif
                    </td>

                    {{-- Actions --}}
                    <td class="px-4 py-3 text-end">
                        <div class="d-flex align-items-center justify-content-end gap-2">
                            {{-- Éditer --}}
                            <button class="btn btn-sm btn-outline-primary btn-edit"
                                    data-id="{{ $ev['Id_Evenement'] }}"
                                    data-titre="{{ $ev['Titre'] }}"
                                    data-description="{{ $ev['Description'] ?? '' }}"
                                    data-date="{{ $date }}"
                                    data-type="{{ $ev['Type'] }}"
                                    data-id_classe="{{ $ev['Id_Classe'] ?? '' }}"
                                    data-id_filiere="{{ $ev['Id_Filiere'] ?? '' }}"
                                    data-pour_tous="{{ $ev['Pour_Tous'] ? '1' : '0' }}"
                                    data-bs-toggle="modal" data-bs-target="#modalEditer"
                                    title="Modifier">
                                <i class="bi bi-pencil"></i>
                            </button>

                            {{-- Supprimer --}}
                            <form action="{{ route('admin.evenements.destroy', $ev['Id_Evenement']) }}"
                                  method="POST"
                                  onsubmit="return confirm('Supprimer cet événement ?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-outline-danger" title="Supprimer">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center text-muted py-5">
                        <i class="bi bi-calendar-x d-block" style="font-size:2rem;"></i>
                        <span class="mt-2 d-block">Aucun événement créé</span>
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>


{{-- ===================== MODAL CRÉER ===================== --}}
<div class="modal fade" id="modalCreer" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow" style="border-radius:14px;">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold">
                    <i class="bi bi-calendar-plus text-primary me-2"></i>Créer un événement
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.evenements.store') }}" method="POST">
                @csrf
                <div class="modal-body px-4 py-3">
                    @include('admin.evenements._form')
                </div>
                <div class="modal-footer border-0 px-4 pb-4">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-lg me-1"></i>Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


{{-- ===================== MODAL ÉDITER ===================== --}}
<div class="modal fade" id="modalEditer" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow" style="border-radius:14px;">
            <div class="modal-header border-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold">
                    <i class="bi bi-pencil-square text-primary me-2"></i>Modifier l'événement
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="formEditer" action="" method="POST">
                @csrf @method('PUT')
                <div class="modal-body px-4 py-3">
                    @include('admin.evenements._form', ['edit' => true])
                </div>
                <div class="modal-footer border-0 px-4 pb-4">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-lg me-1"></i>Mettre à jour
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', function () {
        const id = this.dataset.id;

        // Met à jour l'action du formulaire
        document.getElementById('formEditer').action =
            `/admin/evenements/${id}`;

        // Remplit les champs
        document.querySelector('#modalEditer [name="Titre"]').value        = this.dataset.titre;
        document.querySelector('#modalEditer [name="Description"]').value  = this.dataset.description;
        document.querySelector('#modalEditer [name="Date_Evenement"]').value = this.dataset.date
            ? this.dataset.date.slice(0,16) : '';
        document.querySelector('#modalEditer [name="Type"]').value         = this.dataset.type;
        document.querySelector('#modalEditer [name="Id_Classe"]').value    = this.dataset.id_classe;
        document.querySelector('#modalEditer [name="Id_Filiere"]').value   = this.dataset.id_filiere;

        const pourTous = this.dataset.pour_tous === '1';
        document.querySelector('#modalEditer [name="Pour_Tous"]').checked  = pourTous;

        // Affiche/masque les champs conditionnels
        toggleCible('modalEditer', pourTous);
    });
});

function toggleCible(modalId, pourTous) {
    const bloc = document.querySelector(`#${modalId} .cible-specifique`);
    if (bloc) bloc.style.display = pourTous ? 'none' : 'block';
}

// Gère le toggle Pour_Tous dans chaque modal
document.querySelectorAll('[name="Pour_Tous"]').forEach(chk => {
    chk.addEventListener('change', function () {
        const modal = this.closest('.modal').id;
        toggleCible(modal, this.checked);
    });
    // État initial
    const modal = chk.closest('.modal').id;
    toggleCible(modal, chk.checked);
});
</script>
@endpush