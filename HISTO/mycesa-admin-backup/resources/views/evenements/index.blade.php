@extends('layouts.app')
@section('title', 'Événements — MyCESA')
@section('page-title', 'Événements')
@section('page-subtitle', 'Agenda et événements de l\'établissement')
@section('content')
<div class="row g-3">
    @if(count($evenements) > 0)
        @foreach($evenements as $ev)
        @php
            $date = $ev['Date_Evenement'] ?? $ev['Date'] ?? null;
            $isPast = $date && \Carbon\Carbon::parse($date)->isPast();
        @endphp
        <div class="col-md-6 col-lg-4">
            <div class="page-card h-100 position-relative" style="{{ $isPast ? 'opacity:.7;' : '' }}">
                <div class="d-flex align-items-start justify-content-between mb-3">
                    <div class="stat-icon" style="background:#eff6ff;color:#3b82f6;width:44px;height:44px;flex-shrink:0;">
                        <i class="bi bi-calendar-event-fill"></i>
                    </div>
                    @if($isPast)
                        <span class="badge bg-secondary bg-opacity-10 text-secondary">Passé</span>
                    @else
                        <span class="badge bg-success bg-opacity-10 text-success">À venir</span>
                    @endif
                </div>
                <h6 class="fw-bold mb-1">{{ $ev['Titre_Evenement'] ?? $ev['Titre'] ?? 'Événement' }}</h6>
                <p class="text-muted small mb-2">{{ $ev['Description_Evenement'] ?? $ev['Description'] ?? '' }}</p>
                @if($date)
                <div class="d-flex align-items-center gap-1 text-muted small">
                    <i class="bi bi-clock"></i>
                    {{ \Carbon\Carbon::parse($date)->format('d/m/Y à H:i') }}
                </div>
                @endif
                @if(!empty($ev['Lieu_Evenement'] ?? $ev['Lieu'] ?? null))
                <div class="d-flex align-items-center gap-1 text-muted small mt-1">
                    <i class="bi bi-geo-alt"></i>
                    {{ $ev['Lieu_Evenement'] ?? $ev['Lieu'] }}
                </div>
                @endif
            </div>
        </div>
        @endforeach
    @else
        <div class="col-12">
            <div class="table-card">
                <div class="empty-state"><i class="bi bi-calendar-event"></i><p>Aucun événement prévu</p></div>
            </div>
        </div>
    @endif
</div>
@endsection
