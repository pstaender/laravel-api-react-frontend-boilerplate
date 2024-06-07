<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\Cors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->append(Cors::class);
        // disable CSFR token
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/*',
            'passwordless-login',
            'passwordless-login/token',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
