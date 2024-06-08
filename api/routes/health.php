<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health/up', function (Request $request) {
    // check that db is available
    User::count();
    return ['status' => 'ok'];
});
