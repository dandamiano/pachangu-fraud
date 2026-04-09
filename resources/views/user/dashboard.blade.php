@extends('layouts.app')

@section('content')
<div class="container">
    <h2>User Dashboard</h2>

    <h3>Submit a Transaction</h3>
    <form action="{{ route('transaction.submit') }}" method="POST">
        @csrf
        <input type="number" name="amount" placeholder="Amount" required>
        <input type="text" name="type" placeholder="Type (payment/transfer)" required>
        <input type="text" name="location" placeholder="Location" required>
        <button type="submit">Submit</button>
    </form>

    <h3>Your Transactions</h3>
    <table border="1" width="100%" cellpadding="5">
        <thead style="background-color:#f2f2f2;">
            <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Fraud</th>
            </tr>
        </thead>
        <tbody>
        @foreach(auth()->user()->transactions as $t)
            <tr style="background-color: {{ optional($t->fraudLog)->is_fraud ? '#ffcccc' : '#ccffcc' }}">
                <td>{{ $t->id }}</td>
                <td>{{ $t->amount }}</td>
                <td>{{ $t->type }}</td>
                <td>{{ $t->location }}</td>
                <td>{{ $t->status }}</td>
                <td>{{ $t->fraudLog->risk_score ?? 0 }}</td>
                <td>{{ optional($t->fraudLog)->is_fraud ? '⚠️ Fraud' : '✔ Safe' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection