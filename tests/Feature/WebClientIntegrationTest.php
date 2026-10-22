<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WebClientIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->student = User::where('email', 'student@rafi9i.com')->first();
    }

    public function test_get_profile_returns_nextjs_expected_contract(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'status',
                'message',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'city',
                    'bacStream',
                    'language',
                    'onboardingCompleted',
                    'createdAt',
                    'role',
                ],
            ])
            ->assertJson([
                'success' => true,
                'status' => 'success',
            ]);
    }

    public function test_patch_profile_updates_moroccan_student_attributes(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->patchJson('/api/v1/profile', [
            'name' => 'Amine Bennani Updated',
            'city' => 'rabat',
            'bacStream' => 'sciences-math',
            'language' => 'ar',
            'onboardingCompleted' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Amine Bennani Updated',
                    'city' => 'rabat',
                    'bacStream' => 'sciences-math',
                    'language' => 'ar',
                ],
            ]);

        $this->student->refresh();
        $this->assertEquals('Amine Bennani Updated', $this->student->name);
        $this->assertEquals('rabat', $this->student->profile->location);
        $this->assertEquals('sciences-math', $this->student->profile->field_of_study);
        $this->assertEquals('ar', $this->student->profile->preferred_language);
    }

    public function test_basic_assessment_start_and_submit_handshake(): void
    {
        Sanctum::actingAs($this->student);

        // 1. Start basic assessment
        $startResponse = $this->postJson('/api/v1/assessments/basic/start');
        $startResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'sessionId',
                    'questions',
                    'completed',
                    'lastSubmittedAt',
                ],
            ]);

        $sessionId = $startResponse->json('data.sessionId');
        $this->assertStringStartsWith('sess-basic-', $sessionId);
        $this->assertCount(12, $startResponse->json('data.questions'));

        // 2. Submit basic assessment
        $submitPayload = [
            'sessionId' => $sessionId,
            'answers' => [
                'bacStream' => 'sciences-math',
                'academicStrengths' => ['logique-math', 'experimentation'],
                'favouriteSubjects' => ['maths', 'informatique'],
                'interests' => ['technologie', 'sciences'],
                'preferredActivities' => ['resoudre-problemes', 'creer-objets'],
                'workPreference' => 'liberte-remote',
                'city' => 'casablanca',
                'studyType' => 'public',
                'budget' => 'modere',
                'careerInterests' => ['informatique', 'data'],
                'confidence' => 4,
                'mainDifficulty' => 'trop-de-choix',
            ],
        ];

        $submitResponse = $this->postJson('/api/v1/assessments/basic/submit', $submitPayload);
        $submitResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'result' => [
                        'kind',
                        'result' => [
                            'profileSummary',
                            'topFields',
                            'strengths',
                            'softSkillPriorities',
                            'resources',
                            'roadmap',
                        ],
                        'accessLevel',
                        'source',
                        'generatedAt',
                    ],
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'result' => [
                        'kind' => 'free',
                    ],
                ],
            ]);

        // Top recommended field for Math + Tech should be Informatique & Data
        $topField = $submitResponse->json('data.result.result.topFields.0');
        $this->assertEquals('informatique-data', $topField['id']);
    }

    public function test_advanced_assessment_start_and_submit_handshake(): void
    {
        Sanctum::actingAs($this->student);

        // 1. Start advanced assessment
        $startResponse = $this->postJson('/api/v1/assessments/advanced/start');
        $startResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'sessionId',
                    'questions',
                    'completed',
                ],
            ]);

        $sessionId = $startResponse->json('data.sessionId');
        $this->assertCount(10, $startResponse->json('data.questions'));

        // 2. Submit advanced assessment
        $submitPayload = [
            'sessionId' => $sessionId,
            'answers' => [
                'workEnvironment' => 'hybride',
                'learningStyle' => 'pratique',
                'workMode' => 'collaboratif',
                'leadershipComfort' => 4,
                'communicationConfidence' => 4,
                'mobility' => 'national',
                'financialConstraint' => 'moyenne',
                'careerPriority' => 'passion',
                'longTermGoal' => 'expert',
                'mainObstacle' => 'info',
            ],
        ];

        $submitResponse = $this->postJson('/api/v1/assessments/advanced/submit', $submitPayload);
        $submitResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'result' => [
                        'kind',
                        'result' => [
                            'profileSummary',
                            'topFields',
                            'strengths',
                            'softSkillPriorities',
                            'resources',
                            'roadmap',
                        ],
                    ],
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'result' => [
                        'kind' => 'premium',
                    ],
                ],
            ]);

        $this->assertNotEmpty($submitResponse->json('data.result.result.resources'));
        $this->assertNotEmpty($submitResponse->json('data.result.result.roadmap'));
    }

    public function test_results_latest_endpoint_returns_evaluated_result(): void
    {
        Sanctum::actingAs($this->student);

        // Submit basic assessment first
        $this->postJson('/api/v1/assessments/basic/submit', [
            'sessionId' => 'sess-test',
            'answers' => [
                'bacStream' => 'sciences-math',
                'city' => 'casablanca',
            ],
        ]);

        $response = $this->getJson('/api/v1/results/latest');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'kind',
                    'result' => [
                        'profileSummary',
                        'topFields',
                    ],
                ],
            ]);
    }

    public function test_trial_endpoints_activate_and_read_status(): void
    {
        $freeStudent = User::factory()->student()->free()->create();
        Sanctum::actingAs($freeStudent);

        // 1. Initial trial status
        $status1 = $this->getJson('/api/v1/trial/status');
        $status1->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'not_started',
                    'accessLevel' => 'free',
                ],
            ]);

        // 2. Start trial
        $start = $this->postJson('/api/v1/trial/start');
        $start->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'active',
                    'accessLevel' => 'premium',
                ],
            ]);

        $freeStudent->refresh();
        $this->assertTrue($freeStudent->isPremium());
    }

    public function test_dashboard_endpoint_returns_full_overview(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'profileCompletion',
                    'trial' => [
                        'status',
                        'accessLevel',
                    ],
                    'orientationStage',
                    'streak',
                    'nextAction',
                ],
            ]);
    }

    public function test_progress_tracking_endpoints(): void
    {
        Sanctum::actingAs($this->student);

        // Resource progress
        $resResponse = $this->patchJson('/api/v1/progress/resource/res-python-oc', [
            'completed' => true,
        ]);
        $resResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => 'res-python-oc',
                    'completed' => true,
                ],
            ]);

        // Roadmap step progress
        $rmResponse = $this->patchJson('/api/v1/progress/roadmap/rm-explore-1', [
            'completed' => true,
        ]);
        $rmResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => 'rm-explore-1',
                    'completed' => true,
                ],
            ]);
    }
}
