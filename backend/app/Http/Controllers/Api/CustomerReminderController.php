<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerReminderController extends Controller
{
    /** Open reminders first, soonest due date first. */
    public function index(Request $request): JsonResponse
    {
        $email = $this->targetEmail($request);
        $reminders = CustomerReminder::query()
            ->whereRaw('LOWER(user_email) = ?', [strtolower($email)])
            ->when(! $request->boolean('all'), fn ($q) => $q->where('status', 'open'))
            ->orderBy('due_date')->limit(100)->get();

        return response()->json(['data' => $reminders]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:2000'],
            'folder' => ['nullable', 'string', 'max:40'],
            'due_date' => ['required', 'date', 'after_or_equal:today'],
            'remind_on' => ['nullable', 'date', 'before_or_equal:due_date'],
        ]);
        $reminder = CustomerReminder::create([
            ...$data,
            'user_email' => strtolower($this->targetEmail($request)),
            'folder' => $data['folder'] ?? 'sonstiges',
            'remind_on' => $data['remind_on'] ?? $data['due_date'],
        ]);

        return response()->json(['data' => $reminder], 201);
    }

    public function update(Request $request, CustomerReminder $reminder): JsonResponse
    {
        $this->authorizeAccess($request, $reminder);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['open', 'done', 'dismissed'])],
            'due_date' => ['sometimes', 'date'],
            'remind_on' => ['sometimes', 'date'],
            'title' => ['sometimes', 'string', 'max:255'],
        ]);
        if (isset($data['remind_on']) || isset($data['due_date'])) {
            $data['notified_at'] = null;
            $data['due_notified_at'] = null;
        }
        $reminder->update($data);

        return response()->json(['data' => $reminder->fresh()]);
    }

    /** Staff may pass ?email= to work on a customer's reminders. */
    private function targetEmail(Request $request): string
    {
        $user = $request->user();
        if (in_array($user->role, ['admin', 'provider'], true) && $request->filled('email')) {
            return (string) $request->input('email');
        }

        return $user->email;
    }

    private function authorizeAccess(Request $request, CustomerReminder $reminder): void
    {
        $user = $request->user();
        if (strcasecmp((string) $user?->email, $reminder->user_email) !== 0 && ! in_array($user?->role, ['admin', 'provider'], true)) {
            abort(404);
        }
    }
}
