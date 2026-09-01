<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;

class OfferController extends Controller
{
    public function index(): JsonResponse
    {
        $offers = Offer::query()
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Offer $offer) => $this->serializeOffer($offer))
            ->values();

        return response()->json(['data' => $offers->isNotEmpty() ? $offers : $this->defaultOffers()]);
    }

    private function serializeOffer(Offer $offer): array
    {
        return [
            'id' => $offer->id,
            'key' => $offer->package_key,
            'icon' => $offer->icon,
            'color' => $offer->color,
            'lightColor' => $offer->light_color,
            'title_de' => $offer->title_de,
            'title_ar' => $offer->title_ar,
            'title_en' => $offer->title_en,
            'subtitle_de' => $offer->subtitle_de,
            'subtitle_ar' => $offer->subtitle_ar,
            'subtitle_en' => $offer->subtitle_en,
            'desc_de' => $offer->description_de,
            'desc_ar' => $offer->description_ar,
            'desc_en' => $offer->description_en,
            'suitable_de' => $offer->suitable_de,
            'suitable_ar' => $offer->suitable_ar,
            'suitable_en' => $offer->suitable_en,
            'features' => $offer->features ?? [],
            'examples' => $offer->examples ?? [],
            'prices' => $offer->prices ?? [],
            'sort_order' => $offer->sort_order,
        ];
    }

    private function defaultOffers(): array
    {
        return [
            [
                'id' => 'fullservice',
                'key' => 'fullservice',
                'icon' => 'home',
                'color' => 'bg-purple-500',
                'lightColor' => 'bg-purple-50',
                'title_de' => 'Ganzheitliche Haus- & Familienbetreuung',
                'title_en' => 'Comprehensive Home & Family Care',
                'title_ar' => 'رعاية شاملة للمنزل والأسرة',
                'subtitle_de' => 'Full-Service',
                'subtitle_en' => 'Full-Service',
                'subtitle_ar' => 'خدمة كاملة',
                'desc_de' => 'Vollstaendige Entlastung im Alltag mit zentraler Koordination.',
                'desc_en' => 'Complete everyday support with central coordination.',
                'desc_ar' => 'دعم يومي كامل مع تنسيق مركزي.',
                'features' => [
                    'de' => ['Organisation aller Haushaltsarbeiten', 'Koordination von Reparaturen', 'Buerokratische Unterstuetzung'],
                    'en' => ['Household task coordination', 'Repair coordination', 'Administrative support'],
                    'ar' => ['تنسيق أعمال المنزل', 'تنسيق الإصلاحات', 'دعم إداري'],
                ],
            ],
            [
                'id' => 'yearly',
                'key' => 'yearly',
                'icon' => 'calendar',
                'color' => 'bg-blue-500',
                'lightColor' => 'bg-blue-50',
                'title_de' => 'Jahresbetreuung',
                'title_en' => 'Annual Care',
                'title_ar' => 'الرعاية السنوية',
                'subtitle_de' => 'Ganzjahresmodell',
                'subtitle_en' => 'Full Year Model',
                'subtitle_ar' => 'نموذج سنوي',
                'desc_de' => 'Kontinuierliche Begleitung fuer Haushalt, Familie und Organisation.',
                'desc_en' => 'Continuous support for household, family, and organization.',
                'desc_ar' => 'دعم مستمر للمنزل والأسرة والتنظيم.',
                'features' => [
                    'de' => ['Laufende Organisation', 'Regelmaessige Koordination', 'Feste Ansprechpartner'],
                    'en' => ['Ongoing organization', 'Regular coordination', 'Fixed contacts'],
                    'ar' => ['تنظيم مستمر', 'تنسيق منتظم', 'جهات اتصال ثابتة'],
                ],
            ],
            [
                'id' => 'monthly',
                'key' => 'monthly',
                'icon' => 'calendar-days',
                'color' => 'bg-green-500',
                'lightColor' => 'bg-green-50',
                'title_de' => 'Monatsbetreuung',
                'title_en' => 'Monthly Care',
                'title_ar' => 'الرعاية الشهرية',
                'subtitle_de' => 'Flexibles Abonnement',
                'subtitle_en' => 'Flexible Subscription',
                'subtitle_ar' => 'اشتراك مرن',
                'desc_de' => 'Regelmaessige Unterstuetzung mit flexibler Laufzeit.',
                'desc_en' => 'Regular support with flexible duration.',
                'desc_ar' => 'دعم منتظم بمدة مرنة.',
                'features' => [
                    'de' => ['Monatliche Organisation', 'Terminmanagement', 'Technikkoordination'],
                    'en' => ['Monthly organization', 'Appointment management', 'Technical coordination'],
                    'ar' => ['تنظيم شهري', 'إدارة المواعيد', 'تنسيق تقني'],
                ],
            ],
            [
                'id' => 'weekly',
                'key' => 'weekly',
                'icon' => 'calendar-clock',
                'color' => 'bg-orange-500',
                'lightColor' => 'bg-orange-50',
                'title_de' => 'Wochenbetreuung',
                'title_en' => 'Weekly Care',
                'subtitle_de' => 'Kurzfristige Entlastung',
                'subtitle_en' => 'Short-term Relief',
                'desc_de' => 'Kurzfristige Hilfe fuer intensive Phasen oder zeitlich begrenzte Projekte.',
                'desc_en' => 'Short-term help for intensive phases or time-limited projects.',
                'features' => [
                    'de' => ['Kurzfristige Organisation', 'Buerokratiehilfe', 'Dienstleistungskoordination'],
                    'en' => ['Short-term organization', 'Administrative help', 'Service coordination'],
                ],
            ],
            [
                'id' => 'single',
                'key' => 'single',
                'icon' => 'sparkles',
                'color' => 'bg-pink-500',
                'lightColor' => 'bg-pink-50',
                'title_de' => 'Einzelleistungen & einmalige Services',
                'title_en' => 'Individual Services & One-time Services',
                'desc_de' => 'Einmalige Hilfe fuer konkrete Anliegen.',
                'desc_en' => 'One-time help for specific needs.',
                'examples' => [
                    'de' => ['Umzug oder Renovierung', 'Spezifische Antraege', 'Einmalige Reparaturkoordination'],
                    'en' => ['Move or renovation', 'Specific applications', 'One-time repair coordination'],
                ],
            ],
        ];
    }
}
