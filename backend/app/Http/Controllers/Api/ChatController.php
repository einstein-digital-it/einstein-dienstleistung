<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function respond(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'lang' => ['sometimes', 'nullable', 'string', 'max:10'],
        ]);

        $message = mb_strtolower($data['message']);
        $lang = $data['lang'] ?? 'de';

        $answer = match (true) {
            str_contains($message, 'preis') || str_contains($message, 'price') || str_contains($message, 'سعر') => [
                'de' => 'Unsere Preise haengen von Kategorie und Umfang ab. Sie koennen die aktuellen Preise auf der Services-Seite sehen oder direkt eine Buchung starten.',
                'en' => 'Prices depend on category and scope. You can review current prices on the Services page or start a booking.',
                'ar' => 'تختلف الأسعار حسب الفئة وحجم الخدمة. يمكنك مراجعة الأسعار الحالية من صفحة الخدمات أو بدء الحجز مباشرة.',
            ],
            str_contains($message, 'buch') || str_contains($message, 'book') || str_contains($message, 'حجز') => [
                'de' => 'Sie koennen ueber die Buchungsseite einen Termin anfragen. Danach bestaetigt unser Team oder ein Anbieter die Anfrage.',
                'en' => 'You can request an appointment from the booking page. Our team or a provider will then confirm it.',
                'ar' => 'يمكنك طلب موعد من صفحة الحجز، وبعدها يقوم الفريق أو مزود الخدمة بتأكيد الطلب.',
            ],
            default => [
                'de' => 'Danke fuer Ihre Nachricht. Unser Team hilft Ihnen gern weiter. Fuer konkrete Anliegen koennen Sie den Kundenservice kontaktieren.',
                'en' => 'Thanks for your message. Our team will be happy to help. For specific requests, please contact customer service.',
                'ar' => 'شكراً لرسالتك. فريقنا جاهز للمساعدة. للطلبات المحددة يمكنك التواصل مع خدمة العملاء.',
            ],
        };

        return response()->json([
            'data' => [
                'reply' => $answer[$lang] ?? $answer['de'],
                'source' => 'laravel',
            ],
        ]);
    }
}
