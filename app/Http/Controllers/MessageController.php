<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request, Chat $chat)
    {
        $request->validate([
            'content' => ['required', 'string'],
        ]);

        DB::transaction(function () use ($chat, $request) {
            $nextSequence = (Message::where('chat_id', $chat->id)
                ->lockForUpdate()
                ->max('sequence') ?? 0) + 1;

            $userMessage = Message::create([
                'chat_id' => $chat->id,
                'role' => 'user',
                'content' => $request->content,
                'sequence' => $nextSequence,
            ]);

            $assistantReply = $this->fakeAssistantReply($request->content);

            Message::create([
                'chat_id' => $chat->id,
                'role' => 'assistant',
                'content' => $assistantReply,
                'sequence' => $nextSequence + 1,
                'parent_message_id' => $userMessage->id, // only if you kept this column
            ]);
        });

        return redirect()->route('chats.show', $chat);
    }

    protected function fakeAssistantReply(string $content): string
    {
        return "You said: {$content}";
    }


    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        //
    }
}