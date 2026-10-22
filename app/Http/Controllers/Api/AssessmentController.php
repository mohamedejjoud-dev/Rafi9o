<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SaveAnswerRequest;
use App\Http\Requests\SaveAnswersBatchRequest;
use App\Http\Resources\AssessmentAnswerResource;
use App\Http\Resources\AssessmentAttemptResource;
use App\Http\Resources\AssessmentQuestionResource;
use App\Http\Resources\OrientationResultResource;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\OrientationResult;
use App\Services\CareerAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class AssessmentController extends BaseApiController
{
    public function __construct(
        protected CareerAssessmentService $assessmentService
    ) {}

    /**
     * Retrieve all published, active assessment questions ordered by sequence.
     */
    public function questions(): JsonResponse
    {
        $questions = AssessmentQuestion::active()
            ->ordered()
            ->get();

        return $this->success(
            AssessmentQuestionResource::collection($questions),
            'Assessment questions retrieved successfully.'
        );
    }

    /**
     * Start a new assessment attempt or resume an existing in-progress attempt.
     */
    public function start(Request $request): JsonResponse
    {
        $user = $request->user();
        $forceNew = $request->boolean('force_new', false);

        // Check for existing in-progress attempt unless forced new
        if (! $forceNew) {
            $existing = AssessmentAttempt::where('user_id', $user->id)
                ->where('status', 'in_progress')
                ->latest()
                ->first();

            if ($existing) {
                $existing->load(['answers.question']);

                return $this->success(
                    new AssessmentAttemptResource($existing),
                    'Resumed existing in-progress assessment attempt.'
                );
            }
        }

        $attempt = DB::transaction(function () use ($user) {
            return AssessmentAttempt::create([
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
                'metadata' => [
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
            ]);
        });

        $attempt->load(['answers']);

        return $this->created(
            new AssessmentAttemptResource($attempt),
            'Assessment attempt started successfully.'
        );
    }

    /**
     * Retrieve the current user's active in-progress assessment attempt.
     */
    public function active(Request $request): JsonResponse
    {
        $attempt = AssessmentAttempt::where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->latest()
            ->with(['answers.question'])
            ->first();

        if (! $attempt) {
            return $this->error('No active assessment attempt found.', 404);
        }

        return $this->success(
            new AssessmentAttemptResource($attempt),
            'Active assessment attempt retrieved successfully.'
        );
    }

    /**
     * Retrieve a specific assessment attempt by ID (with authorization check).
     */
    public function show(AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('view', $attempt);

        $attempt->load(['answers.question', 'orientationResults.careerPath']);

        return $this->success(
            new AssessmentAttemptResource($attempt),
            'Assessment attempt retrieved successfully.'
        );
    }

    /**
     * Resume an unfinished assessment attempt.
     */
    public function resume(AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('view', $attempt);

        if ($attempt->status !== 'in_progress') {
            return $this->error('This assessment attempt is already '.$attempt->status.' and cannot be resumed.', 400);
        }

        $attempt->load(['answers.question']);

        return $this->success(
            new AssessmentAttemptResource($attempt),
            'Assessment attempt resumed successfully.'
        );
    }

    /**
     * Save or update a single answer for an in-progress attempt.
     */
    public function saveAnswer(SaveAnswerRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('update', $attempt);

        if ($attempt->status !== 'in_progress') {
            return $this->error('Cannot modify answers for an attempt that is already '.$attempt->status.'.', 400);
        }

        $question = AssessmentQuestion::findOrFail($request->validated('question_id'));
        $selectedOpt = $request->validated('selected_option');

        // Extract score from chosen option
        $optionData = collect($question->options ?? [])->firstWhere('value', $selectedOpt);
        $score = (float) ($optionData['score'] ?? 3.0);

        $answer = AssessmentAnswer::updateOrCreate(
            [
                'assessment_attempt_id' => $attempt->id,
                'assessment_question_id' => $question->id,
            ],
            [
                'selected_option' => $selectedOpt,
                'answer_text' => $request->validated('answer_text'),
                'score' => $score,
            ]
        );

        return $this->success(
            new AssessmentAnswerResource($answer),
            'Answer saved successfully.'
        );
    }

    /**
     * Save multiple answers in batch.
     */
    public function saveAnswersBatch(SaveAnswersBatchRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('update', $attempt);

        if ($attempt->status !== 'in_progress') {
            return $this->error('Cannot modify answers for an attempt that is already '.$attempt->status.'.', 400);
        }

        $answersData = $request->validated('answers');
        $questionIds = collect($answersData)->pluck('question_id')->unique();
        $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

        DB::transaction(function () use ($answersData, $questions, $attempt) {
            foreach ($answersData as $item) {
                $qId = $item['question_id'];
                $question = $questions->get($qId);
                if (! $question) {
                    continue;
                }

                $selectedOpt = $item['selected_option'];
                $optionData = collect($question->options ?? [])->firstWhere('value', $selectedOpt);
                $score = (float) ($optionData['score'] ?? 3.0);

                AssessmentAnswer::updateOrCreate(
                    [
                        'assessment_attempt_id' => $attempt->id,
                        'assessment_question_id' => $qId,
                    ],
                    [
                        'selected_option' => $selectedOpt,
                        'answer_text' => $item['answer_text'] ?? null,
                        'score' => $score,
                    ]
                );
            }
        });

        $attempt->load(['answers']);

        return $this->success(
            new AssessmentAttemptResource($attempt),
            count($answersData).' answers saved successfully.'
        );
    }

    /**
     * Submit and complete an assessment, calculating scoring and career recommendations.
     */
    public function submit(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('update', $attempt);

        if ($attempt->status === 'completed') {
            return $this->error('Assessment attempt has already been submitted and completed.', 400);
        }

        $answerCount = $attempt->answers()->count();
        if ($answerCount === 0) {
            return $this->error('Cannot submit an assessment attempt with 0 answered questions.', 422);
        }

        $completedAttempt = $this->assessmentService->completeAttempt($attempt);

        return $this->success(
            new AssessmentAttemptResource($completedAttempt),
            'Assessment submitted and evaluated successfully.'
        );
    }

    /**
     * List all past and active attempts for the authenticated user.
     */
    public function myAttempts(Request $request): JsonResponse
    {
        $attempts = AssessmentAttempt::where('user_id', $request->user()->id)
            ->latest()
            ->with(['orientationResults.careerPath'])
            ->paginate(15);

        return $this->success([
            'items' => AssessmentAttemptResource::collection($attempts->items()),
            'pagination' => [
                'current_page' => $attempts->currentPage(),
                'last_page' => $attempts->lastPage(),
                'per_page' => $attempts->perPage(),
                'total' => $attempts->total(),
            ],
        ], 'Assessment attempts retrieved successfully.');
    }

    /**
     * View detailed orientation result with soft-skills priorities and roadmap link.
     */
    public function showResult(Request $request, OrientationResult $result): JsonResponse
    {
        Gate::authorize('view', $result);

        $result->loadMissing(['careerPath', 'attempt', 'user']);

        return $this->success(
            new OrientationResultResource($result),
            'Detailed orientation result retrieved successfully.'
        );
    }

    /**
     * Retrieve soft-skills priorities for a specific orientation result.
     */
    public function softSkills(Request $request, OrientationResult $result): JsonResponse
    {
        Gate::authorize('view', $result);

        $result->loadMissing(['careerPath', 'attempt']);
        $traitScores = $result->attempt?->metadata['trait_scores'] ?? [];
        $priorities = $this->assessmentService->getSoftSkillsPriorities(
            $result->careerPath,
            $traitScores,
            $result->growth_areas ?? []
        );

        $isPremium = $request->user()->isPremium();
        if (! $isPremium) {
            $priorities = array_map(function ($p) {
                $p['daily_exercise'] = 'Unlock with Premium (19 DH) for complete actionable daily drills.';
                $p['actionable_steps'] = ['Upgrade to Premium (19 DH) to unlock verified coaching steps.'];
                $p['is_locked'] = true;

                return $p;
            }, $priorities);
        }

        return $this->success([
            'orientation_result_id' => $result->id,
            'career_path' => [
                'id' => $result->careerPath->id,
                'title' => $result->careerPath->title,
                'slug' => $result->careerPath->slug,
                'industry' => $result->careerPath->industry,
            ],
            'match_percentage' => (float) $result->match_percentage,
            'ranking' => $result->ranking,
            'is_premium_unlocked' => $isPremium,
            'soft_skills_priorities' => $priorities,
            'recommended_focus' => 'Focus on high-priority soft skills during Weeks 1 and 2 of your 30-day roadmap.',
        ], 'Soft-skills priorities retrieved successfully.');
    }

    /**
     * List all ranked orientation results for an assessment attempt.
     */
    public function attemptResults(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('view', $attempt);

        $attempt->loadMissing(['orientationResults.careerPath', 'orientationResults.attempt']);

        return $this->success(
            OrientationResultResource::collection($attempt->orientationResults->sortBy('ranking')),
            'Orientation results for attempt retrieved successfully.'
        );
    }

    /**
     * Retrieve soft-skills priorities for the top career match of an attempt.
     */
    public function attemptSoftSkills(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        Gate::authorize('view', $attempt);

        $topResult = $attempt->orientationResults()->where('ranking', 1)->with('careerPath')->first();

        if (! $topResult) {
            return $this->error('No orientation results found for this assessment attempt.', 404);
        }

        $traitScores = $attempt->metadata['trait_scores'] ?? [];
        $priorities = $this->assessmentService->getSoftSkillsPriorities(
            $topResult->careerPath,
            $traitScores,
            $topResult->growth_areas ?? []
        );

        return $this->success([
            'attempt_id' => $attempt->id,
            'career_path' => [
                'id' => $topResult->careerPath->id,
                'title' => $topResult->careerPath->title,
                'slug' => $topResult->careerPath->slug,
            ],
            'match_percentage' => (float) $topResult->match_percentage,
            'soft_skills_priorities' => $priorities,
        ], 'Soft-skills priorities for assessment retrieved successfully.');
    }

    /**
     * Retrieve latest assessment orientation results for the current user.
     */
    public function latestResults(Request $request): JsonResponse
    {
        $latestAttempt = AssessmentAttempt::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->with(['orientationResults.careerPath'])
            ->first();

        if (! $latestAttempt || $latestAttempt->orientationResults->isEmpty()) {
            return $this->error('No completed assessment found. Please complete an assessment first.', 404);
        }

        $results = $latestAttempt->orientationResults->sortBy('ranking');
        $topResult = $results->first();
        $traitScores = $latestAttempt->metadata['trait_scores'] ?? [];
        $softSkills = $topResult
            ? $this->assessmentService->getSoftSkillsPriorities($topResult->careerPath, $traitScores, $topResult->growth_areas ?? [])
            : [];

        return $this->success([
            'attempt_id' => $latestAttempt->id,
            'completed_at' => $latestAttempt->completed_at?->toISOString(),
            'total_score' => (float) $latestAttempt->total_score,
            'top_career' => $topResult ? [
                'id' => $topResult->careerPath->id,
                'title' => $topResult->careerPath->title,
                'slug' => $topResult->careerPath->slug,
                'match_percentage' => (float) $topResult->match_percentage,
            ] : null,
            'soft_skills_priorities' => $softSkills,
            'results' => OrientationResultResource::collection($results),
        ], 'Latest orientation results retrieved successfully.');
    }

    /**
     * Re-generate or enrich AI insights for a specific orientation result.
     */
    public function refreshAiInsights(Request $request, OrientationResult $result): JsonResponse
    {
        Gate::authorize('update', $result);

        $updated = $this->assessmentService->refreshAiExplanation($result);

        return $this->success(
            new OrientationResultResource($updated),
            'AI insights refreshed successfully.'
        );
    }
}
