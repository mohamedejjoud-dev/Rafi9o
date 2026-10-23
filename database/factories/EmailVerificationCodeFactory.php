<?php

namespace Database\Factories;

use App\Models\EmailVerificationCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmailVerificationCode>
 */
class EmailVerificationCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'code' => (string) fake()->numberBetween(100000, 999999),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(15),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'expires_at' => now()->subMinute(),
        ]);
    }

    public function maxAttempts(): static
    {
        return $this->state(fn () => [
            'attempts' => EmailVerificationCode::MAX_ATTEMPTS,
        ]);
    }
}
