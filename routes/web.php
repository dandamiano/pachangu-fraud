<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
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

Route::middleware(['auth'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports', [
            'totalTransactions' => \App\Models\Transaction::count(),
            'fraudCases' => \App\Models\Transaction::whereHas('fraudLog', function($q) {
                $q->where('is_fraud', true);
            })->count(),
            'totalUsers' => \App\Models\User::count(),
        ]);
    })->name('reports.index');
});

require __DIR__.'/auth.php';
