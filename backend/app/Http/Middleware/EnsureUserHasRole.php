<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Faqat ruxsat etilgan rol(lar)dagi foydalanuvchini o'tkazadi.
 *
 * Ishlatish: ->middleware('role:admin')
 *            ->middleware('role:admin,teacher')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Avtorizatsiya talab qilinadi.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Hisobingiz faol emas.'], 403);
        }

        if (! empty($roles) && ! $user->hasRole(...$roles)) {
            return response()->json([
                'message' => 'Bu amalni bajarishga ruxsatingiz yo\'q.',
            ], 403);
        }

        return $next($request);
    }
}
