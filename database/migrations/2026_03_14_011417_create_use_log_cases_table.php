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
            $table->foreignIdFor(UseLog::class, 'use_log_id')->constrained()->cascadeOnDelete();
            $table->string('use_case_label', 100);
            $table->text('evidence');
            $table->string('ai_role', 50);
            $table->enum('confidence', ['High', 'Medium', 'Low'])->default('Medium');
            $table->timestamps();
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