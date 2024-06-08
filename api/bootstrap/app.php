<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\Cors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: __DIR__ . '/../routes/health.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        /**
         * disable CORS on '*' (enables SPA)
         */
        $middleware->append(Cors::class);
        /**
         * disable CSFR token (enables SPA)
         */
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/*',
            /**
             * if you use passwordless login (optional)
             */
            'passwordless-login',
            'passwordless-login/token',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
    })->create();
