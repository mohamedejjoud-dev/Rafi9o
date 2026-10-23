<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromHeader
{
    /**
     * Locales supported by the API. The first one is the default.
     *
     * @var list<string>
     */
    public const SUPPORTED_LOCALES = ['fr', 'en', 'ar', 'ary'];

    /**
     * Apply the locale requested through the X-Locale header, falling back to French.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestedLocale = strtolower(trim((string) $request->header('X-Locale', '')));

        App::setLocale(
            in_array($requestedLocale, self::SUPPORTED_LOCALES, true) ? $requestedLocale : self::SUPPORTED_LOCALES[0]
        );

        return $next($request);
    }
}
