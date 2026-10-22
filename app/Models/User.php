<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'premium_activated_at' => 'datetime',
            'premium_expires_at' => 'datetime',
        ];
    }

    /**
     * Determine if user has active verified Premium subscription (or admin role).
     */
    public function isPremium(): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        if ($this->subscription_status !== 'premium') {
            return false;
        }

        if ($this->premium_expires_at && $this->premium_expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * User's detailed profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * User's assessment attempts.
     */
    public function assessmentAttempts(): HasMany
    {
        return $this->hasMany(AssessmentAttempt::class);
    }

    /**
     * Orientation results generated for this user.
     */
    public function orientationResults(): HasMany
    {
        return $this->hasMany(OrientationResult::class);
    }

    /**
     * Career roadmaps created for this user.
     */
    public function roadmaps(): HasMany
    {
        return $this->hasMany(Roadmap::class);
    }

    /**
     * User's progress tracking across roadmap tasks.
     */
    public function progressTrackings(): HasMany
    {
        return $this->hasMany(ProgressTracking::class);
    }
}
