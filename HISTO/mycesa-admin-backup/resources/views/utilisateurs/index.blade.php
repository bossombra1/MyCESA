@extends('layouts.app')
@section('title', 'Utilisateurs — MyCESA')
@section('page-title', 'Utilisateurs')
@section('page-subtitle', 'Gestion des comptes utilisateurs')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-person-badge-fill text-primary me-2"></i>Comptes utilisateurs <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($utilisateurs) }}</span></h6>
        <a href="{{ route('utilisateurs.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($utilisateurs) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Utilisateur</th><th>Login</th><th>Email</th><th>Rôle</th><th>Statut</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($utilisateurs as $u)
                @php $isAdmin = ($u['Id_ROLE'] ?? 0) == 1; @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm {{ $isAdmin ? 'bg-primary' : 'bg-secondary' }} text-white">{{ strtoupper(substr($u['Nom_User'] ?? 'U', 0, 1)) }}</div>
                            <span class="fw-semibold">{{ $u['Nom_User'] ?? '—' }}</span>
                        </div>
                    </td>
                    <td class="text-muted">{{ $u['Login_User'] ?? '—' }}</td>
                    <td class="text-muted small">{{ $u['Email_User'] ?? '—' }}</td>
                    <td><span class="badge {{ $isAdmin ? 'bg-primary' : 'bg-secondary' }} bg-opacity-10 {{ $isAdmin ? 'text-primary' : 'text-secondary' }}">{{ $isAdmin ? 'Admin' : 'Utilisateur' }}</span></td>
                    <td><span class="badge bg-success bg-opacity-10 text-success">Actif</span></td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('utilisateurs.edit', $u['Id_User'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('utilisateurs.destroy', $u['Id_User'] ?? 0) }}" onsubmit="return confirm('Supprimer cet utilisateur ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-person-badge"></i><p>Aucun utilisateur trouvé</p></div>@endif
</div>
@endsection
