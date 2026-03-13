<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\AiController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\MessageController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/chat/{chat}', [ChatController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('chat.show');

Route::post('/chat/{chat}/messages', [MessageController::class, 'store'])
    ->name('chat.messages.store');

require __DIR__ . '/settings.php';