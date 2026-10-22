<?php

namespace App\Http\Controllers\Api;

use App\Services\OpenRouterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentChatController extends BaseApiController
{
    public function __construct(
        protected OpenRouterService $aiService
    ) {}

    /**
     * Handle student chat message with Rafi AI Agent.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['sometimes', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,assistant,rafi'],
            'history.*.content' => ['required_with:history', 'string', 'max:2000'],
            'profile' => ['sometimes', 'array'],
        ]);

        $message = $validated['message'];
        $history = $validated['history'] ?? [];
        $profile = $validated['profile'] ?? [];

        // If user is authenticated, supplement profile data from DB
        if ($request->user()) {
            $user = $request->user()->loadMissing('profile');
            $profile = array_merge([
                'name' => $user->name,
                'bacStream' => $user->profile?->field_of_study ?? ($profile['bacStream'] ?? null),
                'education_level' => $user->profile?->education_level ?? null,
            ], $profile);
        }

        $reply = $this->aiService->chatWithRafi($message, $history, $profile);

        return $this->success([
            'reply' => $reply,
            'role' => 'rafi',
        ], 'Message processed successfully.');
    }
}
