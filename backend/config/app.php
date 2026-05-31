<?php

return [

    'name' => env('APP_NAME', 'Mebel Shop'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost'),

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

    'timezone' => env('APP_TIMEZONE', 'UTC'),

    'locale' => env('APP_LOCALE', 'uz'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'ru'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Qo'llab-quvvatlanadigan tillar
    |--------------------------------------------------------------------------
    | Ko'p tilli kontent (mahsulot nomi, tavsifi va h.k.) shu tillarda
    | saqlanadi va qaytariladi. SetLocale middleware shu ro'yxatga tayanadi.
    */
    'supported_locales' => array_filter(
        explode(',', env('APP_SUPPORTED_LOCALES', 'uz,ru,en'))
    ),

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
