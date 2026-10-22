<?php

namespace Tests\Feature;

use App\Models\AssessmentAttempt;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\ProgressTracking;
use App\Models\Roadmap;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RoadmapAndOrientationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected User $otherStudent;

    protected CareerPath $fullStackCareer;

    protected CareerPath $aiCareer;

    protected string $studentToken;

    protected string $otherToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->student = User::where('email', 'student@rafi9i.com')->first();
        $this->student->update(['subscription_status' => 'premium']);
        $this->studentToken = $this->student->createToken('test')->plainTextToken;

        $this->otherStudent = User::factory()->create([
            'email' => 'other_user@rafi9i.com',
            'role' => 'student',
            'subscription_status' => 'premium',
        ]);
        $this->otherStudent->profile()->create([
            'education_level' => 'undergraduate',
            'target_role' => 'AI Engineer',
        ]);
        $this->otherToken = $this->otherStudent->createToken('other')->plainTextToken;

        $this->fullStackCareer = CareerPath::where('slug', 'full-stack-software-engineer')->first();
        $this->aiCareer = CareerPath::where('slug', 'ai-machine-learning-engineer')->first();

        Http::preventStrayRequests();
    }

    /*
    |--------------------------------------------------------------------------
    | Detailed Orientation Results & Soft-Skills Priorities Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_can_retrieve_detailed_orientation_result(): void
    {
        $result = OrientationResult::where('user_id', $this->student->id)->first();
        $this->assertNotNull($result);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/assessments/results/{$result->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'career_path_id',
                    'career_path' => [
                        'id',
                        'title',
                        'slug',
                        'industry',
                        'required_skills',
                    ],
                    'match_percentage',
                    'ranking',
                    'ai_analysis',
                    'strengths',
                    'growth_areas',
                    'recommendations',
                    'soft_skills_priorities' => [
                        '*' => [
                            'skill',
                            'category',
                            'priority',
                            'importance',
                            'actionable_steps',
                            'recommended_milestone_week',
                        ],
                    ],
                    'has_active_roadmap',
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $result->id,
                    'user_id' => $this->student->id,
                ],
            ]);

        $this->assertNotEmpty($response->json('data.soft_skills_priorities'));
    }

    public function test_unauthorized_user_cannot_view_others_orientation_result(): void
    {
        $result = OrientationResult::where('user_id', $this->student->id)->first();
        $this->assertNotNull($result);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->getJson("/api/assessments/results/{$result->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_retrieve_dedicated_soft_skills_priorities_for_orientation_result(): void
    {
        $result = OrientationResult::where('user_id', $this->student->id)->first();
        $this->assertNotNull($result);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/assessments/results/{$result->id}/soft-skills");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'orientation_result_id',
                    'career_path' => ['id', 'title', 'slug'],
                    'match_percentage',
                    'ranking',
                    'soft_skills_priorities' => [
                        '*' => [
                            'skill',
                            'category',
                            'priority',
                            'importance',
                            'actionable_steps',
                            'recommended_milestone_week',
                        ],
                    ],
                    'recommended_focus',
                ],
            ]);
    }

    public function test_user_can_retrieve_all_orientation_results_for_attempt(): void
    {
        $attempt = AssessmentAttempt::where('user_id', $this->student->id)
            ->where('status', 'completed')
            ->first();
        $this->assertNotNull($attempt);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/assessments/attempts/{$attempt->id}/results");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'career_path_id',
                        'match_percentage',
                        'ranking',
                        'soft_skills_priorities',
                    ],
                ],
            ]);

        $results = $response->json('data');
        $this->assertCount(3, $results);
        $this->assertEquals(1, $results[0]['ranking']);
        $this->assertEquals(2, $results[1]['ranking']);
    }

    public function test_user_can_retrieve_soft_skills_for_attempt_top_match(): void
    {
        $attempt = AssessmentAttempt::where('user_id', $this->student->id)
            ->where('status', 'completed')
            ->first();
        $this->assertNotNull($attempt);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/assessments/attempts/{$attempt->id}/soft-skills");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'attempt_id',
                    'career_path',
                    'match_percentage',
                    'soft_skills_priorities',
                ],
            ]);
    }

    public function test_user_can_retrieve_latest_orientation_results(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson('/api/assessments/results/latest');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'attempt_id',
                    'completed_at',
                    'total_score',
                    'top_career' => ['id', 'title', 'slug', 'match_percentage'],
                    'soft_skills_priorities',
                    'results',
                ],
            ]);
    }

    public function test_latest_results_returns_404_when_user_has_no_completed_assessment(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->getJson('/api/assessments/results/latest');

        $response->assertStatus(404)
            ->assertJson([
                'status' => 'error',
                'message' => 'No completed assessment found. Please complete an assessment first.',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 30-Day Personalized Roadmap Generation & Milestones Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_can_generate_30_day_roadmap_with_actionable_weekly_milestones(): void
    {
        // Delete any existing roadmaps for this test user
        $this->otherStudent->roadmaps()->delete();

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->aiCareer->id,
                'career_goals' => 'Become an applied AI Engineer building production LLM apps within 30 days',
                'duration_days' => 30,
                'target_hours_per_week' => 12,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'career_path_id',
                    'title',
                    'duration_weeks',
                    'duration_days',
                    'progress' => [
                        'completed_tasks',
                        'total_tasks',
                        'completion_percentage',
                    ],
                    'milestones' => [
                        '*' => [
                            'stage',
                            'total_tasks',
                            'completed_tasks',
                            'completion_percentage',
                        ],
                    ],
                    'tasks' => [
                        '*' => [
                            'id',
                            'title',
                            'description',
                            'stage',
                            'order',
                            'estimated_hours',
                            'skills_covered',
                            'resource_links',
                            'progress' => [
                                'status',
                            ],
                        ],
                    ],
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'duration_weeks' => 4,
                    'duration_days' => 30,
                    'career_path_id' => $this->aiCareer->id,
                ],
            ]);

        // Verify MySQL database persistence
        $this->assertDatabaseHas('roadmaps', [
            'user_id' => $this->otherStudent->id,
            'career_path_id' => $this->aiCareer->id,
            'duration_weeks' => 4,
            'status' => 'active',
        ]);

        $roadmap = Roadmap::where('user_id', $this->otherStudent->id)
            ->where('career_path_id', $this->aiCareer->id)
            ->first();

        $this->assertNotNull($roadmap);
        $this->assertGreaterThanOrEqual(8, $roadmap->tasks()->count());

        // Verify 4 weekly milestone stages are created
        $stages = $roadmap->tasks()->pluck('stage')->unique()->values()->all();
        $this->assertCount(4, $stages);
        $this->assertStringContainsString('Week 1', $stages[0]);
        $this->assertStringContainsString('Week 2', $stages[1]);
        $this->assertStringContainsString('Week 3', $stages[2]);
        $this->assertStringContainsString('Week 4', $stages[3]);

        // Verify all tasks have initial pending progress tracking records
        foreach ($roadmap->tasks as $task) {
            $this->assertDatabaseHas('progress_trackings', [
                'user_id' => $this->otherStudent->id,
                'roadmap_task_id' => $task->id,
                'status' => 'pending',
            ]);
        }
    }

    public function test_duplicate_ai_roadmap_generation_requests_are_avoided_via_caching(): void
    {
        Config::set('services.openrouter.api_key', 'test-openrouter-key');

        $mockRoadmap = [
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'title' => 'Personalized 30-Day AI Roadmap',
                            'description' => 'Fast-track 30-day curriculum for applied AI.',
                            'duration_weeks' => 4,
                            'difficulty_level' => 'advanced',
                            'stages' => [
                                [
                                    'stage' => 'Week 1 (Days 1–7): Foundations & Assessment Gap Bridging',
                                    'tasks' => [
                                        [
                                            'title' => 'PyTorch & Tensor Operations Mastery',
                                            'description' => 'Implement matrix transforms and autograd computation graphs.',
                                            'estimated_hours' => 8,
                                            'skills_covered' => ['Python', 'PyTorch', 'Hypothesis Testing'],
                                            'resource_links' => [],
                                        ],
                                    ],
                                ],
                            ],
                        ]),
                    ],
                ],
            ],
        ];

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response($mockRoadmap, 200),
        ]);

        $this->otherStudent->roadmaps()->delete();

        // 1st Call: Should trigger OpenRouter API call
        $first = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->aiCareer->id,
                'career_goals' => 'Target Junior ML Engineer',
                'target_hours_per_week' => 15,
                'duration_days' => 30,
            ]);
        $first->assertStatus(201);
        Http::assertSentCount(1);

        // 2nd Call with identical parameters: OpenRouter API should NOT be hit again (cache hit!)
        $second = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->aiCareer->id,
                'career_goals' => 'Target Junior ML Engineer',
                'target_hours_per_week' => 15,
                'duration_days' => 30,
            ]);
        $second->assertStatus(201);
        // Assert no new external request was made!
        Http::assertSentCount(1);

        // 3rd Call with force_regenerate = true: Should bust cache and make a fresh AI call
        $third = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->aiCareer->id,
                'career_goals' => 'Target Junior ML Engineer',
                'target_hours_per_week' => 15,
                'duration_days' => 30,
                'force_regenerate' => true,
            ]);
        $third->assertStatus(201);
        // Assert second external request was made!
        Http::assertSentCount(2);
    }

    public function test_generate_roadmap_with_reuse_existing_flag_returns_existing(): void
    {
        $existing = Roadmap::where('user_id', $this->student->id)
            ->where('career_path_id', $this->fullStackCareer->id)
            ->first();
        $this->assertNotNull($existing);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->fullStackCareer->id,
                'reuse_existing' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Existing roadmap retrieved.',
                'data' => [
                    'id' => $existing->id,
                ],
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Retrieving Roadmaps and Viewing Detailed Progress
    |--------------------------------------------------------------------------
    */

    public function test_user_can_retrieve_roadmaps_list(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson('/api/roadmaps');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'duration_weeks',
                        'career_path',
                        'progress' => [
                            'completed_tasks',
                            'total_tasks',
                            'completion_percentage',
                        ],
                    ],
                ],
            ]);
    }

    public function test_user_can_view_roadmap_details_with_milestones_and_tasks(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $this->assertNotNull($roadmap);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/roadmaps/{$roadmap->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'title',
                    'duration_weeks',
                    'duration_days',
                    'milestones',
                    'progress',
                    'tasks' => [
                        '*' => [
                            'id',
                            'title',
                            'stage',
                            'progress',
                        ],
                    ],
                ],
            ]);
    }

    public function test_user_can_view_detailed_progress_breakdown(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $this->assertNotNull($roadmap);

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->getJson("/api/roadmaps/{$roadmap->id}/progress");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'roadmap_id',
                    'title',
                    'duration_weeks',
                    'duration_days',
                    'total_tasks',
                    'completed_tasks',
                    'in_progress_tasks',
                    'pending_tasks',
                    'completion_percentage',
                    'total_estimated_hours',
                    'total_time_spent_minutes',
                    'milestones' => [
                        '*' => [
                            'stage',
                            'total_tasks',
                            'completed_tasks',
                            'completion_percentage',
                            'status',
                        ],
                    ],
                    'next_task',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals($roadmap->id, $data['roadmap_id']);
        $this->assertGreaterThan(0, $data['total_tasks']);
        $this->assertGreaterThanOrEqual(0, $data['completion_percentage']);
    }

    /*
    |--------------------------------------------------------------------------
    | Task Completion, Incompletion and Status Toggling Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_can_mark_task_complete(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->whereDoesntHave('progressTrackings', function ($q) {
            $q->where('status', 'completed');
        })->first() ?? $roadmap->tasks()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/complete", [
                'notes' => 'Finished all documentation exercises and unit tests successfully.',
                'time_spent_minutes' => 120,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Task marked as completed.',
                'data' => [
                    'task_id' => $task->id,
                    'status' => 'completed',
                    'is_completed' => true,
                    'notes' => 'Finished all documentation exercises and unit tests successfully.',
                    'time_spent_minutes' => 120,
                ],
            ]);

        $this->assertNotNull($response->json('data.completed_at'));

        $this->assertDatabaseHas('progress_trackings', [
            'user_id' => $this->student->id,
            'roadmap_task_id' => $task->id,
            'status' => 'completed',
            'time_spent_minutes' => 120,
        ]);
    }

    public function test_user_can_mark_task_incomplete(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();

        // Mark completed first
        ProgressTracking::updateOrCreate(
            ['user_id' => $this->student->id, 'roadmap_task_id' => $task->id],
            ['status' => 'completed', 'completed_at' => now()]
        );

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/incomplete");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Task marked as incomplete.',
                'data' => [
                    'task_id' => $task->id,
                    'status' => 'pending',
                    'is_completed' => false,
                    'completed_at' => null,
                ],
            ]);

        $this->assertDatabaseHas('progress_trackings', [
            'user_id' => $this->student->id,
            'roadmap_task_id' => $task->id,
            'status' => 'pending',
            'completed_at' => null,
        ]);
    }

    public function test_user_can_toggle_task_status(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();

        // Ensure pending initially
        ProgressTracking::updateOrCreate(
            ['user_id' => $this->student->id, 'roadmap_task_id' => $task->id],
            ['status' => 'pending', 'completed_at' => null]
        );

        // Toggle 1: Pending -> Completed
        $toggle1 = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/toggle");

        $toggle1->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'task_id' => $task->id,
                    'status' => 'completed',
                    'is_completed' => true,
                ],
            ]);
        $this->assertNotNull($toggle1->json('data.completed_at'));

        // Toggle 2: Completed -> Pending
        $toggle2 = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/toggle");

        $toggle2->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'task_id' => $task->id,
                    'status' => 'pending',
                    'is_completed' => false,
                    'completed_at' => null,
                ],
            ]);
    }

    public function test_user_can_update_task_progress_status_to_in_progress(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/progress", [
                'status' => 'in_progress',
                'notes' => 'Currently reading through official documentation and drafting module scaffolding.',
                'time_spent_minutes' => 45,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'task_id' => $task->id,
                    'status' => 'in_progress',
                    'is_completed' => false,
                    'time_spent_minutes' => 45,
                ],
            ]);

        $this->assertDatabaseHas('progress_trackings', [
            'user_id' => $this->student->id,
            'roadmap_task_id' => $task->id,
            'status' => 'in_progress',
            'time_spent_minutes' => 45,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Ownership and Authorization Enforcement Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_cannot_view_another_users_roadmap(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $this->assertNotNull($roadmap);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->getJson("/api/roadmaps/{$roadmap->id}");

        $response->assertStatus(403);
    }

    public function test_user_cannot_view_another_users_roadmap_progress(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $this->assertNotNull($roadmap);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->getJson("/api/roadmaps/{$roadmap->id}/progress");

        $response->assertStatus(403);
    }

    public function test_user_cannot_mark_complete_another_users_task(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();
        $this->assertNotNull($task);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/complete");

        $response->assertStatus(403);
    }

    public function test_user_cannot_mark_incomplete_another_users_task(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();
        $this->assertNotNull($task);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/incomplete");

        $response->assertStatus(403);
    }

    public function test_user_cannot_toggle_another_users_task(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();
        $this->assertNotNull($task);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/toggle");

        $response->assertStatus(403);
    }

    public function test_user_cannot_generate_roadmap_using_another_users_assessment_attempt(): void
    {
        $attempt = AssessmentAttempt::where('user_id', $this->student->id)->first();
        $this->assertNotNull($attempt);

        $response = $this->withHeader('Authorization', "Bearer {$this->otherToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->aiCareer->id,
                'assessment_attempt_id' => $attempt->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'You are not authorized to use this assessment attempt.',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Validation Tests
    |--------------------------------------------------------------------------
    */

    public function test_task_progress_rejects_invalid_status(): void
    {
        $roadmap = Roadmap::where('user_id', $this->student->id)->first();
        $task = $roadmap->tasks()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/progress", [
                'status' => 'invalid_status_value',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_generate_roadmap_rejects_invalid_career_path(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => 99999, // non-existent
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['career_path_id']);
    }

    public function test_generate_roadmap_rejects_invalid_duration_days(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->studentToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->fullStackCareer->id,
                'duration_days' => 45, // only 30, 60, 90 allowed
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['duration_days']);
    }
}
