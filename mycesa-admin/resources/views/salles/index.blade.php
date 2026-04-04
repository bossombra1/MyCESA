@extends('layouts.app')
@section('title', 'Salles — MyCESA')
@section('page-title', 'Salles')
@section('page-subtitle', 'Gestion des salles')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-building text-purple me-2"></i>Liste des salles <span class="badge bg-purple bg-opacity-10 text-purple ms-2">{{ count($salles) }}</span></h6>
        <a href="{{ route('salles.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($salles) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Nom</th><th>Localisation</th><th>capacité de la salle</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($salles as $s)
                <tr>
                    <td><span class="fw-semibold">{{ $s['Nom_Salle'] ?? '—' }}</span></td>
                    <td>{{ $s['Localisation_Salle'] ?? '—' }}</td>
                    <td>{{ $s['Superficie_Salle'] ?? '—' }}</td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('salles.edit', $s['Id_SALLE'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('salles.destroy', $s['Id_SALLE'] ?? 0) }}" onsubmit="return confirm('Supprimer cette salle ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-building"></i><p>Aucune salle trouvée</p><a href="{{ route('salles.create') }}" class="btn btn-primary mt-2">Ajouter la première salle</a></div>@endif
</div>
@endsection
