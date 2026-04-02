<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function store(Request $request)
    {
        $chat = Chat::create([
            'title' => 'New chat',
        ]);

        return redirect()->route('chats.show', $chat)->setStatusCode(303);
    }

    public function show(Chat $chat)
    {
        return inertia('chat', [
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

    public function update(Request $request, Chat $chat)
    {
        $chat->update([
            'title' => $request->title,
        ]);

        return redirect()->route('chats.show', $chat)->setStatusCode(303);
    }

    public function destroy(Chat $chat)
    {
        $chat->delete();
    }
}