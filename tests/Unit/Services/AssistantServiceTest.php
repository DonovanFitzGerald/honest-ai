<?php

namespace Tests\Unit\Services;

use App\Models\Chat;
use App\Models\Message;
use App\Services\AssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;
use RuntimeException;
use Tests\TestCase;

class AssistantServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_call_retries_transient_chat_api_failures(): void
    {
        Sleep::fake();
        config()->set('services.google.api_key', 'test-key');

        $chat = Chat::factory()->create();

        Message::factory()
            ->forChat($chat)
            ->user()
            ->sequenceNumber(1)
            ->create(['content' => 'Hello']);

        Http::fakeSequence()
            ->push(['error' => ['message' => 'Try again']], 503)
            ->push([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Retried successfully'],
                            ],
                        ],
                    ],
                ],
            ], 200);

        $response = app(AssistantService::class)->call($chat, requestedModelKey: 'gemini-2.5-flash');

        $this->assertSame('Retried successfully', data_get($response, 'candidates.0.content.parts.0.text'));
        Http::assertSentCount(2);
        Sleep::assertSleptTimes(1);
    }

    public function test_call_does_not_retry_non_transient_chat_api_failures(): void
    {
        Sleep::fake();
        config()->set('services.google.api_key', 'test-key');

        $chat = Chat::factory()->create();

        Message::factory()
            ->forChat($chat)
            ->user()
            ->sequenceNumber(1)
            ->create(['content' => 'Hello']);

        Http::fake([
            '*' => Http::response(['error' => ['message' => 'Bad request']], 400),
        ]);

        try {
            app(AssistantService::class)->call($chat, requestedModelKey: 'gemini-2.5-flash');
            $this->fail('Expected AssistantService::call() to throw for a 400 response.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('Assistant request failed with status 400', $exception->getMessage());
        }

        Http::assertSentCount(1);
        Sleep::assertSleptTimes(0);
    }
}
