<?php

namespace App\Notifications;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestigatorAlertNotification extends Notification implements ShouldQueue
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
            ->subject('New suspicious transaction requires review')
            ->greeting('Hello ' . ($notifiable->name ?? 'Investigator') . ',')
            ->line('A new suspicious transaction requires review.')
            ->line('Transaction ID: TXN-' . $this->transaction->id)
            ->line('Amount: MWK ' . number_format($this->transaction->amount, 2))
            ->line('User: ' . ($this->transaction->user?->name ?? 'Unknown'))
            ->line('Status: ' . ucfirst($this->transaction->status))
            ->action('Open investigator dashboard', route('investigator.dashboard'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'transaction_id' => $this->transaction->id,
            'amount' => $this->transaction->amount,
            'user_name' => $this->transaction->user?->name,
            'status' => $this->transaction->status,
        ];
    }

    public function failed(\Throwable $exception): void
    {
        \Log::error('InvestigatorAlertNotification failed', [
            'transaction_id' => $this->transaction->id,
            'exception' => $exception->getMessage(),
        ]);
    }
}
