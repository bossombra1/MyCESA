<?php
namespace App\Http\Controllers;
class NotificationController extends ApiController
{
    public function index()
    {
        $notifications = $this->getData('/notifications');
        return view('notifications.index', compact('notifications'));
    }
}
