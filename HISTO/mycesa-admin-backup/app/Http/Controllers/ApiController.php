<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;

class ApiController extends Controller
{
    protected function api()
    {
        return Http::timeout((int) env('API_TIMEOUT', 10))
            ->withHeaders([
                'Authorization' => 'Bearer ' . Session::get('jwt_token'),
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json',
            ])
            ->baseUrl(env('NODE_API_URL', 'http://localhost:8080/api'));
    }

    protected function getData(string $endpoint): array
    {
        try {
            $response = $this->api()->get($endpoint);
            if ($response->successful()) {
                $json = $response->json();
                return $json['data'] ?? $json ?? [];
            }
            return [];
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function handleApiError(\Exception $e, string $action = 'effectuer cette action')
    {
        return back()->with('error', "Impossible de {$action}. Verifiez que l'API est disponible.");
    }
}
