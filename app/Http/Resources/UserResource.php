<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profile = $this->relationLoaded('profile') ? $this->profile : $this->profile;

        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'city' => $profile?->location ?? 'Casablanca',
            'bacStream' => $profile?->field_of_study ?? 'sciences-math',
            'language' => $profile?->preferred_language ?? 'fr',
            'onboardingCompleted' => true,
            'createdAt' => $this->created_at?->toISOString(),
            'subscription_status' => $this->subscription_status ?? 'free',
            'is_premium' => $this->isPremium(),
            'premium_activated_at' => $this->premium_activated_at?->toISOString(),
            'premium_expires_at' => $this->premium_expires_at?->toISOString(),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'profile' => new ProfileResource($this->whenLoaded('profile')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
