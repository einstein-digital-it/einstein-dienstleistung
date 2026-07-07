import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { publicApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import StarRating from "@/components/StarRating";
import { motion } from "framer-motion";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  Euro,
  Briefcase,
  ClipboardList,
  Settings,
  Globe,
  BookOpen,
  Printer,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SecretariatPackages from "@/components/SecretariatPackages";

const translations = {
  de: {
    title: "Unsere Dienstleistungen",
    subtitle: "Ganzheitliches Dienstleistungszentrum für Alltag, Bildung & Handwerk",
    book_now: "Jetzt buchen",
    from: "ab",
    per_hour: "/ Std.",
    per_project: "/ Projekt",
    services: {
      forms: {
        name: "Behörden & Formularhilfe",
        desc: "Unterstützung bei Behördenangelegenheiten, Ausfüllen von Formularen und Anträgen.",
        features: [
          "Ausfüllen von Anträgen und Formularen",
          "Unterstützung bei Behördengängen",
          "Erklärung von Bescheiden",
          "Vorbereitung von Unterlagen",
          "Übersetzungshilfe bei Dokumenten"
        ],
        prices: [
          { label: "Behörden & Formularhilfe", price: "40 €", unit: "/ Stunde" }
        ]
      },
      admin: {
        name: "Administrative Dienstleistungen",
        desc: "Umfassende administrative Unterstützung für alle Ihre Verwaltungsaufgaben.",
        features: [
          "Dokumentenmanagement",
          "Korrespondenz und Schriftverkehr",
          "Terminkoordination",
          "Datenpflege und -organisation",
          "Allgemeine Büroarbeiten"
        ],
        prices: [
          { label: "Administrative Dienstleistungen", price: "40 €", unit: "/ Stunde" }
        ]
      },
      coordination: {
        name: "Koordinationsleistungen",
        desc: "Professionelle Koordination und Projektbetreuung für Ihre Vorhaben.",
        features: [
          "Projektkoordination",
          "Terminplanung und -überwachung",
          "Kommunikation mit Dienstleistern",
          "Qualitätskontrolle",
          "Berichterstattung"
        ],
        prices: [
          { label: "Koordinationsleistungen", price: "30 €", unit: "/ Stunde" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Spezialisierte Dienstleistungen für lateinamerikanische Dokumente und Angelegenheiten.",
        features: [
          "Apostille und Legalisation",
          "Dokumentenübersetzung",
          "Beratung zu MERCOSUR-Abkommen",
          "Unterstützung bei Visumsangelegenheiten",
          "Anerkennung von Abschlüssen"
        ],
        prices: [
          { label: "MERCOSUR Service", price: "150 €", unit: "/ Vorgang" }
        ]
      },
      tutoring: {
        name: "Nachhilfe / Lernunterstützung",
        desc: "Individuelle Lernbegleitung und Nachhilfe für alle Altersgruppen.",
        features: [
          "Einzelunterricht",
          "Gruppenunterricht",
          "Hausaufgabenbetreuung",
          "Prüfungsvorbereitung",
          "Sprachförderung"
        ],
        prices: [
          { label: "Nachhilfe / Lernunterstützung", price: "25 €", unit: "/ Stunde" }
        ]
      },
      print: {
        name: "Druck- und Stempeldienstleistungen",
        desc: "Professionelle Druck- und Stempelservices für alle Ihre Bedürfnisse.",
        features: [
          "Dokumentendruck",
          "Kopierservice",
          "Stempelherstellung",
          "Laminieren und Binden",
          "Scan-Service"
        ],
        prices: [
          { label: "Druck- und Stempeldienstleistungen", price: "ab 1 €", unit: "" }
        ]
      },
      office: {
        name: "Projektbezogener Büro- und Organisationsservice",
        desc: "Projektbezogene Büro- und Organisationsdienstleistungen für Selbstständige, kleine Unternehmen sowie Privatpersonen.",
        features: [
          "E-Mail-Management",
          "Terminplanung und Kalenderkoordination",
          "Dokumentenerstellung und -formatierung",
          "Rechnungs- und Angebotsvorbereitung",
          "Digitale Dokumentenorganisation"
        ],
        prices: [
          { label: "Büro- und Organisationsservice", price: "40 €", unit: "/ Stunde" }
        ]
      },
      secretariat: {
        name: "Büro & Sekretariat (Vor-Ort)",
        desc: "Professionelle Sekretariatsleistungen direkt bei Ihnen vor Ort – stundenweise oder als günstiges Monatspaket.",
        features: [
          "Stundenweise Buchung möglich",
          "Vor-Ort-Einsätze beim Kunden",
          "E-Mail- und Korrespondenzmanagement",
          "Termin- und Kalenderverwaltung",
          "Mehrsprachige Kommunikation",
          "Optional: günstige Monatspakete"
        ],
        prices: [
          { label: "Stundensatz (Vor-Ort)", price: "45 €", unit: "/ Stunde" }
        ]
      },
    }
  },
  ar: {
    title: "خدماتنا",
    subtitle: "مركز خدمات شامل للحياة اليومية والتعليم والحرف",
    book_now: "احجز الآن",
    from: "من",
    per_hour: "/ ساعة",
    per_project: "/ مشروع",
    services: {
      forms: {
        name: "مساعدة الدوائر والنماذج",
        desc: "دعم في الشؤون الحكومية، ملء النماذج والطلبات.",
        features: [
          "ملء الطلبات والنماذج",
          "المساعدة في المعاملات الحكومية",
          "شرح القرارات",
          "تحضير الوثائق",
          "المساعدة في ترجمة المستندات"
        ],
        prices: [
          { label: "مساعدة الدوائر والنماذج", price: "40 €", unit: "/ ساعة" }
        ]
      },
      admin: {
        name: "الخدمات الإدارية",
        desc: "دعم إداري شامل لجميع مهامك الإدارية.",
        features: [
          "إدارة المستندات",
          "المراسلات والخطابات",
          "تنسيق المواعيد",
          "صيانة البيانات وتنظيمها",
          "أعمال مكتبية عامة"
        ],
        prices: [
          { label: "الخدمات الإدارية", price: "40 €", unit: "/ ساعة" }
        ]
      },
      coordination: {
        name: "خدمات التنسيق",
        desc: "تنسيق ومتابعة مهنية لمشاريعك.",
        features: [
          "تنسيق المشاريع",
          "تخطيط ومتابعة المواعيد",
          "التواصل مع مقدمي الخدمات",
          "مراقبة الجودة",
          "إعداد التقارير"
        ],
        prices: [
          { label: "خدمات التنسيق", price: "30 €", unit: "/ ساعة" }
        ]
      },
      mercosur: {
        name: "ميركوسور (أمريكا اللاتينية)",
        desc: "خدمات متخصصة للوثائق والشؤون اللاتينية الأمريكية.",
        features: [
          "الأبوستيل والتصديق",
          "ترجمة المستندات",
          "استشارات اتفاقية ميركوسور",
          "دعم شؤون التأشيرات",
          "الاعتراف بالشهادات"
        ],
        prices: [
          { label: "خدمة ميركوسور", price: "150 €", unit: "/ معاملة" }
        ]
      },
      tutoring: {
        name: "الدروس الخصوصية / دعم التعلم",
        desc: "مرافقة تعليمية فردية ودروس خصوصية لجميع الأعمار.",
        features: [
          "دروس فردية",
          "دروس جماعية",
          "متابعة الواجبات المنزلية",
          "التحضير للامتحانات",
          "دعم لغوي"
        ],
        prices: [
          { label: "الدروس الخصوصية / دعم التعلم", price: "25 €", unit: "/ ساعة" }
        ]
      },
      print: {
        name: "خدمات الطباعة والأختام",
        desc: "خدمات طباعة وأختام احترافية لجميع احتياجاتك.",
        features: [
          "طباعة المستندات",
          "خدمة النسخ",
          "صنع الأختام",
          "التغليف والتجليد",
          "خدمة المسح الضوئي"
        ],
        prices: [
          { label: "خدمات الطباعة والأختام", price: "من 1 €", unit: "" }
        ]
      },
      office: {
        name: "خدمة المكتب والتنظيم المشروعية",
        desc: "خدمات مكتبية وتنظيمية على أساس المشاريع للعاملين لحسابهم الخاص والشركات الصغيرة والأفراد.",
        features: [
          "إدارة البريد الإلكتروني",
          "جدولة المواعيد وتنسيق التقويم",
          "إعداد وتنسيق المستندات",
          "إعداد الفواتير والعروض",
          "التنظيم الرقمي للمستندات"
        ],
        prices: [
          { label: "خدمة المكتب والتنظيم", price: "40 €", unit: "/ ساعة" }
        ]
      },
      secretariat: {
        name: "المكتب والسكرتارية (حضوري)",
        desc: "خدمات سكرتارية احترافية مباشرة لديك – بالساعة أو كباقة شهرية مخفضة.",
        features: [
          "حجز بالساعة متاح",
          "زيارات ميدانية عند العميل",
          "إدارة البريد الإلكتروني والمراسلات",
          "إدارة المواعيد والتقويم",
          "تواصل متعدد اللغات",
          "اختياري: باقات شهرية مخفضة"
        ],
        prices: [
          { label: "السعر بالساعة (حضوري)", price: "45 €", unit: "/ ساعة" }
        ]
      },
    }
  },
  en: {
    title: "Our Services",
    subtitle: "Comprehensive Service Center for Daily Life, Education & Crafts",
    book_now: "Book Now",
    from: "from",
    per_hour: "/ hour",
    per_project: "/ project",
    services: {
      forms: {
        name: "Government & Form Assistance",
        desc: "Support with government matters, filling out forms and applications.",
        features: [
          "Filling out applications and forms",
          "Support with government visits",
          "Explanation of official notices",
          "Document preparation",
          "Translation assistance for documents"
        ],
        prices: [
          { label: "Government & Form Assistance", price: "€40", unit: "/ hour" }
        ]
      },
      admin: {
        name: "Administrative Services",
        desc: "Comprehensive administrative support for all your management tasks.",
        features: [
          "Document management",
          "Correspondence and written communication",
          "Appointment coordination",
          "Data maintenance and organization",
          "General office work"
        ],
        prices: [
          { label: "Administrative Services", price: "€40", unit: "/ hour" }
        ]
      },
      coordination: {
        name: "Coordination Services",
        desc: "Professional coordination and project supervision for your projects.",
        features: [
          "Project coordination",
          "Schedule planning and monitoring",
          "Communication with service providers",
          "Quality control",
          "Reporting"
        ],
        prices: [
          { label: "Coordination Services", price: "€30", unit: "/ hour" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Specialized services for Latin American documents and matters.",
        features: [
          "Apostille and legalization",
          "Document translation",
          "MERCOSUR agreement consultation",
          "Visa matter support",
          "Recognition of qualifications"
        ],
        prices: [
          { label: "MERCOSUR Service", price: "€150", unit: "/ case" }
        ]
      },
      tutoring: {
        name: "Tutoring / Learning Support",
        desc: "Individual learning support and tutoring for all age groups.",
        features: [
          "Individual lessons",
          "Group lessons",
          "Homework supervision",
          "Exam preparation",
          "Language support"
        ],
        prices: [
          { label: "Tutoring / Learning Support", price: "€25", unit: "/ hour" }
        ]
      },
      print: {
        name: "Printing & Stamp Services",
        desc: "Professional printing and stamp services for all your needs.",
        features: [
          "Document printing",
          "Copy service",
          "Stamp making",
          "Laminating and binding",
          "Scan service"
        ],
        prices: [
          { label: "Printing & Stamp Services", price: "from €1", unit: "" }
        ]
      },
      office: {
        name: "Project-Based Office & Organization Service",
        desc: "Project-based office and organizational services for freelancers, small businesses and individuals.",
        features: [
          "Email management",
          "Appointment scheduling and calendar coordination",
          "Document creation and formatting",
          "Invoice and quote preparation",
          "Digital document organization"
        ],
        prices: [
          { label: "Office & Organization Service", price: "€40", unit: "/ hour" }
        ]
      },
      secretariat: {
        name: "Office & Secretariat (On-Site)",
        desc: "Professional on-site secretarial services – hourly or as a discounted monthly package.",
        features: [
          "Hourly booking available",
          "On-site visits at the customer",
          "Email and correspondence management",
          "Appointment and calendar management",
          "Multilingual communication",
          "Optional: discounted monthly packages"
        ],
        prices: [
          { label: "Hourly rate (on-site)", price: "€45", unit: "/ hour" }
        ]
      },
    }
  },
  tr: {
    title: "Hizmetlerimiz",
    subtitle: "Gunluk Yasam, Egitim ve El Sanatlari icin Kapsamli Hizmet Merkezi",
    book_now: "Simdi Rezervasyon Yap",
    from: "itibaren",
    per_hour: "/ saat",
    per_project: "/ proje",
    services: {
      forms: {
        name: "Resmi Daire ve Form Yardimi",
        desc: "Resmi isler, form ve basvuru doldurma destegi.",
        features: [
          "Basvuru ve form doldurma",
          "Resmi daire ziyaretlerinde destek",
          "Resmi bildirilerin aciklanmasi",
          "Belge hazirlama",
          "Belge ceviri yardimi"
        ],
        prices: [
          { label: "Resmi Daire ve Form Yardimi", price: "40 Euro", unit: "/ saat" }
        ]
      },
      admin: {
        name: "Idari Hizmetler",
        desc: "Tum yonetim gorevleriniz icin kapsamli idari destek.",
        features: [
          "Belge yonetimi",
          "Yazisma ve iletisim",
          "Randevu koordinasyonu",
          "Veri bakimi ve organizasyonu",
          "Genel ofis isleri"
        ],
        prices: [
          { label: "Idari Hizmetler", price: "40 Euro", unit: "/ saat" }
        ]
      },
      coordination: {
        name: "Koordinasyon Hizmetleri",
        desc: "Projeleriniz icin profesyonel koordinasyon ve proje denetimi.",
        features: [
          "Proje koordinasyonu",
          "Program planlama ve izleme",
          "Hizmet saglayicilarla iletisim",
          "Kalite kontrolu",
          "Raporlama"
        ],
        prices: [
          { label: "Koordinasyon Hizmetleri", price: "30 Euro", unit: "/ saat" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Latin Amerika belgeleri ve konulari icin ozel hizmetler.",
        features: [
          "Apostil ve legalizasyon",
          "Belge cevirisi",
          "MERCOSUR anlasma danismanligi",
          "Vize konularinda destek",
          "Yeterliliklerin taninmasi"
        ],
        prices: [
          { label: "MERCOSUR Hizmeti", price: "150 Euro", unit: "/ islem" }
        ]
      },
      tutoring: {
        name: "Ozel Ders / Ogrenme Destegi",
        desc: "Tum yas gruplari icin bireysel ogrenme destegi ve ozel ders.",
        features: [
          "Bireysel dersler",
          "Grup dersleri",
          "Odev denetimi",
          "Sinav hazirligi",
          "Dil destegi"
        ],
        prices: [
          { label: "Ozel Ders / Ogrenme Destegi", price: "25 Euro", unit: "/ saat" }
        ]
      },
      print: {
        name: "Baski ve Damga Hizmetleri",
        desc: "Tum ihtiyaclariniz icin profesyonel baski ve damga hizmetleri.",
        features: [
          "Belge baskisi",
          "Kopya hizmeti",
          "Damga yapimi",
          "Laminasyon ve ciltleme",
          "Tarama hizmeti"
        ],
        prices: [
          { label: "Baski ve Damga Hizmetleri", price: "1 Euro'dan", unit: "" }
        ]
      },
      office: {
        name: "Proje Bazli Ofis ve Organizasyon Hizmeti",
        desc: "Serbest calisanlar, kucuk isletmeler ve bireyler icin proje bazli ofis ve organizasyon hizmetleri.",
        features: [
          "E-posta yonetimi",
          "Randevu planlama ve takvim koordinasyonu",
          "Belge olusturma ve bicimlendirme",
          "Fatura ve teklif hazirlama",
          "Dijital belge organizasyonu"
        ],
        prices: [
          { label: "Ofis ve Organizasyon Hizmeti", price: "40 Euro", unit: "/ saat" }
        ]
      },
      secretariat: {
        name: "Ofis & Sekreterlik (Yerinde)",
        desc: "Yerinde profesyonel sekreterlik hizmetleri – saatlik veya indirimli aylik paket olarak.",
        features: [
          "Saatlik rezervasyon",
          "Musteride yerinde ziyaretler",
          "E-posta ve yazisma yonetimi",
          "Randevu ve takvim yonetimi",
          "Cok dilli iletisim",
          "Opsiyonel: indirimli aylik paketler"
        ],
        prices: [
          { label: "Saatlik ucret (yerinde)", price: "45 Euro", unit: "/ saat" }
        ]
      },
    }
  },
  es: {
    title: "Nuestros Servicios",
    subtitle: "Centro de Servicios Integral para la Vida Diaria, Educación y Artesanía",
    book_now: "Reservar Ahora",
    from: "desde",
    per_hour: "/ hora",
    per_project: "/ proyecto",
    services: {
      forms: {
        name: "Asistencia Gubernamental y Formularios",
        desc: "Apoyo con asuntos gubernamentales, llenado de formularios y solicitudes.",
        features: [
          "Llenado de solicitudes y formularios",
          "Apoyo en visitas gubernamentales",
          "Explicación de notificaciones oficiales",
          "Preparación de documentos",
          "Asistencia de traducción de documentos"
        ],
        prices: [
          { label: "Asistencia Gubernamental y Formularios", price: "40 €", unit: "/ hora" }
        ]
      },
      admin: {
        name: "Servicios Administrativos",
        desc: "Apoyo administrativo integral para todas sus tareas de gestión.",
        features: [
          "Gestión de documentos",
          "Correspondencia y comunicación escrita",
          "Coordinación de citas",
          "Mantenimiento y organización de datos",
          "Trabajo de oficina general"
        ],
        prices: [
          { label: "Servicios Administrativos", price: "40 €", unit: "/ hora" }
        ]
      },
      coordination: {
        name: "Servicios de Coordinación",
        desc: "Coordinación profesional y supervisión de proyectos.",
        features: [
          "Coordinación de proyectos",
          "Planificación y seguimiento de horarios",
          "Comunicación con proveedores de servicios",
          "Control de calidad",
          "Informes"
        ],
        prices: [
          { label: "Servicios de Coordinación", price: "30 €", unit: "/ hora" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Servicios especializados para documentos y asuntos latinoamericanos.",
        features: [
          "Apostilla y legalización",
          "Traducción de documentos",
          "Consulta sobre acuerdos MERCOSUR",
          "Apoyo en asuntos de visa",
          "Reconocimiento de calificaciones"
        ],
        prices: [
          { label: "Servicio MERCOSUR", price: "150 €", unit: "/ caso" }
        ]
      },
      tutoring: {
        name: "Tutoría / Apoyo al Aprendizaje",
        desc: "Apoyo de aprendizaje individual y tutoría para todas las edades.",
        features: [
          "Clases individuales",
          "Clases grupales",
          "Supervisión de tareas",
          "Preparación de exámenes",
          "Apoyo lingüístico"
        ],
        prices: [
          { label: "Tutoría / Apoyo al Aprendizaje", price: "25 €", unit: "/ hora" }
        ]
      },
      print: {
        name: "Servicios de Impresión y Sellos",
        desc: "Servicios profesionales de impresión y sellos para todas sus necesidades.",
        features: [
          "Impresión de documentos",
          "Servicio de copias",
          "Fabricación de sellos",
          "Laminado y encuadernación",
          "Servicio de escaneo"
        ],
        prices: [
          { label: "Servicios de Impresión y Sellos", price: "desde 1 €", unit: "" }
        ]
      },
      office: {
        name: "Servicio de Oficina y Organización por Proyecto",
        desc: "Servicios de oficina y organización basados en proyectos para autónomos, pequeñas empresas y particulares.",
        features: [
          "Gestión de correo electrónico",
          "Programación de citas y coordinación de calendario",
          "Creación y formateo de documentos",
          "Preparación de facturas y presupuestos",
          "Organización digital de documentos"
        ],
        prices: [
          { label: "Servicio de Oficina y Organización", price: "40 €", unit: "/ hora" }
        ]
      },
      secretariat: {
        name: "Oficina & Secretariado (Presencial)",
        desc: "Servicios de secretariado profesional en sus instalaciones – por horas o como paquete mensual con descuento.",
        features: [
          "Reserva por horas disponible",
          "Visitas presenciales al cliente",
          "Gestión de correo y correspondencia",
          "Gestión de citas y calendario",
          "Comunicación multilingüe",
          "Opcional: paquetes mensuales con descuento"
        ],
        prices: [
          { label: "Tarifa por hora (presencial)", price: "45 €", unit: "/ hora" }
        ]
      },
    }
  }
};

const serviceData = [
  { 
    key: "secretariat", 
    icon: Briefcase, 
    color: "bg-violet-600", 
    lightColor: "bg-violet-50",
    image: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&auto=format&fit=crop"
  },
  { 
    key: "forms", 
    icon: ClipboardList, 
    color: "bg-teal-500", 
    lightColor: "bg-teal-50",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop"
  },
  { 
    key: "admin", 
    icon: FileText, 
    color: "bg-green-500", 
    lightColor: "bg-green-50",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop"
  },
  { 
    key: "coordination", 
    icon: Settings, 
    color: "bg-indigo-500", 
    lightColor: "bg-indigo-50",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop"
  },
  { 
    key: "mercosur", 
    icon: Globe, 
    color: "bg-amber-500", 
    lightColor: "bg-amber-50",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop"
  },
  { 
    key: "tutoring", 
    icon: BookOpen, 
    color: "bg-blue-500", 
    lightColor: "bg-blue-50",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694d6e3a995b53f785114ddc/ca2e6685c_add677bc-ecdf-4517-8651-82d976557296.jpg"
  },
  { 
    key: "print", 
    icon: Printer, 
    color: "bg-pink-500", 
    lightColor: "bg-pink-50",
    image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&auto=format&fit=crop"
  }
];

export default function Services() {
  const [lang, setLang] = useState("de");
  const [packagesOpen, setPackagesOpen] = useState(false);
  
  // Load reviews per category
  const { data: bookingsWithRatings = [] } = useQuery({
    queryKey: ["category-ratings"],
    queryFn: publicApi.getRatings,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Compute average ratings per category
  const categoryRatings = React.useMemo(() => {
    const map = {};
    bookingsWithRatings.forEach(b => {
      if (b.rating && b.category) {
        if (!map[b.category]) map[b.category] = { sum: 0, count: 0 };
        map[b.category].sum += b.rating;
        map[b.category].count += 1;
      }
    });
    const result = {};
    Object.keys(map).forEach(k => {
      result[k] = { avg: map[k].sum / map[k].count, count: map[k].count };
    });
    return result;
  }, [bookingsWithRatings]);

  // Load custom prices from database
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: publicApi.listPricing,
    staleTime: 0,
    refetchOnMount: true,
  });
  
  // Convert array to object
  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.items || item.prices || [];
    });
    return pricesObj;
  }, [priceSettingsData]);
  
  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
    
    const handleStorage = () => {
      const newLang = localStorage.getItem("einstein_lang");
      if (newLang) setLang(newLang);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  
  const t = translations[lang] || translations.de;
  
  // Function to get label by language
  const getLabelByLang = (p) => {
    if (lang === "ar") return p.label_ar || p.label_de || p.label;
    if (lang === "en") return p.label_en || p.label_de || p.label;
    if (lang === "tr") return p.label_tr || p.label_de || p.label;
    if (lang === "es") return p.label_es || p.label_de || p.label;
    return p.label_de || p.label;
  };
  
  const getUnitByLang = (p) => {
    if (lang === "ar") return p.unit_ar || p.unit_de || p.unit;
    if (lang === "en") return p.unit_en || p.unit_de || p.unit;
    if (lang === "tr") return p.unit_tr || p.unit_de || p.unit;
    if (lang === "es") return p.unit_es || p.unit_de || p.unit;
    return p.unit_de || p.unit;
  };

  // Function to get prices - use custom prices if available
  const getPrices = (serviceKey) => {
    if (customPrices && customPrices[serviceKey]) {
      return customPrices[serviceKey].map(p => ({
        label: getLabelByLang(p),
        price: p.price,
        unit: getUnitByLang(p)
      }));
    }
    return t.services[serviceKey]?.prices || [];
  };
  
  // Function to get service name - use custom name if available (from first price entry)
  const getServiceName = (serviceKey, defaultName) => {
    if (customPrices && customPrices[serviceKey] && customPrices[serviceKey][0]) {
      const customName = getLabelByLang(customPrices[serviceKey][0]);
      if (customName) return customName;
    }
    return defaultName;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#6B46C1] mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="space-y-8">
          {serviceData.map((service, index) => {
            const Icon = service.icon;
            const serviceInfo = t.services[service.key];
            
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                  {/* Service Image */}
                  <div className="relative h-72 md:h-96 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={serviceInfo.name}
                      className="w-full h-full object-contain bg-gradient-to-b from-sky-100 to-green-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 start-4 flex items-center gap-3">
                      <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {getServiceName(service.key, serviceInfo.name)}
                        </h2>
                        {categoryRatings[service.key] && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarRating value={Math.round(categoryRatings[service.key].avg)} size="sm" />
                            <span className="text-white/80 text-xs">
                              {categoryRatings[service.key].avg.toFixed(1)} ({categoryRatings[service.key].count})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`${service.lightColor} p-6 md:p-8`}>
                    <div className="flex flex-col gap-4">
                      
                      {/* Content */}
                      <div className="flex-grow">
                        <p className="text-gray-600 mb-4">
                          {serviceInfo.desc}
                        </p>
                        
                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                          {serviceInfo.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Subjects (for education) */}
                        {serviceInfo.subjects && (
                          <div className="mb-4 p-3 bg-white/60 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>{lang === "de" ? "Fächer:" : lang === "ar" ? "المواد:" : "Subjects:"}</strong> {serviceInfo.subjects}
                            </p>
                          </div>
                        )}

                        {/* Prices */}
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                            <Euro className="w-5 h-5 text-[#6B46C1]" />
                            {lang === "de" ? "Preise" : lang === "ar" ? "الأسعار" : "Prices"}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {getPrices(service.key).map((priceItem, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2">
                                <span className="text-sm text-gray-700">{priceItem.label}</span>
                                <Badge className="bg-[#c9a227] text-white font-semibold">
                                  {priceItem.price} {priceItem.unit}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Note */}
                        {serviceInfo.note && (
                          <p className="text-xs text-gray-500 mb-4 italic">
                            {serviceInfo.note}
                          </p>
                        )}
                        
                        {/* Book Button */}
                        <Link to={createPageUrl(`Booking?category=${service.key}`)}>
                          <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                            {t.book_now}
                            <ArrowRight className="ms-2 w-4 h-4" />
                          </Button>
                        </Link>

                        {/* Secretariat Packages inside the card - collapsible */}
                        {service.key === "secretariat" && (
                          <div className="mt-6 pt-6 border-t border-violet-200">
                            <button
                              onClick={() => setPackagesOpen(!packagesOpen)}
                              className="w-full flex items-center justify-between bg-violet-100 hover:bg-violet-200 text-[#6B46C1] font-semibold px-4 py-3 rounded-xl transition-colors"
                            >
                              <span>
                                {lang === "ar" ? "عرض الباقات الشهرية" : lang === "en" ? "View Monthly Packages" : "Monatspakete anzeigen"}
                              </span>
                              {packagesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            {packagesOpen && (
                              <div className="mt-4">
                                <SecretariatPackages lang={lang} embedded={true} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Note Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="border-0 shadow-lg p-6 bg-[#1e3a5f]/5">
            <p className="text-gray-600">
              {lang === "de" && "Keine versteckten Kosten • Flexible Pakete möglich • Rabatte für langfristige Betreuung"}
              {lang === "ar" && "لا تكاليف خفية • باقات مرنة متاحة • خصومات للرعاية طويلة المدى"}
              {lang === "en" && "No hidden costs • Flexible packages available • Discounts for long-term care"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {lang === "de" && "Hinweis: EinStein erbringt ausschließlich genehmigungsfreie Dienstleistungen und keine rechts-, steuer- oder heilberuflichen Leistungen."}
              {lang === "ar" && "ملاحظة: يقدم EinStein فقط خدمات لا تتطلب تصريحًا ولا يقدم خدمات قانونية أو ضريبية أو طبية."}
              {lang === "en" && "Note: EinStein only provides services that do not require a permit and no legal, tax or medical services."}
            </p>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
