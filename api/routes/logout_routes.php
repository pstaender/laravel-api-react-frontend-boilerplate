<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')
    ->post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
    });
