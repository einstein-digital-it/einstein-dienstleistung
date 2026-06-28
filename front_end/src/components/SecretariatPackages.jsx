import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const translations = {
  de: {
    title: "EinStein – Büro & Sekretariat",
    subtitle: "Professionelle Sekretariatsleistungen – vor Ort & remote",
    mostPopular: "Beliebteste Wahl",
    perMonth: "/ Monat",
    hoursMonth: "Stunden / Monat",
    onSite: "Vor-Ort-Einsätze",
    responseTime: "Reaktionszeit",
    bookNow: "Jetzt buchen",
    upgrade: "Upgrade jederzeit möglich",
    packages: [
      {
        name: "Basic Vor-Ort",
        color: "purple",
        price: "ab 299 €",
        hours: 7,
        onSite: "1 Monat",
        response: "bis zu 48h",
        highlight: false,
        tagline: "Ideal für den Einstieg – Upgrade jederzeit möglich.",
        features: [
          "E-Mail & einfache Korrespondenz",
          "Terminorganisation",
          "Dokumentenmanagement",
          "Einfache Telefonate",
          "Mehrsprachige Kommunikation",
        ],
      },
      {
        name: "Standard Vor-Ort",
        color: "blue",
        price: "ab 699 €",
        hours: 20,
        onSite: "3 Monate",
        response: "bis zu 24h",
        highlight: true,
        tagline: "Das meistgewählte Paket für laufende Entlastung.",
        features: [
          "Alle Leistungen aus Basic",
          "Kundenkommunikation",
          "Kalender- und Terminmanagement",
          "Angebots- & Rechnungsvorbereitung",
          "Organisationsaufgaben",
        ],
      },
      {
        name: "Premium Vor-Ort",
        color: "purple",
        price: "ab 1.099 €",
        hours: 40,
        onSite: "6 Monate",
        response: "Schnelle Einsatzbereitschaft",
        highlight: false,
        tagline: "Volle Entlastung – priorisiert und strukturiert.",
        features: [
          "Alle Leistungen aus Standard",
          "Priorisierte Bearbeitung",
          "Unterstützung bei Engpässen",
          "Strukturierte Büroorganisation",
          "Schnelle Einsatzbereitschaft",
        ],
      },
    ],
  },
  ar: {
    title: "EinStein – المكتب والسكرتارية",
    subtitle: "خدمات سكرتارية احترافية – حضورياً وعن بُعد",
    mostPopular: "الأكثر طلباً",
    perMonth: "/ شهر",
    hoursMonth: "ساعة / شهر",
    onSite: "زيارات ميدانية",
    responseTime: "وقت الاستجابة",
    bookNow: "احجز الآن",
    upgrade: "الترقية متاحة في أي وقت",
    packages: [
      {
        name: "باكيج أساسي",
        color: "purple",
        price: "من 299 €",
        hours: 7,
        onSite: "1 شهر",
        response: "حتى 48 ساعة",
        highlight: false,
        tagline: "مثالي للبداية – قابل للترقية في أي وقت.",
        features: [
          "البريد الإلكتروني والمراسلات البسيطة",
          "تنظيم المواعيد",
          "إدارة المستندات",
          "المكالمات الهاتفية البسيطة",
          "التواصل متعدد اللغات",
        ],
      },
      {
        name: "باكيج قياسي",
        color: "blue",
        price: "من 699 €",
        hours: 20,
        onSite: "3 أشهر",
        response: "حتى 24 ساعة",
        highlight: true,
        tagline: "الأكثر اختياراً للتخفيف المستمر من الأعباء.",
        features: [
          "جميع خدمات الباكيج الأساسي",
          "تواصل مع العملاء",
          "إدارة التقويم والمواعيد",
          "إعداد العروض والفواتير",
          "المهام التنظيمية",
        ],
      },
      {
        name: "باكيج بريميوم",
        color: "purple",
        price: "من 1.099 €",
        hours: 40,
        onSite: "6 أشهر",
        response: "استجابة سريعة",
        highlight: false,
        tagline: "راحة تامة – أولوية وتنظيم كامل.",
        features: [
          "جميع خدمات الباكيج القياسي",
          "معالجة ذات أولوية",
          "دعم في أوقات الذروة",
          "تنظيم مكتبي منظّم",
          "استعداد سريع للتدخل",
        ],
      },
    ],
  },
  en: {
    title: "EinStein – Office & Secretariat",
    subtitle: "Professional secretarial services – on-site & remote",
    mostPopular: "Most Popular",
    perMonth: "/ month",
    hoursMonth: "hours / month",
    onSite: "On-site visits",
    responseTime: "Response time",
    bookNow: "Book Now",
    upgrade: "Upgrade anytime",
    packages: [
      {
        name: "Basic On-Site",
        color: "purple",
        price: "from 299 €",
        hours: 7,
        onSite: "1 month",
        response: "up to 48h",
        highlight: false,
        tagline: "Ideal for getting started – upgrade anytime.",
        features: [
          "Email & basic correspondence",
          "Appointment scheduling",
          "Document management",
          "Basic phone calls",
          "Multilingual communication",
        ],
      },
      {
        name: "Standard On-Site",
        color: "blue",
        price: "from 699 €",
        hours: 20,
        onSite: "3 months",
        response: "up to 24h",
        highlight: true,
        tagline: "The most-chosen package for ongoing relief.",
        features: [
          "All Basic features",
          "Customer communication",
          "Calendar & appointment management",
          "Quote & invoice preparation",
          "Organizational tasks",
        ],
      },
      {
        name: "Premium On-Site",
        color: "purple",
        price: "from 1,099 €",
        hours: 40,
        onSite: "6 months",
        response: "Fast response",
        highlight: false,
        tagline: "Full relief – prioritized and structured.",
        features: [
          "All Standard features",
          "Prioritized processing",
          "Support during peak times",
          "Structured office organization",
          "Rapid deployment readiness",
        ],
      },
    ],
  },
  tr: {
    title: "EinStein – Ofis & Sekreterlik",
    subtitle: "Profesyonel sekreterlik hizmetleri – yerinde & uzaktan",
    mostPopular: "En Çok Tercih Edilen",
    perMonth: "/ ay",
    hoursMonth: "saat / ay",
    onSite: "Yerinde ziyaret",
    responseTime: "Yanıt süresi",
    bookNow: "Şimdi Rezervasyon Yap",
    upgrade: "İstediğiniz zaman yükseltme yapın",
    packages: [
      {
        name: "Temel Paket",
        color: "purple",
        price: "299 € 'dan",
        hours: 7,
        onSite: "1 ay",
        response: "48 saate kadar",
        highlight: false,
        tagline: "Başlangıç için ideal – istediğiniz zaman yükseltme.",
        features: ["E-posta & temel yazışma", "Randevu organizasyonu", "Belge yönetimi", "Basit telefon görüşmeleri", "Çok dilli iletişim"],
      },
      {
        name: "Standart Paket",
        color: "blue",
        price: "699 € 'dan",
        hours: 20,
        onSite: "3 ay",
        response: "24 saate kadar",
        highlight: true,
        tagline: "Sürekli rahatlama için en çok seçilen paket.",
        features: ["Tüm Temel özellikler", "Müşteri iletişimi", "Takvim & randevu yönetimi", "Teklif & fatura hazırlama", "Organizasyonel görevler"],
      },
      {
        name: "Premium Paket",
        color: "purple",
        price: "1.099 € 'dan",
        hours: 40,
        onSite: "6 ay",
        response: "Hızlı yanıt",
        highlight: false,
        tagline: "Tam rahatlama – öncelikli ve yapılandırılmış.",
        features: ["Tüm Standart özellikler", "Öncelikli işlem", "Yoğun dönemlerde destek", "Yapılandırılmış ofis organizasyonu", "Hızlı müdahale hazırlığı"],
      },
    ],
  },
  es: {
    title: "EinStein – Oficina & Secretariado",
    subtitle: "Servicios de secretariado profesional – presencial y remoto",
    mostPopular: "Más Popular",
    perMonth: "/ mes",
    hoursMonth: "horas / mes",
    onSite: "Visitas presenciales",
    responseTime: "Tiempo de respuesta",
    bookNow: "Reservar Ahora",
    upgrade: "Actualización disponible en cualquier momento",
    packages: [
      {
        name: "Paquete Básico",
        color: "purple",
        price: "desde 299 €",
        hours: 7,
        onSite: "1 mes",
        response: "hasta 48h",
        highlight: false,
        tagline: "Ideal para empezar – actualización en cualquier momento.",
        features: ["Email y correspondencia básica", "Organización de citas", "Gestión de documentos", "Llamadas telefónicas básicas", "Comunicación multilingüe"],
      },
      {
        name: "Paquete Estándar",
        color: "blue",
        price: "desde 699 €",
        hours: 20,
        onSite: "3 meses",
        response: "hasta 24h",
        highlight: true,
        tagline: "El paquete más elegido para alivio continuo.",
        features: ["Todas las funciones Básicas", "Comunicación con clientes", "Gestión de calendario y citas", "Preparación de ofertas y facturas", "Tareas organizativas"],
      },
      {
        name: "Paquete Premium",
        color: "purple",
        price: "desde 1.099 €",
        hours: 40,
        onSite: "6 meses",
        response: "Respuesta rápida",
        highlight: false,
        tagline: "Alivio total – priorizado y estructurado.",
        features: ["Todas las funciones Estándar", "Procesamiento prioritario", "Apoyo en momentos de sobrecarga", "Organización de oficina estructurada", "Disponibilidad rápida"],
      },
    ],
  },
};

