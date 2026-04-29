import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface InvestigatorReportsProps {
    totalFlagged: number;
    highRiskCases: number;
    mediumRiskCases: number;
    lowRiskCases: number;
    approvedCases: number;
    rejectedCases: number;
    pendingCases: number;
    monthlyStats: Array<{
        month: string;
        flagged: number;
        approved: number;
        rejected: number;
        highRisk: number;
        mediumRisk: number;
        lowRisk: number;
    }>;
    recentCases: Array<{
        id: string;
        user: string;
        amount: number;
        location: string;
        risk: string;
        status: string;
        date: string;
    }>;
    topLocation: string;
    highRiskTrend: number;
}

const statusOptions = ['all', 'pending_review', 'completed', 'approved', 'rejected'];
const riskOptions = ['all', 'High', 'Medium', 'Low'];

export default function InvestigatorReports({
    totalFlagged = 0,
    highRiskCases = 0,
    mediumRiskCases = 0,
    lowRiskCases = 0,
    approvedCases = 0,
    rejectedCases = 0,
    pendingCases = 0,
    monthlyStats = [],
    recentCases = [],
    topLocation = 'Unknown',
    highRiskTrend = 0,
}: InvestigatorReportsProps) {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedRisk, setSelectedRisk] = useState('all');

    const filteredCases = useMemo(
        () => recentCases.filter((item) => {
            const statusMatches = selectedStatus === 'all' || item.status === selectedStatus;
            const riskMatches = selectedRisk === 'all' || item.risk === selectedRisk;
            return statusMatches && riskMatches;
        }),
        [recentCases, selectedStatus, selectedRisk]
    );

    const approvalRate = approvedCases + rejectedCases > 0
        ? Math.round((approvedCases / (approvedCases + rejectedCases)) * 100)
        : 0;

    const highRiskShare = totalFlagged > 0 ? Math.round((highRiskCases / totalFlagged) * 100) : 0;
    const mediumRiskShare = totalFlagged > 0 ? Math.round((mediumRiskCases / totalFlagged) * 100) : 0;
    const lowRiskShare = totalFlagged > 0 ? Math.round((lowRiskCases / totalFlagged) * 100) : 0;

    return (
        <AdminLayout>
            <Head title="Investigator Reports | Fraud Detection and Management System" />

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-semibold text-gray-900">Investigator Control Center</h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Monitor flagged transactions, prioritize high-risk cases, and accelerate fraud reviews with clear incident insights.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
                            Start Review
                        </button>
                        <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Refresh Data
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">High Risk Alert</p>
                        <div className="mt-5 flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 text-2xl">⚠️</div>
                            <div>
                                <p className="text-3xl font-semibold text-gray-900">{highRiskCases}</p>
                                <p className="mt-1 text-sm text-gray-600">High-risk cases awaiting investigation</p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Trend</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {highRiskTrend >= 0 ? `+${highRiskTrend}%` : `${highRiskTrend}%`}
                                </p>
                            </div>
                            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">{highRiskShare}% of flagged</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Total Flagged</p>
                        <p className="mt-4 text-4xl font-semibold text-gray-900">{totalFlagged}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Top Location</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900">{topLocation}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Approval</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900">{approvalRate}%</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Pending</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900">{pendingCases}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">Investigation Summary</p>
                        <div className="mt-5 grid gap-4">
                            <div className="rounded-2xl bg-green-50 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-green-700">Approved</p>
                                <p className="mt-2 text-2xl font-semibold text-green-800">{approvedCases}</p>
                            </div>
                            <div className="rounded-2xl bg-red-50 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-red-700">Rejected</p>
                                <p className="mt-2 text-2xl font-semibold text-red-800">{rejectedCases}</p>
                            </div>
                            <div className="rounded-2xl bg-yellow-50 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-yellow-700">Still Pending</p>
                                <p className="mt-2 text-2xl font-semibold text-yellow-800">{pendingCases}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Recent Fraud Cases</h2>
                                <p className="text-sm text-gray-600">Review the latest suspicious transactions and filter by status or risk rating.</p>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm">
                                <label className="flex items-center gap-2">
                                    <span className="text-gray-600">Status</span>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\w/g, (c) => c.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="flex items-center gap-2">
                                    <span className="text-gray-600">Risk</span>
                                    <select
                                        value={selectedRisk}
                                        onChange={(e) => setSelectedRisk(e.target.value)}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {riskOptions.map((risk) => (
                                            <option key={risk} value={risk}>{risk}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Case</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">User</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Location</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Risk</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredCases.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                                    No cases match the selected filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCases.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                                                    <td className="px-6 py-4 text-gray-700">{item.user}</td>
                                                    <td className="px-6 py-4 text-gray-700">{item.location}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            item.risk === 'High' ? 'bg-red-100 text-red-700' :
                                                            item.risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {item.risk}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">${item.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-gray-700 capitalize">{item.status.replace('_', ' ')}</td>
                                                    <td className="px-6 py-4 text-gray-700">{item.date}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">Investigation Score</p>
                            <p className="mt-4 text-3xl font-semibold text-gray-900">{approvalRate}%</p>
                            <p className="mt-2 text-sm text-gray-600">Approval ratio for completed decisions.</p>
                            <div className="mt-6 space-y-3">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                                        <span>High Risk</span>
                                        <span>{highRiskShare}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-red-500" style={{ width: `${highRiskShare}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                                        <span>Medium Risk</span>
                                        <span>{mediumRiskShare}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${mediumRiskShare}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                                        <span>Low Risk</span>
                                        <span>{lowRiskShare}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${lowRiskShare}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">Monthly Fraud Flux</h2>
                            <p className="text-sm text-gray-600 mt-2">Compare flagged, approved, and rejected cases for the last six months.</p>
                            <div className="mt-6 space-y-4">
                                {monthlyStats.map((stat) => (
                                    <div key={stat.month} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>{stat.month}</span>
                                            <span>{stat.flagged} flagged</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${stat.flagged > 0 ? Math.min(100, (stat.flagged / (totalFlagged || 1)) * 100) : 0}%` }} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500">
                                                <span className="text-left">Approved {stat.approved}</span>
                                                <span className="text-center">Rejected {stat.rejected}</span>
                                                <span className="text-right">High {stat.highRisk}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
