<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'role',
        'content',
        'raw_json',
        'tokens',
        'sequence',
        'model',
        'created_at',
    ];

    protected $casts = [
        'raw_json' => 'array',
    ];

}