<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\UseLog;

class Chat extends Model
{
    /** @use HasFactory<\Database\Factories\ChatFactory> */
    use HasFactory;

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function useLogs()
    {
        return $this->hasMany(UseLog::class);
    }
}