<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Message;
use App\Support\AssistantModelRegistry;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chats = Chat::all();
        $assistantModels = app(AssistantModelRegistry::class)->options();

        foreach ($chats as $chat) {
            $messageCount = fake()->numberBetween(4, 50);
            $messageCount -= $messageCount % 2;
            $dateTime = CarbonImmutable::instance(
                fake()->dateTimeBetween('-14 days', 'now'),
            )->utc();
            $model = fake()->randomElement($assistantModels);
            $modelKey = $model['value'];


            for ($i = 1; $i <= $messageCount; $i++) {
                $isUser = $i % 2 !== 0;
                if ($isUser) {
                    Message::factory()
                        ->forChat($chat)
                        ->sequenceNumber($i)
                        ->user()
                        ->state([
                            'created_at' => $dateTime,
                            'updated_at' => $dateTime,
                        ])
                        ->create();
                }
                else {
                    Message::factory()
                        ->forChat($chat)
                        ->sequenceNumber($i)
                        ->assistant()
                        ->state([
                            'model' => $modelKey,
                            'created_at' => $dateTime,
                            'updated_at' => $dateTime,
                        ])
                        ->create();
                }

                $dateTime = $dateTime->addMinutes(
                    fake()->numberBetween(0, 20),
                );
            }
        }
    }
}