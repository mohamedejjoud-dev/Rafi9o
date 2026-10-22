<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSubscriptionController extends BaseApiController
{
    /**
     * Activate Premium subscription for a verified user (Admin only).
     */
    public function activate(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbidden('Only administrators can verify and activate Premium subscriptions.');
        }

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
            'duration_months' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:120'],
        ]);

        $durationMonths = $validated['duration_months'] ?? null;
        $expiresAt = $durationMonths ? now()->addMonths($durationMonths) : null;

        $user->forceFill([
            'subscription_status' => 'premium',
            'premium_activated_at' => now(),
            'premium_expires_at' => $expiresAt,
            'subscription_notes' => $validated['notes'] ?? 'Manual payment verified via WhatsApp (19 DH)',
        ])->save();

        return $this->success(
            new UserResource($user),
            'Premium subscription activated successfully for '.$user->name.'.'
        );
    }

    /**
     * Deactivate Premium subscription for a user (Admin only).
     */
    public function deactivate(Request $request, User $user): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbidden('Only administrators can manage Premium subscriptions.');
        }

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $user->forceFill([
            'subscription_status' => 'free',
            'premium_activated_at' => null,
            'premium_expires_at' => null,
            'subscription_notes' => $validated['notes'] ?? 'Deactivated by administrator',
        ])->save();

        return $this->success(
            new UserResource($user),
            'Subscription downgraded to Free for '.$user->name.'.'
        );
    }

    /**
     * List subscribers and their status (Admin only).
     */
    public function index(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbidden('Access restricted to administrators.');
        }

        $users = User::query()
            ->when($request->query('status'), fn ($q, $status) => $q->where('subscription_status', $status))
            ->latest()
            ->paginate(20);

        return $this->success([
            'items' => UserResource::collection($users->items()),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ], 'Subscribers retrieved successfully.');
    }
}
