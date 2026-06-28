<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\ServiceExtension;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = [
            [
                'booking_number' => 'ES-MPL004G6',
                'customer_name' => 'ENG. MOHAMMED K. M. ABDELRAHMAN',
                'customer_email' => 'ingr.mohammed.abdelrahman@gmail.com',
                'customer_phone' => '17646678860',
                'service_name' => 'Koordination und Kommunikation',
                'category' => 'coordination',
                'date' => '2026-05-25',
                'time' => '10:00',
                'address' => 'Frankfurt am Main',
                'status' => 'pending',
                'payment_status' => 'authorized',
                'price' => 45,
                'documents_urls' => ['#document-1', '#document-2'],
                'description' => 'Schriftliche Berichte, Planung und administrative Vorbereitung.',
                'required_documents_hint' => 'Ausweis, vorhandene Unterlagen und bisherige Korrespondenz.',
            ],
            [
                'booking_number' => 'ES-MP6ZF6GY',
                'customer_name' => 'Ahmed Al-Saleh',
                'customer_email' => 'asmiahmd@gmail.com',
                'customer_phone' => '0992086301',
                'service_name' => 'Energie und Unterlagen',
                'category' => 'forms',
                'date' => '2026-05-16',
                'time' => '16:00',
                'provider_name' => 'ahmef',
                'confirmed_by_provider_id' => 'provider-ahmef',
                'confirmed_by_provider_name' => 'ahmef',
                'confirmed_by_provider_email' => 'asmiahmd@gmail.com',
                'confirmed_at' => '2026-05-15 14:00:00',
                'status' => 'confirmed',
                'payment_status' => 'unpaid',
                'price' => 150,
                'documents_urls' => [],
            ],
            [
                'booking_number' => 'ES-MOMXEPZA',
                'customer_name' => 'A.A Beshr',
                'customer_email' => 'beshraa79@gmail.com',
                'customer_phone' => '01638266943',
                'service_name' => 'Buero & Sekretariat (Vor-Ort)',
                'category' => 'office',
                'date' => '2026-05-12',
                'time' => '12:00',
                'status' => 'in_progress',
                'payment_status' => 'paid',
                'price' => 299,
                'documents_urls' => [],
                'provider_documents_urls' => ['#provider-document-1'],
            ],
            [
                'booking_number' => 'ES-MO73NFV2',
                'customer_name' => 'faraheldelbi',
                'customer_email' => 'faraheldelbi@gmail.com',
                'customer_phone' => '06927246275',
                'service_name' => 'Druck und Stempeldienstleistungen',
                'category' => 'print',
                'date' => '2026-04-23',
                'time' => '16:00',
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'price' => 5,
                'documents_urls' => [],
            ],
            [
                'booking_number' => 'ES-MNXB6GW4',
                'customer_name' => 'abdulmalekyahya76',
                'customer_email' => 'abdulmalekyahya76@gmail.com',
                'customer_phone' => 'Jdjdhdhf',
                'service_name' => 'Behoerden & Formularhilfe',
                'category' => 'forms',
                'date' => '2026-04-15',
                'time' => '10:00',
                'provider_name' => 'Iuliia Ustinova',
                'status' => 'completed',
                'payment_status' => 'failed',
                'price' => 33.61,
                'documents_urls' => ['#document-1'],
                'provider_documents_urls' => ['#provider-document-2'],
            ],
        ];

        foreach ($bookings as $booking) {
            Booking::updateOrCreate(
                ['booking_number' => $booking['booking_number']],
                $booking
            );
        }

        $firstBooking = Booking::where('booking_number', 'ES-MPL004G6')->first();

        ServiceExtension::updateOrCreate(
            ['booking_number' => 'ES-MPL004G6', 'customer_email' => 'ingr.mohammed.abdelrahman@gmail.com'],
            [
                'booking_id' => $firstBooking?->id,
                'booking_number' => 'ES-MPL004G6',
                'customer_name' => 'ENG. MOHAMMED K. M. ABDELRAHMAN',
                'customer_email' => 'ingr.mohammed.abdelrahman@gmail.com',
                'service_name' => 'Koordination und Kommunikation',
                'provider_name' => 'Iuliia Ustinova',
                'status' => 'pending',
                'payment_status' => 'authorized',
                'amount' => 15,
                'description' => 'Zusaetzliche Bearbeitungszeit fuer die laufende Anfrage.',
                'documents_urls' => ['#extension-document-1'],
            ]
        );
    }
}
