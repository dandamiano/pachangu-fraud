import React from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import type { PageProps } from "../../types";

interface FraudLog {
    is_fraud: boolean;
    risk_score?: number;
    reason?: string;
}

interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: string;
    location: string;
    status: string;
    fraud_log?: FraudLog;
}

interface TransactionsPageProps extends PageProps<{
    transactions: Transaction[];
}> {}

export default function Transactions({ transactions }: TransactionsPageProps) {
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Transaction Management</h1>

                <div className="bg-white shadow rounded p-4">
                    <h2 className="font-semibold mb-4">All Transactions</h2>

                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">User ID</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Location</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Risk Score</th>
                            <th className="text-left p-2">Fraud</th>
                            <th className="text-left p-2">Reason</th>
                        </tr>
                        </thead>

                        <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id} className="border-b">
                                <td className="p-2">{t.id}</td>
                                <td className="p-2">{t.user_id}</td>
                                <td className="p-2">{t.amount}</td>
                                <td className="p-2">{t.type}</td>
                                <td className="p-2">{t.location}</td>
                                <td className="p-2">{t.status}</td>
                                <td className="p-2">{t.fraud_log?.risk_score ?? 0}</td>
                                <td className="p-2">
                                    {t.fraud_log?.is_fraud ? (
                                        <span className="text-red-600 font-bold">⚠️ Fraud</span>
                                    ) : (
                                        <span className="text-green-600">✔ Safe</span>
                                    )}
                                </td>
                                <td className="p-2">{t.fraud_log?.reason ?? '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
