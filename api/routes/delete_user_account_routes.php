<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')
    ->delete('/account', function (Request $request) {
        $user = $request->user();
        if (!\Illuminate\Support\Facades\Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'error' => __('The password did not match'),
                'statusCode' => 409
            ], 409);
        }
        \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
            $user->personalAccessTokens()->delete();
            $user->delete();
        });

        return [
            'status' => 'deleted'
        ];
    });
