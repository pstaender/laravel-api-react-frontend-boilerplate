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
            'message' => __('Welcome :name!', ["name" => $request->ip()]) . ' ' . __('Service is running. Grap a tea and relax.')
        ];
    });

    Route::middleware('auth:sanctum')->get('/user', function (
        Request $request
    ) {
        return $request->user();
    });
});
