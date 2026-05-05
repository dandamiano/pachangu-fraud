<?php

namespace App\Services;

use App\Models\FraudLog;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\InvestigatorAlertNotification;
use App\Notifications\TransactionFlaggedNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class FraudService
{
    public function analyze(Transaction $transaction): array
    {
        $config = config('fraud');
        $userId = $transaction->user_id;

        // Get previous transactions in time window
        $timeWindow = Carbon::now()->subMinutes($config['rules']['velocity']['time_window_minutes']);
        $previousTransactions = Transaction::where('user_id', $userId)
            ->where('created_at', '>=', $timeWindow)
            ->get();

        // Get all previous locations for user
        $previousLocations = Transaction::where('user_id', $userId)
            ->pluck('location')
            ->unique()
            ->toArray();

        $riskScore = 0;
        $reasons = [];
        $ruleDetails = [];

        // Apply rules
        $this->checkAmountRule($transaction, $config, $riskScore, $reasons, $ruleDetails);
        $this->checkLocationRule($transaction, $previousLocations, $config, $riskScore, $reasons, $ruleDetails);
        $this->checkVelocityRule($previousTransactions, $config, $riskScore, $reasons, $ruleDetails);
        $this->checkLocationAnomalyRule($previousTransactions, $transaction, $config, $riskScore, $reasons, $ruleDetails);

        // Determine status
        $status = $this->determineStatus($riskScore, $config);
        // Flag transaction as potential fraud if risk score is high, but let investigator make final decision
        $isFraud = $riskScore >= $config['decision_thresholds']['pending_review'];

        $previousStatus = $transaction->status;
        $transaction->update(['status' => $status]);

        if ($this->isFlaggedStatus($status) && ! $this->isFlaggedStatus($previousStatus)) {
            $this->notifyFlaggedTransaction($transaction);
        }

        // Combine reasons
        $reason = !empty($reasons) ? implode('; ', $reasons) : 'Normal transaction';

        // Log structured output
        \Log::info('Fraud Analysis', [
            'transaction_id' => $transaction->id,
            'user_id' => $userId,
            'amount' => $transaction->amount,
            'location' => $transaction->location,
            'risk_score' => $riskScore,
            'status' => $status,
            'is_fraud' => $isFraud,
            'reasons' => $reasons,
            'rule_details' => $ruleDetails
        ]);

        // Store fraud log
        FraudLog::create([
            'transaction_id' => $transaction->id,
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud,
            'reason' => $reason,
            'meta' => json_encode($ruleDetails)
        ]);

        return [
            'risk_score' => $riskScore,
            'is_fraud' => $isFraud,
            'status' => $status,
            'reasons' => $reasons
        ];
    }

    private function checkAmountRule(Transaction $transaction, array $config, int &$riskScore, array &$reasons, array &$ruleDetails): void
    {
        $amount = $transaction->amount;
        $rules = $config['rules']['amount'];

        if ($amount < $rules['normal_min'] || $amount > $rules['normal_max']) {
            $riskScore += $rules['out_of_range_score'];
            $reasons[] = "Amount out of normal range ({$rules['normal_min']} - {$rules['normal_max']})";
            $ruleDetails['amount'] = ['score' => $rules['out_of_range_score'], 'reason' => 'out_of_range'];
        }

        if ($amount > $rules['high_threshold']) {
            $riskScore += $rules['very_high_score'];
            $reasons[] = "Very high amount (> {$rules['high_threshold']})";
            $ruleDetails['amount'] = ['score' => $rules['very_high_score'], 'reason' => 'very_high'];
        }

        if (!isset($ruleDetails['amount'])) {
            $ruleDetails['amount'] = ['score' => 0, 'reason' => 'normal'];
        }
    }

    private function checkLocationRule(Transaction $transaction, array $previousLocations, array $config, int &$riskScore, array &$reasons, array &$ruleDetails): void
    {
        $location = $transaction->location;
        $rules = $config['rules']['location'];

        if (!in_array($location, $previousLocations)) {
            $riskScore += $rules['new_location_score'];
            $reasons[] = "New location for user";
            $ruleDetails['location'] = ['score' => $rules['new_location_score'], 'reason' => 'new_location'];
        } else {
            $ruleDetails['location'] = ['score' => 0, 'reason' => 'known_location'];
        }
    }

    private function checkVelocityRule(Collection $previousTransactions, array $config, int &$riskScore, array &$reasons, array &$ruleDetails): void
    {
        $rules = $config['rules']['velocity'];
        $count = $previousTransactions->count();

        if ($count >= $rules['max_transactions']) {
            $riskScore += $rules['score'];
            $reasons[] = "High velocity: {$count} transactions in last {$rules['time_window_minutes']} minutes";
            $ruleDetails['velocity'] = ['score' => $rules['score'], 'count' => $count];
        } else {
            $ruleDetails['velocity'] = ['score' => 0, 'count' => $count];
        }
    }

    private function checkLocationAnomalyRule(Collection $previousTransactions, Transaction $transaction, array $config, int &$riskScore, array &$reasons, array &$ruleDetails): void
    {
        $rules = $config['rules']['location_anomaly'];
        $recentLocations = $previousTransactions->pluck('location')->push($transaction->location)->unique();

        if ($recentLocations->count() > $rules['max_unique_locations']) {
            $riskScore += $rules['score'];
            $reasons[] = "Location anomaly: multiple locations in short time";
            $ruleDetails['location_anomaly'] = ['score' => $rules['score'], 'unique_locations' => $recentLocations->count()];
        } else {
            $ruleDetails['location_anomaly'] = ['score' => 0, 'unique_locations' => $recentLocations->count()];
        }
    }

    private function determineStatus(int $riskScore, array $config): string
    {
        $thresholds = $config['decision_thresholds'];

        if ($riskScore < $thresholds['approved']) {
            return 'approved';
        } else {
            // All transactions with risk score >= approved threshold are flagged for investigator review
            // No automatic blocking - investigator decides approval/rejection
            return 'pending_review';
        }
    }

    private function isFlaggedStatus(string $status): bool
    {
        return in_array($status, ['pending_review', 'blocked'], true);
    }

    private function notifyFlaggedTransaction(Transaction $transaction): void
    {
        $transactionUser = $transaction->user ?? User::find($transaction->user_id);

        if ($transactionUser) {
            $transactionUser->notify(new TransactionFlaggedNotification($transaction));
            \Log::info('Queued TransactionFlaggedNotification', [
                'transaction_id' => $transaction->id,
                'user_id' => $transactionUser->id,
            ]);
        }

        $investigators = User::where('role', 'investigator')->get();

        if ($investigators->isNotEmpty()) {
            Notification::send($investigators, new InvestigatorAlertNotification($transaction));
            \Log::info('Queued InvestigatorAlertNotification', [
                'transaction_id' => $transaction->id,
                'investigator_count' => $investigators->count(),
            ]);
        }
    }
}
