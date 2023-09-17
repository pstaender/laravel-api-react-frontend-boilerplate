<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
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

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    if (!$user->email_verified_at) {
        throw ValidationException::withMessages([
            'email' => ['Please confirm e-mail'],
        ]);
    }

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    return $user->createToken($request->device_name)->plainTextToken;
});


Route::get('/verify-email/{id}/{hash}', function ($id, $hash) {
    $user = User::findOrFail($id);
    $email = $user->getEmailForVerification();
    if ($email && !$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
        // done -> redirect
        return redirect('/?email_confirmed=successful', 307);
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
