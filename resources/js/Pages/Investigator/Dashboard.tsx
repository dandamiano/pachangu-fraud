import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
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
    icon: React.ReactNode;
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
            case 'approved':
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);

    const isLoading = loadingId === transactionId;

    if (currentStatus !== 'pending_review') {
        return (
            <span className="text-xs text-gray-500">
                {currentStatus === 'completed' || currentStatus === 'approved' ? 'Approved' : 'Rejected'}
            </span>
        );
    }

    const handleActionClick = (action: 'approve' | 'reject') => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (confirmAction === 'approve') {
            onApprove(transactionId);
        } else if (confirmAction === 'reject') {
            onReject(transactionId);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick('approve');
                    }}
                    disabled={isLoading || disabled}
                    className="px-3 py-1 rounded text-xs font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Processing...' : 'Approve'}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick('reject');
                    }}
                    disabled={isLoading || disabled}
                    className="px-3 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Processing...' : 'Reject'}
                </button>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className={`p-2 rounded-full ${confirmAction === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {confirmAction === 'approve' ? (
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                                    Confirm {confirmAction === 'approve' ? 'Approval' : 'Rejection'}
                                </h3>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Do you want to {confirmAction} this transaction?
                                <br />
                                <span className="font-medium">Transaction ID: #{transactionId}</span>
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                                        confirmAction === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {confirmAction === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
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
            await router.post(`/transactions/${transactionId}/approve`, {});
            setSuccessMessage('Transaction approved successfully!');
            // Reload after showing the message for longer
            setTimeout(() => {
                window.location.reload();
            }, 3000);
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
            await router.post(`/transactions/${transactionId}/reject`, {});
            setSuccessMessage('Transaction rejected successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L8 11.086l6.793-6.793a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        label="Total Flagged"
                        value={stats.total_flagged || 0}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M7.5 2C6.672 2 6 2.672 6 3.5V20a1 1 0 102 0V14.268l.736-.245a2 2 0 011.236 0l2.086.695 2.08-.693a2 2 0 011.238 0l2.086.695 1.657-.552A1 1 0 0020 13V4a1 1 0 00-1.45-.894l-1.638.59a2 2 0 01-1.238 0l-2.086-.695-2.08.693a2 2 0 01-1.238 0L8.736 3.255 8 3.5V3.5A1.5 1.5 0 017.5 2z" />
                            </svg>
                        }
                        color="red"
                    />
                    <StatsCard
                        label="High Risk"
                        value={stats.high_risk || 0}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M10.29 3.86a1 1 0 011.42 0l8.29 8.29a1 1 0 01.21 1.09l-7.5 15A1 1 0 0112 28h-8a1 1 0 01-.92-1.4l7.5-15a1 1 0 01.21-1.09l1.5-1.5zM12 9v4m0 4h.01" clipRule="evenodd" />
                            </svg>
                        }
                        color="red"
                    />
                    <StatsCard
                        label="Pending Review"
                        value={stats.pending_review || 0}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M12 8v5l3 3a1 1 0 101.414-1.414L13 11.586V8a1 1 0 10-2 0z" />
                                <path fillRule="evenodd" d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-9a9 9 0 100 18 9 9 0 000-18z" clipRule="evenodd" />
                            </svg>
                        }
                        color="yellow"
                    />
                    <StatsCard
                        label="Approved"
                        value={stats.approved || 0}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M10.28 15.78a.75.75 0 001.06 0l5.47-5.47a.75.75 0 10-1.06-1.06L11 13.69 9.28 11.97a.75.75 0 10-1.06 1.06l2.06 2.05z" clipRule="evenodd" />
                                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>
                        }
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
