<?php

// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\TransactionController;
// use App\Http\Controllers\UserController;

// Route::post('/transaction', [TransactionController::class, 'store']);

// Route::get('/test', function () {
//     return "API OK";
// });

// Route::post('/payment/callback', [TransactionController::class, 'callback']); // Webhook simulation
// Route::get('/transactions', [TransactionController::class, 'index']); // View transactions

// // ✅ API users
// Route::post('/users', [UserController::class, 'store']);
// Route::get('/users', [UserController::class, 'index']);
// Route::put('/users/{id}', [UserController::class, 'update']);
// Route::delete('/users/{id}', [UserController::class, 'destroy']);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;

// Transaction routes
Route::post('/transaction', [TransactionController::class, 'store']);
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/payment/callback', [TransactionController::class, 'callback']);

// User management API routes
Route::prefix('users')->group(function () {
    Route::post('/', [UserController::class, 'store']); // Create
    Route::get('/', [UserController::class, 'index']);  // List
    Route::put('/{id}', [UserController::class, 'update']); // Update
    Route::delete('/{id}', [UserController::class, 'destroy']); // Delete
});
// Temporary route to create first admin
Route::post('/setup-admin', [UserController::class, 'storeFirstAdmin']);

// Route::get('/test-email', function () {
//     \Mail::raw('Test Email Working!', function ($message) {
//         $message->to('anniedamianoe@gmail.com')
//                 ->subject('Test Email');
//     });

//     return "Email sent!";
// });