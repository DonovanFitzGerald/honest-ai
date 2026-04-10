<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function store(Request $request)
    {
        $chat = Chat::create([
            'user_id' => $request->user()->id,
            'title' => 'New chat',
        ]);

        return redirect()->route('chats.show', $chat)->setStatusCode(303);
    }

    public function show(Request $request, Chat $chat)
    {
        if ($response = $this->redirectIfChatIsInaccessible($request, $chat)) {
            return $response;
        }

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
        if ($response = $this->redirectIfChatIsInaccessible($request, $chat)) {
            return $response;
        }

        $chat->update([
            'title' => $request->title,
        ]);

        return redirect()->route('chats.show', $chat)->setStatusCode(303);
    }

    public function destroy(Request $request, Chat $chat)
    {
        if ($response = $this->redirectIfChatIsInaccessible($request, $chat)) {
            return $response;
        }

        if ($request->active_chat_id == $chat->id) {
            $chat->delete();

            return redirect()->route('dashboard')->setStatusCode(303);
        }

        $chat->delete();
    }
}