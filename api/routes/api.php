<?php

use App\Models\User;
use Egulias\EmailValidator\EmailValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::group(['prefix' => 'v1'], function () {
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });

    Route::middleware('auth:sanctum')
        ->post('/logout', function (Request $request) {
            $request->user()->currentAccessToken()->delete();
        });

    Route::post('/signup', function (Request $request) {
        $request->validate([
            'email' => 'email|required',
            'password' => 'required|min:8',
        ]);
        if (User::where(['email' => $request->input('email')])->first()) {
            return response()->json([
                'error' => 'Email already exists',
                'statusCode' => 409
            ], 409);
        }
        if ($request->input('password') === $request->input('email')) {
            return response()->json([
                'error' => 'Password must be different than email',
                'statusCode' => 409
            ], 409);
        }
        $user = User::create([
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'signup_device' => $request->userAgent(),
        ]);
        $user->save();
        // https://laravel.com/docs/10.x/verification
        event(new \Illuminate\Auth\Events\Registered($user));
        return [
            'message' => 'Signup created. Please confirm your e-mail before logging in',
            'user' => new UserResource($user)
        ];
    });

    Route::get(
        '/signup/email_is_available/{email}',
        function ($email, Request $request): array {
            sleep(.5);
            $valid = (new EmailValidator())->isValid($email, new \Egulias\EmailValidator\Validation\RFCValidation());
            if (!$valid) {
                return [
                    'email_is_available' => false,
                    'email_is_valid' => false,
                ];
            };
            return [
                'email_is_available' => !(bool)User::where(['email' => $email])->first(),
                'email_is_valid' => true,
            ];
        }
    );

    Route::post('/resend_email_verification/{email}', function ($email) {
        User::where(['email' => $email])->first()->sendEmailVerificationNotification();
    });

    Route::middleware('auth:sanctum')
        ->delete('/account', function (Request $request) {
            $user = $request->user();
            if (!\Illuminate\Support\Facades\Hash::check($request->input('password'), $user->password)) {
                return response()->json([
                    'error' => 'The password did not match',
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


    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);
        $status = Password::sendResetLink(
            $request->only('email')
        );
        return [
            'status' => $status,
        ];
    })->name('password.email');

    Route::get('/healthz', function (Request $request) {
        // check that db is available
        User::count();
        return ['status' => 'ok'];
    });
});
