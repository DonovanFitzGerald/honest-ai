<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\UseLog;
use App\Services\AssistantService;
use App\Support\AssistantModelRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UseLogController extends Controller
{
    public function store(
        Request $request,
        Chat $chat,
        AssistantService $assistantService,
        AssistantModelRegistry $models,
    )
    {
        if ($response = $this->redirectIfChatIsInaccessible($request, $chat)) {
            return $response;
        }

        $validated = $request->validate([
            'model' => ['sometimes', 'nullable', 'string', Rule::in($models->activeKeys())],
        ]);

        $useLogData = $assistantService->createUseLog($chat, $validated['model'] ?? null);

        $chatSnapshot = $chat->messages()
            ->orderBy('sequence')
            ->get(['role', 'content', 'sequence'])
            ->map(fn($message) => "{$message->sequence}. {$message->role}: {$message->content}")
            ->implode("\n");

        $useLog = DB::transaction(function () use ($chat, $useLogData, $chatSnapshot) {
            $useLog = UseLog::create([
                'chat_id' => $chat->id,
                'total_use_cases' => $useLogData['total_use_cases'],
                'summary_statement' => $useLogData['summary_statement'],
                'raw_output' => json_encode($useLogData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'chat_snapshot' => $chatSnapshot,
            ]);

            $useLog->use_cases()->createMany(
                collect($useLogData['use_cases'] ?? [])
                    ->values()
                    ->map(fn(array $useCase, int $index) => [
                        'position' => $index + 1,
                        'label' => $useCase['label'],
                        'evidence' => $useCase['evidence'],
                        'input_type' => $useCase['input_type'],
                        'output_type' => $useCase['output_type'],
                        'assistant_role' => $useCase['assistant_role'],
                        'confidence' => $useCase['confidence'],
                    ])
                    ->all()
            );

            return $useLog->load('use_cases');
        });

        return response()->json([
            'useLog' => $useLog,
            'parsed' => $useLogData,
        ]);
    }
}
