<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoadmapTaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $userId = $request->user()?->id;
        $progress = $this->progressTrackings
            ? $this->progressTrackings->firstWhere('user_id', $userId)
            : null;

        return [
            'id' => $this->id,
            'roadmap_id' => $this->roadmap_id,
            'title' => $this->title,
            'description' => $this->description,
            'stage' => $this->stage,
            'order' => $this->order,
            'estimated_hours' => $this->estimated_hours,
            'skills_covered' => $this->skills_covered ?? [],
            'resource_links' => $this->resource_links ?? [],
            'progress' => [
                'status' => $progress?->status ?? 'pending',
                'started_at' => $progress?->started_at?->toISOString(),
                'completed_at' => $progress?->completed_at?->toISOString(),
                'notes' => $progress?->notes,
                'time_spent_minutes' => $progress?->time_spent_minutes ?? 0,
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
