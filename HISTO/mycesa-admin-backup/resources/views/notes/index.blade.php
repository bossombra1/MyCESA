@extends('layouts.app')
@section('title', 'Notes — MyCESA')
@section('page-title', 'Notes')
@section('page-subtitle', 'Relevés de notes et évaluations')
@section('content')
<div class="table-card">
    <div class="table-header flex-wrap gap-2">
        <h6 class="table-title"><i class="bi bi-clipboard2-data-fill text-primary me-2"></i>Liste des notes <span class="badge bg-primary bg-opacity-10 text-primary ms-2">{{ count($notes) }}</span></h6>
    </div>
    @if(count($notes) > 0)
    <div class="table-responsive">
        <table class="table">
            <thead><tr><th>Étudiant</th><th>Matière</th><th>Note</th><th>Type</th><th>Date</th></tr></thead>
            <tbody>
                @foreach($notes as $n)
                <tr>
                    <td class="fw-semibold">{{ ($n['Nom_Etudiant'] ?? '') . ' ' . ($n['Prenoms_Etudiant'] ?? '') }}</td>
                    <td>{{ $n['Nom_Matiere'] ?? '—' }}</td>
                    <td>
                        @php $note = $n['Note_Evaluation'] ?? $n['Note'] ?? null; @endphp
                        <span class="badge {{ $note >= 10 ? 'bg-success' : 'bg-danger' }} bg-opacity-10 {{ $note >= 10 ? 'text-success' : 'text-danger' }} fw-bold" style="font-size:.9rem;">
                            {{ $note ?? '—' }}/20
                        </span>
                    </td>
                    <td><span class="badge bg-light text-secondary">{{ $n['Type_Evaluation'] ?? $n['Type'] ?? '—' }}</span></td>
                    <td class="text-muted small">{{ isset($n['Date_Evaluation']) ? \Carbon\Carbon::parse($n['Date_Evaluation'])->format('d/m/Y') : '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @else
        <div class="empty-state"><i class="bi bi-clipboard2-data"></i><p>Aucune note enregistrée</p></div>
    @endif
</div>
@endsection
