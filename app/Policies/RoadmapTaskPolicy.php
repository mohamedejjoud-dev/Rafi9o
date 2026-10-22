<?php

namespace App\Policies;

use App\Models\RoadmapTask;
use App\Models\User;

class RoadmapTaskPolicy
{
    /**
     * Determine whether the user can view the roadmap task.
     */
    public function view(User $user, RoadmapTask $task): bool
    {
        $task->loadMissing('roadmap');

        return $task->roadmap !== null && ($user->id === $task->roadmap->user_id || $user->role === 'admin');
    }

    /**
     * Determine whether the user can update the roadmap task.
     */
    public function update(User $user, RoadmapTask $task): bool
    {
        $task->loadMissing('roadmap');

        return $task->roadmap !== null && ($user->id === $task->roadmap->user_id || $user->role === 'admin');
    }

    /**
     * Determine whether the user can delete the roadmap task.
     */
    public function delete(User $user, RoadmapTask $task): bool
    {
        $task->loadMissing('roadmap');

        return $task->roadmap !== null && ($user->id === $task->roadmap->user_id || $user->role === 'admin');
    }
}
