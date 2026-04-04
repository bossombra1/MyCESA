@extends('layouts.app')

@section('title', 'Étudiants — MyCESA')
@section('page-title', 'Étudiants')
@section('page-subtitle', 'Gestion des étudiants de l\'établissement')

@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-people-fill text-primary me-2"></i>
            Liste des étudiants
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($etudiants) }}</span>
        </h6>
        <div class="d-flex gap-2 flex-wrap">
            <form method="GET" class="d-flex gap-2">
                <input type="text" name="search" class="form-control" placeholder="Rechercher..." value="{{ request('search') }}" style="width:220px;">
                <button type="submit" class="btn btn-light"><i class="bi bi-search"></i></button>
                @if(request('search'))
                    <a href="{{ route('etudiants.index') }}" class="btn btn-light"><i class="bi bi-x"></i></a>
                @endif
            </form>
            <a href="{{ route('etudiants.create') }}" class="btn btn-primary">
                <i class="bi bi-plus-lg me-1"></i> Ajouter
            </a>
        </div>
    </div>

    @if(count($etudiants) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Classe</th>
                    <th>Genre</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($etudiants as $e)
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm {{ ($e['Genre_Etudiant'] ?? '') == 'Masculin' ? 'bg-primary' : 'bg-warning' }} text-white">
                                {{ strtoupper(substr($e['Nom_Etudiant'] ?? 'E', 0, 1)) }}
                            </div>
                            <div>
                                <div class="fw-semibold text-dark">{{ $e['Nom_Etudiant'] ?? '' }} {{ $e['Prenoms_Etudiant'] ?? '' }}</div>
                                <small class="text-muted">#{{ $e['Id_Etudiant'] ?? '' }}</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">{{ $e['Nom_Classe'] ?? 'N/A' }}</span></td>
                    <td><span class="badge bg-light text-secondary">{{ $e['Genre_Etudiant'] ?? 'N/A' }}</span></td>
                    <td class="text-muted small">{{ $e['Email_Etudiant'] ?? '—' }}</td>
                    <td class="text-muted small">{{ $e['Tel_Etudiant'] ?? '—' }}</td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('etudiants.show', $e['Id_ETUDIANT'] ?? 0) }}" class="btn btn-sm btn-light" title="Voir">
                                <i class="bi bi-eye"></i>
                            </a>
                            <a href="{{ route('etudiants.edit', $e['Id_ETUDIANT'] ?? 0) }}" class="btn btn-sm btn-light" title="Modifier">
                                <i class="bi bi-pencil"></i>
                            </a>
                            <form method="POST" action="{{ route('etudiants.destroy', $e['Id_ETUDIANT'] ?? 0) }}" class="d-inline"
                                  onsubmit="return confirm('Supprimer cet étudiant ?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-light text-danger" title="Supprimer">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state">
            <i class="bi bi-people text-muted"></i>
            <p>Aucun étudiant trouvé</p>
            <a href="{{ route('etudiants.create') }}" class="btn btn-primary mt-2">Ajouter le premier étudiant</a>
        </div>
    @endif
</div>
@endsection