export default function SecretariatPackages({ lang = "de", onSelectPackage = null, embedded = false }) {
  const t = translations[lang] || translations.de;

  const content = (
    <div className={embedded ? "" : "max-w-6xl mx-auto px-4"}>
        {/* Header */}
        {!embedded && <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-[#6B46C1] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            🟣 EinStein – Büro & Sekretariat
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-3">{t.title}</h2>
          <p className="text-gray-500 text-lg">{t.subtitle}</p>
        </div>}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {t.packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border-2 flex flex-col overflow-hidden transition-shadow hover:shadow-xl
                ${pkg.highlight
                  ? "border-[#6B46C1] shadow-lg shadow-purple-200"
                  : "border-gray-200 bg-white shadow-sm"
                }`}
            >
              {/* Popular badge */}
              {pkg.highlight && (
                <div className="bg-[#6B46C1] text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {t.mostPopular}
                </div>
              )}

              {/* Card header */}
              <div className={`px-6 pt-6 pb-4 ${pkg.highlight ? "bg-gradient-to-br from-[#6B46C1] to-[#805AD5] text-white" : "bg-white"}`}>
                <h3 className={`text-xl font-bold mb-1 ${pkg.highlight ? "text-white" : "text-[#1e3a5f]"}`}>
                  {pkg.name}
                </h3>
                <div className={`text-3xl font-extrabold mt-2 ${pkg.highlight ? "text-white" : "text-[#6B46C1]"}`}>
                  {pkg.price}
                  <span className={`text-sm font-normal ms-1 ${pkg.highlight ? "text-purple-200" : "text-gray-400"}`}>
                    {t.perMonth}
                  </span>
                </div>
                <div className={`mt-2 text-sm flex items-center gap-1.5 ${pkg.highlight ? "text-purple-200" : "text-gray-500"}`}>
                  ⏱ {pkg.hours} {t.hoursMonth}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 flex flex-col flex-1 bg-white">
                {/* On-site badge */}
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-5">
                  <span className="text-orange-500 text-base">🔥</span>
                  <span className="text-xs text-orange-600">✔ {pkg.onSite}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Response time */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  {t.responseTime}: <span className="font-semibold text-gray-700">{pkg.response}</span>
                </div>

                {/* Tagline */}
                <p className="text-xs text-gray-400 italic mb-5">{pkg.tagline}</p>

                {/* CTA */}
                {onSelectPackage ? (
                  <Button
                    onClick={() => onSelectPackage(pkg)}
                    className={`w-full font-semibold ${
                      pkg.highlight
                        ? "bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                        : "bg-purple-50 hover:bg-purple-100 text-[#6B46C1] border border-purple-200"
                    }`}
                    variant={pkg.highlight ? "default" : "outline"}
                  >
                    {t.bookNow}
                  </Button>
                ) : (
                  <Link to={`/Booking?category=secretariat&pkg=${encodeURIComponent(pkg.name)}&pkg_price=${encodeURIComponent(pkg.price)}&pkg_hours=${pkg.hours}`}>
                    <Button
                      className={`w-full font-semibold ${
                        pkg.highlight
                          ? "bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                          : "bg-purple-50 hover:bg-purple-100 text-[#6B46C1] border border-purple-200"
                      }`}
                      variant={pkg.highlight ? "default" : "outline"}
                    >
                      {t.bookNow}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">* {t.upgrade}</p>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
      {content}
    </section>
  );
}