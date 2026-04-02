<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chats = Chat::all();

        foreach ($chats as $chat) {
            $messageCount = fake()->numberBetween(4, 12);

            for ($i = 1; $i <= $messageCount; $i++) {
                $isUser = $i % 2 !== 0;
                $dateTime = fake()->dateTimeBetween('-30 days', 'now');

                Message::factory()
                    ->forChat($chat)
                    ->sequenceNumber($i)
                    ->state([
                        'role' => $isUser ? 'user' : 'assistant',
                        'content' => $isUser
                            ? fake()->sentence(fake()->numberBetween(4, 12))
                            : fake()->paragraphs(fake()->numberBetween(1, 2), true),
                        'model' => $isUser ? null : 'gemini',
                        'created_at' => $dateTime,
                    ])
                    ->create();
            }
        }
    }
}