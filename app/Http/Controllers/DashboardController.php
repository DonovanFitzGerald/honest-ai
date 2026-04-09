<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\UseLogCase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $cases = UseLogCase::query()
            ->whereHas('useLog.chat', fn ($query) => $query->ownedBy($user))
            ->get(['input_type', 'output_type', 'assistant_role'])
            ->map(fn($c) => [
                'input_type' => (array) $c->input_type,
                'output_type' => (array) $c->output_type,
                'assistant_role' => $c->assistant_role,
            ])
            ->values();

        $prompts = Message::query()
            ->whereHas('chat', fn ($query) => $query->ownedBy($user))
            ->where('role', 'user')
            ->orderBy('created_at')
            ->get(['created_at'])
            ->map(fn($m) => [
                'created_at' => optional($m->created_at)?->toISOString(),
            ])
            ->values();

        $assistantResponses = Message::query()
            ->whereHas('chat', fn ($query) => $query->ownedBy($user))
            ->where('role', 'assistant')
            ->orderBy('created_at')
            ->get(['created_at', 'tokens', 'model'])
            ->map(fn($m) => [
                'created_at' => optional($m->created_at)?->toISOString(),
                'tokens' => (int) ($m->tokens ?? 0),
                'model' => $m->model ?? 'unknown',
            ])
            ->values();

        return Inertia::render('dashboard/index', [
            'cases' => $cases,
            'prompts' => $prompts,
            'assistantResponses' => $assistantResponses,
        ]);
    }
}
