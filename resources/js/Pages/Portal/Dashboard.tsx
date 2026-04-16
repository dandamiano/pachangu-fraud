import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";

interface Transaction {
    id: number;
    amount: number;
    type: string;
    location: string;
    status: string;
    created_at: string;
    fraudLog?: {
        risk_score: number;
        is_fraud: boolean;
        reason: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Stats {
    total_transactions: number;
    completed_transactions: number;
    pending_transactions: number;
    total_amount: number;
}

interface Props {
    transactions: Transaction[];
    stats: Stats;
    user: User;
}

export default function Dashboard({ transactions, stats, user }: Props) {
    const { flash } = usePage().props as any;
    const [loading, setLoading] = useState(false);
    const [retryLoadingId, setRetryLoadingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

    const [form, setForm] = useState({
        amount: "",
        type: "payment",
        location: "",
    });

    const handleRetry = async (transactionId: number) => {
        if (retryLoadingId !== null) return;

        setRetryLoadingId(transactionId);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/portal/retry/${transactionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                throw new Error('Invalid server response');
            }

            if (data.success && data.redirect) {
                // External redirect to payment gateway for retry
                console.log('Redirecting to retry payment:', data.redirect);
                window.location.href = data.redirect;
                return;
            }

            if (data.error) {
                alert(data.error);
                return;
            }

            alert('Retry failed. Please try again.');
        } catch (error: any) {
            console.error('Retry error:', error);
            alert(error?.message || 'Retry request failed.');
        } finally {
            setRetryLoadingId(null);
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        // Use fetch instead of router.post to handle external redirects
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        console.log('CSRF Token:', csrfToken);
        console.log('Form data:', form);

        fetch('/portal/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
                'Accept': 'application/json',
            },
            body: JSON.stringify(form)
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            return response.text(); // Get text first to see what we're getting
        })
        .then(text => {
            console.log('Raw response:', text);
            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);
                if (data.success && data.redirect) {
                    // External redirect to payment gateway
                    console.log('Redirecting to:', data.redirect);
                    window.location.href = data.redirect;
                } else if (data.error) {
                    // Handle error
                    alert(data.error);
                } else {
                    alert('Unexpected response format: ' + JSON.stringify(data));
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                alert('Server returned invalid response: ' + text.substring(0, 200));
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('Network error: ' + error.message);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'pending_review': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'approved':
                return 'Approved — retry payment';
            case 'pending_review':
                return 'Pending review';
            case 'rejected':
                return 'Rejected';
            default:
                return status.replace('_', ' ');
        }
    };

    const getRiskBadge = (transaction: Transaction) => {
        if (!transaction.fraudLog) return null;

        const { risk_score, is_fraud } = transaction.fraudLog;
        if (is_fraud) {
            return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">High Risk</span>;
        } else if (risk_score > 50) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Medium Risk</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Low Risk</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">PayChangu Portal</h1>
                            <p className="text-sm text-gray-600">Secure Transaction Management</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_transactions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completed_transactions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_transactions}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">MWK {stats.total_amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {flash?.error && (
                    <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('form')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                    activeTab === 'form'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Make Transaction
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                    activeTab === 'history'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Transaction History
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'form' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">New Transaction</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (MWK)</label>
                                            <input
                                                type="number"
                                                placeholder="Enter amount"
                                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={form.amount}
                                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                                            <select
                                                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                                required
                                            >
                                                <option value="payment">Payment</option>
                                                <option value="transfer">Transfer</option>
                                                <option value="withdrawal">Withdrawal</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <select
                                            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={form.location}
                                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                                            required
                                        >
                                            <option value="">Select location</option>
                                            <option value="Lilongwe">Lilongwe (Safe)</option>
                                            <option value="Blantyre">Blantyre (Flagged)</option>
                                            <option value="Mzuzu">Mzuzu (Flagged)</option>
                                            <option value="Zomba">Zomba (Flagged)</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : "Proceed to Payment"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {transactions.map((transaction) => (
                                                <tr key={transaction.id} className="hover:bg-gray-50">
                                                    <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        MWK {transaction.amount.toLocaleString()}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                        {transaction.type}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                                        {transaction.location}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                                            {getStatusLabel(transaction.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                                        {getRiskBadge(transaction)}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap">
                                                        {transaction.status === 'approved' ? (
                                                            <button
                                                                onClick={() => handleRetry(transaction.id)}
                                                                disabled={retryLoadingId !== null}
                                                                className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                {retryLoadingId === transaction.id ? 'Retrying...' : 'Retry'}
                                                            </button>
                                                        ) : transaction.status === 'rejected' ? (
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                Rejected
                                                            </span>
                                                        ) : transaction.status === 'completed' ? (
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 text-xs text-gray-500">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {transactions.length === 0 && (
                                        <div className="text-center py-8">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                                            <p className="mt-1 text-sm text-gray-500">Get started by making your first transaction.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}