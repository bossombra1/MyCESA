<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion — MyCESA</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .login-card {
            background: #fff;
            border-radius: 20px;
            padding: 2.5rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 25px 60px rgba(0,0,0,.4);
        }
        .logo-wrap {
            width: 60px; height: 60px;
            background: #3b82f6;
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.6rem; color: #fff;
            margin: 0 auto 1.5rem;
        }
        h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; text-align: center; }
        .subtitle { color: #64748b; font-size: .875rem; text-align: center; margin-bottom: 2rem; }
        .form-label { font-size: .8rem; font-weight: 600; color: #475569; }
        .form-control {
            border-radius: 10px;
            border: 1.5px solid #e2e8f0;
            padding: .7rem 1rem;
            font-size: .9rem;
        }
        .form-control:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,.15);
        }
        .btn-login {
            width: 100%;
            background: #3b82f6;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: .8rem;
            font-weight: 700;
            font-size: .95rem;
            margin-top: .5rem;
            transition: background .15s;
        }
        .btn-login:hover { background: #2563eb; color: #fff; }
        .input-group-text {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-right: none;
            color: #94a3b8;
            border-radius: 10px 0 0 10px;
        }
        .input-group .form-control { border-radius: 0 10px 10px 0; border-left: none; }
        .input-group .form-control:focus { border-left: none; }
        .alert { border-radius: 10px; font-size: .875rem; border: none; }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="logo-wrap">
            <i class="bi bi-mortarboard-fill"></i>
        </div>
        <h1>MyCESA Admin</h1>
        <p class="subtitle">Connectez-vous à l'espace d'administration</p>

        @if(session('success'))
            <div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>{{ session('success') }}</div>
        @endif
        @if(session('error'))
            <div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ session('error') }}</div>
        @endif
        @if($errors->any())
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ url('/login') }}">
            @csrf
            <div class="mb-3">
                <label class="form-label">Identifiant</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input type="text" name="login" class="form-control @error('login') is-invalid @enderror"
                           placeholder="Votre login" value="{{ old('login') }}" required autofocus>
                </div>
            </div>
            <div class="mb-4">
                <label class="form-label">Mot de passe</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input type="password" name="password" class="form-control @error('password') is-invalid @enderror"
                           placeholder="Votre mot de passe" required>
                </div>
            </div>
            <button type="submit" class="btn-login">
                <i class="bi bi-box-arrow-in-right me-2"></i>Se connecter
            </button>
        </form>

        <p class="text-center text-muted mt-4 mb-0" style="font-size:.75rem;">
            © {{ date('Y') }} MyCESA — Système de Gestion Scolaire
        </p>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
