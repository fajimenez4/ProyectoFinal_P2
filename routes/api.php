<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;



Route::apiResource('productos', ProductoController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/users', [UserController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});

// 19|16aIZjMSotmwyvMnl8fLgT92rTT7hdh6Q9MKtiLn12d360b6


