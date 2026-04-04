<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'MyCESA Admin')</title>

    <!-- Bootstrap 5 CSS via CDN - pas de Vite, zéro problème de build -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <style>
        * { font-family: 'Plus Jakarta Sans', sans-serif; }

        :root {
            --sidebar-width: 260px;
            --sidebar-bg: #0f172a;
            --sidebar-accent: #3b82f6;
            --topbar-h: 64px;
        }

        body { background: #f1f5f9; overflow-x: hidden; }

        /* ── SIDEBAR ── */
        #sidebar {
            position: fixed;
            top: 0; left: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: var(--sidebar-bg);
            z-index: 1040;
            display: flex;
            flex-direction: column;
            transition: transform .25s ease;
            overflow-y: auto;
        }

        #sidebar .brand {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,.07);
            display: flex;
            align-items: center;
            gap: .75rem;
        }
        #sidebar .brand-icon {
            width: 40px; height: 40px;
            background: var(--sidebar-accent);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem; color: #fff;
        }
        #sidebar .brand-text { color: #fff; font-weight: 700; font-size: 1.05rem; line-height: 1.2; }
        #sidebar .brand-text small { color: rgba(255,255,255,.4); font-weight: 400; font-size: .7rem; }

        /* Nav sections */
        #sidebar .nav-section {
            padding: .5rem 1rem .25rem;
            font-size: .65rem;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: rgba(255,255,255,.25);
            margin-top: .75rem;
        }

        #sidebar .nav-link {
            display: flex;
            align-items: center;
            gap: .75rem;
            padding: .6rem 1.25rem;
            margin: .1rem .75rem;
            border-radius: 8px;
            color: rgba(255,255,255,.55);
            font-size: .875rem;
            font-weight: 500;
            transition: all .15s ease;
            text-decoration: none;
        }
        #sidebar .nav-link i { font-size: 1rem; width: 20px; text-align: center; }
        #sidebar .nav-link:hover { color: #fff; background: rgba(255,255,255,.07); }
        #sidebar .nav-link.active { color: #fff; background: var(--sidebar-accent); }

        /* User info at bottom */
        #sidebar .sidebar-user {
            margin-top: auto;
            padding: 1rem 1.25rem;
            border-top: 1px solid rgba(255,255,255,.07);
            display: flex;
            align-items: center;
            gap: .75rem;
        }
        #sidebar .sidebar-user .avatar {
            width: 36px; height: 36px;
            background: var(--sidebar-accent);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: .8rem; color: #fff; font-weight: 700;
            flex-shrink: 0;
        }
        #sidebar .sidebar-user .user-name { color: #fff; font-size: .8rem; font-weight: 600; }
        #sidebar .sidebar-user .user-role { color: rgba(255,255,255,.35); font-size: .7rem; }

        /* ── MAIN ── */
        #main {
            margin-left: var(--sidebar-width);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ── TOPBAR ── */
        #topbar {
            position: sticky;
            top: 0;
            z-index: 1030;
            height: var(--topbar-h);
            background: #fff;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            gap: 1rem;
        }
        #topbar .page-title { font-weight: 700; font-size: 1.1rem; color: #0f172a; }
        #topbar .page-subtitle { font-size: .75rem; color: #94a3b8; }

        /* ── CONTENT ── */
        #content { flex: 1; padding: 1.75rem; }

        /* ── CARDS ── */
        .stat-card {
            background: #fff;
            border-radius: 14px;
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            transition: box-shadow .2s;
        }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .stat-card .stat-icon {
            width: 48px; height: 48px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem;
        }
        .stat-card .stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; line-height: 1; }
        .stat-card .stat-label { font-size: .8rem; color: #64748b; font-weight: 500; margin-top: .25rem; }

        /* ── TABLE ── */
        .table-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }
        .table-card .table-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .table-card .table-title { font-weight: 700; font-size: .95rem; color: #0f172a; margin: 0; }
        .table { margin: 0; }
        .table th {
            background: #f8fafc;
            font-size: .72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .05em;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0 !important;
            padding: .75rem 1rem;
        }
        .table td {
            padding: .85rem 1rem;
            vertical-align: middle;
            border-bottom: 1px solid #f1f5f9;
            font-size: .875rem;
            color: #334155;
        }
        .table tbody tr:last-child td { border-bottom: none; }
        .table tbody tr:hover td { background: #f8fafc; }

        /* ── BADGES ── */
        .badge { font-weight: 600; font-size: .72rem; padding: .35em .7em; border-radius: 6px; }

        /* ── AVATAR ── */
        .avatar-sm {
            width: 34px; height: 34px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: .75rem;
            font-weight: 700;
            flex-shrink: 0;
        }

        /* ── ALERTS ── */
        .alert { border: none; border-radius: 10px; font-size: .875rem; }

        /* ── FORMS ── */
        .form-control, .form-select {
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: .875rem;
            padding: .6rem .875rem;
        }
        .form-control:focus, .form-select:focus {
            border-color: var(--sidebar-accent);
            box-shadow: 0 0 0 3px rgba(59,130,246,.15);
        }
        .form-label { font-size: .8rem; font-weight: 600; color: #475569; margin-bottom: .35rem; }

        /* ── BUTTONS ── */
        .btn { border-radius: 8px; font-weight: 600; font-size: .875rem; padding: .55rem 1.1rem; }
        .btn-primary { background: var(--sidebar-accent); border-color: var(--sidebar-accent); }
        .btn-sm { font-size: .78rem; padding: .35rem .75rem; border-radius: 6px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 991px) {
            #sidebar { transform: translateX(-100%); }
            #sidebar.show { transform: translateX(0); }
            #main { margin-left: 0; }
            .sidebar-overlay { display: block !important; }
        }

        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.5);
            z-index: 1039;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #94a3b8;
        }
        .empty-state i { font-size: 3rem; margin-bottom: 1rem; display: block; }
        .empty-state p { font-size: .9rem; margin: 0; }

        /* ── PAGE CARD ── */
        .page-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            padding: 1.75rem;
        }
    </style>

    @stack('styles')
