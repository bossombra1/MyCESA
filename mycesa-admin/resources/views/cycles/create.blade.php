@extends('layouts.app')
@section('title', 'Ajouter un cycle')
@section('page-title', 'Nouveau cycle')
@section('content')
<div class="row justify-content-center"><div class="col-lg-8"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('cycles.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Ajouter un cycle</h5></div>
    <form method="POST" action="{{ route('cycles.store') }}">@csrf
        <div class="row g-3">
            <div class="col-md-12"><label class="form-label">Nom du cycle *</label><input type="text" name="Lib_Cycle" class="form-control" value="{{ old('Lib_Cycle') }}" required></div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary">Enregistrer</button><a href="{{ route('cycles.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
