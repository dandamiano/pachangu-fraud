import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface FraudLog {
    id: number;
    transaction_id: number;
    risk_score: number;
    is_fraud: boolean;
    reason: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Transaction {
    id: number;
    user_id: number;
    amount: number;
    type: string;
    location: string;
    status: string;
    created_at: string;
    updated_at: string;
    fraudLog?: FraudLog;
    user?: User;
}

interface Stats {
    total_flagged: number;
    high_risk: number;
    pending_review: number;
    approved: number;
}

interface InvestigatorDashboardProps {
    transactions: Transaction[];
    stats: Stats;
}

// Stats Card Component
function StatsCard({
    label,
    value,
    icon,
    color
}: {
    label: string;
    value: number;
    icon: string;
    color: string;
}) {
    const bgColorClass = {
        red: 'bg-red-50',
        yellow: 'bg-yellow-50',
        blue: 'bg-blue-50',
        green: 'bg-green-50'
    }[color] || 'bg-gray-50';

    const iconColorClass = {
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        blue: 'text-blue-600',
        green: 'text-green-600'
    }[color] || 'text-gray-600';

    return (
        <div className={`${bgColorClass} rounded-lg p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`${iconColorClass} text-3xl`}>{icon}</div>
            </div>
        </div>
    );
}

// Risk Badge Component
function RiskBadge({ riskScore }: { riskScore: number }) {
    const getRiskLevel = (score: number) => {
        if (score >= 70) return { level: 'High', color: 'bg-red-100 text-red-800', progressColor: 'bg-red-500' };
        if (score >= 40) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', progressColor: 'bg-yellow-500' };
        return { level: 'Low', color: 'bg-green-100 text-green-800', progressColor: 'bg-green-500' };
    };

    const { level, color, progressColor } = getRiskLevel(riskScore);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                    {level}
                </span>
                <span className="text-xs font-semibold text-gray-700">{riskScore}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${progressColor}`}
                    style={{ width: `${Math.min(riskScore, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const displayStatus = status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
            {displayStatus}
        </span>
    );
}

// Action Buttons Component
function ActionButtons({
    transactionId,
    currentStatus,
    onApprove,
    onReject,
    loadingId,
    disabled
}: {
    transactionId: number;
    currentStatus: string;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    loadingId: number | null;
    disabled: boolean;
}) {
    const isLoading = loadingId === transactionId;

    if (currentStatus !== 'pending_review') {
        return (
            <span className="text-xs text-gray-500">
                {currentStatus === 'completed' ? 'Approved' : 'Rejected'}
            </span>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => onApprove(transactionId)}
                disabled={isLoading || disabled}
                className="px-3 py-1 rounded text-xs font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Processing...' : 'Approve'}
            </button>
            <button
                onClick={() => onReject(transactionId)}
                disabled={isLoading || disabled}
                className="px-3 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Processing...' : 'Reject'}
            </button>
        </div>
    );
}

// Case Details Panel Component
function CaseDetailsPanel({
    transaction,
    onClose
}: {
    transaction: Transaction | null;
    onClose: () => void;
}) {
    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center sticky top-0">
                    <h2 className="text-2xl font-bold">Transaction Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Transaction Info */}
                    <div className="border-b pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Transaction ID</p>
                                <p className="text-lg font-bold text-gray-900">#{transaction.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Amount</p>
                                <p className="text-lg font-bold text-gray-900">{transaction.amount.toLocaleString()} MWK</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Type</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">{transaction.type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 uppercase tracking-wide">Location</p>
                                <p className="text-lg font-bold text-gray-900">{transaction.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    {transaction.user && (
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Name</p>
                                    <p className="text-lg font-bold text-gray-900">{transaction.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                                    <p className="text-lg font-bold text-gray-900">{transaction.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fraud Analysis */}
                    {transaction.fraudLog && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Analysis</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Risk Score</p>
                                    <RiskBadge riskScore={transaction.fraudLog.risk_score} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Risk Reason</p>
                                    <p className="text-sm text-gray-900 mt-1">{transaction.fraudLog.reason}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Detected At</p>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {new Date(transaction.fraudLog.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Current Status</p>
                        <StatusBadge status={transaction.status} />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Dashboard Component
export default function InvestigatorDashboard({ 
    transactions = [], 
    stats = { total_flagged: 0, high_risk: 0, pending_review: 0, approved: 0 }
}: InvestigatorDashboardProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleApprove = async (transactionId: number) => {
        setLoadingId(transactionId);
        try {
            const response = await fetch(`/transactions/${transactionId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            if (response.ok) {
                setSuccessMessage('Transaction approved successfully!');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Failed to approve transaction');
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async (transactionId: number) => {
        setLoadingId(transactionId);
        try {
            const response = await fetch(`/transactions/${transactionId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            if (response.ok) {
                setSuccessMessage('Transaction rejected successfully!');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Failed to reject transaction');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Fraud Investigation</h1>
                        <p className="text-gray-600 mt-1">Review and take action on flagged transactions</p>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        {successMessage}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        label="Total Flagged"
                        value={stats.total_flagged || 0}
                        icon="🚩"
                        color="red"
                    />
                    <StatsCard
                        label="High Risk"
                        value={stats.high_risk || 0}
                        icon="⚠️"
                        color="red"
                    />
                    <StatsCard
                        label="Pending Review"
                        value={stats.pending_review || 0}
                        icon="⏳"
                        color="yellow"
                    />
                    <StatsCard
                        label="Approved"
                        value={stats.approved || 0}
                        icon="✓"
                        color="green"
                    />
                </div>

                {/* Fraud Cases Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Fraud Cases</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} flagged for review
                        </p>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-lg text-gray-500">No flagged transactions</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Risk Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((transaction) => {
                                        const riskScore = transaction.fraudLog?.risk_score || 0;
                                        const isHighRisk = riskScore >= 70;
                                        const isMediumRisk = riskScore >= 40 && riskScore < 70;
                                        const rowBg = isHighRisk
                                            ? 'bg-red-50 hover:bg-red-100'
                                            : isMediumRisk
                                            ? 'bg-yellow-50 hover:bg-yellow-100'
                                            : 'hover:bg-gray-50';

                                        return (
                                            <tr
                                                key={transaction.id}
                                                onClick={() => setSelectedTransaction(transaction)}
                                                className={`${rowBg} cursor-pointer transition-colors`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    #{transaction.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {transaction.user?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    {transaction.amount.toLocaleString()} MWK
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {transaction.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {transaction.fraudLog && (
                                                        <RiskBadge riskScore={riskScore} />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={transaction.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <ActionButtons
                                                        transactionId={transaction.id}
                                                        currentStatus={transaction.status}
                                                        onApprove={handleApprove}
                                                        onReject={handleReject}
                                                        loadingId={loadingId}
                                                        disabled={loadingId !== null}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Case Details Modal */}
            <CaseDetailsPanel
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />
        </AdminLayout>
    );
}