</head>
<body>

<!-- Overlay mobile -->
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<!-- ══ SIDEBAR ══ -->
<nav id="sidebar">
    <div class="brand">
        <div class="brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
        <div class="brand-text">
            MyCESA
            <br><small>Administration</small>
        </div>
    </div>

    <div style="flex:1; padding: .5rem 0;">

        <div class="nav-section">Principal</div>
        <a href="{{ route('dashboard') }}" class="nav-link {{ Route::currentRouteName() == 'dashboard' ? 'active' : '' }}">
            <i class="bi bi-grid-1x2-fill"></i> Tableau de bord
        </a>

        <div class="nav-section">Académique</div>
        <a href="{{ route('etudiants.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'etudiants') ? 'active' : '' }}">
            <i class="bi bi-people-fill"></i> Étudiants
        </a>
        <a href="{{ route('profs.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'profs') ? 'active' : '' }}">
            <i class="bi bi-person-workspace"></i> Professeurs
        </a>
        <a href="{{ route('classes.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'classes') ? 'active' : '' }}">
            <i class="bi bi-building"></i> Classes
        </a>
        <a href="{{ route('matieres.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'matieres') ? 'active' : '' }}">
            <i class="bi bi-book-fill"></i> Matières
        </a>
        <a href="{{ route('emplois-temps.index') }}" class="nav-link {{ Route::currentRouteName() == 'emplois-temps.index' ? 'active' : '' }}">
            <i class="bi bi-calendar3"></i> Emplois du temps
        </a>

        <div class="nav-section">Suivi</div>
        <a href="{{ route('notes.index') }}" class="nav-link {{ Route::currentRouteName() == 'notes.index' ? 'active' : '' }}">
            <i class="bi bi-clipboard2-data-fill"></i> Notes
        </a>
        <a href="{{ route('absences.index') }}" class="nav-link {{ Route::currentRouteName() == 'absences.index' ? 'active' : '' }}">
            <i class="bi bi-calendar-x-fill"></i> Absences
        </a>
        <a href="{{ route('paiements.index') }}" class="nav-link {{ Route::currentRouteName() == 'paiements.index' ? 'active' : '' }}">
            <i class="bi bi-credit-card-fill"></i> Paiements
        </a>

        <div class="nav-section">Général</div>
        <a href="{{ route('evenements.index') }}" class="nav-link {{ Route::currentRouteName() == 'evenements.index' ? 'active' : '' }}">
            <i class="bi bi-calendar-event-fill"></i> Événements
        </a>
        <a href="{{ route('notifications.index') }}" class="nav-link {{ Route::currentRouteName() == 'notifications.index' ? 'active' : '' }}">
            <i class="bi bi-bell-fill"></i> Notifications
        </a>
        <a href="{{ route('utilisateurs.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'utilisateurs') ? 'active' : '' }}">
            <i class="bi bi-person-badge-fill"></i> Utilisateurs
        </a>

        <div class="nav-section">Configuration</div>
        <a href="{{ route('filieres.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'filieres') ? 'active' : '' }}">
            <i class="bi bi-diagram-3"></i> Filières
        </a>
        <a href="{{ route('salles.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'salles') ? 'active' : '' }}">
            <i class="bi bi-building"></i> Salles
        </a>
        <a href="{{ route('cycles.index') }}" class="nav-link {{ str_starts_with(Route::currentRouteName() ?? '', 'cycles') ? 'active' : '' }}">
            <i class="bi bi-calendar3"></i> Cycles
        </a>
    </div>

    <div class="sidebar-user">
        <div class="avatar">
            {{ strtoupper(substr(Session::get('user.Nom_User', 'A'), 0, 1)) }}
        </div>
        <div style="min-width:0;">
            <div class="user-name text-truncate">{{ Session::get('user.Nom_User', 'Administrateur') }}</div>
            <div class="user-role">Admin</div>
        </div>
        <form method="POST" action="{{ route('logout') }}" class="ms-auto">
            @csrf
            <button type="submit" class="btn btn-sm btn-link text-white-50 p-0" title="Déconnexion">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        </form>
    </div>
