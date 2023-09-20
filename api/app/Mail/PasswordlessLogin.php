<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\HtmlString;

class PasswordlessLogin extends Notification
{

    public function __construct(
        private string $code,
        private int $validInMinutes
    )
    {
        //
    }

    /**
     * Get the notification's channels.
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {


        return $this->buildMailMessage();
    }

    /**
     * Get the verify email notification mail message for the given URL.
     *
     * @param  string  $url
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    protected function buildMailMessage()
    {
        $style = "padding: 2rem 4rem; display: block; text-align: center; font-size: 2rem; background: #000; color: #fff; border-radius: 5px; letter-spacing: 0.5rem;";
        return (new MailMessage)
            ->subject(__('Your login code'))
            ->greeting(__('Your login code:'))
            ->line(new HtmlString("<h1 style=\"$style\">$this->code</h1>"))
            ->line(__('The code ist valid for :minutes minutes.', ['minutes' => $this->validInMinutes]));
            // ->action(Lang::get('Verify Email Address'), $url)
            // ->line(Lang::get('If you did not create an account, no further action is required.'));
    }


}
