@extends('layouts.app')
@section('title', 'Cycles — MyCESA')
@section('page-title', 'Cycles')
@section('page-subtitle', 'Gestion des cycles')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-bar-chart-fill text-success me-2"></i>Liste des cycles <span class="badge bg-success bg-opacity-10 text-success ms-2">{{ count($cycles) }}</span></h6>
        <a href="{{ route('cycles.create') }}" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i> Ajouter</a>
    </div>
    @if(count($cycles) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Cycle</th><th class="text-end">Actions</th></tr></thead>
            <tbody>
                @foreach($cycles as $c)
                <tr>
                    <td><span class="fw-semibold">{{ $c['Lib_Cycle'] ?? '—' }}</span></td>
                    <td class="text-end">
                        <div class="d-flex gap-1 justify-content-end">
                            <a href="{{ route('cycles.edit', $c['Id_CYCLE'] ?? 0) }}" class="btn btn-sm btn-light"><i class="bi bi-pencil"></i></a>
                            <form method="POST" action="{{ route('cycles.destroy', $c['Id_CYCLE'] ?? 0) }}" onsubmit="return confirm('Supprimer ce cycle ?')">@csrf @method('DELETE')<button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button></form>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else<div class="empty-state"><i class="bi bi-bar-chart"></i><p>Aucun cycle trouvé</p><a href="{{ route('cycles.create') }}" class="btn btn-primary mt-2">Ajouter le premier cycle</a></div>@endif
</div>
@endsection
