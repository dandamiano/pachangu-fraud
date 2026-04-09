@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Investigator Dashboard</h2>

    <p>Total Fraud Cases: {{ $transactions->count() }}</p>

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
                <th>Reason</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
        @foreach($transactions as $t)
            <tr style="background-color:#ffcccc">
                <td>{{ $t->id }}</td>
                <td>{{ $t->user_id }}</td>
                <td>{{ $t->amount }}</td>
                <td>{{ $t->type }}</td>
                <td>{{ $t->location }}</td>
                <td>{{ $t->status }}</td>
                <td>{{ $t->fraudLog->risk_score ?? 0 }}</td>
                <td>{{ $t->fraudLog->reason ?? '-' }}</td>
                <td>
                    <button>Mark Safe</button>
                    <button>Investigate</button>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection