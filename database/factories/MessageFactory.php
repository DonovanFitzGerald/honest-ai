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

        return [
            'chat_id' => Chat::factory(),
            'role' => $role,
            'content' => $role === 'user'
                ? fake()->sentence(fake()->numberBetween(4, 12))
                : fake()->paragraphs(fake()->numberBetween(1, 3), true),
            'sequence' => fake()->numberBetween(1, 1000),
            'model' => $role === 'assistant'
                ? fake()->randomElement(['gemini'])
                : null,
        ];
    }

    public function user(): static
    {
        return $this->state(fn () => [
            'role' => 'user',
            'content' => fake()->sentence(fake()->numberBetween(4, 12)),
            'model' => null,
        ]);
    }

    public function assistant(): static
    {
        return $this->state(fn () => [
            'role' => 'assistant',
            'content' => fake()->paragraphs(fake()->numberBetween(1, 3), true),
            'model' => fake()->randomElement(['gemini']),
        ]);
    }

    public function forChat(Chat $chat): static
    {
        return $this->state(fn () => [
            'chat_id' => $chat->id,
        ]);
    }

    public function sequenceNumber(int $sequence): static
    {
        return $this->state(fn () => [
            'sequence' => $sequence,
        ]);
    }
}