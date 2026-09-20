<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class CheckJwtToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = Session::get('jwt_token');

        if (!$token) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter.');
        }

        try {
            $apiUrl = env('NODE_API_URL', 'http://localhost:8080/api');
            $response = Http::withToken($token)
                ->timeout(5)
                ->get($apiUrl . '/auth/verify');

            if ($response->status() === 401) {
                Session::flush();
                return redirect()->route('login')->with('error', 'Session expiree. Veuillez vous reconnecter.');
            }

            // Si l'API est down mais qu'on a un token, on laisse passer
            return $next($request);

        } catch (\Exception $e) {
            // API indisponible : on laisse passer avec le token existant
            return $next($request);
        }
    }
}
