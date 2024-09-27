<?php

use App\Models\User;
use Egulias\EmailValidator\EmailValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;

Route::post('/signup', function (Request $request) {
    $request->validate([
        'email' => 'email|required',
        'password' => 'required|min:8',
    ]);

    $email = strtolower($request->input('email'));

    if (User::where(['email' => $email])->first()) {
        return response()->json(
            [
                'error' => __('E-Mail already exists'),
                'statusCode' => 409,
            ],
            409
        );
    }

    if ($request->input('password') === $request->input('email')) {
        return response()->json(
            [
                'error' => __('Password must be different than email'),
                'statusCode' => 409,
            ],
            409
        );
    }
    $user = User::create([
        'email' => $email,
        'password' => Hash::make($request->input('password')),
        'signup_device' => $request->userAgent(),
        'signup_ip' => $request->ip(),
    ]);
    $user->save();
    /**
     * https://laravel.com/docs/11.x/verification
     */
    event(new \Illuminate\Auth\Events\Registered($user));

    return [
        'message' => __(
            'Account created. Please confirm your e-mail before logging in'
        ),
    ];
});

Route::get('/signup/email_is_available/{email}', function (
    $email,
    Request $request
): array {
    sleep(0.5);
    $email = strtolower($email);
    $valid = (new EmailValidator())->isValid(
        $email,
        new \Egulias\EmailValidator\Validation\RFCValidation()
    );
    if (!$valid) {
        return [
            'email_is_available' => false,
            'email_is_valid' => false,
        ];
    }
    return [
        'email_is_available' => !(bool) User::where([
            'email' => $email,
        ])->first(),
        'email_is_valid' => true,
    ];
});

Route::post('/resend_email_verification/{email}', function ($email) {
    User::where(['email' => strtolower($email)])
        ->first()
        ->sendEmailVerificationNotification();
});
