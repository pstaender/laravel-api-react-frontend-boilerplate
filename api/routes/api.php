<?php

use App\Models\User;
use Egulias\EmailValidator\EmailValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;

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
    require_once __DIR__ . '/signup_routes.php';
    require_once __DIR__ . '/forgot_password_routes.php';
    require_once __DIR__ . '/logout_routes.php';
    require_once __DIR__ . '/delete_user_account_routes.php';

    Route::get('/healthz', function (Request $request) {
        // count users as db health check
        User::count();
        if ($request->get('locale')) {
            // this for "testing" the translations
            App::setLocale($request->get('locale'));
        }
        return [
            'status' => 'ok',
            'message' =>
                __('Welcome :name!', ['name' => $request->ip()]) .
                ' ' .
                __('Service is running. Grap a tea and relax.'),
        ];
    });

    Route::middleware('auth:sanctum')->get('/user', function (
        Request $request
    ) {
        return $request->user();
    });

    Route::middleware('auth:sanctum')->post('/user/two-factor-auth', function (
        Request $request
    ) {
        $user = $request->user();
        $tfa = App::make(
            'Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider'
        );
        $enable = new EnableTwoFactorAuthentication($tfa);
        $enable($user);
        return [
            'two_factor_recovery_codes' => $user->two_factor_recovery_codes,
            // 'two_factor_secret' => $user->two_factor_secret,
            'two_factor_qr_code_svg' => $user->two_factor_secret
                ? $user->twoFactorQrCodeSvg()
                : null,
            'two_factor_qr_code_svg_url' => $user->two_factor_secret
                ? $user->twoFactorQrCodeUrl()
                : null,
            'message' => __('Please confirm your two factor authentication'),
        ];

        return $user;
    });

    Route::middleware('auth:sanctum')->post(
        '/user/two-factor-auth/confirm',
        function (Request $request) {
            $user = $request->user();
            $tfa = App::make(
                'Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider'
            );
            $code = $request->input('code');
            $verified = $tfa->verify(decrypt($user->two_factor_secret), $code);
            $passwordIsValid = false;
            if ($request->input('password')) {
                // TODO: set new 2fa
            }
            if (empty($user->two_factor_confirmed_at) && $verified) {
                $user->forceFill([
                    'two_factor_confirmed_at' => now(),
                ])->save();
                TwoFactorAuthenticationConfirmed::dispatch($user);
                /*
                Dose not work?
                */
                /*
                $confirm = new \Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication(
                    $tfa
                );
                try {
                    $confirm($user, $code);
                } catch (ValidationException $e) {
                    return [
                        'is_confirmed' => $verified,
                        'confirmed_at' => null,
                        'error' => $e->getMessage(),
                    ];
                }
                */
            }
            return [
                'code_is_valid' => $verified,
                'confirmed_at' => $user->fresh()->two_factor_confirmed_at,
            ];
        }
    );
});
