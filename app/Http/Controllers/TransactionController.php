<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Services\FraudService;
use Inertia\Inertia;

// class TransactionController extends Controller
// {
//     public function store(Request $request)
//     {
//         $transaction = Transaction::create([
//             'user_id' => $request->user_id,
//             'amount' => $request->amount,
//             'type' => $request->type,
//             'location' => $request->location,
//             'status' => 'completed'
//         ]);

//         return response()->json($transaction);
//     }
// }

class TransactionController extends Controller
{
    // List all transactions
    public function index()
    {
        return Inertia::render('Admin/Transactions', [
            'transactions' => Transaction::with('fraudLog')->latest()->get()
        ]);
    }

    // Store a transaction (simulation)
    public function store(Request $request)
    {
        $transaction = Transaction::create([
            'user_id' => $request->user_id,
            'amount' => $request->amount,
            'type' => $request->type,
            'location' => $request->location,
            'status' => 'pending_review',
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        if (! $fraudResult['is_fraud']) {
            $transaction->update(['status' => 'completed']);
        }

        return response()->json([
            'transaction' => $transaction,
            'fraud_analysis' => $fraudResult,
        ]);
    }

    // Callback from PayChangu or simulated webhook
    public function callback(Request $request)
    {
        $transaction = Transaction::create([
            'user_id' => $request->user_id ?? 1,
            'amount' => $request->amount,
            'type' => $request->type ?? 'payment',
            'location' => $request->location ?? 'Unknown',
            'status' => 'completed',
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        if ($fraudResult['is_fraud']) {
            $transaction->update(['status' => 'pending_review']);
        }

        return response()->json([
            'message' => 'Callback received',
            'fraud_analysis' => $fraudResult,
        ]);
    }

    // Approve a flagged transaction
    public function approve($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->update(['status' => 'completed']);

            \Log::info('Transaction Approved', [
                'transaction_id' => $id,
                'approved_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction approved successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            \Log::error('Approval Failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to approve transaction'
            ], 500);
        }
    }

    // Reject a flagged transaction
    public function reject($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->update(['status' => 'rejected']);

            \Log::info('Transaction Rejected', [
                'transaction_id' => $id,
                'rejected_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction rejected successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            \Log::error('Rejection Failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to reject transaction'
            ], 500);
        }
    }
}
