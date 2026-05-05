import { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import AdminLayout from "../../Layouts/AdminLayout";
import type { PageProps } from "../../types";

interface ReportsPageProps extends PageProps<{
    totalTransactions: number;
    fraudCases: number;
    totalUsers: number;
    approvedCount: number;
    rejectedCount: number;
    monthlyTrendData: TrendPoint[];
    fraudLocationData: LocationPoint[];
    amountRangeData: AmountRangePoint[];
    riskScoreData: RiskPoint[];
    transactions: TransactionRecord[];
}> {}

interface TrendPoint {
    month: string;
    transactions: number;
    fraud: number;
}

interface LocationPoint {
    location: string;
    fraud: number;
}

interface AmountRangePoint {
    range: string;
    cases: number;
}

interface RiskPoint {
    name: string;
    value: number;
}

interface TransactionRecord {
    id: string;
    user: string;
    amount: number;
    location: string;
    risk: string;
    status: string;
    date: string;
}

const statusOptions = ["All", "Approved", "Rejected", "Fraud"];
const riskOptions = ["All", "Low", "Medium", "High"];

export default function Reports({
    totalTransactions,
    fraudCases,
    totalUsers,
    approvedCount,
    rejectedCount,
    monthlyTrendData,
    fraudLocationData,
    amountRangeData,
    riskScoreData,
    transactions,
}: ReportsPageProps) {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [riskFilter, setRiskFilter] = useState("All");
    const [showActions, setShowActions] = useState(false);

    const download = (type: string) => {
        window.open(`/reports/${type}/download`, '_blank');
        setShowActions(false);
    };

    const printReport = () => {
        setShowActions(false);
        window.print();
    };

    const fraudRate = totalTransactions > 0 ? ((fraudCases / totalTransactions) * 100).toFixed(1) : "0.0";

    const filteredTransactions = useMemo(() => {
        return transactions.filter((txn) => {
            if (statusFilter !== "All" && txn.status !== statusFilter) {
                return false;
            }
            if (riskFilter !== "All" && txn.risk !== riskFilter) {
                return false;
            }
            if (dateFrom && txn.date < dateFrom) {
                return false;
            }
            if (dateTo && txn.date > dateTo) {
                return false;
            }
            return true;
        });
    }, [transactions, dateFrom, dateTo, statusFilter, riskFilter]);

    return (
        <AdminLayout>
            <Head title="Reports & Analytics" />

            <div className="p-6 space-y-8">
                <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                            <p className="text-gray-500 mt-1">
                                Comprehensive transaction and fraud monitoring for your admin team.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Active users: {totalUsers}
                            </p>
                        </div>
                        <div className="relative inline-flex">
                            <button
                                type="button"
                                onClick={() => setShowActions((open) => !open)}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                            >
                                Report actions
                            </button>
                            {showActions ? (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => download('fraud-summary')}
                                            className="w-full rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                                        >
                                            Download Fraud Summary PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => download('suspicious-activity')}
                                            className="w-full rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                                        >
                                            Download Suspicious Activity PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => download('risk-distribution')}
                                            className="w-full rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-900 hover:bg-slate-100"
                                        >
                                            Download Risk Distribution PDF
                                        </button>
                                        <button
                                            type="button"
                                            onClick={printReport}
                                            className="w-full rounded-2xl bg-slate-900 px-3 py-2 text-left text-sm font-medium text-white hover:bg-slate-800"
                                        >
                                            Print report
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="text-sm uppercase text-gray-500">Total Transactions</div>
                        <div className="mt-3 text-3xl font-semibold text-slate-900">{totalTransactions}</div>
                        <div className="mt-2 text-sm text-gray-500">Number of completed requests.</div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="text-sm uppercase text-gray-500">Total Fraud Cases</div>
                        <div className="mt-3 text-3xl font-semibold text-red-600">{fraudCases}</div>
                        <div className="mt-2 text-sm text-gray-500">Confirmed or suspected fraudulent activity.</div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="text-sm uppercase text-gray-500">Fraud Rate</div>
                        <div className="mt-3 text-3xl font-semibold text-amber-600">{fraudRate}%</div>
                        <div className="mt-2 text-sm text-gray-500">Fraud cases divided by total transactions.</div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="text-sm uppercase text-gray-500">Approved vs Rejected</div>
                        <div className="mt-3 flex items-baseline gap-4">
                            <div>
                                <div className="text-3xl font-semibold text-emerald-600">{approvedCount}</div>
                                <div className="text-xs uppercase text-gray-500">Approved</div>
                            </div>
                            <div>
                                <div className="text-3xl font-semibold text-red-600">{rejectedCount}</div>
                                <div className="text-xs uppercase text-gray-500">Rejected</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Fraud Trends</h2>
                                <p className="text-sm text-gray-500">Monthly fraud cases vs overall transactions.</p>
                            </div>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="fraud" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Transactions vs Fraud</h2>
                                <p className="text-sm text-gray-500">Transaction volume compared to fraud counts.</p>
                            </div>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="transactions" fill="#2563EB" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="fraud" fill="#DC2626" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-3">Fraud by Location</h3>
                        <div className="space-y-3">
                            {fraudLocationData.map((item) => (
                                <div key={item.location} className="flex items-center justify-between text-sm">
                                    <span>{item.location}</span>
                                    <span className="font-semibold text-red-600">{item.fraud}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-3">Fraud by Amount Range</h3>
                        <div className="space-y-3">
                            {amountRangeData.map((item) => (
                                <div key={item.range} className="flex items-center justify-between text-sm">
                                    <span>{item.range}</span>
                                    <span className="font-semibold text-slate-900">{item.cases}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-3">Risk Score Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={riskScoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4}>
                                        {riskScoreData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 0 ? "#DC2626" : index === 1 ? "#F59E0B" : "#10B981"}
                                            />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Transaction Log</h2>
                            <p className="text-sm text-gray-500">Filter and inspect the most recent transactions.</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="block text-sm text-gray-600">
                                Date from
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </label>

                            <label className="block text-sm text-gray-600">
                                Date to
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </label>

                            <label className="block text-sm text-gray-600">
                                Risk
                                <select
                                    value={riskFilter}
                                    onChange={(event) => setRiskFilter(event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {riskOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block text-sm text-gray-600">
                                Status
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Transaction</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Location</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Risk</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredTransactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{txn.id}</td>
                                        <td className="px-4 py-3 text-gray-700">{txn.user}</td>
                                        <td className="px-4 py-3 text-right text-slate-900">${txn.amount.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-gray-700">{txn.location}</td>
                                        <td className="px-4 py-3 text-gray-700">{txn.risk}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    txn.status === "Approved"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : txn.status === "Rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                                }`}
                                            >
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{txn.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
