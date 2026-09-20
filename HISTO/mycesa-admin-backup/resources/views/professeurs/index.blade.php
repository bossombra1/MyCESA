@extends('layouts.app')
@section('title', 'Professeurs — MyCESA')
@section('page-title', 'Professeurs')
@section('page-subtitle', 'Corps enseignant de l\'établissement')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-person-workspace text-success me-2"></i>Liste des professeurs
            <span class="badge bg-success bg-opacity-10 text-success ms-2">{{ count($professeurs) }}</span>
        </h6>
        <div class="d-flex gap-2">
            <form method="GET" class="d-flex gap-2">
                <input type="text" name="search" class="form-control" placeholder="Rechercher..." value="{{ request('search') }}" style="width:220px;">
                <button type="submit" class="btn btn-light"><i class="bi bi-search"></i></button>
                @if(request('search'))<a href="{{ route('profs.index') }}" class="btn btn-light"><i class="bi bi-x"></i></a>@endif
            </form>
            <a href="{{ route('profs.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
        </div>
    </div>
    @if(count($professeurs) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Professeur</th><th>Spécialité</th><th>Grade</th><th>Email</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($professeurs as $p)
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm bg-success text-white">{{ strtoupper(substr($p['Nom_Prof'] ?? 'P', 0, 1)) }}</div>
                            <div>
                                <div class="fw-semibold">{{ ($p['Nom_Prof'] ?? '') . ' ' . ($p['Prenoms_Prof'] ?? '') }}</div>
                                <small class="text-muted">#{{ $p['Id_Prof'] ?? '' }}</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-primary bg-opacity-10 text-primary">{{ $p['Specialite_Prof'] ?? '—' }}</span></td>
                    <td class="text-muted small">{{ $p['Grade_Prof'] ?? '—' }}</td>
                    <td class="text-muted small">{{ $p['Email_Prof'] ?? '—' }}</td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('profs.edit', $p['Id_Prof'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('profs.destroy', $p['Id_Prof'] ?? 0) }}" onsubmit="return confirm('Supprimer ce professeur ?')">
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
        <div class="empty-state"><i class="bi bi-person-workspace"></i><p>Aucun professeur trouvé</p><a href="{{ route('profs.create') }}" class="btn btn-primary mt-2">Ajouter le premier professeur</a></div>
    @endif
</div>
@endsection
