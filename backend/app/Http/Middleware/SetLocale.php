<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * So'rovdagi tilni aniqlab, ilova locale'ini o'rnatadi.
 *
 * Til quyidagi tartibda aniqlanadi:
 *  1. ?lang=ru query parametri
 *  2. X-Locale header
 *  3. Accept-Language header
 *  4. Standart (config app.locale)
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('app.supported_locales', ['uz', 'ru', 'en']);
        $fallback = config('app.locale', 'uz');

        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $this->fromAcceptLanguage($request, $supported)
            ?? $fallback;

        if (! in_array($locale, $supported, true)) {
            $locale = $fallback;
        }

        app()->setLocale($locale);

        return $next($request);
    }

    private function fromAcceptLanguage(Request $request, array $supported): ?string
    {
        $header = $request->header('Accept-Language');

        if (! $header) {
            return null;
        }

        foreach (explode(',', $header) as $part) {
            $code = strtolower(trim(explode(';', $part)[0]));
            $code = substr($code, 0, 2);

            if (in_array($code, $supported, true)) {
                return $code;
            }
        }

        return null;
    }
}
