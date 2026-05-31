<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'message' => 'Camelot LMS API. /api ga murojaat qiling.',
        'version' => '1.0.0',
    ]);
});
