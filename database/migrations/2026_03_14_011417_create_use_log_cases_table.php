<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\UseLog;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('use_log_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('use_log_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->string('label', 99);
            $table->text('evidence');
            $table->json('input_type');
            $table->json('output_type');
            $table->string('ai_role', 50);
            $table->string('confidence', 10);
            $table->timestamps();
            $table->index(['use_log_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('use_log_cases');
    }
};