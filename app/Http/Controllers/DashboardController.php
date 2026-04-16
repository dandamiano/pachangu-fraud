<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Transaction;

class DashboardController extends Controller
{
    // Default dashboard (redirect based on role)
    public function index(Request $request)
    {
        $role = $request->user()->role;

        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($role === 'investigator') {
            return redirect()->route('investigator.dashboard');
        }

        // Regular users go to portal (unified transaction interface)
        return redirect()->route('portal');
    }

    // Admin dashboard
    public function admin()
    {
        return Inertia::render('Admin/Dashboard', [
            'users' => User::all(),
            'transactions' => Transaction::latest()->take(10)->get(),
        ]);
    }

    // Investigator dashboard
    public function investigator()
    {
        $transactions = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true);
        })->with(['fraudLog', 'user'])->latest()->get();

        $stats = [
            'total_flagged' => $transactions->count(),
            'high_risk' => $transactions->where('fraudLog.risk_score', '>', 70)->count(),
            'pending_review' => $transactions->where('status', 'pending_review')->count(),
            'approved' => $transactions->where('status', 'completed')->count(),
        ];

        return Inertia::render('Investigator/Dashboard', [
            'transactions' => $transactions,
            'stats' => $stats
        ]);
    }

    // Investigator reports
    public function investigatorReports()
    {
        // Get fraud statistics
        $totalFlagged = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true);
        })->count();

        $highRiskCases = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true)->where('risk_score', '>', 70);
        })->count();

        $approvedCases = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true);
        })->where('status', 'completed')->count();

        $rejectedCases = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true);
        })->where('status', 'rejected')->count();

        $pendingCases = Transaction::whereHas('fraudLog', function ($q) {
            $q->where('is_fraud', true);
        })->where('status', 'pending_review')->count();

        // Monthly statistics for the last 6 months
        $monthlyStats = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M Y');

            $flagged = Transaction::whereHas('fraudLog', function ($q) {
                $q->where('is_fraud', true);
            })->whereYear('created_at', $date->year)
              ->whereMonth('created_at', $date->month)
              ->count();

            $approved = Transaction::whereHas('fraudLog', function ($q) {
                $q->where('is_fraud', true);
            })->where('status', 'completed')
              ->whereYear('created_at', $date->year)
              ->whereMonth('created_at', $date->month)
              ->count();

            $rejected = Transaction::whereHas('fraudLog', function ($q) {
                $q->where('is_fraud', true);
            })->where('status', 'rejected')
              ->whereYear('created_at', $date->year)
              ->whereMonth('created_at', $date->month)
              ->count();

            $monthlyStats[] = [
                'month' => $monthName,
                'flagged' => $flagged,
                'approved' => $approved,
                'rejected' => $rejected,
            ];
        }

        return Inertia::render('Investigator/Reports', [
            'totalFlagged' => $totalFlagged,
            'highRiskCases' => $highRiskCases,
            'approvedCases' => $approvedCases,
            'rejectedCases' => $rejectedCases,
            'pendingCases' => $pendingCases,
            'monthlyStats' => $monthlyStats,
        ]);
    }
}
