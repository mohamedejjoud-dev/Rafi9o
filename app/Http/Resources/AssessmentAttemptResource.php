<?php

namespace App\Http\Resources;

use App\Models\AssessmentQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentAttemptResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalQuestions = AssessmentQuestion::active()->count();
        $answeredCount = $this->answers()->count();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'total_score' => $this->total_score !== null ? (float) $this->total_score : null,
            'progress' => [
                'answered_count' => $answeredCount,
                'total_questions' => $totalQuestions,
                'completion_percentage' => $totalQuestions > 0 ? round(($answeredCount / $totalQuestions) * 100, 1) : 0,
            ],
            'metadata' => $this->metadata ?? [],
            'answers' => AssessmentAnswerResource::collection($this->whenLoaded('answers')),
            'orientation_results' => OrientationResultResource::collection($this->whenLoaded('orientationResults')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
