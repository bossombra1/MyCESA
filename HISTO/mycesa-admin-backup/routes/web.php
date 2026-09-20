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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UtilisateurController;

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

    Route::get('/notes',         [NoteController::class,         'index'])->name('notes.index');
    Route::get('/paiements',     [PaiementController::class,     'index'])->name('paiements.index');
    Route::get('/emplois-temps', [EmploiTempsController::class,  'index'])->name('emplois-temps.index');
    Route::get('/absences',      [AbsenceController::class,      'index'])->name('absences.index');
    Route::get('/evenements',    [EvenementController::class,    'index'])->name('evenements.index');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
});
