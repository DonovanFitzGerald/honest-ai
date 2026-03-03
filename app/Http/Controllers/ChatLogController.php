<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $id = $request->integer('id');

        $selected = null;

        if ($id) {
            $selected = Chat::query()
                ->findOrFail($id);
        }

        return Inertia::render('Chat/Index', [
            'selectedChatlog' => $selected
                ? [
                    'id' => $selected->id,
                    'title' => $selected->title ?? 'Untitled chat',
                    'messages' => $selected->messages,
                ]
                : null,
        ]);
    }
}