@extends('layouts.app')
@section('title', 'Classes — MyCESA')
@section('page-title', 'Classes')
@section('page-subtitle', 'Gestion des classes et niveaux')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-building text-purple me-2" style="color:#8b5cf6;"></i>Liste des classes <span class="badge ms-2" style="background:#f5f3ff;color:#8b5cf6;">{{ count($classes) }}</span></h6>
        <a href="{{ route('classes.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($classes) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Nom</th><th>Filière</th><th>Cycle</th><th>Niveau</th><th>Capacité</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($classes as $c)
                <tr>
                    <td><span class="fw-semibold">{{ $c['Nom_Classe'] ?? '' }}</span></td>
                    <td class="text-muted">{{ $c['Filiere'] ?? $c['Nom_Filiere'] ?? '—' }}</td>
                    <td class="text-muted">{{ $c['Cycle'] ?? $c['Nom_Cycle'] ?? '—' }}</td>
                    <td><span class="badge bg-info bg-opacity-10 text-info">{{ $c['Niveau_Classe'] ?? '—' }}</span></td>
                    <td class="text-muted">{{ $c['Capacite_Classe'] ?? '—' }}</td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('classes.edit', $c['Id_Classe'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('classes.destroy', $c['Id_Classe'] ?? 0) }}" onsubmit="return confirm('Supprimer cette classe ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-building"></i><p>Aucune classe trouvée</p><a href="{{ route('classes.create') }}" class="btn btn-primary mt-2">Ajouter la première classe</a></div>@endif
</div>
@endsection
