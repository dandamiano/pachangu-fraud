import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

interface InvestigatorReportsProps {
    totalFlagged: number;
    highRiskCases: number;
    approvedCases: number;
    rejectedCases: number;
    pendingCases: number;
    monthlyStats: Array<{
        month: string;
        flagged: number;
        approved: number;
        rejected: number;
    }>;
}

export default function InvestigatorReports({
    totalFlagged = 0,
    highRiskCases = 0,
    approvedCases = 0,
    rejectedCases = 0,
    pendingCases = 0,
    monthlyStats = []
}: InvestigatorReportsProps) {
    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Investigator Reports</h1>
                        <p className="text-gray-600 mt-1">Comprehensive fraud investigation analytics</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Flagged</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{totalFlagged}</p>
                            </div>
                            <div className="text-blue-600 text-3xl">🚩</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Risk</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{highRiskCases}</p>
                            </div>
                            <div className="text-red-600 text-3xl">⚠️</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{approvedCases}</p>
                            </div>
                            <div className="text-green-600 text-3xl">✓</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{rejectedCases}</p>
                            </div>
                            <div className="text-red-600 text-3xl">✗</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCases}</p>
                            </div>
                            <div className="text-yellow-600 text-3xl">⏳</div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trends */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Monthly Trends</h2>
                        <p className="text-sm text-gray-600 mt-1">Fraud detection patterns over time</p>
                    </div>

                    {monthlyStats.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-lg text-gray-500">No data available</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Month
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Flagged Cases
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Approved
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Rejected
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Approval Rate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {monthlyStats.map((stat, index) => {
                                        const total = stat.approved + stat.rejected;
                                        const approvalRate = total > 0 ? Math.round((stat.approved / total) * 100) : 0;

                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {stat.month}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {stat.flagged}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                    {stat.approved}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                                    {stat.rejected}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        approvalRate >= 70 ? 'bg-green-100 text-green-800' :
                                                        approvalRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {approvalRate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Risk Analysis Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">High Risk Cases</span>
                                <span className="text-sm font-semibold text-red-600">{highRiskCases}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full"
                                    style={{ width: totalFlagged > 0 ? `${(highRiskCases / totalFlagged) * 100}%` : '0%' }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Medium Risk Cases</span>
                                <span className="text-sm font-semibold text-yellow-600">
                                    {totalFlagged - highRiskCases - (totalFlagged - highRiskCases - approvedCases - rejectedCases)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: totalFlagged > 0 ? `${((totalFlagged - highRiskCases) / totalFlagged) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Action Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Action Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-green-800">Cases Approved</span>
                                <span className="text-lg font-bold text-green-600">{approvedCases}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-sm font-medium text-red-800">Cases Rejected</span>
                                <span className="text-lg font-bold text-red-600">{rejectedCases}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-sm font-medium text-yellow-800">Cases Pending</span>
                                <span className="text-lg font-bold text-yellow-600">{pendingCases}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}