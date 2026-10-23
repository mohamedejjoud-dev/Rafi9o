<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsPremium
{
    /**
     * Reject the request unless the authenticated user has an active Premium subscription.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isPremium()) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'code' => 'premium_required',
                'message' => 'This feature requires an active Premium subscription.',
            ], 403);
        }

        return $next($request);
    }
}
