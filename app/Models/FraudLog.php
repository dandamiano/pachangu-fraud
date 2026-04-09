<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FraudLog extends Model
{
    protected $fillable = [
        'transaction_id', // ADD THIS
        'risk_score',
        'is_fraud',
        'reason'
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}
