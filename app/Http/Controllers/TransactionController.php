<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Services\FraudService;

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
        return response()->json(Transaction::all());
    }

    // Store a transaction (simulation)
    public function store(Request $request)
    {
        $transaction = Transaction::create($request->all());

        // Run fraud detection
        $fraudResult = app(FraudService::class)->analyze($transaction);

        return response()->json([
            'transaction' => $transaction,
            'fraud_analysis' => $fraudResult
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
            'status' => 'completed'
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        return response()->json([
            'message' => 'Callback received',
            'fraud_analysis' => $fraudResult
        ]);
    }
}
