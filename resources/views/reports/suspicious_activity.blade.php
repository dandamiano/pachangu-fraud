@extends('reports.layout')

@section('content')
    <div class="report-section">
        <h2>Executive Summary</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            This report tracks suspicious activity and exposes cases where risk level and status indicate an elevated threat.
            Review these transactions to identify common fraud patterns and refine controls.
        </p>
    </div>

    <div class="report-section">
        <h2>Key Metrics</h2>
        <div class="grid-3">
            <div class="card">
                <div class="metric-title">Total Suspicious Cases</div>
                <div class="metric-value">{{ number_format(count($records)) }}</div>
                <div class="metric-subtitle">All filtered transactions with fraud indicators.</div>
            </div>
            <div class="card">
                <div class="metric-title">Blocked Transactions</div>
                <div class="metric-value">{{ number_format($totalBlocked) }}</div>
                <div class="metric-subtitle">Transactions that were blocked by the system.</div>
            </div>
            <div class="card">
                <div class="metric-title">Review Focus</div>
                <div class="metric-value">{{ count($records) > 0 ? round(($totalBlocked / count($records)) * 100, 1) : 0 }}%</div>
                <div class="metric-subtitle">Proportion of suspicious cases ending as blocked.</div>
            </div>
        </div>
    </div>

    <div class="report-section">
        <h2>Detailed Cases</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Transaction</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Location</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($records as $record)
                    <tr>
                        <td>{{ $record['id'] }}</td>
                        <td>{{ $record['user'] }}</td>
                        <td>MWK {{ number_format($record['amount'], 2) }}</td>
                        <td>{{ $record['location'] }}</td>
                        <td>{{ $record['risk_score'] }}</td>
                        <td>
                            <span class="badge {{ $record['status'] === 'Blocked' ? 'badge-red' : 'badge-amber' }}">
                                {{ $record['status'] }}
                            </span>
                        </td>
                        <td>{{ $record['reason'] }}</td>
                        <td>{{ $record['date'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
