@extends('layouts.app')
@section('title', 'Historique des emplois du temps')
@section('page-title', 'Historique des emplois du temps')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2"><h6 class="table-title"><i class="bi bi-clock-history text-primary me-2"></i>Historique des créneaux</h6><a href="{{ route('emplois-temps.index') }}" class="btn btn-light">Retour au planning</a></div>
    <form method="GET" class="d-flex gap-2 mb-3"><select name="classe" class="form-select" style="max-width:280px" onchange="this.form.submit()"><option value="">Toutes les classes</option>@foreach($classes as $classe)<option value="{{ $classe['Id_CLASSE'] }}" {{ request('classe') == $classe['Id_CLASSE'] ? 'selected' : '' }}>{{ $classe['Nom_Classe'] }}</option>@endforeach</select></form>
    @if(count($archive))
    <div class="table-responsive"><table class="table"><thead><tr><th>Action</th><th>Date du cours</th><th>Horaire</th><th>Classe</th><th>Matière</th><th>Professeur</th><th>Salle</th><th>Archivé le</th></tr></thead><tbody>
    @foreach($archive as $item)<tr><td><span class="badge {{ ($item['Action_Archive'] ?? '') === 'SUPPRESSION' ? 'bg-danger' : 'bg-warning text-dark' }}">{{ $item['Action_Archive'] }}</span></td><td>{{ isset($item['date_']) ? \Carbon\Carbon::parse($item['date_'])->format('d/m/Y') : '—' }}</td><td>{{ substr($item['Heure_Debut'] ?? '',0,5) }} - {{ substr($item['Heure_Fin'] ?? '',0,5) }}</td><td>{{ $item['Nom_Classe'] ?? '—' }}</td><td>{{ $item['Nom_Matiere'] ?? '—' }}</td><td>{{ $item['Nom_Professeur'] ?? '—' }}</td><td>{{ $item['Nom_Salle'] ?? '—' }}</td><td>{{ isset($item['Date_Archive']) ? \Carbon\Carbon::parse($item['Date_Archive'])->format('d/m/Y H:i') : '—' }}</td></tr>@endforeach
    </tbody></table></div>
    @else <div class="empty-state"><i class="bi bi-clock-history"></i><p>Aucun historique disponible.</p></div>@endif
</div>
@endsection
