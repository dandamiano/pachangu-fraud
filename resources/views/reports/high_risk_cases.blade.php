@extends('reports.layout')

@section('content')
    <div class="report-section">
        <h2>High Risk Cases</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            A focused list of the most dangerous transactions that require immediate follow-up and containment.
        </p>
    </div>

    <div class="report-section">
        <h2>Risk Summary</h2>
        <div class="grid-3">
            <div class="card">
                <div class="metric-title">High Risk Count</div>
                <div class="metric-value">{{ number_format($count) }}</div>
                <div class="metric-subtitle">Transactions with risk score 70 or higher.</div>
            </div>
            <div class="card">
                <div class="metric-title">Report Period</div>
                <div class="metric-value">{{ $dateRange }}</div>
                <div class="metric-subtitle">Data range used to generate this report.</div>
            </div>
            <div class="card">
                <div class="metric-title">Urgency</div>
                <div class="metric-value">High</div>
                <div class="metric-subtitle">Focus these cases first.</div>
            </div>
        </div>
    </div>

    <div class="report-section">
        <h2>Case Details</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Transaction</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Location</th>
                    <th>Risk Score</th>
                    <th>Reason</th>
                    <th>Status</th>
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
                        <td>{{ $record['reason'] }}</td>
                        <td>
                            <span class="badge badge-red">{{ $record['status'] }}</span>
                        </td>
                        <td>{{ $record['date'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
