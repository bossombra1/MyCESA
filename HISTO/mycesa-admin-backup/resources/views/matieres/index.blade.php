@extends('layouts.app')
@section('title', 'Matières — MyCESA')
@section('page-title', 'Matières')
@section('page-subtitle', 'Configuration des enseignements')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-book-fill text-warning me-2"></i>Liste des matières <span class="badge bg-warning bg-opacity-10 text-warning ms-2">{{ count($matieres) }}</span></h6>
        <a href="{{ route('matieres.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($matieres) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Matière</th><th>Code</th><th>Coefficient</th><th>Heures/sem</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($matieres as $m)
                <tr>
                    <td><span class="fw-semibold">{{ $m['Nom_Matiere'] ?? '' }}</span></td>
                    <td><span class="badge bg-light text-dark">{{ $m['Code_Matiere'] ?? '—' }}</span></td>
                    <td><span class="badge bg-warning bg-opacity-10 text-warning">{{ $m['Coefficient_Matiere'] ?? '—' }}</span></td>
                    <td class="text-muted">{{ $m['Heures_Semaine'] ?? '—' }}h</td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('matieres.edit', $m['Id_Matiere'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('matieres.destroy', $m['Id_Matiere'] ?? 0) }}" onsubmit="return confirm('Supprimer cette matière ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-book"></i><p>Aucune matière trouvée</p><a href="{{ route('matieres.create') }}" class="btn btn-primary mt-2">Ajouter la première matière</a></div>@endif
</div>
@endsection
