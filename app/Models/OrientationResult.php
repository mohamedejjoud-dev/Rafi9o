<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrientationResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assessment_attempt_id',
        'user_id',
        'career_path_id',
        'match_percentage',
        'ranking',
        'ai_analysis',
        'strengths',
        'growth_areas',
        'recommendations',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'match_percentage' => 'decimal:2',
            'ranking' => 'integer',
            'strengths' => 'array',
            'growth_areas' => 'array',
            'recommendations' => 'array',
        ];
    }

    /**
     * Scope a query to sort by ranking.
     */
    public function scopeTopRanked(Builder $query): Builder
    {
        return $query->orderBy('ranking');
    }

    /**
     * The assessment attempt that generated this result.
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(AssessmentAttempt::class, 'assessment_attempt_id');
    }

    /**
     * The user this orientation result belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The recommended career path.
     */
    public function careerPath(): BelongsTo
    {
        return $this->belongsTo(CareerPath::class);
    }
}
