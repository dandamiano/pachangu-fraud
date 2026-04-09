
<!DOCTYPE html>
<html>
<head>
    <title>Fraud Detection Dashboard</title>
</head>
<body>
    <h1>Transactions Dashboard</h1>
    <table border="1" cellpadding="5">
        <thead>
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
            <tr>
                <td>{{ $t->id }}</td>
                <td>{{ $t->user_id }}</td>
                <td>{{ $t->amount }}</td>
                <td>{{ $t->type }}</td>
                <td>{{ $t->location }}</td>
                <td>{{ $t->status }}</td>
                <td>{{ $t->fraudLog->risk_score ?? 0 }}</td>
                <td>{{ optional($t->fraudLog)->is_fraud ? 'Yes' : 'No' }}</td>
                <td>{{ $t->fraudLog->reason ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>