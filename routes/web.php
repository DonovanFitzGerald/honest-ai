<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UseLogController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::post('/chats', [ChatController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('chats.store');

Route::get('/chats/{chat}', [ChatController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('chats.show');

Route::put('/chats/{chat}', [ChatController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('chats.update');

Route::delete('/chats/{chat}', [ChatController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('chats.destroy');

Route::post('/chats/{chat}/messages', [MessageController::class, 'store'])
    ->name('chats.messages.store');

Route::post('/chats/{chat}/use-logs', [UseLogController::class, 'store'])
    ->name('chats.use-logs.store');


require __DIR__ . '/settings.php';