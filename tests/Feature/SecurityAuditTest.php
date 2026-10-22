<?php

namespace Tests\Feature;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\CareerPath;
use App\Models\OrientationResult;
use App\Models\Roadmap;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $studentA;

    protected User $studentB;

    protected User $adminUser;

    protected string $tokenA;

    protected string $tokenB;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        RateLimiter::clear('auth');
        RateLimiter::clear('ai');

        $this->studentA = User::where('email', 'student@rafi9i.com')->first();
        $this->tokenA = $this->studentA->createToken('token_a')->plainTextToken;

        $this->studentB = User::factory()->student()->free()->create([
            'email' => 'victim_or_attacker@example.com',
            'name' => 'Second Student',
        ]);
        $this->studentB->profile()->create([
            'education_level' => 'undergraduate',
            'target_role' => 'Data Analyst',
        ]);
        $this->tokenB = $this->studentB->createToken('token_b')->plainTextToken;

        $this->adminUser = User::where('email', 'admin@rafi9i.com')->first();
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Mass Assignment & Privilege Escalation Tests
    |--------------------------------------------------------------------------
    */

    public function test_registration_rejects_admin_role_escalation(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Hacker Bob',
            'email' => 'hacker@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);

        $this->assertDatabaseMissing('users', ['email' => 'hacker@example.com']);
    }

    public function test_registration_ignores_subscription_status_injection(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Sneaky Student',
            'email' => 'sneaky@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'role' => 'student',
            'subscription_status' => 'premium',
            'premium_activated_at' => now()->toIso8601String(),
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'sneaky@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('student', $user->role);
        $this->assertEquals('free', $user->subscription_status);
        $this->assertFalse($user->isPremium());
    }

    public function test_profile_update_cannot_escalate_role_or_subscription(): void
    {
        Sanctum::actingAs($this->studentB);

        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Legit Name Change',
            'role' => 'admin',
            'subscription_status' => 'premium',
            'is_premium' => true,
        ]);

        $response->assertStatus(200);

        $this->studentB->refresh();
        $this->assertEquals('student', $this->studentB->role);
        $this->assertEquals('free', $this->studentB->subscription_status);
        $this->assertFalse($this->studentB->isPremium());
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Authentication, Token Expiration & Password Reset Security Tests
    |--------------------------------------------------------------------------
    */

    public function test_sanctum_token_expiration_is_enforced(): void
    {
        // Set short expiration of 1 minute for test
        Config::set('sanctum.expiration', 1);

        $tokenInstance = $this->studentA->tokens()->first();
        $this->assertNotNull($tokenInstance);

        // Simulate token created 5 minutes ago (expired)
        $tokenInstance->created_at = now()->subMinutes(5);
        $tokenInstance->save();

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_logout_revokes_token_completely(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Successfully logged out.',
            ]);

        // Attempting to reuse revoked token must yield 401
        $this->app['auth']->forgetGuards();
        $secondResponse = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->getJson('/api/auth/me');

        $secondResponse->assertStatus(401);
    }

    public function test_password_reset_requires_secure_hash_and_rejects_arbitrary_token(): void
    {
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $this->studentA->email],
            [
                'token' => Hash::make('valid-secret-token-12345'),
                'created_at' => now(),
            ]
        );

        // Attempt with wrong token
        $badResponse = $this->postJson('/api/auth/reset-password', [
            'email' => $this->studentA->email,
            'token' => 'invalid-guess-token',
            'password' => 'NewSecurePassword999',
            'password_confirmation' => 'NewSecurePassword999',
        ]);

        $badResponse->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid or expired password reset token.',
            ]);

        // Verify password did not change
        $this->studentA->refresh();
        $this->assertTrue(Hash::check('password123', $this->studentA->password));
    }

    public function test_password_reset_rejects_expired_token(): void
    {
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $this->studentA->email],
            [
                'token' => Hash::make('expired-token-12345'),
                'created_at' => now()->subMinutes(65),
            ]
        );

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $this->studentA->email,
            'token' => 'expired-token-12345',
            'password' => 'NewSecurePassword999',
            'password_confirmation' => 'NewSecurePassword999',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Password reset token has expired. Please request a new one.',
            ]);
    }

    public function test_successful_password_reset_invalidates_all_active_tokens(): void
    {
        $tokenBefore = $this->tokenA;

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $this->studentA->email],
            [
                'token' => Hash::make('valid-reset-token'),
                'created_at' => now(),
            ]
        );

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $this->studentA->email,
            'token' => 'valid-reset-token',
            'password' => 'BrandNewPassword123',
            'password_confirmation' => 'BrandNewPassword123',
        ]);

        $response->assertStatus(200);

        // Token from before the reset must now be revoked
        $this->app['auth']->forgetGuards();
        $testOldToken = $this->withHeader('Authorization', "Bearer {$tokenBefore}")
            ->getJson('/api/auth/me');

        $testOldToken->assertStatus(401);
    }

    /*
    |--------------------------------------------------------------------------
    | 3. IDOR / BOLA & Access Control Tests
    |--------------------------------------------------------------------------
    */

    public function test_student_cannot_view_another_students_assessment_attempt(): void
    {
        $attemptA = AssessmentAttempt::where('user_id', $this->studentA->id)->first();
        $this->assertNotNull($attemptA);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->getJson("/api/assessments/attempts/{$attemptA->id}");

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
                'message' => 'This action is unauthorized.',
            ]);
    }

    public function test_student_cannot_modify_answers_on_another_students_attempt(): void
    {
        $attemptA = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
        $question = AssessmentQuestion::active()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/assessments/attempts/{$attemptA->id}/answers", [
                'question_id' => $question->id,
                'selected_option' => $question->options[0]['value'],
            ]);

        $response->assertStatus(403);
    }

    public function test_student_cannot_batch_modify_answers_on_another_students_attempt(): void
    {
        $attemptA = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
        $question = AssessmentQuestion::active()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/assessments/attempts/{$attemptA->id}/answers/batch", [
                'answers' => [
                    [
                        'question_id' => $question->id,
                        'selected_option' => $question->options[0]['value'],
                    ],
                ],
            ]);

        $response->assertStatus(403);
    }

    public function test_student_cannot_submit_another_students_attempt(): void
    {
        $attemptA = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/assessments/attempts/{$attemptA->id}/submit");

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_another_students_orientation_result(): void
    {
        $resultA = OrientationResult::where('user_id', $this->studentA->id)->first();
        $this->assertNotNull($resultA);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->getJson("/api/assessments/results/{$resultA->id}");

        $response->assertStatus(403);
    }

    public function test_student_cannot_refresh_ai_insights_for_another_students_result(): void
    {
        $resultA = OrientationResult::where('user_id', $this->studentA->id)->first();
        $this->assertNotNull($resultA);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/assessments/results/{$resultA->id}/ai-insights");

        $response->assertStatus(403);
    }

    public function test_student_cannot_view_another_students_roadmap(): void
    {
        $roadmapA = Roadmap::where('user_id', $this->studentA->id)->first();
        $this->assertNotNull($roadmapA);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->getJson("/api/roadmaps/{$roadmapA->id}");

        $response->assertStatus(403);
    }

    public function test_student_cannot_modify_another_students_roadmap_task(): void
    {
        $roadmapA = Roadmap::where('user_id', $this->studentA->id)->first();
        $task = $roadmapA->tasks()->first();
        $this->assertNotNull($task);

        // Complete attempt by other student
        $completeResponse = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/complete");
        $completeResponse->assertStatus(403);

        // Progress update attempt by other student
        $progressResponse = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson("/api/roadmaps/tasks/{$task->id}/progress", [
                'status' => 'in_progress',
            ]);
        $progressResponse->assertStatus(403);
    }

    public function test_student_cannot_access_admin_subscription_endpoints(): void
    {
        // 1. List subscribers
        $listResponse = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->getJson('/api/admin/subscriptions');
        $listResponse->assertStatus(403);

        // 2. Activate premium
        $activateResponse = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/admin/users/{$this->studentB->id}/activate-premium");
        $activateResponse->assertStatus(403);

        // 3. Deactivate premium
        $deactivateResponse = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/admin/users/{$this->studentA->id}/deactivate-premium");
        $deactivateResponse->assertStatus(403);
    }

    public function test_admin_can_view_user_attempts_and_manage_subscriptions(): void
    {
        $adminToken = $this->adminUser->createToken('admin_token')->plainTextToken;

        // Admin can access subscription management
        $indexResponse = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/subscriptions');
        $indexResponse->assertStatus(200);

        // Admin can activate premium for studentB
        $actResponse = $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->postJson("/api/admin/users/{$this->studentB->id}/activate-premium", [
                'duration_months' => 6,
                'notes' => 'Audited payment verified',
            ]);
        $actResponse->assertStatus(200);

        $this->studentB->refresh();
        $this->assertEquals('premium', $this->studentB->subscription_status);
        $this->assertTrue($this->studentB->isPremium());
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Input Validation & DoS Protection Tests
    |--------------------------------------------------------------------------
    */

    public function test_batch_answers_rejects_oversized_payload(): void
    {
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
        $question = AssessmentQuestion::active()->first();

        // 51 answers (limit is 50)
        $oversizedAnswers = [];
        for ($i = 0; $i < 51; $i++) {
            $oversizedAnswers[] = [
                'question_id' => $question->id,
                'selected_option' => $question->options[0]['value'],
            ];
        }

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers/batch", [
                'answers' => $oversizedAnswers,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['answers']);
    }

    public function test_profile_update_rejects_oversized_bio(): void
    {
        Sanctum::actingAs($this->studentA);

        $response = $this->putJson('/api/auth/profile', [
            'bio' => str_repeat('A', 1001),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['bio']);
    }

    public function test_profile_update_rejects_oversized_skills_array(): void
    {
        Sanctum::actingAs($this->studentA);

        $oversizedSkills = array_fill(0, 51, 'PHP');

        $response = $this->putJson('/api/auth/profile', [
            'skills' => $oversizedSkills,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['skills']);
    }

    public function test_answer_submission_rejects_inactive_question(): void
    {
        $inactiveQuestion = AssessmentQuestion::create([
            'question_text' => 'Archived Question?',
            'category' => 'general',
            'question_type' => 'likert',
            'options' => [
                ['label' => 'Agree', 'value' => 'agree', 'score' => 4],
            ],
            'weight' => 1.0,
            'order' => 999,
            'is_active' => false,
        ]);

        $attempt = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers", [
                'question_id' => $inactiveQuestion->id,
                'selected_option' => 'agree',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['question_id']);
    }

    public function test_answer_submission_rejects_invalid_option_value(): void
    {
        $question = AssessmentQuestion::active()->first();
        $attempt = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/assessments/attempts/{$attempt->id}/answers", [
                'question_id' => $question->id,
                'selected_option' => 'totally_made_up_option_value_xyz',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['selected_option']);
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Business Logic Integrity Tests
    |--------------------------------------------------------------------------
    */

    public function test_cannot_submit_assessment_with_zero_answers(): void
    {
        $emptyAttempt = AssessmentAttempt::create([
            'user_id' => $this->studentA->id,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/assessments/attempts/{$emptyAttempt->id}/submit");

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error',
                'message' => 'Cannot submit an assessment attempt with 0 answered questions.',
            ]);
    }

    public function test_cannot_modify_answers_on_completed_assessment(): void
    {
        $completedAttempt = AssessmentAttempt::where('user_id', $this->studentA->id)
            ->where('status', 'completed')
            ->first();
        $this->assertNotNull($completedAttempt);
        $question = AssessmentQuestion::active()->first();

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->postJson("/api/assessments/attempts/{$completedAttempt->id}/answers", [
                'question_id' => $question->id,
                'selected_option' => $question->options[0]['value'],
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Cannot modify answers for an attempt that is already completed.',
            ]);
    }

    public function test_free_user_cannot_generate_premium_roadmap(): void
    {
        $career = CareerPath::first();

        $response = $this->withHeader('Authorization', "Bearer {$this->tokenB}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $career->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'status' => 'error',
            ]);
    }

    public function test_expired_premium_user_is_restricted_from_premium_features(): void
    {
        $expiredUser = User::factory()->student()->create([
            'subscription_status' => 'premium',
            'premium_activated_at' => now()->subMonths(2),
            'premium_expires_at' => now()->subDay(), // Expired yesterday
        ]);
        $expiredToken = $expiredUser->createToken('expired')->plainTextToken;

        $this->assertFalse($expiredUser->isPremium());

        $career = CareerPath::first();
        $response = $this->withHeader('Authorization', "Bearer {$expiredToken}")
            ->postJson('/api/roadmaps/generate', [
                'career_path_id' => $career->id,
            ]);

        $response->assertStatus(403);
    }

    /*
    |--------------------------------------------------------------------------
    | 6. Injection & Sensitive Data Exposure Tests
    |--------------------------------------------------------------------------
    */

    public function test_sql_injection_payloads_do_not_cause_sql_errors(): void
    {
        Sanctum::actingAs($this->studentA);

        $sqliPayload = "admin' OR '1'='1' -- /*";

        // Test in query parameters
        $response = $this->getJson("/api/admin/subscriptions?status={$sqliPayload}");
        $this->assertNotEquals(500, $response->getStatusCode());

        // Test in profile update
        $updateResponse = $this->putJson('/api/auth/profile', [
            'name' => "User {$sqliPayload}",
            'bio' => "Bio with {$sqliPayload}",
        ]);
        $this->assertNotEquals(500, $updateResponse->getStatusCode());
    }

    public function test_xss_payloads_in_inputs_are_handled_safely(): void
    {
        Sanctum::actingAs($this->studentA);

        $xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';

        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Safe User',
            'bio' => $xssPayload,
        ]);

        $response->assertStatus(200);

        $this->studentA->refresh();
        $this->assertEquals($xssPayload, $this->studentA->profile->bio);
    }

    public function test_user_endpoints_never_expose_password_or_tokens(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->tokenA}")
            ->getJson('/api/auth/me');

        $response->assertStatus(200);
        $json = $response->json('data');

        $this->assertArrayNotHasKey('password', $json);
        $this->assertArrayNotHasKey('remember_token', $json);
    }

    /*
    |--------------------------------------------------------------------------
    | 7. Rate Limiting Tests
    |--------------------------------------------------------------------------
    */

    public function test_auth_rate_limiting_triggers_429_after_limit(): void
    {
        $email = 'bruteforce_target@example.com';

        // 5 allowed attempts
        for ($i = 0; $i < 5; $i++) {
            $res = $this->postJson('/api/auth/login', [
                'email' => $email,
                'password' => 'WrongPassword123',
            ]);
            $this->assertEquals(401, $res->getStatusCode(), "Attempt $i should return 401");
        }

        // 6th attempt must trigger 429
        $throttled = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'WrongPassword123',
        ]);

        $throttled->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Too many authentication attempts. Please try again in 1 minute.',
            ]);
    }
}
