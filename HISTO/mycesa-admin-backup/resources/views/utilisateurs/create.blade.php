@extends('layouts.app')
@section('title', 'Ajouter un utilisateur')
@section('page-title', 'Nouvel utilisateur')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('utilisateurs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Ajouter un utilisateur</h5></div>
    <form method="POST" action="{{ route('utilisateurs.store') }}">@csrf
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom *</label><input type="text" name="Nom_User" class="form-control" value="{{ old('Nom_User') }}" required></div>
            <div class="col-md-6"><label class="form-label">Login *</label><input type="text" name="Login_User" class="form-control" value="{{ old('Login_User') }}" required></div>
            <div class="col-md-6"><label class="form-label">Email</label><input type="email" name="Email_User" class="form-control" value="{{ old('Email_User') }}"></div>
            <div class="col-md-6"><label class="form-label">Mot de passe *</label><input type="password" name="Password_User" class="form-control" required></div>
            <div class="col-md-6">
                <label class="form-label">Rôle</label>
                <select name="Id_ROLE" class="form-select">
                    <option value="2">Utilisateur</option>
                    <option value="1">Administrateur</option>
                </select>
            </div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Créer le compte</button><a href="{{ route('utilisateurs.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
