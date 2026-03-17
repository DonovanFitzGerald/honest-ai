<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UseLog extends Model
{
    /** @use HasFactory<\Database\Factories\UseLogFactory> */
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'total_use_cases',
        'raw_output',
        'chat_snapshot'
    ];

    public function use_cases(): HasMany
    {
        return $this->hasMany(UseLogCase::class)->orderBy('position');
    }
}