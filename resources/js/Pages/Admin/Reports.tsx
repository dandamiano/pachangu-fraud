import React from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import type { PageProps } from "../../types";

interface ReportsPageProps extends PageProps<{
    totalTransactions: number;
    fraudCases: number;
    totalUsers: number;
}> {}

export default function Reports({ totalTransactions, fraudCases, totalUsers }: ReportsPageProps) {
    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 shadow rounded">
                        <h3 className="text-gray-500">Total Transactions</h3>
                        <p className="text-2xl font-bold">{totalTransactions}</p>
                    </div>

                    <div className="bg-white p-4 shadow rounded">
                        <h3 className="text-gray-500">Fraud Cases</h3>
                        <p className="text-2xl font-bold text-red-600">{fraudCases}</p>
                    </div>

                    <div className="bg-white p-4 shadow rounded">
                        <h3 className="text-gray-500">Total Users</h3>
                        <p className="text-2xl font-bold">{totalUsers}</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded p-4">
                    <h2 className="font-semibold mb-4">Additional Reports</h2>
                    <p className="text-gray-600">More detailed reports and analytics features coming soon...</p>
                </div>
            </div>
        </AdminLayout>
    );
}
