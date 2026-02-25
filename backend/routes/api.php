<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ServiceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    // Auth: rate limit strict for login/register
    Route::middleware('throttle:5,1')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Services: list and show are public
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);

    // Protected: auth required
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::apiResource('services', ServiceController::class)->except(['index', 'show']);
        Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
    });
});
