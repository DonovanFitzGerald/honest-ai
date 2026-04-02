<?php

namespace Tests\Feature\Controllers;

use App\Models\Chat;
use App\Models\User;
use App\Services\AssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_messages_and_returns_json()
    {
        $user = User::factory()->create();
        $chat = Chat::factory()->create();

        $this->mock(AssistantService::class, function (MockInterface $mock) {
            $mock->shouldReceive('call')->once()->andReturn([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Hello from Assistant'],
                            ],
                        ],
                    ],
                ],
                'modelVersion' => 'gemini-mock',
            ]);
        });

        $response = $this->actingAs($user)->postJson(route('chats.messages.store', $chat), [
            'content' => 'Hello from user',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'userMessage',
            'assistantMessage',
        ]);

        $response->assertJsonPath('userMessage.content', 'Hello from user');
        $response->assertJsonPath('assistantMessage.content', 'Hello from Assistant');

        $this->assertDatabaseHas('messages', [
            'chat_id' => $chat->id,
            'role' => 'user',
            'content' => 'Hello from user',
            'sequence' => 1,
        ]);

        $this->assertDatabaseHas('messages', [
            'chat_id' => $chat->id,
            'role' => 'assistant',
            'content' => 'Hello from Assistant',
            'sequence' => 2,
            'model' => 'gemini-mock',
        ]);
    }
}