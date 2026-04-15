<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Transaction;
use App\Services\FraudService;

class PortalController extends Controller
{
    public function index()
    {
        return Inertia::render('Portal/TransactionForm', [
            'transactions' => auth()->user()->transactions()->with('fraudLog')->latest()->get()
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'type' => 'required',
            'location' => 'required'
        ]);

        // Step 1: Create transaction and analyze fraud
        $transaction = Transaction::create([
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'type' => $request->type,
            'location' => $request->location,
            'status' => 'pending_review',
        ]);

        $fraudResult = app(FraudService::class)->analyze($transaction);

        $isFraud = $fraudResult['is_fraud'];

        if (!$isFraud) {
            $transaction->update(['status' => 'completed']);
        }

        // Step 2: If FRAUD
        if ($isFraud) {
            return response()->json([
                'success' => false,
                'error' => '⚠️ Fraud detected! Transaction pending approval.'
            ], 400);
        }

        // Step 3: If SAFE → Redirect to PayChangu
        try {
            \Log::info('Initiating PayChangu payment', [
                'transaction_id' => $transaction->id,
                'amount' => $request->amount
            ]);

            $paychanguUrl = env('PAYCHANGU_API_URL', 'https://api.paychangu.com/payment');
            
            // For development: if PAYCHANGU_TEST_MODE is enabled, use mock response
            if (env('PAYCHANGU_TEST_MODE', false)) {
                \Log::info('Using PayChangu test mode (mock)');
                $payData = [
                    'data' => [
                        'checkout_url' => 'https://checkout.paychangu.com/mock-' . rand(100000, 999999),
                        'reference' => 'TEST-' . $transaction->id
                    ]
                ];
            } else {
                $response = Http::timeout(30)->retry(2, 1000)->withHeaders([
                    'Authorization' => 'Bearer ' . env('PAYCHANGU_TEST_KEY', 'sec-test-iA4dZR7CJ0Ku6wucXiRCZKVsqLDyQwD8'),
                    'Accept' => 'application/json',
                ])->post($paychanguUrl, [
                    "amount" => (string)$request->amount,
                    "currency" => "MWK",
                    "email" => auth()->user()->email,
                    "first_name" => auth()->user()->name,
                    "last_name" => auth()->user()->last_name ?? "Banda",
                    "callback_url" => "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
                    "return_url" => url('/portal'),
                    "tx_ref" => (string)rand(100000000, 999999999),
                    "customization" => [
                        "title" => "Fraud Checked Payment",
                        "description" => "Secure Payment"
                    ],
                    "meta" => [
                        "uuid" => "uuid",
                        "response" => "Response"
                    ]
                ]);

                \Log::info('PayChangu Response', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                if (!$response->successful()) {
                    \Log::error('PayChangu API Error', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'transaction_id' => $transaction->id
                    ]);
                    return response()->json([
                        'success' => false,
                        'error' => 'Payment gateway error (HTTP ' . $response->status() . '). Please try again.'
                    ], 400);
                }

                $payData = $response->json();
            }

            if (!isset($payData['data']['checkout_url'])) {
                \Log::error('PayChangu Invalid Response', [
                    'data' => $payData,
                    'transaction_id' => $transaction->id
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid payment response. Please try again.'
                ], 400);
            }

            \Log::info('Payment Redirect', [
                'checkout_url' => $payData['data']['checkout_url'],
                'transaction_id' => $transaction->id
            ]);

            // Always return JSON for this endpoint since frontend uses fetch
            return response()->json([
                'success' => true,
                'redirect' => $payData['data']['checkout_url'],
                'message' => 'Redirecting to payment gateway...'
            ]);
        } catch (\Exception $e) {
            \Log::error('PayChangu Request Failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transaction->id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Payment processing failed. Check DNS and internet connection.'
            ], 500);
        }
    }
}