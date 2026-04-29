<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
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
        Route::get('/reports', function () {
            $totalTransactions = Transaction::count();
            $fraudCases = Transaction::whereHas('fraudLog', fn($q) => $q->where('is_fraud', true))->count();
            $totalUsers = User::count();
            $approvedCount = Transaction::where('status', 'Approved')->count();
            $rejectedCount = Transaction::where('status', 'Rejected')->count();

            $monthlyTrendData = Transaction::leftJoin('fraud_logs', 'transactions.id', '=', 'fraud_logs.transaction_id')
                ->selectRaw("DATE_FORMAT(transactions.created_at, '%b') as month")
                ->selectRaw('count(distinct transactions.id) as transactions')
                ->selectRaw('sum(case when fraud_logs.is_fraud = 1 then 1 else 0 end) as fraud')
                ->groupBy('month')
                ->orderByRaw('min(transactions.created_at)')
                ->get()
                ->map(fn($row) => [
                    'month' => $row->month,
                    'transactions' => (int) $row->transactions,
                    'fraud' => (int) $row->fraud,
                ])
                ->toArray();

            $fraudLocationData = Transaction::select('location')
                ->selectRaw('count(*) as fraud')
                ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true))
                ->groupBy('location')
                ->orderByDesc('fraud')
                ->limit(5)
                ->get()
                ->map(fn($row) => [
                    'location' => $row->location ?: 'Unknown',
                    'fraud' => (int) $row->fraud,
                ])
                ->toArray();

            $amountRangeData = Transaction::whereHas('fraudLog', fn($q) => $q->where('is_fraud', true))
                ->selectRaw("case when amount <= 100 then '$0-100' when amount <= 500 then '$100-500' when amount <= 1000 then '$500-1K' else '$1K+' end as amount_range")
                ->selectRaw('count(*) as cases')
                ->groupBy('amount_range')
                ->orderByRaw("case when amount <= 100 then 1 when amount <= 500 then 2 when amount <= 1000 then 3 else 4 end")
                ->get()
                ->map(fn($row) => [
                    'range' => $row->amount_range,
                    'cases' => (int) $row->cases,
                ])
                ->toArray();

            $riskScoreData = FraudLog::selectRaw("case when risk_score >= 70 then 'High Risk' when risk_score >= 40 then 'Medium Risk' else 'Low Risk' end as name")
                ->selectRaw('count(*) as value')
                ->groupBy('name')
                ->orderByRaw("case when name = 'High Risk' then 1 when name = 'Medium Risk' then 2 else 3 end")
                ->get()
                ->map(fn($row) => [
                    'name' => $row->name,
                    'value' => (int) $row->value,
                ])
                ->toArray();

            $transactions = Transaction::with(['user', 'fraudLog'])
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn($txn) => [
                    'id' => "TXN-{$txn->id}",
                    'user' => $txn->user?->name ?: 'Unknown',
                    'amount' => (float) $txn->amount,
                    'location' => $txn->location ?: 'Unknown',
                    'risk' => $txn->fraudLog
                        ? ($txn->fraudLog->risk_score >= 70
                            ? 'High'
                            : ($txn->fraudLog->risk_score >= 40 ? 'Medium' : 'Low'))
                        : 'Unknown',
                    'status' => $txn->status,
                    'date' => $txn->created_at->format('Y-m-d'),
                ])
                ->toArray();

            return Inertia::render('Admin/Reports', [
                'totalTransactions' => $totalTransactions,
                'fraudCases' => $fraudCases,
                'totalUsers' => $totalUsers,
                'approvedCount' => $approvedCount,
                'rejectedCount' => $rejectedCount,
                'monthlyTrendData' => $monthlyTrendData,
                'fraudLocationData' => $fraudLocationData,
                'amountRangeData' => $amountRangeData,
                'riskScoreData' => $riskScoreData,
                'transactions' => $transactions,
            ]);
        })->name('reports.index');
    });

    Route::middleware(['role:investigator'])->group(function () {
        Route::get('/investigator', [DashboardController::class, 'investigator'])->name('investigator.dashboard');
        Route::get('/investigator/reports', [DashboardController::class, 'investigatorReports'])->name('investigator.reports');
    });
});

// Transaction approval/rejection routes
Route::middleware(['auth', 'role:investigator|admin'])->group(function () {
    Route::post('/transactions/{id}/approve', [TransactionController::class, 'approve']);
    Route::post('/transactions/{id}/reject', [TransactionController::class, 'reject']);
});

require __DIR__.'/auth.php';
