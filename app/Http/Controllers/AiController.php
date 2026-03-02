<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function callAi(Request $request)
    {
        $inputText = (string) $request->input('prompt', '');

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

        $response = Http::withHeaders([
            'Content-Type'   => 'application/json',
            'x-goog-api-key' => config('services.google.api_key'),
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $inputText],
                    ],
                ],
            ],
        ]);

        if ($response->failed()) {
            return response()->json([
                'error'   => 'Google AI request failed',
                'status'  => $response->status(),
                'details' => $response->json(),
                'resonse' => $response,
            ], 500);
        }

        $result = $response->json();

        $parts = data_get($result, 'candidates.0.content.parts', []);

        return response()->json([
            'raw'   => $result,
            'parts' => $parts,
        ]);
    }
}