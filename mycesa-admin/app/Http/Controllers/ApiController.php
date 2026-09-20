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
            ->baseUrl(env('NODE_API_URL'));
    }

    /**
     * Client HTTP dédié aux envois de fichiers (multipart/form-data).
     *
     * On ne force surtout PAS l'en-tête Content-Type ici : Guzzle ne génère
     * « multipart/form-data; boundary=... » que si aucun Content-Type n'est
     * déjà défini (il l'ajoute en en-tête « conditionnel »). Un
     * Content-Type: application/json explicite ferait donc partir un corps
     * multipart étiqueté JSON, et le backend Node.js tenterait de le parser
     * avec express.json() -> « Unexpected token '-', "--..." is not valid JSON ».
     */
    protected function apiMultipart(int $timeout = 120)
    {
        return Http::timeout($timeout)
            ->withHeaders([
                'Authorization' => 'Bearer ' . Session::get('jwt_token'),
                'Accept'        => 'application/json',
            ])
            ->baseUrl(env('NODE_API_URL'));
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

    /**
     * Envoie des données via POST.
     */
    protected function postData(string $endpoint, array $data = []): bool
    {
        try {
            $response = $this->api()->post($endpoint, $data);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Met à jour des données via PUT.
     */
    protected function putData(string $endpoint, array $data = []): bool
    {
        try {
            $response = $this->api()->put($endpoint, $data);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Supprime des données via DELETE.
     */
    protected function deleteData(string $endpoint): bool
    {
        try {
            $response = $this->api()->delete($endpoint);
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
