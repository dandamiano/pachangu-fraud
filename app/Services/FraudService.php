<?php
namespace App\Services;

use App\Models\FraudLog;

class FraudService
{
    public function analyze($transaction)
    {
        $riskScore = 0;
        $reasons = [];

        // Rule 1: High amount
        if ($transaction->amount > 100000) {
            $riskScore += 50;
            $reasons[] = "High amount (> 100,000)";
        }

        // Rule 2: Rapid transaction simulation (you can add timestamps)
        // Rule 3: Location anomaly simulation
        if ($transaction->location != 'Lilongwe') {
            $riskScore += 20;
            $reasons[] = "Location not in safe zone (not Lilongwe)";
        }

        $isFraud = $riskScore >= 50;
        $reason = !empty($reasons) ? implode('; ', $reasons) : 'Normal transaction';

        \Log::info('Fraud Analysis', [
            'transaction_id' => $transaction->id,
            'amount' => $transaction->amount,
            'location' => $transaction->location,
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud,
            'reason' => $reason
        ]);

        // Store fraud log
        FraudLog::create([
            'transaction_id' => $transaction->id,
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud,
            'reason' => $reason
        ]);

        return [
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud
        ];
    }
}