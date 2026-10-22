<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'education_level' => $this->education_level,
            'field_of_study' => $this->field_of_study,
            'institution' => $this->institution,
            'graduation_year' => $this->graduation_year,
            'target_role' => $this->target_role,
            'skills' => $this->skills ?? [],
            'interests' => $this->interests ?? [],
            'location' => $this->location,
            'preferred_language' => $this->preferred_language,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
