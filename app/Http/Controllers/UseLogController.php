<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\UseLog;
use App\Services\AssistantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UseLogController extends Controller
{
    public function store(Request $request, Chat $chat, AssistantService $assistantService)
    {
        $assistantReply = $assistantService->createUseLog($chat);

        $rawText = $this->parseAssitantResponse($assistantReply);

        $total = $this->parseTotalUseCases($rawText);

        $chatSnapshot = $chat->messages()
            ->orderBy('sequence')
            ->get(['role', 'content', 'sequence'])
            ->map(fn($m) => "{$m->sequence}. {$m->role}: {$m->content}")
            ->implode("\n");

        $useLog = DB::transaction(function () use ($chat, $rawText, $total, $chatSnapshot) {
            return UseLog::create([
                'chat_id' => $chat->id,
                'total_use_cases' => $total,
                'raw_output' => $rawText,
                'chat_snapshot' => $chatSnapshot,
            ]);
        });

        return response()->json([
            'useLog' => $useLog,
            'raw' => $assistantReply,
        ]);
    }

    private function parseAssitantResponse($assistantReply)
    {
        $rawParts = data_get($assistantReply, 'candidates.0.content.parts', []);
        $textParts = array_column($rawParts, 'text');
        $jointResponses = implode('', $textParts);
        $cleanedResponses = str_replace(["\n", "\r"], '', $jointResponses);

        return $cleanedResponses;
    }

    private function parseSummary(string $raw): string
    {
        if (preg_match('/SUMMARY:\s*(\d+)/i', $raw, $matches)) {
            return (int) $matches[1];
        }
    }
    private function parseTotalUseCases(string $raw): int
    {
        if (preg_match('/TOTAL_USE_CASES:\s*(\d+)/i', $raw, $matches)) {
            return (int) $matches[1];
        }

        preg_match_all('/^\s*\d+\.\s*USE_CASE:/mi', $raw, $matches);
        return count($matches[0] ?? []);
    }
}