<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CareerPath extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'industry',
        'average_salary_range',
        'growth_outlook',
        'required_skills',
        'recommended_education',
        'difficulty_level',
        'is_active',
        'order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'required_skills' => 'array',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Scope a query to only include active career paths.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Orientation results matching this career path.
     */
    public function orientationResults(): HasMany
    {
        return $this->hasMany(OrientationResult::class);
    }

    /**
     * Roadmaps associated with this career path.
     */
    public function roadmaps(): HasMany
    {
        return $this->hasMany(Roadmap::class);
    }
}
