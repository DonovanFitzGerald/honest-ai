<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Services\AssistantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class MessageController extends Controller
{
    public function store(Request $request, Chat $chat, AssistantService $assistantService)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $requestId = $request->header('X-Request-Id', (string) Str::uuid());
        $context = [
            'request_id' => $requestId,
            'route' => $request->route()?->getName(),
            'chat_id' => $chat->id,
            'user_id' => $request->user()?->id,
            'message_length' => mb_strlen($validated['content']),
        ];

        $stage = 'persist_user_message';

        try {
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

            $stage = 'assistant_call';
            $assistantReply = $assistantService->call($chat);

            $stage = 'parse_assistant_response';
            $assistantText = data_get($assistantReply, 'candidates.0.content.parts.0.text');
            $assistantTokenCount = data_get($assistantReply, 'usageMetadata.totalTokenCount');
            $assistantModel = data_get($assistantReply, 'modelVersion');

            if (!is_string($assistantText) || trim($assistantText) === '') {
                $assistantText = 'No response returned.';
            }

            $stage = 'persist_assistant_message';
            $assistantMessage = DB::transaction(function () use ($chat, $assistantText, $assistantModel, $assistantReply, $assistantTokenCount) {
                $nextSequence = (Message::where('chat_id', $chat->id)
                    ->lockForUpdate()
                    ->max('sequence') ?? 0) + 1;

                return Message::create([
                    'chat_id' => $chat->id,
                    'role' => 'assistant',
                    'tokens' => $assistantTokenCount,
                    'content' => $assistantText,
                    'raw_json' => $assistantReply,
                    'sequence' => $nextSequence,
                    'model' => $assistantModel,
                ]);
            });

            return response()
                ->json([
                    'userMessage' => $userMessage,
                    'assistantMessage' => $assistantMessage,
                ])
                ->header('X-Request-Id', $requestId);
        } catch (Throwable $exception) {
            Log::error('Message send request failed.', [
                ...$context,
                'stage' => $stage,
                'exception_class' => $exception::class,
                'exception_message' => $exception->getMessage(),
                'exception' => $exception,
            ]);

            return response()
                ->json([
                    'message' => 'The server failed while sending your message.',
                    'errors' => [
                        'server' => [
                            "The request failed in the server stage \"{$stage}\".",
                        ],
                    ],
                    'request_id' => $requestId,
                ], 500)
                ->header('X-Request-Id', $requestId);
        }
    }
}
