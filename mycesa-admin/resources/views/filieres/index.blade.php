@extends('layouts.app')
@section('title', 'Filières — MyCESA')
@section('page-title', 'Filières')
@section('page-subtitle', 'Gestion des filières')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-bookmarks-fill text-info me-2"></i>Liste des filières <span class="badge bg-info bg-opacity-10 text-info ms-2">{{ count($filieres) }}</span></h6>
        <a href="{{ route('filieres.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($filieres) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Filière</th><th>Cycle</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($filieres as $f)
                <tr>
                    <td><span class="fw-semibold">{{ $f['Nom_Filiere'] ?? '—' }}</span></td>
                    <td><span class="text-muted">{{ $cycleLabels[$f['Id_CYCLE']] ?? ($f['Id_CYCLE'] ?? '—') }}</span></td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('filieres.edit', $f['Id_FILIERE'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('filieres.destroy', $f['Id_FILIERE'] ?? 0) }}" onsubmit="return confirm('Supprimer cette filière ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-bookmarks"></i><p>Aucune filière trouvée</p><a href="{{ route('filieres.create') }}" class="btn btn-primary mt-2">Ajouter la première filière</a></div>@endif
</div>
@endsection
