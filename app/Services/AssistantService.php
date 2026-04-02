<?php

namespace App\Services;

use App\Models\Chat;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AssistantService
{
    public function call(Chat $chat): array
    {
        $contents = $this->buildContentsFromChat($chat, includeAssistant: true);

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-goog-api-key' => config('services.google.api_key'),
        ])->post($url, [
                    'contents' => $contents,
                ]);

        if ($response->failed()) {
            throw new RuntimeException('Assistant request failed: ' . $response->body());
        }

        return $response->json();
    }

    public function createUseLog(Chat $chat): array
    {
        $promptPath = resource_path('prompts/AI_LOG_FORMATTER.md');
        $schemaPath = resource_path('prompts/AI_LOG_SCHEMA.json');

        $systemPrompt = file_get_contents($promptPath);
        $schemaJson = file_get_contents($schemaPath);

        if (!is_string($systemPrompt) || trim($systemPrompt) === '') {
            throw new RuntimeException("AI log prompt file missing/empty: {$promptPath}");
        }

        if (!is_string($schemaJson) || trim($schemaJson) === '') {
            throw new RuntimeException("AI log schema file missing/empty: {$schemaPath}");
        }

        $schema = json_decode($schemaJson, true);

        if (!is_array($schema)) {
            throw new RuntimeException(
                "AI log schema is invalid JSON: {$schemaPath}. Error: " . json_last_error_msg()
            );
        }

        $contents = $this->buildContentsFromChat($chat, includeAssistant: true);

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

        $payload = [
            'system_instruction' => [
                'parts' => [
                    ['text' => $systemPrompt],
                ],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseJsonSchema' => $schema,
            ],
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-goog-api-key' => config('services.google.api_key'),
        ])->post($url, $payload);

        if ($response->failed()) {
            throw new RuntimeException('Use log request failed: ' . $response->body());
        }

        $body = $response->json();

        $text = data_get($body, 'candidates.0.content.parts.0.text');

        if (!is_string($text) || trim($text) === '') {
            $finishReason = data_get($body, 'candidates.0.finishReason', 'UNKNOWN');
            $blockReason = data_get($body, 'promptFeedback.blockReason');

            throw new RuntimeException(
                'Use log response contained no JSON text. '
                . 'finishReason=' . $finishReason
                . ($blockReason ? ', blockReason=' . $blockReason : '')
                . ', raw=' . json_encode($body, JSON_UNESCAPED_UNICODE)
            );
        }

        $parsed = json_decode($text, true);

        if (!is_array($parsed)) {
            throw new RuntimeException(
                'Use log JSON could not be decoded: ' . json_last_error_msg()
                . '. Raw text: ' . $text
            );
        }

        if (
            !array_key_exists('total_use_cases', $parsed) ||
            !array_key_exists('use_cases', $parsed) ||
            !array_key_exists('summary_statement', $parsed)
        ) {
            throw new RuntimeException(
                'Use log JSON missing required top-level keys. Parsed='
                . json_encode($parsed, JSON_UNESCAPED_UNICODE)
            );
        }

        if (!is_int($parsed['total_use_cases'])) {
            throw new RuntimeException('Use log JSON field "total_use_cases" must be an integer.');
        }

        if (!is_array($parsed['use_cases'])) {
            throw new RuntimeException('Use log JSON field "use_cases" must be an array.');
        }

        if (!is_string($parsed['summary_statement'])) {
            throw new RuntimeException('Use log JSON field "summary_statement" must be a string.');
        }

        return $parsed;
    }

    private function buildContentsFromChat(Chat $chat, bool $includeAssistant = true): array
    {
        $messages = $chat->messages()
            ->orderBy('sequence')
            ->get(['role', 'content']);

        $contents = [];

        foreach ($messages as $message) {
            if (!$includeAssistant && $message->role !== 'user') {
                continue;
            }

            $role = $message->role === 'assistant' ? 'model' : 'user';

            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $message->content],
                ],
            ];
        }

        return $contents;
    }
}