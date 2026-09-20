<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;

class NotificationAdminController extends ApiController
{
    public function index()
{
    $notifications = $this->getData('/notifications/admin/liste') ?? [];
    $filieres      = $this->getData('/filieres') ?? [];
    $classes       = $this->getData('/classes')  ?? [];

    return view('admin.notifications.index',
                compact('notifications', 'filieres', 'classes'));
}

    public function store(Request $request)
    {
        $request->validate([
            'Titre_Notif'   => 'required|string|max:255',
            'Message_Notif' => 'required|string',
            'Type'          => 'required|string',
            'Cible'         => 'required|string',
        ]);

        $payload = [
            'Titre_Notif'   => $request->input('Titre_Notif'),
            'Message_Notif' => $request->input('Message_Notif'),
            'Type'          => $request->input('Type'),
            'Cible'         => $request->input('Cible'),
            'Id_Filiere'    => $request->filled('Id_Filiere')  ? $request->input('Id_Filiere')  : null,
            'Id_Classe'     => $request->filled('Id_Classe')   ? $request->input('Id_Classe')   : null,
            'Id_Etudiant'   => $request->filled('Id_Etudiant') ? $request->input('Id_Etudiant') : null,
            'Scheduled_At'  => $request->filled('Scheduled_At')? $request->input('Scheduled_At'): null,
        ];

        if ($payload['Cible'] === 'tous') {
            $payload['Id_Filiere']  = null;
            $payload['Id_Classe']   = null;
            $payload['Id_Etudiant'] = null;
        }

        $result = $this->postData('/notifications/send-cible', $payload);
        $count  = $result['recipients_count'] ?? 0;

        return redirect()->route('admin.notifications.index')
            ->with('success', "Notification envoyée à {$count} étudiant(s).");
    }

    public function destroy(int $id)
    {
        $this->deleteData("/notifications/admin/{$id}");

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Notification supprimée.');
    }
}