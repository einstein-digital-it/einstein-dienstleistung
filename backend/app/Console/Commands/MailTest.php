<?php

namespace App\Console\Commands;

use App\Mail\VerificationCodeMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/** Sends a sample sign-up code email to check the mail settings (MAIL_* in .env). */
class MailTest extends Command
{
    protected $signature = 'mail:test {to : Address that should receive the test email} {--lang=ar}';

    protected $description = 'Send a sample verification email to check the SMTP settings';

    public function handle(): int
    {
        $to = (string) $this->argument('to');
        if (! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error('Not a valid email address.');

            return self::FAILURE;
        }

        $this->line('Mailer: '.config('mail.default').' · Host: '.config('mail.mailers.smtp.host').':'.config('mail.mailers.smtp.port').' · From: '.config('mail.from.address'));

        try {
            Mail::to($to)->send(new VerificationCodeMail('123456', (string) $this->option('lang')));
        } catch (\Throwable $e) {
            $this->error('Sending failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info(config('mail.default') === 'log'
            ? 'Written to storage/logs/laravel.log only (MAIL_MAILER=log). Set MAIL_MAILER=smtp to really send.'
            : "Sent to {$to}. Check the inbox and the spam folder.");

        return self::SUCCESS;
    }
}
