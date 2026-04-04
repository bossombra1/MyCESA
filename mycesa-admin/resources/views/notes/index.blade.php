@extends('layouts.app')
@section('title', 'Notes — MyCESA')
@section('page-title', 'Notes')
@section('page-subtitle', 'Relevés de notes par étudiant')

@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title">
            <i class="bi bi-clipboard2-data-fill text-primary me-2"></i>
            Notes par étudiant
            <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($parEtudiant) }}</span>
        </h6>
        <form method="GET" class="d-flex gap-2">
            <input type="text" name="search" class="form-control" placeholder="Rechercher un étudiant..."
                   value="{{ request('search') }}" style="width:240px;">
            <button type="submit" class="btn btn-light"><i class="bi bi-search"></i></button>
            @if(request('search'))
                <a href="{{ route('notes.index') }}" class="btn btn-light"><i class="bi bi-x"></i></a>
            @endif
        </form>
    </div>

    @if(count($parEtudiant) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Matricule</th>
                    <th>Nb notes</th>
                    <th>Moyenne générale</th>
                    <th>Mention</th>
                    <th class="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($parEtudiant as $matricule => $etudiant)
                @php
                    $moy = $etudiant['moyenne'];
                    $mention = null;
                    $couleur = 'secondary';
                    if ($moy !== null) {
                        if ($moy >= 16)      { $mention = 'Très Bien';   $couleur = 'success'; }
                        elseif ($moy >= 14)  { $mention = 'Bien';        $couleur = 'success'; }
                        elseif ($moy >= 12)  { $mention = 'Assez Bien';  $couleur = 'warning'; }
                        elseif ($moy >= 10)  { $mention = 'Passable';    $couleur = 'warning'; }
                        else                 { $mention = 'Insuffisant'; $couleur = 'danger'; }
                    }
                @endphp
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="avatar-sm text-white fw-bold"
                                 style="background:{{ $moy >= 10 ? '#10b981' : ($moy === null ? '#94a3b8' : '#ef4444') }};">
                                {{ strtoupper(substr($etudiant['nom_complet'], 0, 1)) }}
                            </div>
                            <span class="fw-semibold">{{ $etudiant['nom_complet'] }}</span>
                        </div>
                    </td>
                    <td><span class="badge bg-light text-dark">{{ $matricule }}</span></td>
                    <td>
                        <span class="badge bg-primary bg-opacity-10 text-primary">
                            {{ $etudiant['nb_notes'] }} note(s)
                        </span>
                    </td>
                    <td>
                        @if($moy !== null)
                            @php $pct = ($moy / 20) * 100; @endphp
                            <div class="d-flex align-items-center gap-2">
                                <div style="flex:1;height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden;">
                                    <div style="height:100%;width:{{ $pct }}%;background:{{ $moy >= 10 ? '#10b981' : '#ef4444' }};border-radius:99px;"></div>
                                </div>
                                <span class="fw-bold" style="color:{{ $moy >= 10 ? '#10b981' : '#ef4444' }};min-width:48px;">
                                    {{ $moy }}/20
                                </span>
                            </div>
                        @else
                            <span class="text-muted">—</span>
                        @endif
                    </td>
                    <td>
                        @if($mention)
                            <span class="badge bg-{{ $couleur }} bg-opacity-10 text-{{ $couleur }}">{{ $mention }}</span>
                        @else
                            <span class="text-muted">—</span>
                        @endif
                    </td>
                    <td class="text-end">
                        <a href="{{ route('notes.show', urlencode($matricule)) }}" class="btn btn-sm btn-primary">
                            <i class="bi bi-eye me-1"></i> Voir bulletin
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state">
            <i class="bi bi-clipboard2-data"></i>
            <p>Aucune note enregistrée</p>
        </div>
    @endif
</div>
@endsection
