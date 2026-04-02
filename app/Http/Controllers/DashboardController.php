<?php

namespace App\Http\Controllers;

use App\Models\UseLogCase;
use App\Models\Message;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $cases = UseLogCase::query()
            ->get(['input_type', 'output_type', 'assistant_role'])
            ->map(fn($c) => [
                'input_type' => (array) $c->input_type,
                'output_type' => (array) $c->output_type,
                'assistant_role' => $c->assistant_role,
            ])
            ->values();

        $prompts = Message::query()
            ->where('role', 'user')
            ->orderBy('created_at')
            ->get(['created_at'])
            ->map(fn($m) => [
                'created_at' => optional($m->created_at)?->toISOString(),
            ])
            ->values();

        $assistantResponses = Message::query()
            ->where('role', 'assistant')
            ->orderBy('created_at')
            ->get(['created_at', 'tokens', 'model'])
            ->map(fn($m) => [
                'created_at' => optional($m->created_at)?->toISOString(),
                'tokens' => (int) ($m->tokens ?? 0),
                'model' => $m->model ?? 'unknown',
            ])
            ->values();

        return Inertia::render('dashboard', [
            'cases' => $cases,
            'prompts' => $prompts,
            'assistantResponses' => $assistantResponses,
        ]);
    }
}