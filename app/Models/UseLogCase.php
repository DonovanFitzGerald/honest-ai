<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UseLogCase extends Model
{
    /** @use HasFactory<\Database\Factories\UseLogCaseFactory> */
    use HasFactory;

    protected $fillable = [
        'use_log_id',
        'position',
        'label',
        'evidence',
        'input_type',
        'output_type',
        'assistant_role',
        'confidence',
    ];

    protected $casts = [
        'input_type' => 'array',
        'output_type' => 'array',
    ];

    public function useLog(): BelongsTo
    {
        return $this->belongsTo(UseLog::class);
    }
}