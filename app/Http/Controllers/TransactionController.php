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
            'status' => 'pending',
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        // Transaction status is set by fraud analysis
        // If no fraud detected (low risk), auto-approve; otherwise require investigator review
        if (! $fraudResult['is_fraud']) {
            $transaction->update(['status' => 'completed']);
        }
        // If fraud flagged, stays in pending_review for investigator decision

        return response()->json([
            'transaction' => $transaction,
            'fraud_analysis' => $fraudResult,
        ]);
    }

    // Callback from PayChangu or simulated webhook
    public function callback(Request $request)
    {
        // Check if this is a retry transaction
        $retryTransactionId = $request->input('meta.retry_transaction_id') ?? $request->input('retry_transaction_id');

        if ($retryTransactionId) {
            // This is a retry - update existing transaction
            $transaction = Transaction::find($retryTransactionId);

            if ($transaction) {
                \Log::info('Processing retry callback', [
                    'retry_transaction_id' => $retryTransactionId,
                    'transaction_status' => $transaction->status
                ]);

                // Mark the retry transaction as completed
                $transaction->update(['status' => 'completed']);

                \Log::info('Retry transaction marked as completed', [
                    'transaction_id' => $transaction->id
                ]);

                return response()->json([
                    'message' => 'Retry callback processed successfully',
                    'transaction_id' => $transaction->id,
                    'status' => 'completed'
                ]);
            } else {
                \Log::error('Retry transaction not found', [
                    'retry_transaction_id' => $retryTransactionId
                ]);

                return response()->json([
                    'error' => 'Retry transaction not found'
                ], 404);
            }
        }

        // This is a new transaction (original flow)
        $transaction = Transaction::create([
            'user_id' => $request->user_id ?? 1,
            'amount' => $request->amount,
            'type' => $request->type ?? 'payment',
            'location' => $request->location ?? 'Unknown',
            'status' => 'pending',
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        // If low risk score, auto-approve; otherwise investigator reviews
        if (! $fraudResult['is_fraud']) {
            $transaction->update(['status' => 'completed']);
        }
        // If fraud flagged (high risk), stays in pending_review for investigator decision

        return response()->json([
            'message' => 'Callback received',
            'fraud_analysis' => $fraudResult,
        ]);
    }

    // Approve a flagged transaction and allow user retry
    public function approve($id)
    {
        \Log::info('Approve request received', [
            'id_param' => $id,
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role
        ]);

        $transaction = Transaction::findOrFail($id);

        \Log::info('Transaction found', [
            'transaction_id' => $transaction->id,
            'current_status' => $transaction->status
        ]);

        try {
            $transaction->update(['status' => 'approved']);

            \Log::info('Transaction Approved', [
                'transaction_id' => $transaction->id,
                'approved_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction approved successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            \Log::error('Approval Failed', [
                'transaction_id' => $transaction->id,
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
        \Log::info('Reject request received', [
            'id_param' => $id,
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role
        ]);

        $transaction = Transaction::findOrFail($id);

        \Log::info('Transaction found for rejection', [
            'transaction_id' => $transaction->id,
            'current_status' => $transaction->status
        ]);

        try {
            $transaction->update(['status' => 'rejected']);

            \Log::info('Transaction Rejected', [
                'transaction_id' => $transaction->id,
                'rejected_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction rejected successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            \Log::error('Rejection Failed', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to reject transaction'
            ], 500);
        }
    }
}
