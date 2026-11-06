<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerDocument;
use App\Support\FormTemplates;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Applications (Anträge): templates + the customer's saved personal data,
 * so the app can fill the letter, show what's missing and send it by mail.
 */
class CustomerFormController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = array_filter([
            'full_name' => $user->full_name ?: $user->name,
            'phone' => $user->phone,
        ]) + (array) ($user->form_data ?? []);

        // Suggest recipients from the newest letter of each authority that printed an e-mail
        $suggestions = [];
        foreach (FormTemplates::all() as $form) {
            $email = CustomerDocument::whereRaw('LOWER(user_email) = ?', [strtolower($user->email)])
                ->where('folder', $form['folder'])->whereNotNull('sender_email')
                ->latest()->value('sender_email');
            if ($email) {
                $suggestions[$form['recipient_field']] = $email;
            }
        }

        return response()->json(['data' => [
            'personal' => FormTemplates::PERSONAL,
            'forms' => FormTemplates::all(),
            'data' => (object) $data,
            'suggestions' => (object) $suggestions,
            'email' => $user->email,
        ]]);
    }

    /** PUT customer/form-data { data: { key: value } } — merges into the saved data. */
    public function saveData(Request $request): JsonResponse
    {
        $allowed = collect(FormTemplates::PERSONAL)->pluck('key');
        foreach (FormTemplates::all() as $form) {
            $allowed = $allowed->merge(collect($form['fields'])->pluck('key'));
        }
        $allowed = $allowed->unique()->all();

        $input = (array) $request->input('data', []);
        $clean = [];
        foreach ($input as $key => $value) {
            if (in_array($key, $allowed, true) && (is_string($value) || is_null($value))) {
                $clean[$key] = $value === null ? null : mb_substr(trim($value), 0, 2000);
            }
        }

        $user = $request->user();
        $user->form_data = array_filter(array_merge((array) ($user->form_data ?? []), $clean), fn ($v) => $v !== null && $v !== '');
        if (! empty($clean['full_name'])) {
            $user->full_name = $clean['full_name'];
        }
        if (! empty($clean['phone'])) {
            $user->phone = $clean['phone'];
        }
        $user->save();

        return response()->json(['data' => (object) $user->form_data]);
    }
}
