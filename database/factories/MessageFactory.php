<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        $role = fake()->randomElement(['user', 'assistant']);
        $content = $role === 'user'
            ? fake()->sentence(fake()->numberBetween(4, 30))
            : fake()->paragraphs(fake()->numberBetween(1, 30), true);
        $tokens = $content ? str_word_count($content) * 5 : 0;

        return [
            'chat_id' => Chat::factory(),
            'role' => $role,
            'content' => $content,
            'sequence' => fake()->numberBetween(1, 1000),
            'tokens' => $tokens,
            'model' => $role === 'assistant'
                ? fake()->randomElement(['gemini'])
                : null,
        ];
    }

    public function user(): static
    {
        $content = fake()->sentence(fake()->numberBetween(4, 30));
        $tokens = $content ? str_word_count($content) * 5 : 0;

        return $this->state(fn() => [
            'role' => 'user',
            'content' => $content,
            'tokens' => $tokens,
            'model' => null,
        ]);
    }

    public function assistant(): static
    {
        $content = fake()->paragraphs(fake()->numberBetween(1, 30), true);
        $tokens = $content ? str_word_count($content) * 5 : 0;

        return $this->state(fn() => [
            'role' => 'assistant',
            'content' => $content,
            'tokens' => $tokens,
            'model' => fake()->randomElement(['gemini']),
        ]);
    }

    public function forChat(Chat $chat): static
    {
        return $this->state(fn() => [
            'chat_id' => $chat->id,
        ]);
    }

    public function sequenceNumber(int $sequence): static
    {
        return $this->state(fn() => [
            'sequence' => $sequence,
        ]);
    }
}