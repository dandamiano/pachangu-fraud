import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface FraudLog {
    is_fraud: boolean;
}

interface Transaction {
    id: number;
    amount: number;
    status: string;
    fraud_log?: FraudLog;
}

interface AdminDashboardProps {
    users: User[];
    transactions: Transaction[];
}

export default function AdminDashboard({ users, transactions }: AdminDashboardProps) {
    return (
        <AdminLayout>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 shadow rounded">
                    <h3 className="text-gray-500">Total Users</h3>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h3 className="text-gray-500">Transactions</h3>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h3 className="text-gray-500">Fraud Alerts</h3>
                    <p className="text-2xl font-bold text-red-600">
                        {
                            transactions.filter(t => t.fraud_log?.is_fraud)
                                .length
                        }
                    </p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white shadow rounded p-4">
                <h2 className="font-semibold mb-4">Recent Transactions</h2>

                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Risk</th>
                    </tr>
                    </thead>

                    <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id} className="border-b">
                            <td className="p-2">{t.amount}</td>
                            <td className="p-2">{t.status}</td>
                            <td className="p-2">
                                {t.fraud_log?.is_fraud ? (
                                    <span className="text-red-600 font-bold">
                                            High Risk
                                        </span>
                                ) : (
                                    <span className="text-green-600">
                                            Safe
                                        </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
