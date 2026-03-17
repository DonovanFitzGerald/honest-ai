<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function show(Chat $chat)
    {
        return inertia('chat/show', [
            'chat' => $chat,
            'messages' => $chat->messages()
                ->orderBy('sequence')
                ->get(),
            'useLog' => $chat->useLogs()
                ->with(['use_cases' => fn($row) => $row->orderBy('position')])
                ->latest('created_at')
                ->first(),
        ]);
    }
}