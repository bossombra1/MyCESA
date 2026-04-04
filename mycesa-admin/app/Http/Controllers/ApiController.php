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
            ->baseUrl(env('NODE_API_URL', 'http://localhost:3000/api'));
    }

    /**
     * Récupère une liste depuis l'API.
     * Gère : [], {value:[...]}, {data:[...]}, {items:[...]}
     */
    protected function getData(string $endpoint): array
    {
        try {
            $response = $this->api()->get($endpoint);
            if (!$response->successful()) return [];

            $json = $response->json();

            // Tableau direct
            if (is_array($json) && array_is_list($json)) return $json;

            // Cherche la première clé qui contient un tableau indexé
            $priority = ['value', 'data', 'items', 'results'];
            foreach ($priority as $key) {
                if (isset($json[$key]) && is_array($json[$key])) {
                    return $json[$key];
                }
            }
            // Dernier recours : première valeur tableau trouvée
            foreach ($json as $v) {
                if (is_array($v) && array_is_list($v)) return $v;
            }

            return [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Récupère un objet unique par ID depuis une liste.
     * Utilisé quand GET /{resource}/{id} n'existe pas dans l'API.
     */
    protected function getOneFromList(string $listEndpoint, string $idKey, $id): array
    {
        $items = $this->getData($listEndpoint);
        foreach ($items as $item) {
            if (isset($item[$idKey]) && (string)$item[$idKey] === (string)$id) {
                return $item;
            }
        }
        return [];
    }

    /**
     * Récupère un objet unique via GET /{endpoint}/{id}.
     * Gère {data:{...}} et {...} direct.
     */
    protected function getOne(string $endpoint): array
    {
        try {
            $response = $this->api()->get($endpoint);
            if (!$response->successful()) return [];

            $json = $response->json();
            if (isset($json['data']) && is_array($json['data'])) return $json['data'];
            if (isset($json['value']) && is_array($json['value'])) return $json['value'];
            if (is_array($json)) return $json;

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
