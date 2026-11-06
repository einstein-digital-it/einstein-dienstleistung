<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Document reminders (Jobcenter period ends, residence permit expires, ...)
Illuminate\Support\Facades\Schedule::command('reminders:send')->dailyAt('08:00')->timezone('Europe/Berlin');
