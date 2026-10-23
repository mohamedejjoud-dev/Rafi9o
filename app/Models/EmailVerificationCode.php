<?php

namespace App\Models;

use Database\Factories\EmailVerificationCodeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailVerificationCode extends Model
{
    /** @use HasFactory<EmailVerificationCodeFactory> */
    use HasFactory;

    public const MAX_ATTEMPTS = 5;

    public const CODE_TTL_MINUTES = 15;

    public const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'code',
        'attempts',
        'expires_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /**
     * Check if the verification code has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if maximum attempts have been exceeded.
     */
    public function hasExceededAttempts(): bool
    {
        return $this->attempts >= self::MAX_ATTEMPTS;
    }

    /**
     * Verify if the provided code matches and is valid.
     */
    public function isValid(string $candidate): bool
    {
        if ($this->isExpired() || $this->hasExceededAttempts()) {
            return false;
        }

        return hash_equals((string) $this->code, trim($candidate));
    }

    /**
     * Determine if a new code can be requested (cooldown check).
     */
    public function canResend(): bool
    {
        if (! $this->updated_at) {
            return true;
        }

        return $this->updated_at->addSeconds(self::RESEND_COOLDOWN_SECONDS)->isPast();
    }

    /**
     * Return seconds remaining until resend is allowed.
     */
    public function secondsUntilResend(): int
    {
        if (! $this->updated_at) {
            return 0;
        }

        $nextAllowed = $this->updated_at->addSeconds(self::RESEND_COOLDOWN_SECONDS);

        return $nextAllowed->isPast() ? 0 : (int) now()->diffInSeconds($nextAllowed, false);
    }
}
