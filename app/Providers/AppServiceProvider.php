<?php

namespace App\Providers;

use Anthropic\Client as AnthropicClient;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AnthropicClient::class, function (): AnthropicClient {
            return new AnthropicClient(
                apiKey: (string) config('services.anthropic.api_key'),
                requestOptions: ['timeout' => (float) config('services.anthropic.timeout', 60)],
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiter for authentication endpoints (prevent brute-force attacks)
        RateLimiter::for('auth', function (Request $request) {
            $identifier = $request->input('email')
                ? Str::transliterate(Str::lower($request->input('email'))).'|'.$request->ip()
                : $request->ip();

            return Limit::perMinute(5)->by($identifier)->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many authentication attempts. Please try again in 1 minute.',
                ], 429, $headers);
            });
        });

        // Rate limiter for AI generation endpoints (OpenRouter token & usage management)
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip())->response(function (Request $request, array $headers) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Too many AI generation requests. Please wait a moment before trying again.',
                ], 429, $headers);
            });
        });

        // General API rate limiter
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
