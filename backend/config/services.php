<?php

return [

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Bildirishnoma kanallari (Telegram / SMS)
    |--------------------------------------------------------------------------
    */
    'telegram' => [
        'enabled' => env('TELEGRAM_ENABLED', false),
        'token' => env('TELEGRAM_BOT_TOKEN'),
    ],

    'eskiz' => [
        'enabled' => env('SMS_ENABLED', false),
        'email' => env('ESKIZ_EMAIL'),
        'password' => env('ESKIZ_PASSWORD'),
        'from' => env('ESKIZ_FROM', '4546'),
        'base_url' => env('ESKIZ_BASE_URL', 'https://notify.eskiz.uz/api'),
    ],

];
