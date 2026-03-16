<?php

use App\Models\Chat;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('use_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Chat::class, 'chat_id')->constrained('chats')->cascadeOnDelete();
            $table->unsignedInteger('total_use_cases')->default(0);
            $table->longText('raw_output');
            $table->text('summary_statement')->nullable();
            $table->longText('chat_snapshot')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('use_logs');
    }
};