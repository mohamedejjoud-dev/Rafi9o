<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends BaseApiController
{
    /**
     * Register a new user account with profile and return access token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = new User;
            $user->forceFill([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
                'role' => $request->validated('role', 'student'),
            ])->save();

            // Create initial profile
            $user->profile()->create([
                'education_level' => $request->validated('education_level'),
                'field_of_study' => $request->validated('field_of_study'),
                'target_role' => $request->validated('target_role'),
                'preferred_language' => 'en',
            ]);

            return $user;
        });

        $user->load('profile');
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->created([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully.');
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
