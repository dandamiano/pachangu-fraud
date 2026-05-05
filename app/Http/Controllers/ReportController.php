<?php

namespace App\Http\Controllers;

use App\Models\FraudLog;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function adminReports(Request $request)
    {
        return Inertia::render('Admin/Reports', $this->getAdminReportData());
    }

    public function investigatorReports(Request $request)
    {
        return Inertia::render('Investigator/Reports', $this->getInvestigationReportData());
    }

    public function download(Request $request, string $type)
    {
        $user = $request->user();
        $role = $user?->role;
        $allowedAdmin = ['fraud-summary', 'suspicious-activity', 'risk-distribution'];
        $allowedInvestigator = ['investigation-report', 'high-risk-cases'];

        if ($role === 'admin' && !in_array($type, $allowedAdmin, true)) {
            abort(403);
        }

        if ($role === 'investigator' && !in_array($type, $allowedInvestigator, true)) {
            abort(403);
        }

        if ($role !== 'admin' && $role !== 'investigator') {
            abort(403);
        }

        $range = $this->parseDateRange($request);
        $title = $this->getReportTitle($type);
        $filename = sprintf('%s_%s.pdf', str_replace(' ', '_', strtolower($title)), now()->format('Ymd_His'));

        $data = match ($type) {
            'fraud-summary' => array_merge($this->getAdminReportData($range), ['reportTitle' => $title, 'dateRange' => $range['label']]),
            'suspicious-activity' => array_merge($this->getSuspiciousActivityData($range), ['reportTitle' => $title, 'dateRange' => $range['label']]),
            'risk-distribution' => array_merge($this->getRiskDistributionData($range), ['reportTitle' => $title, 'dateRange' => $range['label']]),
            'investigation-report' => array_merge($this->getInvestigationReportData($range), ['reportTitle' => $title, 'dateRange' => $range['label']]),
            'high-risk-cases' => array_merge($this->getHighRiskCasesData($range), ['reportTitle' => $title, 'dateRange' => $range['label']]),
            default => abort(404),
        };

        $view = 'reports.' . str_replace('-', '_', $type);

        $pdf = Pdf::loadView($view, $data)->setPaper('a4', 'portrait');

        return $pdf->download($filename);
    }

    protected function getReportTitle(string $type): string
    {
        return match ($type) {
            'fraud-summary' => 'Fraud Summary Report',
            'suspicious-activity' => 'Suspicious Activity Report',
            'risk-distribution' => 'Risk Distribution Report',
            'investigation-report' => 'Investigation Report',
            'high-risk-cases' => 'High Risk Cases Report',
            default => 'Report',
        };
    }

    protected function parseDateRange(Request $request): array
    {
        $from = $request->query('from');
        $to = $request->query('to');
        $fromDate = null;
        $toDate = null;

        try {
            if ($from) {
                $fromDate = Carbon::parse($from)->startOfDay();
            }
            if ($to) {
                $toDate = Carbon::parse($to)->endOfDay();
            }
        } catch (\Exception $e) {
            $fromDate = null;
            $toDate = null;
        }

        $label = 'All time';

        if ($fromDate && $toDate) {
            $label = $fromDate->format('M d, Y') . ' - ' . $toDate->format('M d, Y');
        } elseif ($fromDate) {
            $label = 'From ' . $fromDate->format('M d, Y');
        } elseif ($toDate) {
            $label = 'Until ' . $toDate->format('M d, Y');
        }

        return ['from' => $fromDate, 'to' => $toDate, 'label' => $label];
    }

    protected function getAdminReportData(array $range = null): array
    {
        $range = $range ?? ['from' => null, 'to' => null, 'label' => 'All time'];

        $transactions = Transaction::with(['user', 'fraudLog'])->latest();
        $this->applyDateRange($transactions, $range['from'], $range['to']);

        $totalTransactions = Transaction::count();
        $fraudCases = Transaction::whereHas('fraudLog', fn($q) => $q->where('is_fraud', true))->count();
        $totalUsers = User::count();
        $approvedCount = Transaction::where('status', 'approved')->count();
        $rejectedCount = Transaction::where('status', 'rejected')->count();

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

        $transactionsList = $transactions->get()->map(fn($txn) => [
            'id' => "TXN-{$txn->id}",
            'user' => $txn->user?->name ?: 'Unknown',
            'amount' => (float) $txn->amount,
            'location' => $txn->location ?: 'Unknown',
            'risk' => $txn->fraudLog
                ? ($txn->fraudLog->risk_score >= 70
                    ? 'High'
                    : ($txn->fraudLog->risk_score >= 40 ? 'Medium' : 'Low'))
                : 'Unknown',
            'status' => ucfirst($txn->status),
            'date' => $txn->created_at->format('Y-m-d'),
        ])->toArray();

        return [
            'totalTransactions' => $totalTransactions,
            'fraudCases' => $fraudCases,
            'totalUsers' => $totalUsers,
            'approvedCount' => $approvedCount,
            'rejectedCount' => $rejectedCount,
            'monthlyTrendData' => $monthlyTrendData,
            'fraudLocationData' => $fraudLocationData,
            'amountRangeData' => $amountRangeData,
            'riskScoreData' => $riskScoreData,
            'transactions' => $transactionsList,
        ];
    }

    protected function getSuspiciousActivityData(array $range): array
    {
        $query = Transaction::with(['user', 'fraudLog'])
            ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true));

        $this->applyDateRange($query, $range['from'], $range['to']);

        $records = $query->latest()->get()->map(fn($txn) => [
            'id' => "TXN-{$txn->id}",
            'user' => $txn->user?->name ?: 'Unknown',
            'amount' => (float) $txn->amount,
            'location' => $txn->location ?: 'Unknown',
            'risk_score' => $txn->fraudLog->risk_score,
            'status' => ucfirst($txn->status),
            'reason' => $txn->fraudLog->reason,
            'date' => $txn->created_at->format('Y-m-d'),
        ])->toArray();

        $totalBlocked = $query->where('status', 'blocked')->count();

        return [
            'dateRange' => $range['label'],
            'reportTitle' => 'Suspicious Activity Report',
            'records' => $records,
            'totalBlocked' => $totalBlocked,
        ];
    }

    protected function getRiskDistributionData(array $range): array
    {
        $query = Transaction::with('fraudLog')
            ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true));

        $this->applyDateRange($query, $range['from'], $range['to']);

        $highRisk = $query->whereHas('fraudLog', fn($q) => $q->where('risk_score', '>=', 70))->count();
        $mediumRisk = $query->whereHas('fraudLog', fn($q) => $q->whereBetween('risk_score', [40, 69]))->count();
        $lowRisk = $query->whereHas('fraudLog', fn($q) => $q->where('risk_score', '<', 40))->count();

        $total = max($highRisk + $mediumRisk + $lowRisk, 1);

        return [
            'dateRange' => $range['label'],
            'reportTitle' => 'Risk Distribution Report',
            'highRisk' => $highRisk,
            'mediumRisk' => $mediumRisk,
            'lowRisk' => $lowRisk,
            'highPercent' => round(($highRisk / $total) * 100),
            'mediumPercent' => round(($mediumRisk / $total) * 100),
            'lowPercent' => round(($lowRisk / $total) * 100),
        ];
    }

    protected function getInvestigationReportData(array $range = null): array
    {
        $range = $range ?? ['from' => null, 'to' => null, 'label' => 'All time'];

        $query = Transaction::with(['user', 'fraudLog'])
            ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true));

        $this->applyDateRange($query, $range['from'], $range['to']);

        $recentCases = $query->latest()->get()->map(fn($txn) => [
            'id' => "TXN-{$txn->id}",
            'user' => $txn->user?->name ?: 'Unknown',
            'amount' => (float) $txn->amount,
            'location' => $txn->location ?: 'Unknown',
            'risk' => $txn->fraudLog
                ? ($txn->fraudLog->risk_score >= 70
                    ? 'High'
                    : ($txn->fraudLog->risk_score >= 40 ? 'Medium' : 'Low'))
                : 'Unknown',
            'status' => ucfirst($txn->status),
            'date' => $txn->created_at->format('Y-m-d'),
        ])->toArray();

        $queryForStats = Transaction::with(['user', 'fraudLog'])
            ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true));
        $this->applyDateRange($queryForStats, $range['from'], $range['to']);

        $topLocation = Transaction::select('location')
            ->selectRaw('count(*) as count')
            ->whereHas('fraudLog', fn($q) => $q->where('is_fraud', true))
            ->groupBy('location')
            ->orderByDesc('count')
            ->first();

        return [
            'totalFlagged' => $queryForStats->count(),
            'highRiskCases' => $queryForStats->whereHas('fraudLog', fn($q) => $q->where('risk_score', '>=', 70))->count(),
            'mediumRiskCases' => $queryForStats->whereHas('fraudLog', fn($q) => $q->whereBetween('risk_score', [40, 69]))->count(),
            'lowRiskCases' => $queryForStats->whereHas('fraudLog', fn($q) => $q->where('risk_score', '<', 40))->count(),
            'approvedCases' => $queryForStats->where('status', 'approved')->count(),
            'rejectedCases' => $queryForStats->where('status', 'rejected')->count(),
            'pendingCases' => $queryForStats->where('status', 'pending_review')->count(),
            'monthlyStats' => [],
            'recentCases' => $recentCases,
            'topLocation' => $topLocation?->location ?: 'Unknown',
            'highRiskTrend' => 0,
            'reportTitle' => 'Investigation Report',
            'dateRange' => $range['label'],
        ];
    }

    protected function getHighRiskCasesData(array $range): array
    {
        $query = Transaction::with(['user', 'fraudLog'])
            ->whereHas('fraudLog', fn($q) => $q->where('risk_score', '>=', 70));

        $this->applyDateRange($query, $range['from'], $range['to']);

        $records = $query->latest()->get()->map(fn($txn) => [
            'id' => "TXN-{$txn->id}",
            'user' => $txn->user?->name ?: 'Unknown',
            'amount' => (float) $txn->amount,
            'location' => $txn->location ?: 'Unknown',
            'risk_score' => $txn->fraudLog->risk_score,
            'reason' => $txn->fraudLog->reason,
            'status' => ucfirst($txn->status),
            'date' => $txn->created_at->format('Y-m-d'),
        ])->toArray();

        return [
            'reportTitle' => 'High Risk Cases Report',
            'dateRange' => $range['label'],
            'records' => $records,
            'count' => count($records),
        ];
    }

    protected function applyDateRange($query, ?Carbon $from, ?Carbon $to): void
    {
        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }
    }
}
