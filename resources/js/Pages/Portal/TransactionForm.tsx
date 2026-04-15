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

interface Props {
    transactions: Transaction[];
}

export default function TransactionForm({ transactions }: Props) {
    const { flash } = usePage().props as any;
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        type: "payment",
        location: "",
    });

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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Transaction Portal</h1>

            {/* Alerts */}
            {flash?.error && (
                <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-white p-6 shadow rounded">
                    <h2 className="text-xl font-semibold mb-4">Make Transaction</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                className="border p-2 w-full rounded"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm({ ...form, amount: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                                className="border p-2 w-full rounded"
                                value={form.type}
                                onChange={(e) =>
                                    setForm({ ...form, type: e.target.value })
                                }
                                required
                            >
                                <option value="payment">Payment</option>
                                <option value="transfer">Transfer</option>
                                <option value="withdrawal">Withdrawal</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <select
                                className="border p-2 w-full rounded"
                                value={form.location}
                                onChange={(e) =>
                                    setForm({ ...form, location: e.target.value })
                                }
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
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Proceed to Payment"}
                        </button>
                    </form>
                </div>

                {/* Transactions Table */}
                <div className="bg-white p-6 shadow rounded">
                    <h2 className="text-xl font-semibold mb-4">Your Transactions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Amount</th>
                                    <th className="p-2 text-left">Type</th>
                                    <th className="p-2 text-left">Location</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-t">
                                        <td className="p-2">{transaction.amount}</td>
                                        <td className="p-2">{transaction.type}</td>
                                        <td className="p-2">{transaction.location}</td>
                                        <td className="p-2">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    transaction.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.status === 'pending_review'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="p-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && (
                            <p className="text-center text-gray-500 mt-4">No transactions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}