<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoadmapResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tasks = $this->tasks ?? collect();
        $totalTasks = $tasks->count();

        $completedCount = 0;
        $userId = $request->user()?->id;

        $inProgressCount = 0;
        $pendingCount = 0;
        $stagesMap = [];

        foreach ($tasks as $task) {
            $prog = $task->progressTrackings ? $task->progressTrackings->firstWhere('user_id', $userId) : null;
            $status = $prog?->status ?? 'pending';

            if ($status === 'completed') {
                $completedCount++;
            } elseif ($status === 'in_progress') {
                $inProgressCount++;
            } else {
                $pendingCount++;
            }

            $stageName = $task->stage ?: 'General';
            if (! isset($stagesMap[$stageName])) {
                $stagesMap[$stageName] = [
                    'stage' => $stageName,
                    'total_tasks' => 0,
                    'completed_tasks' => 0,
                    'completion_percentage' => 0,
                ];
            }
            $stagesMap[$stageName]['total_tasks']++;
            if ($status === 'completed') {
                $stagesMap[$stageName]['completed_tasks']++;
            }
        }

        foreach ($stagesMap as &$st) {
            $st['completion_percentage'] = $st['total_tasks'] > 0
                ? round(($st['completed_tasks'] / $st['total_tasks']) * 100, 1)
                : 0;
        }
        unset($st);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'career_path_id' => $this->career_path_id,
            'career_path' => $this->whenLoaded('careerPath', function () {
                return [
                    'id' => $this->careerPath->id,
                    'title' => $this->careerPath->title,
                    'slug' => $this->careerPath->slug,
                    'industry' => $this->careerPath->industry,
                ];
            }),
            'title' => $this->title,
            'description' => $this->description,
            'duration_weeks' => $this->duration_weeks,
            'duration_days' => $this->metadata['duration_days'] ?? ($this->duration_weeks * 7),
            'difficulty_level' => $this->difficulty_level,
            'status' => $this->status,
            'progress' => [
                'completed_tasks' => $completedCount,
                'in_progress_tasks' => $inProgressCount,
                'pending_tasks' => $pendingCount,
                'total_tasks' => $totalTasks,
                'completion_percentage' => $totalTasks > 0 ? round(($completedCount / $totalTasks) * 100, 1) : 0,
            ],
            'milestones' => array_values($stagesMap),
            'metadata' => $this->metadata ?? [],
            'tasks' => RoadmapTaskResource::collection($this->whenLoaded('tasks')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
