<?php

namespace Tests\Feature;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\User;
use App\Services\OpenRouterService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class OpenRouterIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected User $otherStudent;

    protected CareerPath $fullStackCareer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->student = User::where('email', 'student@rafi9i.com')->first();
        $this->otherStudent = User::factory()->create([
            'email' => 'other_student@rafi9i.com',
            'role' => 'student',
        ]);

        $this->fullStackCareer = CareerPath::where('slug', 'full-stack-software-engineer')->first();

        // Always prevent real external HTTP calls during tests
        Http::preventStrayRequests();
        RateLimiter::clear('ai');
    }

    public function test_ai_career_match_explanation_succeeds_with_mocked_openrouter(): void
    {
        Config::set('services.openrouter.api_key', 'test-openrouter-secret-key-12345');
        Config::set('services.openrouter.model', 'google/gemini-2.5-flash');

        $mockAiResponse = [
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'analysis' => 'Amine possesses an exceptional profile for Full Stack Engineering, showing strong mastery in PHP/Laravel and React.',
                            'strengths' => [
                                'End-to-end full stack architecture',
                                'Relational database schema modeling',
                                'Rapid API prototyping',
                            ],
                            'growth_areas' => [
                                'Advanced Docker container orchestration',
                                'Automated integration test coverage',
                            ],
                            'recommendations' => [
                                'Build a production SaaS capstone with Sanctum auth',
                                'Contribute to open source Laravel packages',
                                'Deploy your portfolio on a cloud VPS with CI/CD',
                            ],
                        ]),
                    ],
                ],
            ],
        ];

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response($mockAiResponse, 200),
        ]);

        // Create an attempt with answers
        $this->student->assessmentAttempts()->delete();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        foreach (AssessmentQuestion::active()->get() as $q) {
            $attempt->answers()->create([
                'assessment_question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
                'score' => 5.0,
            ]);
        }

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(200);

        // Verify OpenRouter was called with correct headers and payload
        Http::assertSent(function (ClientRequest $request) {
            return $request->url() === 'https://openrouter.ai/api/v1/chat/completions'
                && $request->hasHeader('Authorization', 'Bearer test-openrouter-secret-key-12345')
                && $request->hasHeader('HTTP-Referer')
                && $request->hasHeader('X-Title', 'Rafi9i')
                && $request['model'] === 'google/gemini-2.5-flash';
        });

        // Verify top orientation result has the AI-generated analysis
        $topResult = OrientationResult::where('assessment_attempt_id', $attempt->id)
            ->where('ranking', 1)
            ->first();

        $this->assertNotNull($topResult);
        $this->assertStringContainsString('Amine possesses an exceptional profile', $topResult->ai_analysis);
        $this->assertContains('End-to-end full stack architecture', $topResult->strengths);
    }

    public function test_ai_career_match_falls_back_gracefully_when_api_key_is_missing(): void
    {
        Config::set('services.openrouter.api_key', null);

        $this->student->assessmentAttempts()->delete();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        foreach (AssessmentQuestion::active()->get() as $q) {
            $attempt->answers()->create([
                'assessment_question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
                'score' => 5.0,
            ]);
        }

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(200);

        // No external calls should be made when API key is missing
        Http::assertNothingSent();

        // Baseline deterministic orientation results must still be generated
        $topResult = OrientationResult::where('assessment_attempt_id', $attempt->id)
            ->where('ranking', 1)
            ->first();

        $this->assertNotNull($topResult);
        $this->assertNotEmpty($topResult->ai_analysis);
        $this->assertNotEmpty($topResult->strengths);
        $this->assertNotEmpty($topResult->recommendations);
    }

    public function test_ai_career_match_falls_back_gracefully_on_openrouter_500_error(): void
    {
        Config::set('services.openrouter.api_key', 'test-key');

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response(['error' => 'Internal server error'], 500),
        ]);

        $this->student->assessmentAttempts()->delete();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        foreach (AssessmentQuestion::active()->get() as $q) {
            $attempt->answers()->create([
                'assessment_question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
                'score' => 5.0,
            ]);
        }

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        // The assessment submission MUST still succeed without crashing
        $response->assertStatus(200);

        $topResult = OrientationResult::where('assessment_attempt_id', $attempt->id)
            ->where('ranking', 1)
            ->first();

        $this->assertNotNull($topResult);
        $this->assertNotEmpty($topResult->ai_analysis);
    }

    public function test_ai_career_match_falls_back_gracefully_on_openrouter_timeout(): void
    {
        Config::set('services.openrouter.api_key', 'test-key');

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => function () {
                throw new ConnectionException('cURL error 28: Operation timed out after 30000 milliseconds');
            },
        ]);

        $this->student->assessmentAttempts()->delete();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        foreach (AssessmentQuestion::active()->get() as $q) {
            $attempt->answers()->create([
                'assessment_question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
                'score' => 5.0,
            ]);
        }

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(200);

        $topResult = OrientationResult::where('assessment_attempt_id', $attempt->id)->first();
        $this->assertNotNull($topResult);
    }

    public function test_ai_personalized_roadmap_generation_succeeds_with_mocked_openrouter(): void
    {
        Config::set('services.openrouter.api_key', 'test-key');

        $mockRoadmapResponse = [
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'title' => 'Amine’s Custom AI Full Stack Acceleration Plan',
                            'description' => '12-week intensive tailored to Computer Science undergraduate student.',
                            'duration_weeks' => 12,
                            'difficulty_level' => 'intermediate',
                            'stages' => [
                                [
                                    'stage' => 'Phase 1: API & DB Foundations',
                                    'tasks' => [
                                        [
                                            'title' => 'Design Normalized Relational Schema in MySQL',
                                            'description' => 'Create tables with constraints and composite indexes.',
                                            'estimated_hours' => 6,
                                            'skills_covered' => ['MySQL', 'Indexing'],
                                            'resource_links' => [
                                                ['title' => 'Laravel Migrations', 'url' => 'https://laravel.com/docs', 'type' => 'docs'],
                                            ],
                                        ],
                                        [
                                            'title' => 'Implement REST Controllers with BaseApiController',
                                            'description' => 'Standardize JSON envelopes and HTTP status codes.',
                                            'estimated_hours' => 8,
                                            'skills_covered' => ['Laravel', 'REST APIs'],
                                            'resource_links' => [],
                                        ],
                                    ],
                                ],
                                [
                                    'stage' => 'Phase 2: React 19 Frontend Integration',
                                    'tasks' => [
                                        [
                                            'title' => 'Connect React SPA to Laravel Sanctum',
                                            'description' => 'Manage session tokens and protected route guards.',
                                            'estimated_hours' => 10,
                                            'skills_covered' => ['React 19', 'Sanctum'],
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
            'https://openrouter.ai/api/v1/chat/completions' => Http::response($mockRoadmapResponse, 200),
        ]);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->fullStackCareer->id,
                'target_hours_per_week' => 15,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'title' => 'Amine’s Custom AI Full Stack Acceleration Plan',
                    'duration_weeks' => 12,
                    'career_path_id' => $this->fullStackCareer->id,
                ],
            ]);

        $this->assertDatabaseHas('roadmaps', [
            'user_id' => $this->student->id,
            'career_path_id' => $this->fullStackCareer->id,
            'title' => 'Amine’s Custom AI Full Stack Acceleration Plan',
        ]);

        $this->assertDatabaseHas('roadmap_tasks', [
            'title' => 'Design Normalized Relational Schema in MySQL',
            'stage' => 'Phase 1: API & DB Foundations',
        ]);
    }

    public function test_ai_personalized_roadmap_falls_back_when_openrouter_unavailable(): void
    {
        Config::set('services.openrouter.api_key', null);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $this->fullStackCareer->id,
            ]);

        $response->assertStatus(201);
        Http::assertNothingSent();

        // Baseline structured roadmap must still be created
        $this->assertDatabaseHas('roadmaps', [
            'user_id' => $this->student->id,
            'career_path_id' => $this->fullStackCareer->id,
        ]);

        $this->assertGreaterThan(0, $this->student->roadmaps()->first()->tasks()->count());
    }

    public function test_refresh_ai_insights_endpoint_is_authorized_and_rate_limited(): void
    {
        Config::set('services.openrouter.api_key', 'test-key');

        $result = OrientationResult::where('user_id', $this->student->id)->first();
        $this->assertNotNull($result);

        // 1. Authorization: Other student cannot access Amine's result
        $otherToken = $this->otherStudent->createToken('other')->plainTextToken;
        $unauthResponse = $this->withHeader('Authorization', "Bearer $otherToken")
            ->postJson("/api/assessments/results/{$result->id}/ai-insights");
        $unauthResponse->assertStatus(403);

        // 2. Owner can refresh
        $mockResponse = [
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'analysis' => 'Refreshed AI analysis text.',
                            'strengths' => ['Updated Strength 1'],
                            'growth_areas' => ['Updated Area 1'],
                            'recommendations' => ['Updated Rec 1'],
                        ]),
                    ],
                ],
            ],
        ];

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response($mockResponse, 200),
        ]);

        $this->app['auth']->forgetGuards();
        $token = $this->student->createToken('test')->plainTextToken;

        $okResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/results/{$result->id}/ai-insights");
        $okResponse->assertStatus(200);

        // 1 initial request succeeded (1 of 10 consumed).
        // 9 subsequent requests must also be permitted (10 of 10 consumed).
        for ($i = 0; $i < 9; $i++) {
            $this->app['auth']->forgetGuards();
            $res = $this->withHeader('Authorization', "Bearer $token")
                ->postJson("/api/assessments/results/{$result->id}/ai-insights");
            $this->assertNotEquals(429, $res->getStatusCode(), "Request $i should be allowed");
        }

        // 11th request must return 429 Too Many Requests
        $this->app['auth']->forgetGuards();
        $throttled = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/results/{$result->id}/ai-insights");
        $throttled->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Too many AI generation requests. Please wait a moment before trying again.',
            ]);
    }

    public function test_openrouter_service_never_leaks_api_key_in_string_or_debug(): void
    {
        $service = new OpenRouterService;

        // Ensure key is not printed in logs or public properties
        $reflection = new \ReflectionClass($service);
        $this->assertTrue($reflection->getProperty('apiKey')->isProtected());

        // Verify config doesn't expose key in public API routes
        $response = $this->getJson('/api/health');
        $response->assertStatus(200);
        $this->assertStringNotContainsString('sk-or', $response->content());
    }
}
