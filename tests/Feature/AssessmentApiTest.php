<?php

namespace Tests\Feature;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected User $otherStudent;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->student = User::where('email', 'student@rafi9i.com')->first();

        // Create a secondary user for authorization tests
        $this->otherStudent = User::factory()->create([
            'email' => 'other_student@rafi9i.com',
            'role' => 'student',
        ]);
        $this->otherStudent->profile()->create([
            'education_level' => 'undergraduate',
            'target_role' => 'Cybersecurity Analyst',
        ]);
    }

    public function test_can_retrieve_published_assessment_questions(): void
    {
        $response = $this->getJson('/api/assessments/questions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'question_text',
                        'category',
                        'question_type',
                        'options' => [
                            '*' => ['value', 'label'],
                        ],
                        'order',
                    ],
                ],
            ]);

        $this->assertGreaterThanOrEqual(8, count($response->json('data')));
    }

    public function test_authenticated_user_can_start_assessment(): void
    {
        // First delete seeded completed attempt so student starts fresh
        $this->student->assessmentAttempts()->delete();

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/assessments/start');

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'user_id',
                    'status',
                    'started_at',
                    'progress' => [
                        'answered_count',
                        'total_questions',
                    ],
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user_id' => $this->student->id,
                    'status' => 'in_progress',
                ],
            ]);

        $this->assertDatabaseHas('assessment_attempts', [
            'user_id' => $this->student->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_start_resumes_existing_in_progress_attempt(): void
    {
        $this->student->assessmentAttempts()->delete();
        $token = $this->student->createToken('test')->plainTextToken;

        // 1st start
        $first = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/assessments/start');
        $firstId = $first->json('data.id');

        // 2nd start should return existing in_progress attempt
        $second = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/assessments/start');
        $secondId = $second->json('data.id');

        $this->assertEquals($firstId, $secondId);
        $this->assertEquals(1, AssessmentAttempt::where('user_id', $this->student->id)->where('status', 'in_progress')->count());
    }

    public function test_user_can_save_answer_with_server_side_validation(): void
    {
        $this->student->assessmentAttempts()->delete();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $question = AssessmentQuestion::active()->first();
        $validOption = $question->options[0]['value'];

        $token = $this->student->createToken('test')->plainTextToken;

        $payload = [
            'question_id' => $question->id,
            'selected_option' => $validOption,
            'answer_text' => 'My reasoning for this option.',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'assessment_question_id' => $question->id,
                    'selected_option' => $validOption,
                    'answer_text' => 'My reasoning for this option.',
                ],
            ]);

        $this->assertDatabaseHas('assessment_answers', [
            'assessment_attempt_id' => $attempt->id,
            'assessment_question_id' => $question->id,
            'selected_option' => $validOption,
        ]);
    }

    public function test_saving_answer_fails_when_selected_option_is_invalid(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $question = AssessmentQuestion::active()->first();
        $token = $this->student->createToken('test')->plainTextToken;

        $payload = [
            'question_id' => $question->id,
            'selected_option' => 'invalid_unsupported_option_value',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers", $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['selected_option']);
    }

    public function test_user_can_save_answers_in_batch(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $questions = AssessmentQuestion::active()->take(3)->get();
        $token = $this->student->createToken('test')->plainTextToken;

        $answers = [];
        foreach ($questions as $q) {
            $answers[] = [
                'question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
            ];
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers/batch", [
                'answers' => $answers,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'progress' => [
                        'answered_count' => 3,
                    ],
                ],
            ]);

        $this->assertEquals(3, $attempt->answers()->count());
    }

    public function test_user_can_resume_unfinished_attempt(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now()->subMinutes(10),
        ]);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/assessments/attempts/{$attempt->id}/resume");

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $attempt->id,
                    'status' => 'in_progress',
                ],
            ]);
    }

    public function test_cannot_resume_already_completed_attempt(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'completed',
            'started_at' => now()->subHours(1),
            'completed_at' => now(),
        ]);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/assessments/attempts/{$attempt->id}/resume");

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'This assessment attempt is already completed and cannot be resumed.',
            ]);
    }

    public function test_user_can_submit_assessment_and_get_orientation_results(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now()->subMinutes(20),
        ]);

        $questions = AssessmentQuestion::active()->get();
        foreach ($questions as $q) {
            $attempt->answers()->create([
                'assessment_question_id' => $q->id,
                'selected_option' => $q->options[0]['value'],
                'score' => $q->options[0]['score'] ?? 5,
            ]);
        }

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'id',
                    'status',
                    'completed_at',
                    'total_score',
                    'orientation_results' => [
                        '*' => [
                            'id',
                            'career_path_id',
                            'career_path',
                            'match_percentage',
                            'ranking',
                            'ai_analysis',
                            'strengths',
                            'recommendations',
                        ],
                    ],
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'status' => 'completed',
                ],
            ]);

        $attempt->refresh();
        $this->assertEquals('completed', $attempt->status);
        $this->assertNotNull($attempt->completed_at);
        $this->assertGreaterThan(0, $attempt->orientationResults()->count());
    }

    public function test_cannot_submit_attempt_with_zero_answers(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Cannot submit an assessment attempt with 0 answered questions.',
            ]);
    }

    public function test_cannot_submit_already_completed_attempt(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'completed',
            'started_at' => now()->subHours(1),
            'completed_at' => now(),
        ]);

        $token = $this->student->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Assessment attempt has already been submitted and completed.',
            ]);
    }

    public function test_authorization_user_cannot_access_another_users_attempt(): void
    {
        // Attempt belongs to $this->student
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // Attempt accessed by $this->otherStudent
        $otherToken = $this->otherStudent->createToken('other')->plainTextToken;

        // 1. Cannot view
        $viewRes = $this->withHeader('Authorization', "Bearer $otherToken")
            ->getJson("/api/assessments/attempts/{$attempt->id}");
        $viewRes->assertStatus(403);

        // 2. Cannot save answers
        $question = AssessmentQuestion::active()->first();
        $saveRes = $this->withHeader('Authorization', "Bearer $otherToken")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers", [
                'question_id' => $question->id,
                'selected_option' => $question->options[0]['value'],
            ]);
        $saveRes->assertStatus(403);

        // 3. Cannot submit
        $submitRes = $this->withHeader('Authorization', "Bearer $otherToken")
            ->postJson("/api/assessments/attempts/{$attempt->id}/submit");
        $submitRes->assertStatus(403);
    }
}
