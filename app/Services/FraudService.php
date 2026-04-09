<?php
namespace App\Services;

use App\Models\FraudLog;

class FraudService
{
    public function analyze($transaction)
    {
        $riskScore = 0;

        // Rule 1: High amount
        if ($transaction->amount > 100000) {
            $riskScore += 50;
        }

        // Rule 2: Rapid transaction simulation (you can add timestamps)
        // Rule 3: Location anomaly simulation
        if ($transaction->location != 'Lilongwe') {
            $riskScore += 20;
        }

        $isFraud = $riskScore >= 50;

        // Store fraud log
        FraudLog::create([
            'transaction_id' => $transaction->id,
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud,
            'reason' => $isFraud ? 'Suspicious transaction' : 'Normal'
        ]);

        return [
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud
        ];
    }
}