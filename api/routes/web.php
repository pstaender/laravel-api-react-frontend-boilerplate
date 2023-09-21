<?php

use App\Models\LoginCode;
use App\Models\LoginCodeAttempt;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

function validateEmailAndPassword(string $email, string $password)
{
    $email = strtolower($email);
    $user = User::where('email', $email)->first();

    if (!$user) {
        throw ValidationException::withMessages([
            'email' => [__('The provided credentials are incorrect')],
        ]);
    }

    if (!$user->email_verified_at) {
        throw ValidationException::withMessages([
            'email' => [__('Please confirm your e-mail-address first')],
        ]);
    }

    $verified = \Illuminate\Support\Facades\Auth::attempt([
        'email' => $email,
        'password' => $password
    ]);

    if ($verified) {
        return $user;
    }

    throw ValidationException::withMessages([
        'email' => [__('The provided credentials are incorrect')],
    ]);
}

Route::get('/', function () {
    return view('welcome');
});

// login
Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);
    $user = validateEmailAndPassword($request->email, $request->password);
    return $user ? $user->createToken($request->device_name)->plainTextToken : null;
});

Route::post('/passwordless-login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'device_name' => 'required',
    ]);
    $user = User::where('email', strtolower($request->email))->first();
    if ($user && $user->hasVerifiedEmail() && $user->validLoginCodes()->count() < 10 && LoginCodeAttempt::where(['user_id' => $user->id])->whereTime('created_at', '>=', Carbon::now()->subMinutes(5))->count() < 10) {
        (new LoginCodeAttempt(['user_id' => $user->id]))->save();
        LoginCode::createLoginCodeAndNotifyUser(
            user: $user,
            device_name: $request->device_name,
            validInMinutes: 5,
            codeLength: 4,
            ip: $request->ip()
        );
    }
    return [
        'message' => __('If you have signed up correctly, you have now received a login code'),
    ];
});

Route::post('/passwordless-login/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'code' => 'required',
        'device_name' => 'required',
    ]);
    // check that not more than x are generated in the last 5 minutes
    $user = User::where('email', '=', $request->email)->first();
    if ($user && $user->hasVerifiedEmail()) {

        $validCodes = $user->validLoginCodes()->where([
            'code' => $request->code,
            'device_name' => $request->device_name,
        ]);

        $loginCode = $validCodes->first();

        (new LoginCodeAttempt([
            'user_id' => $user->id,
        ]))->save();

        if (LoginCodeAttempt::where(['user_id' => $user->id])->whereTime('created_at', '>=', Carbon::now()->subMinutes(5))->count() >= 10) {
            throw ValidationException::withMessages([
                'code' => [__('Too many login attempts')],
            ]);
        }

        if ($loginCode) {
            // invalidate login code(s)
            $validCodes->update(['valid_until' => Carbon::now()->subDay()]);
            return [
                'token' => $user->createToken($request->device_name)->plainTextToken,
            ];
        }
    }
    throw ValidationException::withMessages([
        'code' => [__('Code or e-mail is invalid')],
    ]);
});

Route::get('/verify-email/{id}/{hash}', function ($id, $hash, Request $request) {
    $user = User::findOrFail($id);
    $email = $user->getEmailForVerification();


    $createInitialSessionForLoginAndRedirectToFrontend = function ($user, Request $request, bool $removeIpAndDeviceFromUserSignup = false) {
        $userAgent = $request->device_name ?: ($request->userAgent() ?: 'unknown');
        $signupIp = $user->signup_ip;
        $signupDevice = $user->signup_device;
        if ($removeIpAndDeviceFromUserSignup) {
            $user->signup_ip = $user->signup_device = null;
            $user->save();
        }
        if ($signupIp !== $request->ip() || $signupDevice !== $userAgent) {
            return redirect(
                env('FRONTEND_URL', '') . '/?emailConfirmed=✓',
                307
            );
        }
        return redirect(
            env('FRONTEND_URL', '') . '/?authToken=' . $user->createToken($userAgent)->plainTextToken,
            307
        );
    };


    if ($email && !$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));

        return $createInitialSessionForLoginAndRedirectToFrontend(
            user: $user,
            request: $request,
            removeIpAndDeviceFromUserSignup: true
        );
        // return redirect('/?email_confirmed=successful', 307);
    }

    return redirect(env('REDIRECT_TO_IF_NOT_AUTHENTICATE', '/?from=invalid_email_confirm'), 307);
})->middleware(['signed'])->name('verification.verify');

Route::get('/reset-password/{token}', function ($token, Request $request) {
    return view('auth.reset-password', [
        'token' => $token,
        'request' =>  $request,
    ]);
})->middleware('guest')->name('password.reset');

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
    );

    return $status === Password::PASSWORD_RESET ? redirect('/login?password_reset_successfull') : back()->withErrors(['email' => [__($status)]]);
})->middleware('guest')->name('password.update');
