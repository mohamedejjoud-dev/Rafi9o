<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GenerateRoadmapRequest;
use App\Http\Requests\UpdateTaskProgressRequest;
use App\Http\Resources\RoadmapResource;
use App\Http\Resources\RoadmapTaskResource;
use App\Models\AssessmentAttempt;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\ProgressTracking;
use App\Models\Roadmap;
use App\Models\RoadmapTask;
use App\Services\CareerAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RoadmapController extends BaseApiController
{
    public function __construct(
        protected CareerAssessmentService $assessmentService
    ) {}

    /**
     * List all roadmaps belonging to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $roadmaps = Roadmap::where('user_id', $request->user()->id)
            ->with(['careerPath', 'tasks.progressTrackings'])
            ->latest()
            ->get();

        return $this->success(
            RoadmapResource::collection($roadmaps),
            'Roadmaps retrieved successfully.'
        );
    }

    /**
     * View a specific roadmap with its tasks and progress.
     */
    public function show(Roadmap $roadmap): JsonResponse
    {
        Gate::authorize('view', $roadmap);

        $roadmap->load(['careerPath', 'tasks.progressTrackings']);

        return $this->success(
            new RoadmapResource($roadmap),
            'Roadmap details retrieved successfully.'
        );
    }

    /**
     * View detailed progress metrics and weekly milestones for a roadmap.
     */
    public function progress(Roadmap $roadmap): JsonResponse
    {
        Gate::authorize('view', $roadmap);

        $roadmap->load(['careerPath', 'tasks.progressTrackings']);
        $tasks = $roadmap->tasks;
        $totalTasks = $tasks->count();
        $userId = auth()->id();

        $completedCount = 0;
        $inProgressCount = 0;
        $pendingCount = 0;
        $totalEstimatedHours = 0;
        $totalTimeSpentMinutes = 0;
        $stagesMap = [];
        $nextTask = null;
        $lastActivityAt = null;

        foreach ($tasks as $task) {
            $totalEstimatedHours += (int) $task->estimated_hours;
            $prog = $task->progressTrackings ? $task->progressTrackings->firstWhere('user_id', $userId) : null;
            $status = $prog?->status ?? 'pending';

            if ($status === 'completed') {
                $completedCount++;
            } elseif ($status === 'in_progress') {
                $inProgressCount++;
            } else {
                $pendingCount++;
            }

            if ($prog) {
                $totalTimeSpentMinutes += (int) $prog->time_spent_minutes;
                if ($prog->completed_at && (! $lastActivityAt || $prog->completed_at > $lastActivityAt)) {
                    $lastActivityAt = $prog->completed_at;
                }
                if ($prog->updated_at && (! $lastActivityAt || $prog->updated_at > $lastActivityAt)) {
                    $lastActivityAt = $prog->updated_at;
                }
            }

            if (! $nextTask && $status !== 'completed') {
                $nextTask = $task;
            }

            $stageName = $task->stage ?: 'General';
            if (! isset($stagesMap[$stageName])) {
                $stagesMap[$stageName] = [
                    'stage' => $stageName,
                    'total_tasks' => 0,
                    'completed_tasks' => 0,
                    'completion_percentage' => 0,
                    'status' => 'pending',
                ];
            }
            $stagesMap[$stageName]['total_tasks']++;
            if ($status === 'completed') {
                $stagesMap[$stageName]['completed_tasks']++;
            }
        }

        foreach ($stagesMap as &$st) {
            $pct = $st['total_tasks'] > 0 ? round(($st['completed_tasks'] / $st['total_tasks']) * 100, 1) : 0;
            $st['completion_percentage'] = $pct;
            $st['status'] = $pct >= 100 ? 'completed' : ($pct > 0 ? 'in_progress' : 'pending');
        }
        unset($st);

        $completionPercentage = $totalTasks > 0 ? round(($completedCount / $totalTasks) * 100, 1) : 0;

        return $this->success([
            'roadmap_id' => $roadmap->id,
            'title' => $roadmap->title,
            'duration_weeks' => $roadmap->duration_weeks,
            'duration_days' => $roadmap->metadata['duration_days'] ?? ($roadmap->duration_weeks * 7),
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedCount,
            'in_progress_tasks' => $inProgressCount,
            'pending_tasks' => $pendingCount,
            'completion_percentage' => $completionPercentage,
            'total_estimated_hours' => $totalEstimatedHours,
            'total_time_spent_minutes' => $totalTimeSpentMinutes,
            'milestones' => array_values($stagesMap),
            'next_task' => $nextTask ? new RoadmapTaskResource($nextTask) : null,
            'last_activity_at' => $lastActivityAt?->toISOString(),
        ], 'Roadmap progress retrieved successfully.');
    }

    /**
     * Generate or re-generate an AI-personalized 30-day development roadmap.
     */
    public function generate(GenerateRoadmapRequest $request): JsonResponse
    {
        $user = $request->user();

        // Enforce verified Premium subscription access
        if (! $user->isPremium()) {
            return $this->forbidden('Generating a 30-day transformation roadmap requires an active Premium subscription. Upgrade to Premium (19 DH) to unlock your personalized curriculum.');
        }

        $careerPath = CareerPath::findOrFail($request->validated('career_path_id'));

        // Validate ownership of assessment attempt if provided
        if ($attemptId = $request->validated('assessment_attempt_id')) {
            $attempt = AssessmentAttempt::findOrFail($attemptId);
            if ($attempt->user_id !== $user->id && $user->role !== 'admin') {
                return $this->forbidden('You are not authorized to use this assessment attempt.');
            }
        }

        // Validate ownership of orientation result if provided
        if ($resultId = $request->validated('orientation_result_id')) {
            $result = OrientationResult::findOrFail($resultId);
            if ($result->user_id !== $user->id && $user->role !== 'admin') {
                return $this->forbidden('You are not authorized to use this orientation result.');
            }
        }

        // If reuse_existing requested and active roadmap exists
        if ($request->boolean('reuse_existing', false)) {
            $existing = Roadmap::where('user_id', $user->id)
                ->where('career_path_id', $careerPath->id)
                ->where('status', 'active')
                ->with(['careerPath', 'tasks.progressTrackings'])
                ->first();

            if ($existing && $existing->tasks->isNotEmpty()) {
                return $this->success(
                    new RoadmapResource($existing),
                    'Existing roadmap retrieved.'
                );
            }
        }

        $options = [
            'career_goals' => $request->validated('career_goals'),
            'focus_areas' => $request->validated('focus_areas', []),
            'target_hours_per_week' => $request->validated('target_hours_per_week', 10),
            'duration_days' => $request->validated('duration_days', 30),
            'force_regenerate' => $request->boolean('force_regenerate', false),
            'assessment_attempt_id' => $request->validated('assessment_attempt_id'),
            'orientation_result_id' => $request->validated('orientation_result_id'),
        ];

        $roadmap = $this->assessmentService->createPersonalizedRoadmap($user, $careerPath, $options);

        return $this->created(
            new RoadmapResource($roadmap),
            'Personalized roadmap generated successfully.'
        );
    }

    /**
     * Update progress status or notes for a roadmap task.
     */
    public function updateTaskProgress(UpdateTaskProgressRequest $request, RoadmapTask $task): JsonResponse
    {
        $task->loadMissing('roadmap');
        Gate::authorize('update', $task);

        $validated = $request->validated();
        $status = $validated['status'];

        $startedAt = match ($status) {
            'pending' => null,
            default => now(),
        };

        $completedAt = match ($status) {
            'completed' => now(),
            default => null,
        };

        $progress = ProgressTracking::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'roadmap_task_id' => $task->id,
            ],
            [
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
                'time_spent_minutes' => $validated['time_spent_minutes'] ?? 0,
                'started_at' => $startedAt,
                'completed_at' => $completedAt,
            ]
        );

        return $this->success([
            'task_id' => $task->id,
            'status' => $progress->status,
            'is_completed' => $progress->status === 'completed',
            'completed_at' => $progress->completed_at?->toISOString(),
            'notes' => $progress->notes,
            'time_spent_minutes' => $progress->time_spent_minutes,
        ], 'Task progress updated successfully.');
    }

    /**
     * Mark a roadmap task as completed.
     */
    public function markTaskComplete(Request $request, RoadmapTask $task): JsonResponse
    {
        $task->loadMissing('roadmap');
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'time_spent_minutes' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ]);

        $progress = ProgressTracking::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'roadmap_task_id' => $task->id,
            ],
            [
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
                'time_spent_minutes' => $validated['time_spent_minutes'] ?? 0,
                'started_at' => now(),
                'completed_at' => now(),
            ]
        );

        return $this->success([
            'task_id' => $task->id,
            'status' => 'completed',
            'is_completed' => true,
            'completed_at' => $progress->completed_at?->toISOString(),
            'notes' => $progress->notes,
            'time_spent_minutes' => $progress->time_spent_minutes,
        ], 'Task marked as completed.');
    }

    /**
     * Mark a roadmap task as incomplete (pending).
     */
    public function markTaskIncomplete(Request $request, RoadmapTask $task): JsonResponse
    {
        $task->loadMissing('roadmap');
        Gate::authorize('update', $task);

        $progress = ProgressTracking::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'roadmap_task_id' => $task->id,
            ],
            [
                'status' => 'pending',
                'completed_at' => null,
            ]
        );

        return $this->success([
            'task_id' => $task->id,
            'status' => 'pending',
            'is_completed' => false,
            'completed_at' => null,
            'notes' => $progress->notes,
            'time_spent_minutes' => $progress->time_spent_minutes,
        ], 'Task marked as incomplete.');
    }

    /**
     * Toggle a roadmap task between completed and incomplete.
     */
    public function toggleTaskStatus(Request $request, RoadmapTask $task): JsonResponse
    {
        $task->loadMissing('roadmap');
        Gate::authorize('update', $task);

        $progress = ProgressTracking::firstOrNew([
            'user_id' => $request->user()->id,
            'roadmap_task_id' => $task->id,
        ]);

        $newStatus = ($progress->status === 'completed') ? 'pending' : 'completed';
        $progress->status = $newStatus;
        $progress->completed_at = ($newStatus === 'completed') ? now() : null;
        if ($newStatus === 'completed' && ! $progress->started_at) {
            $progress->started_at = now();
        }
        $progress->save();

        return $this->success([
            'task_id' => $task->id,
            'status' => $progress->status,
            'is_completed' => $progress->status === 'completed',
            'completed_at' => $progress->completed_at?->toISOString(),
            'notes' => $progress->notes,
            'time_spent_minutes' => $progress->time_spent_minutes,
        ], 'Task status toggled to '.$newStatus.'.');
    }
}
