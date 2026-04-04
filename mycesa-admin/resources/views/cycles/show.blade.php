@extends('layouts.app')
@section('title', 'Fiche cycle')
@section('page-title', 'Fiche cycle')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center justify-content-between mb-4"><div class="d-flex align-items-center gap-3"><a href="{{ route('cycles.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Fiche cycle</h5></div><a href="{{ route('cycles.edit', $cycle['Id_CYCLE'] ?? 0) }}" class="btn btn-primary btn-sm"><i class="bi bi-pencil"></i> Modifier</a></div>
    <div class="row g-3">
        <div class="col-md-12"><div class="p-3 rounded-3 border"><div class="text-muted small mb-1">Libellé</div><div class="fw-semibold">{{ $cycle['Lib_Cycle'] ?? '—' }}</div></div></div>
    </div>
</div></div></div>
@endsection
