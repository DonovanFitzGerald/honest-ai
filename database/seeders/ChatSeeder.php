<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::all();
        foreach ($user as $u) {
            Chat::factory()->count(15)->create([
                'user_id' => $u->id,
            ]);
        }
    }
}