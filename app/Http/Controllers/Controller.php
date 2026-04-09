<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function redirectIfChatIsInaccessible(
        Request $request,
        Chat $chat,
    ): JsonResponse|RedirectResponse|null {
        $user = $request->user();

        if ($user && $chat->user_id === $user->id) {
            return null;
        }

        $message = 'You do not have access to this chat.';
        $dashboardUrl = route('dashboard');

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'errors' => [
                    'chat' => [$message],
                ],
                'redirect' => $dashboardUrl,
            ], 403);
        }

        return redirect()->route('dashboard')->setStatusCode(303);
    }
}
