<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoadmapTask extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'roadmap_id',
        'title',
        'description',
        'stage',
        'order',
        'estimated_hours',
        'resource_links',
        'skills_covered',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'estimated_hours' => 'integer',
            'resource_links' => 'array',
            'skills_covered' => 'array',
        ];
    }

    /**
     * Scope a query to sort tasks by stage and order.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('stage')->orderBy('order');
    }

    /**
     * The roadmap this task belongs to.
     */
    public function roadmap(): BelongsTo
    {
        return $this->belongsTo(Roadmap::class);
    }

    /**
     * Progress tracking records across users for this task.
     */
    public function progressTrackings(): HasMany
    {
        return $this->hasMany(ProgressTracking::class);
    }
}
