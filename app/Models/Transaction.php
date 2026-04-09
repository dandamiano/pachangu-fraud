<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'location',
        'status'
    ];

    public function fraudLog()
    {
        return $this->hasOne(FraudLog::class); // One transaction has one fraud log
    }
}
