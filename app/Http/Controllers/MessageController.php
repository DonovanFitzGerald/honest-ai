<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Services\AssistantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function store(Request $request, Chat $chat, AssistantService $assistantService)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $userMessage = DB::transaction(function () use ($chat, $validated) {
            $nextSequence = (Message::where('chat_id', $chat->id)
                ->lockForUpdate()
                ->max('sequence') ?? 0) + 1;

            return Message::create([
                'chat_id' => $chat->id,
                'role' => 'user',
                'content' => $validated['content'],
                'sequence' => $nextSequence,
            ]);
        });

        $assistantReply = $assistantService->call($chat);

        $assistantText = data_get($assistantReply, 'candidates.0.content.parts.0.text');
        $assistantModel = data_get($assistantReply, 'modelVersion');

        if (!is_string($assistantText) || trim($assistantText) === '') {
            $assistantText = 'No response returned.';
        }

        $assistantMessage = DB::transaction(function () use ($chat, $assistantText, $assistantModel, $assistantReply) {
            $nextSequence = (Message::where('chat_id', $chat->id)
                ->lockForUpdate()
                ->max('sequence') ?? 0) + 1;

            return Message::create([
                'chat_id' => $chat->id,
                'role' => 'assistant',
                // 'input_tokens' => 
                'content' => $assistantText,
                'raw_json' => $assistantReply,
                'sequence' => $nextSequence,
                'model' => $assistantModel,
            ]);
        });

        return response()->json([
            'userMessage' => $userMessage,
            'assistantMessage' => $assistantMessage,
        ]);
    }
}