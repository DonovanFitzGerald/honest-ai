<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Services\AssistantService;
use App\Support\AssistantModelRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class MessageController extends Controller
{
    public function store(
        Request $request,
        Chat $chat,
        AssistantService $assistantService,
        AssistantModelRegistry $models,
    ) {
        if ($response = $this->redirectIfChatIsInaccessible($request, $chat)) {
            return $response;
        }

        $requestedModel = $request->input('model');
        $effectiveModelKey = is_string($requestedModel) && $requestedModel !== ''
            ? $requestedModel
            : $chat->messages()
                ->where('role', 'assistant')
                ->whereNotNull('model')
                ->orderByDesc('sequence')
                ->value('model');
        $capabilities = $models->capabilitiesFor($effectiveModelKey);
        $allowedThinkingLevels = [
            'default',
            ...$capabilities['thinking_levels'],
        ];

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'model' => ['sometimes', 'nullable', 'string', Rule::in($models->activeKeys())],
            'tools' => ['sometimes', 'array'],
            'tools.*' => ['string', Rule::in($capabilities['built_in_tools'])],
            'thinking_level' => ['sometimes', 'nullable', 'string', Rule::in($allowedThinkingLevels)],
        ]);

        $requestId = $request->header('X-Request-Id', (string) Str::uuid());
        $context = [
            'request_id' => $requestId,
            'route' => $request->route()?->getName(),
            'chat_id' => $chat->id,
            'user_id' => $request->user()?->id,
            'requested_model' => $validated['model'] ?? null,
            'requested_thinking_level' => $validated['thinking_level'] ?? null,
            'requested_tools' => $validated['tools'] ?? [],
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
            $assistantReply = $assistantService->call(
                $chat,
                $validated['model'] ?? null,
                $validated['tools'] ?? [],
                $validated['thinking_level'] ?? null,
            );

            $stage = 'parse_assistant_response';
            $assistantText = collect(data_get($assistantReply, 'candidates.0.content.parts', []))
                ->pluck('text')
                ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                ->implode("\n\n");
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
