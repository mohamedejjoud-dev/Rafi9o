<?php

namespace App\Http\Resources;

use App\Models\Roadmap;
use App\Services\CareerAssessmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrientationResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $traitScores = $this->attempt?->metadata['trait_scores'] ?? [];
        $softSkills = $this->relationLoaded('careerPath') && $this->careerPath
            ? app(CareerAssessmentService::class)->getSoftSkillsPriorities($this->careerPath, $traitScores, $this->growth_areas ?? [])
            : [];

        $roadmap = $this->relationLoaded('user') && $this->user && $this->user->relationLoaded('roadmaps')
            ? $this->user->roadmaps->firstWhere('career_path_id', $this->career_path_id)
            : Roadmap::where('user_id', $this->user_id)
                ->where('career_path_id', $this->career_path_id)
                ->first();

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'assessment_attempt_id' => $this->assessment_attempt_id,
            'career_path_id' => $this->career_path_id,
            'career_path' => $this->whenLoaded('careerPath', function () {
                return [
                    'id' => $this->careerPath->id,
                    'title' => $this->careerPath->title,
                    'slug' => $this->careerPath->slug,
                    'summary' => $this->careerPath->summary,
                    'description' => $this->careerPath->description,
                    'industry' => $this->careerPath->industry,
                    'average_salary_range' => $this->careerPath->average_salary_range,
                    'growth_outlook' => $this->careerPath->growth_outlook,
                    'difficulty_level' => $this->careerPath->difficulty_level,
                    'required_skills' => $this->careerPath->required_skills ?? [],
                ];
            }),
            'match_percentage' => (float) $this->match_percentage,
            'ranking' => $this->ranking,
            'ai_analysis' => $this->ai_analysis,
            'strengths' => $this->strengths ?? [],
            'growth_areas' => $this->growth_areas ?? [],
            'recommendations' => $this->recommendations ?? [],
            'soft_skills_priorities' => $softSkills,
            'trait_scores' => $traitScores,
            'has_active_roadmap' => $roadmap !== null,
            'roadmap_id' => $roadmap?->id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
