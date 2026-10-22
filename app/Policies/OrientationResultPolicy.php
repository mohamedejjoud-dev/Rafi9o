<?php

namespace App\Policies;

use App\Models\OrientationResult;
use App\Models\User;

class OrientationResultPolicy
{
    /**
     * Determine whether the user can view the orientation result.
     */
    public function view(User $user, OrientationResult $result): bool
    {
        return $user->id === $result->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the orientation result.
     */
    public function update(User $user, OrientationResult $result): bool
    {
        return $user->id === $result->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the orientation result.
     */
    public function delete(User $user, OrientationResult $result): bool
    {
        return $user->id === $result->user_id || $user->role === 'admin';
    }
}
