<?php

namespace App\Services;

use App\Models\Chat;
use App\Support\AssistantModelRegistry;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AssistantService
{
    public function __construct(
        private readonly AssistantModelRegistry $models,
    ) {
    }

    public function call(
        Chat $chat,
        ?string $requestedModelKey = null,
        array $requestedTools = [],
        ?string $thinkingLevel = null,
    ): array {
        $contents = $this->buildContentsFromChat($chat, includeAssistant: true);
        $apiKey = config('services.google.api_key');
        $modelKey = $this->resolveModelKey($chat, $requestedModelKey);

        if (!is_string($apiKey) || trim($apiKey) === '') {
            throw new RuntimeException('Google API key is not configured for assistant requests.');
        }

        $url = $this->buildGenerateContentUrl($modelKey);
        $payload = $this->buildChatPayload(
            $modelKey,
            $contents,
            $requestedTools,
            $thinkingLevel,
        );

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-goog-api-key' => $apiKey,
        ])->post($url, $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                'Assistant request failed with status '
                . $response->status()
                . ': '
                . $response->body()
            );
        }

        $body = $response->json();

        if (!is_array($body)) {
            throw new RuntimeException('Assistant response was not valid JSON.');
        }

        return $body;
    }

    public function createUseLog(Chat $chat, ?string $requestedModelKey = null): array
    {
        $promptPath = resource_path('prompts/AI_LOG_FORMATTER.md');
        $schemaPath = resource_path('prompts/AI_LOG_SCHEMA.json');
        $apiKey = config('services.google.api_key');
        $modelKey = $this->resolveModelKey($chat, $requestedModelKey);

        if (!is_string($apiKey) || trim($apiKey) === '') {
            throw new RuntimeException('Google API key is not configured for use-log requests.');
        }

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

        $url = $this->buildGenerateContentUrl($modelKey);

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
            'x-goog-api-key' => $apiKey,
        ])->post($url, $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                'Use log request failed with status '
                . $response->status()
                . ': '
                . $response->body()
            );
        }

        $body = $response->json();

        if (!is_array($body)) {
            throw new RuntimeException('Use log response was not valid JSON.');
        }

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

    private function resolveModelKey(Chat $chat, ?string $requestedModelKey = null): string
    {
        if (is_string($requestedModelKey) && $requestedModelKey !== '') {
            $modelKey = $this->models->resolveKey($requestedModelKey);

            if (is_string($modelKey) && $modelKey !== '') {
                return $modelKey;
            }
        }

        $latestAssistantModel = $chat->messages()
            ->where('role', 'assistant')
            ->whereNotNull('model')
            ->orderByDesc('sequence')
            ->value('model');

        $modelKey = $this->models->resolveKey($latestAssistantModel);

        if (!is_string($modelKey) || $modelKey === '') {
            throw new RuntimeException('No active assistant model is configured.');
        }

        return $modelKey;
    }

    private function buildGenerateContentUrl(string $modelKey): string
    {
        return "https://generativelanguage.googleapis.com/v1beta/models/{$modelKey}:generateContent";
    }

    private function buildChatPayload(
        string $modelKey,
        array $contents,
        array $requestedTools = [],
        ?string $thinkingLevel = null,
    ): array {
        $payload = [
            'contents' => $contents,
        ];

        $tools = $this->buildToolsPayload($requestedTools);

        if ($tools !== []) {
            $payload['tools'] = $tools;
        }

        $thinkingConfig = $this->buildThinkingConfig($modelKey, $thinkingLevel);

        if ($thinkingConfig !== []) {
            $payload['generationConfig'] = [
                'thinkingConfig' => $thinkingConfig,
            ];
        }

        return $payload;
    }

    private function buildThinkingConfig(
        string $modelKey,
        ?string $thinkingLevel = null,
    ): array {
        $normalizedThinkingLevel = is_string($thinkingLevel)
            ? strtolower(trim($thinkingLevel))
            : null;

        if (
            !is_string($normalizedThinkingLevel) ||
            $normalizedThinkingLevel === '' ||
            $normalizedThinkingLevel === 'default'
        ) {
            return [];
        }

        if (str_starts_with($modelKey, 'gemini-3')) {
            return [
                'thinkingLevel' => $normalizedThinkingLevel,
            ];
        }

        return [];
    }

    private function buildToolsPayload(array $requestedTools): array
    {
        $enabledTools = array_values(array_unique(array_filter(
            $requestedTools,
            fn($tool): bool => is_string($tool),
        )));

        return array_map(
            fn(string $tool): array => $this->buildToolPayload($tool),
            $enabledTools,
        );
    }

    private function buildToolPayload(string $tool): array
    {
        return match ($tool) {
            'google_search' => ['googleSearch' => new \stdClass],
            'url_context' => ['urlContext' => new \stdClass],
            'code_execution' => ['codeExecution' => new \stdClass],
            default => [],
        };
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
