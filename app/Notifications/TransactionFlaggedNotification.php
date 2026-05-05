<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionFlaggedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Transaction $transaction)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your transaction has been flagged for review')
            ->greeting('Hello ' . ($notifiable->name ?? 'Customer') . ',')
            ->line('Your transaction has been flagged and is under review.')
            ->line('Transaction ID: TXN-' . $this->transaction->id)
            ->line('Amount: MWK ' . number_format($this->transaction->amount, 2))
            ->line('Status: ' . ucfirst($this->transaction->status))
            ->action('View your portal', url('/portal'))
            ->line('We will notify you once a decision is made.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'transaction_id' => $this->transaction->id,
            'amount' => $this->transaction->amount,
            'status' => $this->transaction->status,
        ];
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error('TransactionFlaggedNotification failed', [
            'transaction_id' => $this->transaction->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
