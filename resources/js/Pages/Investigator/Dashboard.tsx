import React from 'react';

export default function InvestigatorDashboard({ transactions }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Investigator Dashboard</h1>

            <h2>Fraud Cases</h2>

            <ul>
                {transactions.map((t) => (
                    <li key={t.id}>
                        Transaction #{t.id} - {t.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
}
