<?php

namespace Tests\Feature;

use App\Mail\EmailVerificationCodeMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        RateLimiter::clear('auth');
    }

    public function test_user_can_register_successfully(): void
    {
        $payload = [
            'name' => 'Karim Idrissi',
            'email' => 'karim@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'education_level' => 'undergraduate',
            'field_of_study' => 'Computer Science',
            'target_role' => 'Full Stack Developer',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                        'profile',
                    ],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'name' => 'Karim Idrissi',
                        'email' => 'karim@example.com',
                        'role' => 'student',
                    ],
                    'token_type' => 'Bearer',
                ],
            ]);

        // Verify password is NOT exposed in response
        $this->assertArrayNotHasKey('password', $response->json('data.user'));

        // Verify user in DB
        $this->assertDatabaseHas('users', ['email' => 'karim@example.com']);
        $this->assertDatabaseHas('profiles', ['education_level' => 'undergraduate']);
    }

    public function test_registration_validation_fails_on_duplicate_email(): void
    {
        $payload = [
            'name' => 'Duplicate User',
            'email' => 'student@rafi9i.com', // Already seeded
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_validation_fails_on_short_password_or_mismatch(): void
    {
        $payload = [
            'name' => 'Weak Pass User',
            'email' => 'weak@example.com',
            'password' => 'short',
            'password_confirmation' => 'different',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $payload = [
            'email' => 'student@rafi9i.com',
            'password' => 'password123',
            'device_name' => 'test_runner',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'profile'],
                    'token',
                    'token_type',
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'email' => 'student@rafi9i.com',
                    ],
                    'token_type' => 'Bearer',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $payload = [
            'email' => 'student@rafi9i.com',
            'password' => 'wrong_password',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'The provided credentials do not match our records.',
            ]);
    }

    public function test_login_fails_with_unregistered_email(): void
    {
        $payload = [
            'email' => 'nonexistent@rafi9i.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/auth/login', $payload);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'The provided credentials do not match our records.',
            ]);
    }

    public function test_authenticated_user_can_retrieve_profile_via_me(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'email' => 'student@rafi9i.com',
                    'name' => 'Amine Bennani',
                ],
            ]);
    }

    public function test_unauthenticated_request_to_me_returns_401(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $token = $user->createToken('test_token')->plainTextToken;

        $payload = [
            'name' => 'Amine Bennani Updated',
            'phone' => '+212699887766',
            'bio' => 'Updated developer bio.',
            'target_role' => 'Senior Full Stack Engineer',
            'skills' => ['JavaScript', 'PHP', 'Laravel', 'React', 'Docker'],
            'preferred_language' => 'fr',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/auth/profile', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'name' => 'Amine Bennani Updated',
                    'profile' => [
                        'phone' => '+212699887766',
                        'bio' => 'Updated developer bio.',
                        'target_role' => 'Senior Full Stack Engineer',
                        'preferred_language' => 'fr',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', ['name' => 'Amine Bennani Updated']);
        $this->assertDatabaseHas('profiles', ['phone' => '+212699887766', 'target_role' => 'Senior Full Stack Engineer']);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::where('email', 'student@rafi9i.com')->first();
        $token = $user->createToken('logout_test_token')->plainTextToken;

        // Logout
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Successfully logged out.',
            ]);

        // Subsequent request with the revoked token must be rejected
        $this->app['auth']->forgetGuards();
        $followUp = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $followUp->assertStatus(401);
    }

    public function test_forgot_password_generates_token(): void
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'student@rafi9i.com',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'student@rafi9i.com',
        ]);
    }

    public function test_reset_password_updates_password_successfully(): void
    {
        $email = 'student@rafi9i.com';
        $plainToken = 'secret-test-token-12345';

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $email,
            'token' => $plainToken,
            'password' => 'NewPassword999',
            'password_confirmation' => 'NewPassword999',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Password has been successfully reset. Please log in with your new password.',
            ]);

        // Token must be deleted after use
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $email]);

        // Can login with new password
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'NewPassword999',
        ]);

        $loginResponse->assertStatus(200);
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $email = 'student@rafi9i.com';

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make('valid-token'),
                'created_at' => now(),
            ]
        );

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $email,
            'token' => 'invalid-token',
            'password' => 'NewPassword999',
            'password_confirmation' => 'NewPassword999',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => 'error',
                'message' => 'Invalid or expired password reset token.',
            ]);
    }

    public function test_auth_endpoints_are_rate_limited_after_repeated_attempts(): void
    {
        RateLimiter::clear('auth');

        $payload = [
            'email' => 'student@rafi9i.com',
            'password' => 'wrong_password',
        ];

        // 5 allowed attempts
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/auth/login', $payload);
            $this->assertNotEquals(429, $response->getStatusCode(), "Attempt $i should not be rate-limited yet.");
        }

        // 6th attempt should hit 429
        $throttled = $this->postJson('/api/auth/login', $payload);
        $throttled->assertStatus(429)
            ->assertJson([
                'status' => 'error',
                'message' => 'Too many authentication attempts. Please try again in 1 minute.',
            ]);
    }

    public function test_can_request_email_verification_code_via_smtp(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/send-verification-code', [
            'email' => 'newstudent@example.com',
            'name' => 'Sara Mansouri',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'message']);

        // Assert code was saved to database
        $this->assertDatabaseHas('email_verification_codes', [
            'email' => 'newstudent@example.com',
        ]);

        $record = EmailVerificationCode::where('email', 'newstudent@example.com')->first();
        $this->assertNotNull($record);
        $this->assertEquals(6, strlen($record->code));

        // Assert verification email was queued/sent via Mailable
        Mail::assertSent(EmailVerificationCodeMail::class, function (EmailVerificationCodeMail $mail) use ($record) {
            return $mail->hasTo('newstudent@example.com') && $mail->code === $record->code;
        });
    }

    public function test_request_email_verification_code_fails_if_email_is_already_registered(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/auth/send-verification-code', [
            'email' => 'student@rafi9i.com', // Seeded account
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        Mail::assertNothingSent();
    }

    public function test_request_email_verification_code_enforces_resend_cooldown(): void
    {
        Mail::fake();

        // 1st request
        $first = $this->postJson('/api/auth/send-verification-code', [
            'email' => 'cooldown@example.com',
        ]);
        $first->assertStatus(200);

        // Immediate 2nd request should hit cooldown (429)
        $second = $this->postJson('/api/auth/send-verification-code', [
            'email' => 'cooldown@example.com',
        ]);
        $second->assertStatus(429)
            ->assertJsonStructure(['status', 'message', 'errors' => ['retry_after']]);
    }

    public function test_can_verify_email_code_successfully(): void
    {
        $record = EmailVerificationCode::factory()->create([
            'email' => 'testverify@example.com',
            'code' => '458921',
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/auth/verify-code', [
            'email' => 'testverify@example.com',
            'code' => '458921',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);
    }

    public function test_verify_code_fails_on_incorrect_code_and_tracks_attempts(): void
    {
        EmailVerificationCode::factory()->create([
            'email' => 'testfail@example.com',
            'code' => '123456',
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
        ]);

        $response = $this->postJson('/api/auth/verify-code', [
            'email' => 'testfail@example.com',
            'code' => '999999',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);

        $updated = EmailVerificationCode::where('email', 'testfail@example.com')->first();
        $this->assertEquals(1, $updated->attempts);
    }

    public function test_user_can_register_with_valid_verification_code(): void
    {
        EmailVerificationCode::factory()->create([
            'email' => 'verified.student@example.com',
            'code' => '654321',
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
        ]);

        $payload = [
            'name' => 'Aya Bennani',
            'email' => 'verified.student@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'verification_code' => '654321',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'user' => [
                        'email' => 'verified.student@example.com',
                    ],
                ],
            ]);

        // Assert user email is verified
        $user = User::where('email', 'verified.student@example.com')->first();
        $this->assertNotNull($user->email_verified_at);

        // Assert code was deleted after successful registration
        $this->assertDatabaseMissing('email_verification_codes', [
            'email' => 'verified.student@example.com',
        ]);
    }

    public function test_registration_fails_with_invalid_verification_code(): void
    {
        EmailVerificationCode::factory()->create([
            'email' => 'invalid.code@example.com',
            'code' => '654321',
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
        ]);

        $payload = [
            'name' => 'Fake User',
            'email' => 'invalid.code@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'verification_code' => '000000', // Incorrect
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['verification_code']);

        $this->assertDatabaseMissing('users', ['email' => 'invalid.code@example.com']);
    }

    public function test_registration_requires_strong_password_with_letters_and_numbers(): void
    {
        // Only letters
        $resLettersOnly = $this->postJson('/api/auth/register', [
            'name' => 'User One',
            'email' => 'user1@example.com',
            'password' => 'onlyletters',
            'password_confirmation' => 'onlyletters',
        ]);
        $resLettersOnly->assertStatus(422)->assertJsonValidationErrors(['password']);

        // Only numbers
        $resNumbersOnly = $this->postJson('/api/auth/register', [
            'name' => 'User Two',
            'email' => 'user2@example.com',
            'password' => '123456789',
            'password_confirmation' => '123456789',
        ]);
        $resNumbersOnly->assertStatus(422)->assertJsonValidationErrors(['password']);

        // Too short (< 8 chars)
        $resTooShort = $this->postJson('/api/auth/register', [
            'name' => 'User Three',
            'email' => 'user3@example.com',
            'password' => 'Pass1',
            'password_confirmation' => 'Pass1',
        ]);
        $resTooShort->assertStatus(422)->assertJsonValidationErrors(['password']);
    }
}
