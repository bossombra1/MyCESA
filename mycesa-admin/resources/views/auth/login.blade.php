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
        :root {
            --primary-blue: #e68518;
            --dark-blue: #4cd323;
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
            --text-main: #0f172a;
            --text-muted: #64748b;
            --input-border: #e2e8f0;
        }

        * { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            background: var(--bg-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }

        .login-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 3rem 2.5rem;
            width: 100%;
            max-width: 440px;
            box-shadow: 0 25px 60px rgba(0,0,0,.4);
            position: relative;
            overflow: hidden;
        }

        /* Effet de bordure supérieure décorative */
        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: var(--primary-blue);
        }

        .logo-wrap {
            width: 70px; 
            height: 70px;
            background: var(--primary-blue);
            border-radius: 18px;
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-size: 2rem; 
            color: #fff;
            margin: 0 auto 1.5rem;
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        h1 { 
            font-size: 1.75rem; 
            font-weight: 800; 
            color: var(--text-main); 
            text-align: center; 
            letter-spacing: -0.5px;
            margin-bottom: 0.5rem;
        }

        .subtitle { 
            color: var(--text-muted); 
            font-size: 0.95rem; 
            text-align: center; 
            margin-bottom: 2.5rem; 
        }

        .form-label { 
            font-size: 0.85rem; 
            font-weight: 600; 
            color: #475569;
            margin-bottom: 0.5rem;
            display: block;
        }

        .input-group {
            margin-bottom: 1.5rem;
            border-radius: 12px;
            transition: all 0.2s;
        }

        .input-group-text {
            background: #f8fafc;
            border: 1.5px solid var(--input-border);
            border-right: none;
            color: #94a3b8;
            border-radius: 12px 0 0 12px;
            padding: 0.75rem 1rem;
        }

        .form-control {
            border-radius: 0 12px 12px 0;
            border: 1.5px solid var(--input-border);
            border-left: none;
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: var(--text-main);
            transition: all 0.2s;
        }

        .form-control:focus {
            border-color: var(--primary-blue);
            box-shadow: none;
            background-color: #fff;
        }

        .input-group:focus-within .input-group-text {
            border-color: var(--primary-blue);
            color: var(--primary-blue);
        }

        .btn-login {
            width: 100%;
            background: var(--primary-blue);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 1rem;
            font-weight: 700;
            font-size: 1rem;
            margin-top: 1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .btn-login:hover { 
            background: var(--dark-blue); 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(37, 99, 235, 0.3);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .alert { 
            border-radius: 12px; 
            font-size: 0.875rem; 
            border: none; 
            padding: 1rem;
            margin-bottom: 1.5rem;
        }

        .footer-text {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8rem;
            margin-top: 2.5rem;
        }

        /* Media Queries pour mobile */
        @media (max-width: 480px) {
            .login-card {
                padding: 2rem 1.5rem;
            }
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="logo-wrap">
            <i class="bi bi-mortarboard-fill"></i>
        </div>

        <h1>MyCESA Admin</h1>
        <p class="subtitle">Gestion simplifiée de votre établissement</p>

        @if(session('success'))
            <div class="alert alert-success d-flex align-items: center;">
                <i class="bi bi-check-circle-fill me-2"></i>
                {{ session('success') }}
            </div>
        @endif

        @if(session('error') || $errors->any())
            <div class="alert alert-danger d-flex align-items: center;">
                <i class="bi bi-exclamation-octagon-fill me-2"></i>
                {{ session('error') ?? $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ url('/login') }}">
            @csrf
            
            <div class="mb-3">
                <label for="login" class="form-label">Identifiant</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                    <input type="text" id="login" name="login" 
                           class="form-control @error('login') is-invalid @enderror"
                           placeholder="Ex: admin_cesa" 
                           value="{{ old('login') }}" 
                           required autofocus>
                </div>
            </div>

            <div class="mb-4">
                <label for="password" class="form-label">Mot de passe</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-shield-lock-fill"></i></span>
                    <input type="password" id="password" name="password" 
                           class="form-control @error('password') is-invalid @enderror"
                           placeholder="••••••••" 
                           required>
                </div>
            </div>

            <button type="submit" class="btn-login">
                <span>Se connecter</span>
                <i class="bi bi-arrow-right-short fs-4"></i>
            </button>
        </form>

        <div class="footer-text">
            © {{ date('Y') }} <strong>MyCESA</strong> — Tous droits réservés.
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>