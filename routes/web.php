<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\PortalController;
use App\Models\FraudLog;
use App\Models\Transaction;
use App\Models\User;
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

    // Portal is now the main user interface
    Route::get('/portal', [PortalController::class, 'index'])->name('portal');
    Route::post('/portal/submit', [PortalController::class, 'submit']);
    Route::post('/portal/retry/{id}', [PortalController::class, 'retry'])->name('portal.retry');

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin', [DashboardController::class, 'admin'])->name('admin.dashboard');
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('/reports', [ReportController::class, 'adminReports'])->name('reports.index');
    });

    Route::middleware(['role:investigator'])->group(function () {
        Route::get('/investigator', [DashboardController::class, 'investigator'])->name('investigator.dashboard');
        Route::get('/investigator/reports', [ReportController::class, 'investigatorReports'])->name('investigator.reports');
    });

    Route::get('/reports/{type}/download', [ReportController::class, 'download'])->name('reports.download');
});

// Transaction approval/rejection routes
Route::middleware(['auth', 'role:investigator|admin'])->group(function () {
    Route::post('/transactions/{id}/approve', [TransactionController::class, 'approve']);
    Route::post('/transactions/{id}/reject', [TransactionController::class, 'reject']);
});

require __DIR__.'/auth.php';
