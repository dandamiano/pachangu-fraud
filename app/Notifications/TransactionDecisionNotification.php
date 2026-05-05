<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionDecisionNotification extends Notification implements ShouldQueue
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
        $subject = $this->transaction->status === 'approved'
            ? 'Your transaction has been approved'
            : 'Your transaction has been rejected';

        $message = $this->transaction->status === 'approved'
            ? 'Your transaction has been approved. You can retry payment.'
            : 'Your transaction has been rejected due to fraud risk.';

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . ($notifiable->name ?? 'Customer') . ',')
            ->line($message)
            ->line('Transaction ID: TXN-' . $this->transaction->id)
            ->line('Amount: MWK ' . number_format($this->transaction->amount, 2))
            ->line('Current status: ' . ucfirst($this->transaction->status))
            ->action('View your portal', url('/portal'));
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
        \Log::error('TransactionDecisionNotification failed', [
            'transaction_id' => $this->transaction->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
