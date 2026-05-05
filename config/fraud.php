<?php

return [
    'rules' => [
        'amount' => [
            'normal_min' => 100,
            'normal_max' => 1000000,
            'high_threshold' => 5000000,
            'out_of_range_score' => 20,
            'very_high_score' => 50,
        ],
        'location' => [
            'new_location_score' => 30,
        ],
        'velocity' => [
            'time_window_minutes' => 5,
            'max_transactions' => 3,
            'score' => 30,
        ],
        'location_anomaly' => [
            'time_window_minutes' => 5,
            'max_unique_locations' => 1,
            'score' => 25,
        ],
    ],
    'decision_thresholds' => [
        'approved' => 30,
        // Transactions with risk_score >= pending_review threshold are flagged for investigator review
        // No auto-blocking: all high-risk transactions are reviewed by investigators
        'pending_review' => 70,
    ],
];