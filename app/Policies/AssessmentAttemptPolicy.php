<?php

namespace App\Policies;

use App\Models\AssessmentAttempt;
use App\Models\User;

class AssessmentAttemptPolicy
{
    /**
     * Determine whether the user can view the assessment attempt.
     */
    public function view(User $user, AssessmentAttempt $attempt): bool
    {
        return $user->id === $attempt->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the assessment attempt.
     */
    public function update(User $user, AssessmentAttempt $attempt): bool
    {
        return $user->id === $attempt->user_id;
    }

    /**
     * Determine whether the user can submit the assessment attempt.
     */
    public function submit(User $user, AssessmentAttempt $attempt): bool
    {
        return $user->id === $attempt->user_id && $attempt->status === 'in_progress';
    }
}
