<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UseLogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::post('/chats', [ChatController::class, 'store'])
        ->name('chats.store');

    Route::get('/chats/{chat}', [ChatController::class, 'show'])
        ->name('chats.show');

    Route::put('/chats/{chat}', [ChatController::class, 'update'])
        ->name('chats.update');

    Route::delete('/chats/{chat}', [ChatController::class, 'destroy'])
        ->name('chats.destroy');

    Route::post('/chats/{chat}/messages', [MessageController::class, 'store'])
        ->name('chats.messages.store');

    Route::post('/chats/{chat}/use-logs', [UseLogController::class, 'store'])
        ->name('chats.use-logs.store');
});

require __DIR__ . '/settings.php';