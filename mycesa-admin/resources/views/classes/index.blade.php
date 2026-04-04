@extends('layouts.app')
@section('title', 'Classes — MyCESA')
@section('page-title', 'Classes')
@section('page-subtitle', 'Gestion des classes')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-building me-2" style="color:#8b5cf6;"></i>Liste des classes
            <span class="badge ms-2" style="background:#f5f3ff;color:#8b5cf6;">{{ count($classes) }}</span>
        </h6>
        <a href="{{ route('classes.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($classes) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Nom de la classe</th>
                    <th>Filière</th>
                    <th>Effectif prévu</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($classes as $c)
                @php
                    $filiereName = '—';
                    foreach($filieres as $f) {
                        if ((string)($f['Id_FILIERE'] ?? '') === (string)($c['Id_FILIERE'] ?? '')) {
                            $filiereName = $f['Nom_FILIERE'] ?? $f['Nom_Filiere'] ?? '—';
                            break;
                        }
                    }
                @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm text-white" style="background:#8b5cf6;">
                                {{ strtoupper(substr($c['Nom_Classe'] ?? 'C', 0, 1)) }}
                            </div>
                            <div>
                                <div class="fw-semibold">{{ $c['Nom_Classe'] ?? '—' }}</div>
                                <small class="text-muted">#{{ $c['Id_CLASSE'] ?? '' }}</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-primary bg-opacity-10 text-primary">{{ $filiereName }}</span></td>
                    <td>
                        @if($c['Effectif_Prevu_Etudiant'] ?? null)
                            <span class="badge bg-success bg-opacity-10 text-success">
                                <i class="bi bi-people me-1"></i>{{ $c['Effectif_Prevu_Etudiant'] }} étudiants
                            </span>
                        @else
                            <span class="text-muted">—</span>
                        @endif
                    </td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('classes.show', $c['Id_CLASSE'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-eye"></i></a>
                            <a href="{{ route('classes.edit', $c['Id_CLASSE'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('classes.destroy', $c['Id_CLASSE'] ?? 0) }}" onsubmit="return confirm('Supprimer cette classe ?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button>
                            </form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state"><i class="bi bi-building"></i><p>Aucune classe trouvée</p><a href="{{ route('classes.create') }}" class="btn btn-primary mt-2">Ajouter la première classe</a></div>
    @endif
</div>
@endsection
