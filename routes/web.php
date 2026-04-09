<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::middleware(['auth'])->group(function () {
//
//     Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
//
//     Route::middleware(['role:admin'])->group(function () {
//         Route::get('/admin', [DashboardController::class, 'admin'])->name('admin.dashboard');
//     });
//
//     Route::middleware(['role:investigator'])->group(function () {
//         Route::get('/investigator', [DashboardController::class, 'investigator'])->name('investigator.dashboard');
//     });
//
// });
//
// // Profile routes
// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });
//
// Route::middleware(['auth', 'role:admin'])->group(function () {
//     Route::get('/users', [UserController::class, 'index'])->name('users.index');
//     Route::post('/users', [UserController::class, 'store'])->name('users.store');
//     Route::put('/users/{id}', [UserController::class, 'update']);
//     Route::delete('/users/{id}', [UserController::class, 'destroy']);
// });

Route::middleware(['auth'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin', [DashboardController::class, 'admin'])->name('admin.dashboard');
    });

    Route::middleware(['role:investigator'])->group(function () {
        Route::get('/investigator', [DashboardController::class, 'investigator'])->name('investigator.dashboard');
    });

});

require __DIR__.'/auth.php';
