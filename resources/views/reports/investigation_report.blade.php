@extends('reports.layout')

@section('content')
    <div class="report-section">
        <h2>Investigation Overview</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            This report highlights investigator performance and case outcomes to help leaders understand review efficiency and decision consistency.
        </p>
    </div>

    <div class="report-section grid-3">
        <div class="card">
            <div class="metric-title">Total Cases Assigned</div>
            <div class="metric-value">{{ number_format($totalFlagged) }}</div>
            <div class="metric-subtitle">All cases sent to investigators.</div>
        </div>
        <div class="card">
            <div class="metric-title">Reviewed Cases</div>
            <div class="metric-value">{{ number_format($approvedCases + $rejectedCases) }}</div>
            <div class="metric-subtitle">Decisions made by investigators.</div>
        </div>
        <div class="card">
            <div class="metric-title">Pending Cases</div>
            <div class="metric-value">{{ number_format($pendingCases) }}</div>
            <div class="metric-subtitle">Cases still awaiting review.</div>
        </div>
    </div>

    <div class="report-section">
        <h2>Decision Breakdown</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Approved</td>
                    <td>{{ number_format($approvedCases) }}</td>
                    <td>{{ $approvedCases + $rejectedCases > 0 ? round(($approvedCases / ($approvedCases + $rejectedCases)) * 100, 1) : 0 }}%</td>
                </tr>
                <tr>
                    <td>Rejected</td>
                    <td>{{ number_format($rejectedCases) }}</td>
                    <td>{{ $approvedCases + $rejectedCases > 0 ? round(($rejectedCases / ($approvedCases + $rejectedCases)) * 100, 1) : 0 }}%</td>
                </tr>
                <tr>
                    <td>Pending</td>
                    <td>{{ number_format($pendingCases) }}</td>
                    <td>{{ $totalFlagged > 0 ? round(($pendingCases / $totalFlagged) * 100, 1) : 0 }}%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="report-section">
        <h2>Recent Investigator Cases</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Location</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($recentCases as $case)
                    <tr>
                        <td>{{ $case['id'] }}</td>
                        <td>{{ $case['user'] }}</td>
                        <td>${{ number_format($case['amount'], 2) }}</td>
                        <td>{{ $case['location'] }}</td>
                        <td>{{ $case['risk'] }}</td>
                        <td>{{ $case['status'] }}</td>
                        <td>{{ $case['date'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
