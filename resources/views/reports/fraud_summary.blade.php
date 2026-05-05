@extends('reports.layout')

@section('content')
    <div class="report-section">
        <h2>Executive Overview</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            This summary gives leadership a concise view of overall transaction volume and fraud exposure.
            Use the metrics below to quickly identify whether fraud rates are rising and whether your controls are keeping pace.
        </p>
    </div>

    <div class="report-section grid-3">
        <div class="card">
            <div class="metric-title">Total Transactions</div>
            <div class="metric-value">{{ number_format($totalTransactions) }}</div>
            <div class="metric-subtitle">All recorded transactions in the system.</div>
        </div>
        <div class="card">
            <div class="metric-title">Total Flagged</div>
            <div class="metric-value">{{ number_format($fraudCases) }}</div>
            <div class="metric-subtitle">Transactions that were marked for review.</div>
        </div>
        <div class="card">
            <div class="metric-title">Fraud Rate</div>
            <div class="metric-value">{{ $totalTransactions > 0 ? round(($fraudCases / $totalTransactions) * 100, 1) : 0 }}%</div>
            <div class="metric-subtitle">Flagged volume as a share of total transactions.</div>
        </div>
    </div>

    <div class="report-section">
        <h2>Insights</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            The report shows the current fraud load and highlights whether fraud events are concentrated in a small number of cases.
            Investigate growth in flagged transactions immediately if the rate exceeds acceptable thresholds.
        </p>
    </div>
@endsection
