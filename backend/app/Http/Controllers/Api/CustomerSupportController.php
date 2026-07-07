<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerSupportRequest;
use App\Models\SupportFaq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerSupportController extends Controller
{
    public function index(): JsonResponse
    {
        $faqs = SupportFaq::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SupportFaq $faq) => $this->serializeFaq($faq))
            ->values();

        return response()->json([
            'data' => [
                'contact' => [
                    'city' => 'Frankfurt, Deutschland',
                    'phone_primary' => '069 27246275',
                    'phone_secondary' => '01573 1770487',
                    'email' => 'info@e-in-s-tein.de',
                    'opening_hours' => 'Mo-Fr: 9:00 - 18:00 Uhr',
                    'chat_status' => 'online',
                ],
                'faqs' => $faqs->isNotEmpty() ? $faqs : $this->defaultFaqs(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:255'],
            'request_type' => ['required', Rule::in(['chat', 'callback', 'email', 'general'])],
            'subject' => ['sometimes', 'nullable', 'string', 'max:255'],
            'message' => ['sometimes', 'nullable', 'string'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ]);

        $supportRequest = CustomerSupportRequest::create([
            ...$data,
            'status' => 'new',
            'priority' => 'normal',
            'source' => 'customer_service',
        ]);

        return response()->json(['data' => $this->serializeRequest($supportRequest)], 201);
    }

    private function serializeFaq(SupportFaq $faq): array
    {
        return [
            'id' => $faq->id,
            'question_de' => $faq->question_de,
            'question_ar' => $faq->question_ar,
            'question_en' => $faq->question_en,
            'answer_de' => $faq->answer_de,
            'answer_ar' => $faq->answer_ar,
            'answer_en' => $faq->answer_en,
            'category' => $faq->category,
            'icon' => $faq->icon,
            'sort_order' => $faq->sort_order,
        ];
    }

    private function serializeRequest(CustomerSupportRequest $request): array
    {
        return [
            'id' => $request->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'request_type' => $request->request_type,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => $request->status,
            'priority' => $request->priority,
            'created_at' => $request->created_at?->toISOString(),
        ];
    }

    private function defaultFaqs(): array
    {
        return [
            [
                'id' => 'booking',
                'question_de' => 'Wie kann ich eine Buchung stornieren?',
                'question_en' => 'How can I cancel a booking?',
                'question_ar' => 'كيف يمكنني إلغاء حجز؟',
                'answer_de' => 'Senden Sie uns Ihre Buchungsnummer, damit unser Team die Stornierung bearbeiten kann.',
                'icon' => 'calendar',
            ],
            [
                'id' => 'payment',
                'question_de' => 'Welche Zahlungsmethoden gibt es?',
                'question_en' => 'Which payment methods are available?',
                'question_ar' => 'ما هي طرق الدفع المتاحة؟',
                'answer_de' => 'Die verfuegbaren Zahlungsmethoden werden im Zahlungsbereich der Buchung angezeigt.',
                'icon' => 'credit-card',
            ],
            [
                'id' => 'provider',
                'question_de' => 'Wie werde ich Dienstleister?',
                'question_en' => 'How do I become a provider?',
                'question_ar' => 'كيف أصبح مزود خدمة؟',
                'answer_de' => 'Nutzen Sie das Bewerbungsformular fuer Fachkraefte und laden Sie Ihre Unterlagen hoch.',
                'icon' => 'users',
            ],
        ];
    }
}
