<?php

namespace App\Services;

use App\Models\Chat;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AssistantService
{
    public function call(Chat $chat): array
    {
        $messages = $chat->messages()
            ->orderBy('sequence')
            ->get(['role', 'content']);

        $contents = $messages
            ->map(function ($message) {
                return [
                    'role' => $message->role === 'assistant' ? 'model' : 'user',
                    'parts' => [
                        ['text' => $message->content],
                    ],
                ];
            })
            ->values()
            ->all();

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

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
}