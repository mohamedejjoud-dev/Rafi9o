<?php

namespace App\Policies;

use App\Models\Roadmap;
use App\Models\User;

class RoadmapPolicy
{
    /**
     * Determine whether the user can view the roadmap.
     */
    public function view(User $user, Roadmap $roadmap): bool
    {
        return $user->id === $roadmap->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the roadmap.
     */
    public function update(User $user, Roadmap $roadmap): bool
    {
        return $user->id === $roadmap->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the roadmap.
     */
    public function delete(User $user, Roadmap $roadmap): bool
    {
        return $user->id === $roadmap->user_id || $user->role === 'admin';
    }
}
