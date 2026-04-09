@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Admin Dashboard</h2>

    <div class="stats">
        <p>Total Transactions: {{ $transactions->count() }}</p>
        <p>Fraud Cases: {{ $transactions->filter(fn($t) => optional($t->fraudLog)->is_fraud)->count() }}</p>
    </div>

    <table border="1" width="100%" cellpadding="5">
        <thead style="background-color:#f2f2f2;">
            <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Fraud</th>
                <th>Reason</th>
            </tr>
        </thead>
        <tbody>
        @foreach($transactions as $t)
            <tr style="background-color: {{ optional($t->fraudLog)->is_fraud ? '#ffcccc' : '#ccffcc' }}">
                <td>{{ $t->id }}</td>
                <td>{{ $t->user_id }}</td>
                <td>{{ $t->amount }}</td>
                <td>{{ $t->type }}</td>
                <td>{{ $t->location }}</td>
                <td>{{ $t->status }}</td>
                <td>{{ $t->fraudLog->risk_score ?? 0 }}</td>
                <td>{{ optional($t->fraudLog)->is_fraud ? '⚠️ Fraud' : '✔ Safe' }}</td>
                <td>{{ $t->fraudLog->reason ?? '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection