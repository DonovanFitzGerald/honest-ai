<?php

namespace Tests\Feature\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\UseLog;
use App\Models\UseLogCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_authentication()
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect('/login');
    }

    public function test_dashboard_renders_inertia_view_with_chart_counts()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $chat = Chat::factory()->for($user)->create();
        $otherChat = Chat::factory()->for($otherUser)->create();

        $useLog = UseLog::factory()->create(['chat_id' => $chat->id]);
        $otherUseLog = UseLog::factory()->create(['chat_id' => $otherChat->id]);

        UseLogCase::factory()->create([
            'use_log_id' => $useLog->id,
            'input_type' => ['text'],
            'output_type' => ['text'],
            'assistant_role' => 'tutor',
        ]);
        UseLogCase::factory()->create([
            'use_log_id' => $otherUseLog->id,
            'input_type' => ['code'],
            'output_type' => ['plan'],
            'assistant_role' => 'reviewer',
        ]);

        Message::factory()->user()->create(['chat_id' => $chat->id]);
        Message::factory()->assistant()->create(['chat_id' => $chat->id]);
        Message::factory()->user()->create(['chat_id' => $otherChat->id]);
        Message::factory()->assistant()->create(['chat_id' => $otherChat->id]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('dashboard/index')
                ->has('cases', 1)
                ->has('prompts', 1)
                ->has('assistantResponses', 1)
        );
    }
}
