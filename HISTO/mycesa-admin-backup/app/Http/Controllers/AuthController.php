<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class AuthController extends Controller
{
    public function showLoginForm()
    {
        if (Session::has('jwt_token')) {
            return redirect()->route('dashboard');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string|min:3',
        ], [
            'login.required'    => 'Le login est obligatoire.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min'      => 'Le mot de passe doit faire au moins 3 caracteres.',
        ]);

        try {
            $apiUrl   = env('NODE_API_URL', 'http://localhost:8080/api');
            $response = Http::timeout(10)->post($apiUrl . '/auth/login', [
                'Login_User'    => $request->login,
                'Password_User' => $request->password,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Le token peut etre sous "token" ou "access_token"
                $token = $data['token'] ?? $data['access_token'] ?? $data['jwt'] ?? null;

                if (!$token) {
                    return back()->withErrors(['login' => 'Reponse API invalide : token manquant.'])->withInput();
                }

                // Verification du role admin (Id_ROLE = 1)
                $user   = $data['user'] ?? $data['data'] ?? null;
                $roleId = $user['Id_ROLE'] ?? $user['role_id'] ?? null;

                if ($roleId !== null && $roleId !== 1) {
                    return back()->withErrors(['login' => 'Acces reserve aux administrateurs.'])->withInput();
                }

                Session::put('jwt_token', $token);
                Session::put('user', $user);

                return redirect()->route('dashboard')->with('success', 'Connexion reussie !');
            }

            $errorMsg = $response->json()['message'] ?? 'Identifiants incorrects.';
            return back()->withErrors(['login' => $errorMsg])->withInput();

        } catch (\Exception $e) {
            return back()->withErrors([
                'login' => 'Impossible de contacter le serveur. Verifiez que l\'API est demarree sur le port 8080.'
            ])->withInput();
        }
    }

    public function logout(Request $request)
    {
        Session::flush();
        return redirect()->route('login')->with('success', 'Deconnexion reussie.');
    }
}
