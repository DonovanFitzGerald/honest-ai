<?php

namespace Tests\Feature\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\UseLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_chat_and_redirects()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('chats.store'));

        $chat = Chat::first();

        $this->assertNotNull($chat);
        $this->assertEquals('New chat', $chat->title);
        $response->assertStatus(303);
        $response->assertRedirect(route('chats.show', $chat));
    }

    public function test_show_renders_inertia_view_with_chat_messages_and_use_log()
    {
        $user = User::factory()->create();
        $chat = Chat::factory()->create();

        Message::factory()->create(['chat_id' => $chat->id, 'sequence' => 1]);
        UseLog::factory()->create(['chat_id' => $chat->id]);

        $response = $this->actingAs($user)->get(route('chats.show', $chat));

        $response->assertOk();
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('chats/show')
                ->has('chat')
                ->has('messages', 1)
                ->has('useLog')
        );
    }

    public function test_destroy_deletes_chat()
    {
        $user = User::factory()->create();
        $chat = Chat::factory()->create();

        $response = $this->actingAs($user)->delete(route('chats.destroy', $chat));

        $this->assertDatabaseMissing('chats', ['id' => $chat->id]);
        $response->assertStatus(200);
    }
}