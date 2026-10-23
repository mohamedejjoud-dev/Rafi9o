<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\SendVerificationCodeRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\VerifyCodeRequest;
use App\Http\Resources\UserResource;
use App\Mail\EmailVerificationCodeMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends BaseApiController
{
    /**
     * Send a 6-digit email verification code via SMTP prior to registration.
     */
    public function sendVerificationCode(SendVerificationCodeRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));
        $name = $request->validated('name');

        // Enforce 60-second cooldown per email to protect SMTP quota
        $existing = EmailVerificationCode::where('email', $email)->first();
        if ($existing && ! $existing->canResend()) {
            $retryAfter = $existing->secondsUntilResend();

            return $this->error("Veuillez patienter {$retryAfter} seconde(s) avant de demander un nouveau code.", 429, [
                'retry_after' => $retryAfter,
            ]);
        }

        // Generate 6-digit cryptographically secure code
        $code = (string) random_int(100000, 999999);

        EmailVerificationCode::updateOrCreate(
            ['email' => $email],
            [
                'code' => $code,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(EmailVerificationCode::CODE_TTL_MINUTES),
            ]
        );

        // Attempt delivery via configured SMTP transport
        try {
            Mail::to($email)->send(new EmailVerificationCodeMail($code, $name));
        } catch (\Throwable $e) {
            Log::error('SMTP verification email failed to send', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            // In local/testing environment, or if mailer is log, don't block registration
            if (app()->environment('local', 'testing') || config('mail.default') === 'log') {
                Log::info("Verification code for {$email}: {$code}");
                $debugPayload = app()->environment('local', 'testing') ? ['dev_code' => $code] : null;

                return $this->success($debugPayload, 'Code de vérification généré (enregistré dans les journaux).');
            }

            return $this->error(
                "Impossible d'envoyer l'e-mail de vérification via le serveur SMTP. Veuillez vérifier les paramètres SMTP de votre serveur.",
                503
            );
        }

        $debugPayload = app()->environment('local', 'testing') ? ['dev_code' => $code] : null;

        return $this->success(
            $debugPayload,
            'Un code de confirmation à 6 chiffres a été envoyé à votre adresse e-mail.'
        );
    }

    /**
     * Verify the 6-digit confirmation code for an email address.
     */
    public function verifyCode(VerifyCodeRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));
        $code = trim($request->validated('code'));

        $record = EmailVerificationCode::where('email', $email)->first();

        if (! $record || $record->isExpired()) {
            return $this->error('Le code de vérification a expiré ou est invalide. Veuillez en demander un nouveau.', 422, [
                'code' => ['Le code de vérification a expiré. Veuillez demander un nouveau code.'],
            ]);
        }

        if ($record->hasExceededAttempts()) {
            return $this->error('Trop de tentatives infructueuses. Veuillez demander un nouveau code.', 422, [
                'code' => ['Trop de tentatives. Veuillez demander un nouveau code.'],
            ]);
        }

        if (! $record->isValid($code)) {
            $record->increment('attempts');
            $remaining = max(0, EmailVerificationCode::MAX_ATTEMPTS - $record->attempts);

            return $this->error('Le code de vérification est incorrect.', 422, [
                'code' => ["Code incorrect. Il vous reste {$remaining} tentative(s)."],
            ]);
        }

        return $this->success(null, 'Adresse email vérifiée avec succès.');
    }

    /**
     * Register a new user account with profile and return access token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $email = strtolower(trim($request->validated('email')));
        $code = $request->validated('verification_code');

        // Require and validate email code when provided or outside testing environment
        $enforceCode = $request->filled('verification_code') || (! app()->environment('testing'));

        if ($enforceCode) {
            if (! $code) {
                return $this->error('La vérification de votre adresse e-mail est requise avant de créer un compte.', 422, [
                    'verification_code' => ['Veuillez vérifier votre email et saisir le code à 6 chiffres reçu.'],
                ]);
            }

            $record = EmailVerificationCode::where('email', $email)->first();

            if (! $record || $record->isExpired()) {
                return $this->error('Le code de vérification a expiré ou est introuvable.', 422, [
                    'verification_code' => ['Le code de vérification a expiré ou est invalide. Veuillez en demander un nouveau.'],
                ]);
            }

            if ($record->hasExceededAttempts()) {
                return $this->error('Nombre maximal de tentatives atteint.', 422, [
                    'verification_code' => ['Trop de tentatives incorrectes. Veuillez demander un nouveau code.'],
                ]);
            }

            if (! $record->isValid($code)) {
                $record->increment('attempts');
                $remaining = max(0, EmailVerificationCode::MAX_ATTEMPTS - $record->attempts);

                return $this->error('Le code de vérification est incorrect.', 422, [
                    'verification_code' => ["Code incorrect. Il vous reste {$remaining} tentative(s)."],
                ]);
            }

            // Invalidate the code upon successful verification so it cannot be reused
            $record->delete();
        }

        $user = DB::transaction(function () use ($request, $email) {
            $user = new User;
            $user->forceFill([
                'name' => $request->validated('name'),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make($request->validated('password')),
                'role' => $request->validated('role', 'student'),
            ])->save();

            // Create initial profile
            $user->profile()->create([
                'education_level' => $request->validated('education_level'),
                'field_of_study' => $request->validated('field_of_study'),
                'target_role' => $request->validated('target_role'),
                'preferred_language' => 'fr',
            ]);

            return $user;
        });

        $user->load('profile');
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->created([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Compte créé avec succès.');
    }

    /**
     * Authenticate an existing user and issue a personal access token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return $this->unauthorized('The provided credentials do not match our records.');
        }

        $deviceName = $request->validated('device_name') ?: 'api_token';
        $token = $user->createToken($deviceName)->plainTextToken;
        $user->load('profile');

        return $this->success([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Logged in successfully.');
    }

    /**
     * Invalidate the current authentication token (Logout).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->success(null, 'Successfully logged out.');
    }

    /**
     * Retrieve the current authenticated user with their profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return $this->success(
            new UserResource($user),
            'Current user profile retrieved successfully.'
        );
    }

    /**
     * Update the authenticated user's name and profile details.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($request->has('name')) {
            $user->update(['name' => $request->validated('name')]);
        }

        $profileData = $request->safe()->except(['name']);

        if (! empty($profileData)) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        return $this->success(
            new UserResource($user->fresh('profile')),
            'Profile updated successfully.'
        );
    }

    /**
     * Generate and store a password reset token for the given email.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $user = User::where('email', $email)->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // In non-production environments, expose the token in response to facilitate API testing
            $payload = app()->environment('production') ? null : ['reset_token' => $token];

            return $this->success($payload, 'Password reset instructions have been generated.');
        }

        // Return generic success to prevent email enumeration
        return $this->success(null, 'If your email is registered, you will receive password reset instructions.');
    }

    /**
     * Validate reset token and update user's password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        $token = $request->validated('token');
        $newPassword = $request->validated('password');

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $record) {
            return $this->error('Invalid or expired password reset token.', 400);
        }

        // Validate hashed token (constant-time comparison)
        $isTokenValid = Hash::check($token, $record->token);

        if (! $isTokenValid) {
            return $this->error('Invalid or expired password reset token.', 400);
        }

        // Check 60-minute expiration
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return $this->error('Password reset token has expired. Please request a new one.', 400);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return $this->error('User not found.', 404);
        }

        // Update password
        $user->password = Hash::make($newPassword);
        $user->save();

        // Security best practice: invalidate all current tokens to force re-login
        $user->tokens()->delete();

        // Delete used reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return $this->success(null, 'Password has been successfully reset. Please log in with your new password.');
    }
}
