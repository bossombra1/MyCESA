<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service indisponible — MyCESA</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        * { font-family: 'Segoe UI', sans-serif; }
        body { min-height: 100vh; background: #f1f5f9; display: flex; align-items: center; justify-content: center; }
        .error-card { background: #fff; border-radius: 20px; padding: 3rem; text-align: center; max-width: 480px; box-shadow: 0 10px 40px rgba(0,0,0,.1); }
        .error-icon { font-size: 4rem; color: #ef4444; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <h2 class="fw-bold mb-2">Service indisponible</h2>
        <p class="text-muted mb-4">{{ $message ?? 'L\'API Node.js est inaccessible.' }}</p>
        @if(config('app.debug') && !empty($error))
            <div class="alert alert-warning text-start small"><strong>Debug:</strong> {{ $error }}</div>
        @endif
        <div class="d-flex gap-2 justify-content-center">
            <a href="{{ url('/dashboard') }}" class="btn btn-primary">Réessayer</a>
            <a href="{{ route('login') }}" class="btn btn-light">Se reconnecter</a>
        </div>
        <p class="text-muted small mt-4">Vérifiez que l'API Node.js tourne sur le port 8080.</p>
    </div>
</body>
</html>
