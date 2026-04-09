import React from 'react';

export default function AdminDashboard({ users, transactions }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            <p>Total Users: {users.length}</p>
            <p>Total Transactions: {transactions.length}</p>

            <h2 className="mt-6 font-semibold">Recent Transactions</h2>
            <ul>
                {transactions.map((t) => (
                    <li key={t.id}>
                        {t.amount} - {t.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}