</nav>

<!-- ══ MAIN ══ -->
<div id="main">

    <!-- Topbar -->
    <div id="topbar">
        <button class="btn btn-sm btn-light d-lg-none me-2" onclick="toggleSidebar()">
            <i class="bi bi-list fs-5"></i>
        </button>
        <div>
            <div class="page-title">@yield('page-title', 'Tableau de bord')</div>
            <div class="page-subtitle">@yield('page-subtitle', 'MyCESA — Système de gestion scolaire')</div>
        </div>
        <div class="ms-auto d-flex align-items-center gap-3">
            <span class="text-muted small d-none d-md-inline" id="clock"></span>
            <a href="{{ route('notifications.index') }}" class="btn btn-sm btn-light position-relative">
                <i class="bi bi-bell"></i>
            </a>
        </div>
    </div>

    <!-- Flash messages -->
    <div style="padding: 1rem 1.75rem 0;">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
                <i class="bi bi-check-circle-fill"></i>
                {{ session('success') }}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        @endif
        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill"></i>
                {{ session('error') }}
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        @endif
        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                @foreach($errors->all() as $error)
                    {{ $error }}<br>
                @endforeach
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        @endif
    </div>

    <!-- Content -->
    <div id="content">
        @yield('content')
    </div>

    <!-- Footer -->
    <footer style="padding: .75rem 1.75rem; border-top: 1px solid #e2e8f0; background:#fff;">
        <small class="text-muted">© {{ date('Y') }} MyCESA — Système de Gestion Scolaire v1.0</small>
    </footer>
</div>

<!-- Bootstrap 5 JS via CDN -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
    // Horloge
    function updateClock() {
        document.getElementById('clock').textContent = new Date().toLocaleTimeString('fr-FR');
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Sidebar mobile
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('show');
        document.getElementById('sidebarOverlay').style.display = 'block';
    }
    function closeSidebar() {
        document.getElementById('sidebar').classList.remove('show');
        document.getElementById('sidebarOverlay').style.display = 'none';
    }

    // Auto-hide alerts
    setTimeout(() => {
        document.querySelectorAll('.alert').forEach(el => {
            try { bootstrap.Alert.getOrCreateInstance(el).close(); } catch(e) {}
        });
    }, 5000);
</script>

@stack('scripts')
</body>
</html>
