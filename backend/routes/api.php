<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowRecordController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FineController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Any logged-in user
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
    Route::apiResource('books', BookController::class)->only(['index', 'show']);
    Route::apiResource('borrow-records', BorrowRecordController::class)
        ->only(['index', 'store', 'show', 'destroy']);
    Route::get('/fines', [FineController::class, 'index']);

    // Librarian (admin) only
    Route::middleware('admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('books', BookController::class)->only(['store', 'update', 'destroy']);
        Route::patch('/borrow-records/{borrowRecord}/status', [BorrowRecordController::class, 'updateStatus']);
        Route::patch('/fines/{fine}/pay', [FineController::class, 'pay']);
    });
});