<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\AssessmentAttempt;
use App\Services\MoroccanOrientationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebClientController extends BaseApiController
{
    public function __construct(
        protected MoroccanOrientationService $orientationService
    ) {}

    /**
     * Retrieve the authenticated user profile.
     */
    public function getProfile(Request $request): JsonResponse
    {
        return $this->success(
            new UserResource($request->user()->load('profile')),
            'Profile retrieved successfully.'
        );
    }

    /**
     * Update the authenticated user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:150'],
            'bacStream' => ['sometimes', 'nullable', 'string', 'max:150'],
            'language' => ['sometimes', 'nullable', 'string', 'in:fr,ar,en'],
            'onboardingCompleted' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
            $user->save();
        }

        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        if (isset($validated['city'])) {
            $profile->location = $validated['city'];
        }
        if (isset($validated['bacStream'])) {
            $profile->field_of_study = $validated['bacStream'];
        }
        if (isset($validated['language'])) {
            $profile->preferred_language = $validated['language'];
        }
        $profile->save();

        return $this->success(
            new UserResource($user->fresh('profile')),
            'Profile updated successfully.'
        );
    }

    /**
     * Start or resume a basic assessment session.
     */
    public function startBasic(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempt = AssessmentAttempt::where('user_id', $user->id)
            ->latest()
            ->first();

        if (! $attempt) {
            $attempt = AssessmentAttempt::create([
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        $hasResult = isset($attempt->metadata['free_result']);

        return $this->success([
            'sessionId' => 'sess-basic-'.$attempt->id,
            'questions' => $this->orientationService->getBasicQuestions(),
            'completed' => $hasResult,
            'lastSubmittedAt' => $attempt->completed_at?->toISOString(),
        ], 'Basic assessment session started.');
    }

    /**
     * Submit basic assessment answers and generate free orientation recommendations.
     */
    public function submitBasic(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'sessionId' => ['required', 'string'],
            'answers' => ['required', 'array'],
        ]);

        $attempt = AssessmentAttempt::where('user_id', $user->id)
            ->latest()
            ->first();

        if (! $attempt) {
            $attempt = AssessmentAttempt::create([
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        $result = $this->orientationService->generateFreeResult($user, $validated['answers']);

        $metadata = $attempt->metadata ?? [];
        $metadata['basic_answers'] = $validated['answers'];
        $metadata['free_result'] = $result;

        $attempt->update([
            'status' => 'completed',
            'completed_at' => now(),
            'metadata' => $metadata,
        ]);

        return $this->success([
            'result' => $result,
        ], 'Basic assessment evaluated successfully.');
    }

    /**
     * Start or resume an advanced assessment session.
     */
    public function startAdvanced(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempt = AssessmentAttempt::where('user_id', $user->id)
            ->latest()
            ->first();

        if (! $attempt) {
            $attempt = AssessmentAttempt::create([
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        $hasResult = isset($attempt->metadata['premium_result']);

        return $this->success([
            'sessionId' => 'sess-advanced-'.$attempt->id,
            'questions' => $this->orientationService->getAdvancedQuestions(),
            'completed' => $hasResult,
            'lastSubmittedAt' => $attempt->completed_at?->toISOString(),
        ], 'Advanced assessment session started.');
    }

    /**
     * Submit advanced assessment answers and generate premium orientation recommendations.
     */
    public function submitAdvanced(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'sessionId' => ['required', 'string'],
            'answers' => ['required', 'array'],
        ]);

        $attempt = AssessmentAttempt::where('user_id', $user->id)
            ->latest()
            ->first();

        if (! $attempt) {
            $attempt = AssessmentAttempt::create([
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        $metadata = $attempt->metadata ?? [];
        $basicAnswers = $metadata['basic_answers'] ?? [];

        $result = $this->orientationService->generatePremiumResult($user, $basicAnswers, $validated['answers']);

        $metadata['advanced_answers'] = $validated['answers'];
        $metadata['premium_result'] = $result;

        $attempt->update([
            'status' => 'completed',
            'completed_at' => now(),
            'metadata' => $metadata,
        ]);

        return $this->success([
            'result' => $result,
        ], 'Advanced assessment evaluated successfully.');
    }

    /**
     * Retrieve the latest evaluated orientation result for the authenticated user.
     */
    public function latestResult(Request $request): JsonResponse
    {
        $attempt = AssessmentAttempt::where('user_id', $request->user()->id)
            ->latest()
            ->first();

        $metadata = $attempt?->metadata ?? [];
        $latest = $metadata['premium_result'] ?? $metadata['free_result'] ?? null;

        if (! $latest) {
            return $this->error('No orientation results found yet.', 404);
        }

        return $this->success(
            $latest,
            'Latest orientation result retrieved.'
        );
    }

    /**
     * Start a 3-day premium preview trial.
     */
    public function startTrial(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill([
            'subscription_status' => 'premium',
            'premium_activated_at' => now(),
            'premium_expires_at' => now()->addDays(3),
            'subscription_notes' => '3-day premium preview trial',
        ])->save();

        return $this->success(
            $this->orientationService->getTrialStatus($user),
            '3-day Premium preview activated successfully!'
        );
    }

    /**
     * Retrieve the user's trial and subscription status.
     */
    public function getTrialStatus(Request $request): JsonResponse
    {
        return $this->success(
            $this->orientationService->getTrialStatus($request->user()),
            'Trial status retrieved.'
        );
    }

    /**
     * Retrieve the user dashboard overview.
     */
    public function getDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $attempt = AssessmentAttempt::where('user_id', $user->id)
            ->latest()
            ->first();

        $metadata = $attempt?->metadata ?? [];
        $latest = $metadata['premium_result'] ?? $metadata['free_result'] ?? null;

        return $this->success(
            $this->orientationService->getDashboard($user, $latest),
            'Dashboard retrieved successfully.'
        );
    }

    /**
     * Update progress on a learning resource.
     */
    public function updateResourceProgress(Request $request, string $id): JsonResponse
    {
        $completed = $request->boolean('completed', true);

        return $this->success([
            'id' => $id,
            'completed' => $completed,
        ], 'Resource progress updated.');
    }

    /**
     * Update progress on a roadmap step.
     */
    public function updateRoadmapProgress(Request $request, string $id): JsonResponse
    {
        $completed = $request->boolean('completed', true);

        return $this->success([
            'id' => $id,
            'completed' => $completed,
        ], 'Roadmap step progress updated.');
    }
}
