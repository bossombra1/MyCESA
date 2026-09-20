<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\ProfesseurController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\EmploiTempsController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\NotificationController;        // ← existant, ne pas toucher
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\Admin\EvenementAdminController;
use App\Http\Controllers\Admin\NotificationAdminController; // ← seul ajout nouveau

// Auth
Route::get('/login',  [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Redirect root
Route::get('/', fn() => redirect()->route('dashboard'));

// Protected routes
Route::middleware(['check.jwt'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('etudiants',    EtudiantController::class);
    Route::resource('profs',        ProfesseurController::class);
    Route::resource('classes',      ClasseController::class);
    Route::resource('matieres',     MatiereController::class);
    Route::resource('utilisateurs', UtilisateurController::class);
    Route::resource('filieres',     FiliereController::class);
    Route::resource('salles',       SalleController::class);
    Route::resource('cycles',       CycleController::class);

    Route::get('/notes',             [NoteController::class,     'index'])->name('notes.index');
    Route::get('/notes/{matricule}', [NoteController::class,     'show'])->name('notes.show');

    Route::get('/paiements',                          [PaiementController::class, 'index'])->name('paiements.index');
    Route::post('/paiements',                         [PaiementController::class, 'store'])->name('paiements.store');
    Route::get('/paiements/{Id_ETUDIANT}',            [PaiementController::class, 'show'])->name('paiements.show');
    Route::get('/paiements/detail/{Id_ETUDIANT}',     [PaiementController::class, 'show'])->name('paiements.detail');
    Route::put('/paiements/{Id_VERSEMENT}',           [PaiementController::class, 'update'])->name('paiements.update');
    Route::delete('/paiements/{Id_VERSEMENT}',        [PaiementController::class, 'destroy'])->name('paiements.destroy');

    Route::get('/absences',               [AbsenceController::class, 'index'])->name('absences.index');
    Route::post('/absences',              [AbsenceController::class, 'store'])->name('absences.store');
    Route::post('/absences/justifier',    [AbsenceController::class, 'justify'])->name('absences.justify');
    Route::delete('/absences',            [AbsenceController::class, 'destroy'])->name('absences.destroy');

    Route::get('/evenements',    [EvenementController::class,    'index'])->name('evenements.index');

    // ── Notifications étudiants (EXISTANT — ne pas modifier la vue ni le contrôleur)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // ── Routes Admin
    Route::prefix('admin')->name('admin.')->group(function () {

        // Événements admin (existant)
        Route::resource('evenements', EvenementAdminController::class);

        // Notifications admin (NOUVEAU — contrôleur séparé dans Admin/)
        Route::get(    'notifications',       [NotificationAdminController::class, 'index'])
             ->name('notifications.index');
        Route::post(   'notifications',       [NotificationAdminController::class, 'store'])
             ->name('notifications.store');
        Route::delete( 'notifications/{id}',  [NotificationAdminController::class, 'destroy'])
             ->name('notifications.destroy');
    });

    // Emplois du temps
    Route::get('/emplois-temps',         [EmploiTempsController::class, 'index'])->name('emplois-temps.index');
     Route::post('/emplois-temps/fichier', [EmploiTempsController::class, 'uploadFile'])->name('emplois-temps.upload-file');
     Route::get('/emplois-temps/fichier/{id}/download', [EmploiTempsController::class, 'downloadFile'])->name('emplois-temps.download-file');
     Route::get('/emplois-temps/fichier/{id}/apercu', [EmploiTempsController::class, 'previewFile'])->name('emplois-temps.preview-file');
     Route::delete('/emplois-temps/fichier/{id}', [EmploiTempsController::class, 'destroyFile'])->name('emplois-temps.destroy-file');
     Route::get('/emplois-temps/archive', [EmploiTempsController::class, 'archive'])->name('emplois-temps.archive');
     Route::get('/emplois-temps/modifier', function (\Illuminate\Http\Request $request, EmploiTempsController $controller) {
          return $controller->edit($request->except(['_token']));
     })->name('emplois-temps.edit');
     Route::put('/emplois-temps/modifier', [EmploiTempsController::class, 'update'])->name('emplois-temps.update');
    Route::get('/emplois-temps/creer',   [EmploiTempsController::class, 'create'])->name('emplois-temps.create');
     Route::post('/emplois-temps/importer', [EmploiTempsController::class, 'import'])->name('emplois-temps.import');
    Route::post('/emplois-temps',        [EmploiTempsController::class, 'store'])->name('emplois-temps.store');
    Route::delete('/emplois-temps/{id}', [EmploiTempsController::class, 'destroy'])->name('emplois-temps.destroy');
});