<?php

namespace App\Console\Commands;

use App\Models\CustomerReminder;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Daily: notify customers about reminders that are due (remind_on reached),
 * and once more on the day itself.
 */
class SendCustomerReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Send due document reminders to customers';

    public function handle(): int
    {
        $today = Carbon::today();
        $sent = 0;

        $first = CustomerReminder::where('status', 'open')->whereNull('notified_at')
            ->whereDate('remind_on', '<=', $today)->get();
        foreach ($first as $reminder) {
            $this->notify($reminder, false);
            $reminder->update(['notified_at' => now()]);
            $sent++;
        }

        $dueToday = CustomerReminder::where('status', 'open')->whereNull('due_notified_at')
            ->whereDate('due_date', '<=', $today)->whereNotNull('notified_at')->get();
        foreach ($dueToday as $reminder) {
            $this->notify($reminder, true);
            $reminder->update(['due_notified_at' => now()]);
            $sent++;
        }

        $this->info("Reminders sent: $sent");

        return self::SUCCESS;
    }

    private function notify(CustomerReminder $r, bool $dueNow): void
    {
        $date = $r->due_date->format('d.m.Y');
        Notification::create([
            'user_email' => $r->user_email,
            'type' => 'reminder',
            'title_de' => $dueNow ? 'Heute fällig' : 'Erinnerung',
            'title_ar' => $dueNow ? 'الموعد اليوم' : 'تذكير',
            'title_en' => $dueNow ? 'Due today' : 'Reminder',
            'message_de' => "{$r->title} – bis {$date}",
            'message_ar' => "{$r->title} – قبل {$date}",
            'message_en' => "{$r->title} – by {$date}",
            'link' => 'MyDocuments',
        ]);

        if (config('mail.default') === 'log') {
            return;
        }
        try {
            Mail::raw(
                "{$r->title}\n{$date}\n\n".($r->details ?? '')."\n\nhttps://app.einsteindienstleistung.com/MyDocuments\n\nEinStein Dienstleistung",
                fn ($m) => $m->to($r->user_email)->subject('EinStein: '.$r->title)
            );
        } catch (Throwable $e) {
            Log::warning('reminder mail failed', ['id' => $r->id, 'error' => $e->getMessage()]);
        }
    }
}
