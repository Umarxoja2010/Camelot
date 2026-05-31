<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Token-based auth (Bearer) ishlatamiz — statefulApi() KERAK EMAS
        // (aks holda frontend domenidan POST so'rovlar CSRF xatosini beradi).

        // Til (locale) ni so'rovdagi Accept-Language yoki ?lang orqali aniqlash
        $middleware->api(prepend: [
            \App\Http\Middleware\SetLocale::class,
        ]);

        // role:admin , role:teacher , role:admin,teacher ko'rinishida ishlatiladi
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
