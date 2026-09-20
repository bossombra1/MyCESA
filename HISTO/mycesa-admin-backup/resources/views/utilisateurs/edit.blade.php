@extends('layouts.app')
@section('title', 'Modifier utilisateur')
@section('page-title', 'Modifier utilisateur')
@section('content')
<div class="row justify-content-center"><div class="col-lg-7"><div class="page-card">
    <div class="d-flex align-items-center gap-3 mb-4"><a href="{{ route('utilisateurs.index') }}" class="btn btn-light btn-sm"><i class="bi bi-arrow-left"></i></a><h5 class="mb-0 fw-bold">Modifier l'utilisateur</h5></div>
    <form method="POST" action="{{ route('utilisateurs.update', $utilisateur['Id_User'] ?? 0) }}">@csrf @method('PUT')
        <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom</label><input type="text" name="Nom_User" class="form-control" value="{{ old('Nom_User', $utilisateur['Nom_User'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Login</label><input type="text" name="Login_User" class="form-control" value="{{ old('Login_User', $utilisateur['Login_User'] ?? '') }}" required></div>
            <div class="col-md-6"><label class="form-label">Email</label><input type="email" name="Email_User" class="form-control" value="{{ old('Email_User', $utilisateur['Email_User'] ?? '') }}"></div>
            <div class="col-md-6"><label class="form-label">Nouveau mot de passe <small class="text-muted">(laisser vide = inchangé)</small></label><input type="password" name="Password_User" class="form-control"></div>
            <div class="col-md-6">
                <label class="form-label">Rôle</label>
                <select name="Id_ROLE" class="form-select">
                    <option value="2" {{ ($utilisateur['Id_ROLE'] ?? 2) == 2 ? 'selected' : '' }}>Utilisateur</option>
                    <option value="1" {{ ($utilisateur['Id_ROLE'] ?? 2) == 1 ? 'selected' : '' }}>Administrateur</option>
                </select>
            </div>
        </div>
        <div class="d-flex gap-2 mt-4"><button type="submit" class="btn btn-primary"><i class="bi bi-check-lg me-1"></i> Enregistrer</button><a href="{{ route('utilisateurs.index') }}" class="btn btn-light">Annuler</a></div>
    </form>
</div></div></div>
@endsection
