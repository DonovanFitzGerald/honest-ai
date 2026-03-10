<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function show(Chat $chat)
    {
        return Inertia::render('chat/show', [
            'chat' => [
                'id' => $chat->id,
                'title' => $chat->title,
                'created_at' => $chat->created_at,
                'updated_at' => $chat->updated_at,
            ],
        ]);
    }
}