@extends('reports.layout')

@section('content')
    <div class="report-section">
        <h2>Risk Profile Summary</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            This report breaks down fraud risk distribution so you can focus resources on the most dangerous segments.
        </p>
    </div>

    <div class="report-section grid-3">
        <div class="card">
            <div class="metric-title">High Risk</div>
            <div class="metric-value">{{ $highRisk }}</div>
            <div class="metric-subtitle">% of cases with risk score &ge; 70.</div>
        </div>
        <div class="card">
            <div class="metric-title">Medium Risk</div>
            <div class="metric-value">{{ $mediumRisk }}</div>
            <div class="metric-subtitle">% of cases with risk score 40-69.</div>
        </div>
        <div class="card">
            <div class="metric-title">Low Risk</div>
            <div class="metric-value">{{ $lowRisk }}</div>
            <div class="metric-subtitle">% of cases with risk score &lt; 40.</div>
        </div>
    </div>

    <div class="report-section">
        <h2>Risk Distribution</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Risk Level</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>High Risk</td>
                    <td>{{ $highRisk }}</td>
                    <td>{{ $highPercent }}%</td>
                </tr>
                <tr>
                    <td>Medium Risk</td>
                    <td>{{ $mediumRisk }}</td>
                    <td>{{ $mediumPercent }}%</td>
                </tr>
                <tr>
                    <td>Low Risk</td>
                    <td>{{ $lowRisk }}</td>
                    <td>{{ $lowPercent }}%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="report-section">
        <h2>Risk Insights</h2>
        <p style="margin:0; color:#4b5563; font-size:13px; line-height:1.8;">
            High-risk transactions should be prioritized for immediate review. Medium-risk cases should be monitored for escalating patterns, while low-risk cases may be sampled for quality checks.
        </p>
    </div>
@endsection
