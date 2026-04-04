@extends('layouts.app')
@section('title', 'Notifications — MyCESA')
@section('page-title', 'Notifications')
@section('page-subtitle', 'Centre de notifications')
@section('content')
<div class="table-card">
    <div class="table-header">
        <h6 class="table-title"><i class="bi bi-bell-fill text-warning me-2"></i>Toutes les notifications <span class="badge bg-warning bg-opacity-10 text-warning ms-2">{{ count($notifications) }}</span></h6>
    </div>
    @if(count($notifications) > 0)
    <div style="padding: .5rem 0;">
        @foreach($notifications as $n)
        @php $lu = $n['Lu'] ?? $n['Is_Read'] ?? true; @endphp
        <div class="d-flex align-items-start gap-3 px-4 py-3 {{ !$lu ? 'bg-primary bg-opacity-5' : '' }}" style="border-bottom:1px solid #f1f5f9;">
            <div class="stat-icon mt-1" style="width:38px;height:38px;border-radius:10px;background:{{ !$lu ? '#eff6ff' : '#f8fafc' }};color:{{ !$lu ? '#3b82f6' : '#94a3b8' }};flex-shrink:0;">
                <i class="bi bi-bell{{ !$lu ? '-fill' : '' }}"></i>
            </div>
            <div class="flex-grow-1">
                <div class="fw-semibold {{ !$lu ? 'text-dark' : 'text-muted' }}" style="font-size:.875rem;">
                    {{ $n['Titre_Notification'] ?? $n['Titre'] ?? 'Notification' }}
                </div>
                <div class="text-muted small mt-1">{{ $n['Message_Notification'] ?? $n['Message'] ?? '' }}</div>
                @if(!empty($n['Date_Notification'] ?? $n['created_at'] ?? null))
                <div class="text-muted" style="font-size:.72rem;margin-top:.25rem;">
                    <i class="bi bi-clock me-1"></i>
                    {{ \Carbon\Carbon::parse($n['Date_Notification'] ?? $n['created_at'])->diffForHumans() }}
                </div>
                @endif
            </div>
            @if(!$lu)
                <div class="rounded-circle bg-primary flex-shrink-0 mt-2" style="width:8px;height:8px;"></div>
            @endif
        </div>
        @endforeach
    </div>
    @else
        <div class="empty-state"><i class="bi bi-bell-slash"></i><p>Aucune notification</p></div>
    @endif
</div>
@endsection
