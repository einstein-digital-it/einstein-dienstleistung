import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { adminServicesApi, bookingsApi, priceAdminApi, providersApi, uploadApi } from "@/api/backendClient";
import { getStoredAuthUser } from "@/lib/backendAuth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  Briefcase,
  ClipboardList,
  Settings,
  Globe,
  Printer,
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ship
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { getPriceNumber, toGrossPrice, vatNote, displayPrice, priceNote, plusVatNote, BUEROMANAGEMENT_TIERS } from "@/lib/priceUtils";
import SecretariatPackages from "@/components/SecretariatPackages";
import PageHero from "@/components/site/PageHero";

const translations = {
  de: {
    title: "Dienstleistung buchen",
    step1: "Kategorie wählen",
    step2: "Dienstleistung wählen",
    step3: "Details eingeben",
    step4: "Termin wählen",
    select_provider: "Fachkraft auswählen",
    any_provider: "Beliebige Fachkraft",
    any_provider_desc: "Wir weisen Ihnen die beste verfügbare Fachkraft zu",
    selected_provider: "Ausgewählte Fachkraft",
    change_provider: "Ändern",
    no_providers: "Keine Fachkräfte für diese Kategorie verfügbar",
    reviews: "Bewertungen",
    categories: {
      office: "Büro- & Organisationsservice",
      forms: "Behörden & Formularhilfe",
      admin: "Administrative Dienstleistungen",
      coordination: "Koordinationsleistungen",
      mercosur: "MERCOSUR (LATAM)",
      print: "Druck- & Stempeldienstleistungen",
      secretariat: "Büro & Sekretariat (Vor-Ort)",
      eur1: "Dokumentenservice EU–Syrien / EUR.1",
      dokumentabo: "Dokumenten-Abo – 58,31 € / Monat inkl. MwSt.",
      bueromanagement: "Büro-Management (Betriebe)"
    },
    name: "Vollständiger Name",
    email: "E-Mail-Adresse",
    phone: "Telefonnummer",
    address: "Adresse (optional)",
    description: "Beschreiben Sie Ihren Bedarf",
    description_placeholder: "Was genau benötigen Sie? Geben Sie uns so viele Details wie möglich...",
    upload_docs: "Dokumente hochladen (optional)",
    select_date: "Datum wählen",
    select_time: "Uhrzeit wählen",
    next: "Weiter",
    back: "Zurück",
    submit: "Buchung absenden",
    success_title: "Buchung erfolgreich!",
    success_message: "Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.",
    booking_number: "Buchungsnummer",
    available: "Verfügbar",
    booked: "Gebucht",
    slots_available: "Termine verfügbar",
    no_slots: "Keine Termine verfügbar",
    loading_slots: "Termine werden geladen...",
    login_required: "Anmeldung erforderlich",
    login_required_message: "Bitte melden Sie sich an, um fortzufahren. Klicken Sie auf 'Anmelden' oben rechts."
  },
  ar: {
    title: "حجز خدمة",
    step1: "اختر الفئة",
    step2: "اختر الخدمة",
    step3: "أدخل التفاصيل",
    step4: "اختر الموعد",
    select_provider: "اختيار مزود الخدمة",
    any_provider: "أي مزود خدمة",
    any_provider_desc: "سنخصص لك أفضل مزود خدمة متاح",
    selected_provider: "مزود الخدمة المختار",
    change_provider: "تغيير",
    no_providers: "لا يوجد مزودي خدمة لهذه الفئة",
    reviews: "تقييمات",
    categories: {
      office: "خدمة المكتب والتنظيم",
      forms: "مساعدة الدوائر والنماذج",
      admin: "الخدمات الإدارية",
      coordination: "خدمات التنسيق",
      mercosur: "ميركوسور (أمريكا اللاتينية)",
      print: "خدمات الطباعة والأختام",
      secretariat: "المكتب والسكرتارية (حضوري)",
      eur1: "خدمة وثائق التصدير/الاستيراد EUR.1",
      dokumentabo: "اشتراك المستندات – 58.31 يورو / شهرياً شامل الضريبة",
      bueromanagement: "إدارة المكتب (للشركات)"
    },
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "العنوان (اختياري)",
    description: "صف احتياجك",
    description_placeholder: "ما الذي تحتاجه بالضبط؟ أعطنا أكبر قدر ممكن من التفاصيل...",
    upload_docs: "رفع المستندات (اختياري)",
    select_date: "اختر التاريخ",
    select_time: "اختر الوقت",
    next: "التالي",
    back: "رجوع",
    submit: "إرسال الحجز",
    success_title: "تم الحجز بنجاح!",
    success_message: "لقد استلمنا طلبك وسنتواصل معك قريباً.",
    booking_number: "رقم الحجز",
    available: "متاح",
    booked: "محجوز",
    slots_available: "مواعيد متاحة",
    no_slots: "لا توجد مواعيد متاحة",
    loading_slots: "جاري تحميل المواعيد...",
    login_required: "يجب تسجيل الدخول",
    login_required_message: "يرجى تسجيل الدخول للمتابعة. انقر على 'تسجيل الدخول' في الأعلى."
  },
  en: {
    title: "Book a Service",
    step1: "Select Category",
    step2: "Select Service",
    step3: "Enter Details",
    step4: "Choose Date & Time",
    select_provider: "Select Provider",
    any_provider: "Any Available Provider",
    any_provider_desc: "We'll assign you the best available professional",
    selected_provider: "Selected Provider",
    change_provider: "Change",
    no_providers: "No providers available for this category",
    reviews: "reviews",
    categories: {
      office: "Office & Organization Service",
      forms: "Government & Form Assistance",
      admin: "Administrative Services",
      coordination: "Coordination Services",
      mercosur: "MERCOSUR (LATAM)",
      print: "Printing & Stamp Services",
      secretariat: "Office & Secretariat (On-Site)",
      eur1: "EU–Syria Document Service / EUR.1",
      dokumentabo: "Document Subscription – €58.31 / month incl. VAT",
      bueromanagement: "Office Management (businesses)"
    },
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address (optional)",
    description: "Describe your needs",
    description_placeholder: "What exactly do you need? Give us as many details as possible...",
    upload_docs: "Upload Documents (optional)",
    select_date: "Select Date",
    select_time: "Select Time",
    next: "Next",
    back: "Back",
    submit: "Submit Booking",
    success_title: "Booking Successful!",
    success_message: "We have received your request and will contact you shortly.",
    booking_number: "Booking Number",
    available: "Available",
    booked: "Booked",
    slots_available: "slots available",
    no_slots: "No slots available",
    loading_slots: "Loading available slots...",
    login_required: "Login Required",
    login_required_message: "Please log in to continue. Click 'Login' at the top right."
    },
    es: {
    title: "Reservar un Servicio",
    step1: "Seleccionar Categoría",
    step2: "Seleccionar Servicio",
    step3: "Ingresar Detalles",
    step4: "Elegir Fecha y Hora",
    select_provider: "Seleccionar Proveedor",
    any_provider: "Cualquier Proveedor Disponible",
    any_provider_desc: "Te asignaremos el mejor profesional disponible",
    selected_provider: "Proveedor Seleccionado",
    change_provider: "Cambiar",
    no_providers: "No hay proveedores disponibles para esta categoría",
    reviews: "reseñas",
    categories: {
      office: "Servicio de Oficina y Organización",
      forms: "Asistencia Gubernamental y Formularios",
      admin: "Servicios Administrativos",
      coordination: "Servicios de Coordinación",
      mercosur: "MERCOSUR (LATAM)",
      print: "Servicios de Impresión y Sellos",
      secretariat: "Oficina & Secretariado (Presencial)",
      eur1: "Servicio de Documentos UE–Siria / EUR.1",
      dokumentabo: "Suscripción de Documentos – 58,31 € / mes IVA incl.",
      bueromanagement: "Gestión de Oficina (empresas)"
    },
    name: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Número de Teléfono",
    address: "Dirección (opcional)",
    description: "Describe tus necesidades",
    description_placeholder: "¿Qué necesitas exactamente? Danos tantos detalles como sea posible...",
    upload_docs: "Subir Documentos (opcional)",
    select_date: "Seleccionar Fecha",
    select_time: "Seleccionar Hora",
    next: "Siguiente",
    back: "Atrás",
    submit: "Enviar Reserva",
    success_title: "¡Reserva Exitosa!",
    success_message: "Hemos recibido tu solicitud y te contactaremos pronto.",
    booking_number: "Número de Reserva",
    available: "Disponible",
    booked: "Reservado",
    slots_available: "horarios disponibles",
    no_slots: "No hay horarios disponibles",
    loading_slots: "Cargando horarios disponibles...",
    login_required: "Inicio de Sesión Requerido",
    login_required_message: "Por favor inicia sesión para continuar. Haz clic en 'Iniciar Sesión' arriba a la derecha."
    },
  tr: {
    title: "Hizmet Rezervasyonu",
    step1: "Kategori Seçin",
    step2: "Hizmet Seçin",
    step3: "Detayları Girin",
    step4: "Tarih ve Saat Seçin",
    select_provider: "Sağlayıcı Seçin",
    any_provider: "Herhangi Bir Sağlayıcı",
    any_provider_desc: "Size en iyi müsait profesyoneli atayacağız",
    selected_provider: "Seçilen Sağlayıcı",
    change_provider: "Değiştir",
    no_providers: "Bu kategori için sağlayıcı yok",
    reviews: "değerlendirmeler",
    categories: {
      office: "Ofis ve Organizasyon Hizmeti",
      forms: "Resmi Daire ve Form Yardımı",
      admin: "İdari Hizmetler",
      coordination: "Koordinasyon Hizmetleri",
      mercosur: "MERCOSUR (LATAM)",
      print: "Baskı ve Damga Hizmetleri",
      secretariat: "Ofis & Sekreterlik (Yerinde)",
      eur1: "AB–Suriye Belge Hizmeti / EUR.1",
      dokumentabo: "Belge Aboneliği – Aylık 58,31 € KDV dahil",
      bueromanagement: "Büro Yönetimi (işletmeler)"
    },
    name: "Tam Ad",
    email: "E-posta Adresi",
    phone: "Telefon Numarası",
    address: "Adres (isteğe bağlı)",
    description: "İhtiyaçlarınızı açıklayın",
    description_placeholder: "Tam olarak neye ihtiyacınız var? Mümkün olduğunca çok ayrıntı verin...",
    upload_docs: "Belge Yükle (isteğe bağlı)",
    select_date: "Tarih Seçin",
    select_time: "Saat Seçin",
    next: "İleri",
    back: "Geri",
    submit: "Rezervasyon Gönder",
    success_title: "Rezervasyon Başarılı!",
    success_message: "Talebinizi aldık ve kısa süre içinde sizinle iletişime geçeceğiz.",
    booking_number: "Rezervasyon Numarası",
    available: "Müsait",
    booked: "Rezerve Edildi",
    slots_available: "randevu müsait",
    no_slots: "Müsait randevu yok",
    loading_slots: "Müsait randevular yükleniyor...",
    login_required: "Giriş Gerekli",
    login_required_message: "Devam etmek için lütfen giriş yapın. Sağ üstteki 'Giriş Yap'a tıklayın."
  },
  uk: {
    title: "Забронювати послугу",
    step1: "Оберіть категорію",
    step2: "Оберіть послугу",
    step3: "Введіть дані",
    step4: "Оберіть дату й час",
    select_provider: "Оберіть виконавця",
    any_provider: "Будь-який вільний виконавець",
    any_provider_desc: "Ми призначимо вам найкращого вільного фахівця",
    selected_provider: "Обраний виконавець",
    change_provider: "Змінити",
    no_providers: "Для цієї категорії немає виконавців",
    reviews: "відгуків",
    categories: {
      office: "Офісні та організаційні послуги",
      forms: "Допомога з установами та формулярами",
      admin: "Адміністративні послуги",
      coordination: "Послуги координації",
      mercosur: "MERCOSUR (Латинська Америка)",
      print: "Друк і печатки",
      secretariat: "Офіс і секретаріат (на місці)",
      eur1: "Документи ЄС–Сирія / EUR.1",
      dokumentabo: "Документна підписка – 58,31 € / міс. з ПДВ",
      bueromanagement: "Офіс-менеджмент (для бізнесу)"
    },
    name: "Повне ім’я",
    email: "E-mail",
    phone: "Номер телефону",
    address: "Адреса (необов’язково)",
    description: "Опишіть, що вам потрібно",
    description_placeholder: "Що саме вам потрібно? Опишіть якомога детальніше...",
    upload_docs: "Завантажити документи (необов’язково)",
    select_date: "Оберіть дату",
    select_time: "Оберіть час",
    next: "Далі",
    back: "Назад",
    submit: "Надіслати бронювання",
    success_title: "Бронювання успішне!",
    success_message: "Ми отримали ваш запит і незабаром зв’яжемося з вами.",
    booking_number: "Номер бронювання",
    available: "Вільно",
    booked: "Зайнято",
    slots_available: "вільних слотів",
    no_slots: "Немає вільних слотів",
    loading_slots: "Завантаження вільних слотів...",
    login_required: "Потрібен вхід",
    login_required_message: "Будь ласка, увійдіть, щоб продовжити. Натисніть «Увійти» вгорі праворуч."
  }
    };

// Texts of the redesigned booking page
const B = {
  de: { kicker: "Jetzt buchen", sub: "In drei kurzen Schritten zur passenden Dienstleistung.", steps: ["Leistung", "Ihre Daten", "Termin"], chooseHint: "Wählen Sie die gewünschte Dienstleistung.", optional: "Optional", orPackage: "Oder ein Monatspaket wählen", save: "Mit einem Monatspaket sparen Sie.", remove: "Entfernen", hours: "Anzahl der Stunden", packageHint: "Oder gehen Sie zurück und wählen Sie ein günstigeres Monatspaket.", monthly: "Monatspaket", change: "Ändern", pickFiles: "Dateien auswählen (PDF oder Fotos)", filesUploaded: "{n} Datei(en) hochgeladen", summary: "Ihre Buchung", service: "Leistung", when: "Termin", notChosen: "Noch nicht gewählt", price: "Preis", help: "Fragen zur Buchung?", helpText: "Wir helfen Ihnen gern am Telefon, Mo–Fr 9–18 Uhr.", loginText: "Bitte melden Sie sich an oder erstellen Sie ein Konto, um die Buchung fortzusetzen.", signIn: "Anmelden", later: "Später", bookingError: "Die Buchung konnte nicht gesendet werden.", agbPre: "Ich habe die ", agbAnd: " und die ", privacy: "Datenschutzerklärung", agbPost: " gelesen und akzeptiere sie. *", withdrawal: "Ich verlange ausdrücklich, dass EinStein vor Ablauf der Widerrufsfrist mit der Leistung beginnt. Mir ist bekannt, dass mein Widerrufsrecht bei vollständiger Vertragserfüllung erlischt." },
  ar: { kicker: "احجز الآن", sub: "ثلاث خطوات قصيرة للوصول إلى الخدمة المناسبة.", steps: ["الخدمة", "بياناتك", "الموعد"], chooseHint: "اختر الخدمة التي تحتاجها.", optional: "اختياري", orPackage: "أو اختر باقة شهرية", save: "توفّر أكثر مع الباقات الشهرية.", remove: "إزالة", hours: "عدد الساعات المطلوبة", packageHint: "أو ارجع واختر باقة شهرية بسعر أقل.", monthly: "باقة شهرية", change: "تغيير", pickFiles: "اختر الملفات (PDF أو صور)", filesUploaded: "تم رفع {n} ملف", summary: "حجزك", service: "الخدمة", when: "الموعد", notChosen: "لم يُحدَّد بعد", price: "السعر", help: "هل لديك سؤال عن الحجز؟", helpText: "يسعدنا مساعدتك عبر الهاتف من الاثنين إلى الجمعة، من الساعة 9 إلى 18.", loginText: "يرجى تسجيل الدخول أو إنشاء حساب لمتابعة الحجز.", signIn: "تسجيل الدخول", later: "لاحقاً", bookingError: "تعذّر إرسال الحجز.", agbPre: "لقد قرأت ", agbAnd: " و", privacy: "سياسة الخصوصية", agbPost: " وأوافق عليها. *", withdrawal: "أطلب صراحةً أن يبدأ آينشتاين بتقديم الخدمة قبل انتهاء مهلة العدول، وأعلم أن حقي في العدول يسقط عند التنفيذ الكامل للعقد." },
  en: { kicker: "Book now", sub: "Three short steps to the right service.", steps: ["Service", "Your details", "Date"], chooseHint: "Choose the service you need.", optional: "Optional", orPackage: "Or choose a monthly package", save: "Save with a monthly package.", remove: "Remove", hours: "Number of hours", packageHint: "Or go back and choose a cheaper monthly package.", monthly: "Monthly package", change: "Change", pickFiles: "Choose files (PDF or photos)", filesUploaded: "{n} file(s) uploaded", summary: "Your booking", service: "Service", when: "Date", notChosen: "Not chosen yet", price: "Price", help: "Questions about booking?", helpText: "We are happy to help by phone, Mon–Fri 9–18.", loginText: "Please sign in or create an account to continue your booking.", signIn: "Sign in", later: "Later", bookingError: "The booking could not be sent.", agbPre: "I have read the ", agbAnd: " and the ", privacy: "Privacy Policy", agbPost: " and accept them. *", withdrawal: "I expressly request that EinStein begins the service before the withdrawal period expires. I am aware that my right of withdrawal expires upon complete performance of the contract." },
  tr: { kicker: "Hemen rezervasyon", sub: "Doğru hizmete üç kısa adımda ulaşın.", steps: ["Hizmet", "Bilgileriniz", "Randevu"], chooseHint: "İhtiyacınız olan hizmeti seçin.", optional: "İsteğe bağlı", orPackage: "Ya da aylık bir paket seçin", save: "Aylık paketle tasarruf edin.", remove: "Kaldır", hours: "Saat sayısı", packageHint: "Ya da geri dönüp daha uygun bir aylık paket seçin.", monthly: "Aylık paket", change: "Değiştir", pickFiles: "Dosya seçin (PDF veya fotoğraf)", filesUploaded: "{n} dosya yüklendi", summary: "Rezervasyonunuz", service: "Hizmet", when: "Randevu", notChosen: "Henüz seçilmedi", price: "Fiyat", help: "Rezervasyonla ilgili sorunuz mu var?", helpText: "Telefonla memnuniyetle yardımcı oluruz, Pzt–Cum 9–18.", loginText: "Rezervasyona devam etmek için lütfen giriş yapın veya hesap oluşturun.", signIn: "Giriş yap", later: "Sonra", bookingError: "Rezervasyon gönderilemedi.", agbPre: "", agbAnd: " ve ", privacy: "Gizlilik Politikası", agbPost: " metinlerini okudum ve kabul ediyorum. *", withdrawal: "EinStein'in hizmete cayma süresi dolmadan başlamasını açıkça talep ediyorum. Cayma hakkımın sözleşmenin tamamen ifasıyla sona ereceğini biliyorum." },
  es: { kicker: "Reservar ahora", sub: "Tres pasos cortos hasta el servicio adecuado.", steps: ["Servicio", "Sus datos", "Cita"], chooseHint: "Elija el servicio que necesita.", optional: "Opcional", orPackage: "O elija un paquete mensual", save: "Ahorre con un paquete mensual.", remove: "Quitar", hours: "Número de horas", packageHint: "O vuelva atrás y elija un paquete mensual más económico.", monthly: "Paquete mensual", change: "Cambiar", pickFiles: "Elegir archivos (PDF o fotos)", filesUploaded: "{n} archivo(s) subido(s)", summary: "Su reserva", service: "Servicio", when: "Cita", notChosen: "Aún sin elegir", price: "Precio", help: "¿Preguntas sobre la reserva?", helpText: "Le ayudamos por teléfono, lun–vie 9–18.", loginText: "Inicie sesión o cree una cuenta para continuar con la reserva.", signIn: "Iniciar sesión", later: "Más tarde", bookingError: "No se pudo enviar la reserva.", agbPre: "He leído las ", agbAnd: " y la ", privacy: "Política de Privacidad", agbPost: " y las acepto. *", withdrawal: "Solicito expresamente que EinStein comience la prestación antes de que expire el plazo de desistimiento. Soy consciente de que mi derecho de desistimiento se extingue con la ejecución completa del contrato." },
  uk: { kicker: "Забронювати", sub: "Три короткі кроки до потрібної послуги.", steps: ["Послуга", "Ваші дані", "Дата"], chooseHint: "Оберіть потрібну послугу.", optional: "Необов’язково", orPackage: "Або оберіть місячний пакет", save: "Із місячним пакетом вигідніше.", remove: "Видалити", hours: "Кількість годин", packageHint: "Або поверніться й оберіть вигідніший місячний пакет.", monthly: "Місячний пакет", change: "Змінити", pickFiles: "Оберіть файли (PDF або фото)", filesUploaded: "Завантажено файлів: {n}", summary: "Ваше бронювання", service: "Послуга", when: "Дата", notChosen: "Ще не обрано", price: "Ціна", help: "Питання щодо бронювання?", helpText: "Охоче допоможемо телефоном, пн–пт 9–18.", loginText: "Увійдіть або створіть акаунт, щоб продовжити бронювання.", signIn: "Увійти", later: "Пізніше", bookingError: "Не вдалося надіслати бронювання.", agbPre: "Я прочитав(-ла) ", agbAnd: " та ", privacy: "Політику конфіденційності", agbPost: " і погоджуюся з ними. *", withdrawal: "Я прямо прошу, щоб EinStein почав надавати послугу до закінчення строку відмови. Мені відомо, що моє право на відмову припиняється після повного виконання договору." },
};

const categories = [
  { key: "forms", icon: ClipboardList, color: "bg-teal-500" },
  { key: "admin", icon: FileText, color: "bg-green-500" },
  { key: "coordination", icon: Settings, color: "bg-indigo-500" },
  { key: "mercosur", icon: Globe, color: "bg-amber-500" },
  { key: "print", icon: Printer, color: "bg-pink-500" },
  { key: "secretariat", icon: Building2, color: "bg-violet-600" },
  { key: "eur1", icon: Ship, color: "bg-rose-600" },
  { key: "dokumentabo", icon: Mail, color: "bg-purple-500" },
  { key: "bueromanagement", icon: Briefcase, color: "bg-sky-700" }
];

// Büro-Management: package chosen by number of employees (net prices, B2B)
const BM_TEXT = {
  de: { title: "Paket wählen", hint: "Nach Zahl der Mitarbeitenden, Minijobber eingeschlossen. Alle Pakete enthalten dieselben Leistungen.", klein: "Paket Klein", mittel: "Paket Mittel", gross: "Paket Groß", employees: "Mitarbeitende", month: "/ Monat" },
  ar: { title: "اختر الباقة", hint: "حسب عدد الموظفين، بما فيهم موظفو Minijob. جميع الباقات تشمل نفس الخدمات.", klein: "باقة صغيرة", mittel: "باقة متوسطة", gross: "باقة كبيرة", employees: "موظفين", month: "/ شهرياً" },
  en: { title: "Choose a package", hint: "By number of employees, Minijob employees included. All packages include the same services.", klein: "Small package", mittel: "Medium package", gross: "Large package", employees: "employees", month: "/ month" },
  tr: { title: "Paket seçin", hint: "Çalışan sayısına göre, Minijob çalışanları dahil. Tüm paketler aynı hizmetleri içerir.", klein: "Küçük paket", mittel: "Orta paket", gross: "Büyük paket", employees: "çalışan", month: "/ ay" },
  es: { title: "Elija un paquete", hint: "Según el número de empleados, incluidos los Minijob. Todos los paquetes incluyen los mismos servicios.", klein: "Paquete pequeño", mittel: "Paquete mediano", gross: "Paquete grande", employees: "empleados", month: "/ mes" },
  uk: { title: "Оберіть пакет", hint: "За кількістю працівників, включно з Minijob. Усі пакети містять однакові послуги.", klein: "Малий пакет", mittel: "Середній пакет", gross: "Великий пакет", employees: "працівників", month: "/ міс." },
};

const allTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Maximum bookings per time slot
const MAX_BOOKINGS_PER_SLOT = 3;

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("ar");
  
  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);
  
  const t = translations[lang] || translations.de;
  
  // Load custom prices from database
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: priceAdminApi.listPriceGroups,
  });

  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.items || item.prices || [];
    });
    return pricesObj;
  }, [priceSettingsData]);

  const getLabelByLang = (p) => {
    if (!p) return "";
    if (lang === "ar") return p.label_ar || p.label_de || p.label;
    if (lang === "en") return p.label_en || p.label_de || p.label;
    if (lang === "tr") return p.label_tr || p.label_de || p.label;
    if (lang === "es") return p.label_es || p.label_de || p.label;
    if (lang === "uk") return p.label_en || p.label_de || p.label;
    return p.label_de || p.label;
  };

  const getUnitByLang = (p) => {
    if (!p) return "";
    if (lang === "ar") return p.unit_ar || p.unit_de || p.unit;
    if (lang === "en") return p.unit_en || p.unit_de || p.unit;
    if (lang === "tr") return p.unit_tr || p.unit_de || p.unit;
    if (lang === "es") return p.unit_es || p.unit_de || p.unit;
    if (lang === "uk") return p.unit_en || p.unit_de || p.unit;
    return p.unit_de || p.unit;
  };

  const getCategoryName = (cat) => {
    if (customPrices && customPrices[cat] && customPrices[cat][0]) {
      const customName = getLabelByLang(customPrices[cat][0]);
      if (customName) return customName;
    }
    return t.categories[cat];
  }

  const getCategoryPriceInfo = (cat) => {
    if (customPrices && customPrices[cat] && customPrices[cat][0]) {
       return {
         price: customPrices[cat][0].price,
         unit: getUnitByLang(customPrices[cat][0])
       };
    }
    return null;
  }

  // Steps: 1=category+service, 2=details, 3=datetime
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  const [formData, setFormData] = useState({
    category: searchParams.get("category") || "",
    service_id: searchParams.get("service") || "",
    provider_id: searchParams.get("provider") || "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
    description: "",
    date: undefined,
    time: "",
    documents_urls: [],
    hours: 1,
    agb_accepted: false,
    withdrawal_consent: false
  });

  // Fetch providers for selected category
  const { data: categoryProviders = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["category-providers", formData.category],
    queryFn: () => providersApi.listProviders("approved"),
    enabled: !!formData.category,
    select: (providers) => providers.filter(p => p.categories?.includes(formData.category))
  });

  // Fetch selected provider details
  const { data: providerDetails } = useQuery({
    queryKey: ["provider-details", formData.provider_id],
    queryFn: () => providersApi.getProvider(formData.provider_id),
    enabled: !!formData.provider_id,
    onSuccess: (data) => {
      if (data) {
        setSelectedProvider(data);
        if (data.categories?.length === 1 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data.categories[0] }));
        }
      }
    }
  });

  useEffect(() => {
    if (providerDetails) {
      setSelectedProvider(providerDetails);
      if (providerDetails.categories?.length >= 1 && !formData.category) {
        setFormData(prev => ({ ...prev, category: providerDetails.categories[0] }));
      }
    }
  }, [providerDetails]);

  // Fetch existing bookings to check availability
  const { data: existingBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings-availability", formData.category],
    queryFn: () => bookingsApi.listBookings({ category: formData.category, status_not: "cancelled" }),
    enabled: !!formData.category
  });

  // Fetch service price for selected category
  const { data: categoryServices = [] } = useQuery({
    queryKey: ["category-services", formData.category],
    queryFn: () => adminServicesApi.listServices({ category: formData.category, status: "active" }),
    enabled: !!formData.category
  });

  // Get booked slots for a specific date
  const getBookedSlotsForDate = (date) => {
    if (!date) return {};
    const dateStr = format(date, "yyyy-MM-dd");
    const slotsCount = {};
    
    existingBookings.forEach(booking => {
      if (booking.date === dateStr && booking.time) {
        slotsCount[booking.time] = (slotsCount[booking.time] || 0) + 1;
      }
    });
    
    return slotsCount;
  };

  // Get available slots for selected date
  const getAvailableSlots = () => {
    // Always return all slots as available if no date selected or no bookings data
    if (!formData.date) return allTimeSlots.map(slot => ({ time: slot, available: true, count: 0 }));
    
    // If still loading or no bookings, all slots available
    if (loadingBookings || !existingBookings || existingBookings.length === 0) {
      return allTimeSlots.map(slot => ({ time: slot, available: true, count: 0 }));
    }
    
    const bookedSlots = getBookedSlotsForDate(formData.date);
    
    return allTimeSlots.map(slot => ({
      time: slot,
      available: (bookedSlots[slot] || 0) < MAX_BOOKINGS_PER_SLOT,
      count: bookedSlots[slot] || 0
    }));
  };

  // Check if a date has any available slots
  const hasAvailableSlots = (date) => {
    // Always return true if date is in the future - all slots available by default
    if (!existingBookings || existingBookings.length === 0) return true;
    
    const dateStr = format(date, "yyyy-MM-dd");
    const bookingsOnDate = existingBookings.filter(b => b.date === dateStr);
    
    // If no bookings on this date, all slots are available
    if (bookingsOnDate.length === 0) return true;
    
    const slotsCount = {};
    
    bookingsOnDate.forEach(booking => {
      if (booking.time) {
        slotsCount[booking.time] = (slotsCount[booking.time] || 0) + 1;
      }
    });
    
    // Check if at least one slot is available
    return allTimeSlots.some(slot => (slotsCount[slot] || 0) < MAX_BOOKINGS_PER_SLOT);
  };

  // Count available slots for a date
  const countAvailableSlots = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const bookingsOnDate = existingBookings.filter(b => b.date === dateStr);
    const slotsCount = {};
    
    bookingsOnDate.forEach(booking => {
      if (booking.time) {
        slotsCount[booking.time] = (slotsCount[booking.time] || 0) + 1;
      }
    });
    
    return allTimeSlots.filter(slot => (slotsCount[slot] || 0) < MAX_BOOKINGS_PER_SLOT).length;
  };

  const availableSlots = getAvailableSlots();

  useEffect(() => {
    const checkUser = () => {
      const userData = getStoredAuthUser();
      if (!userData) return;
      setUser(userData);
      if (userData.email) localStorage.setItem("einstein_customer_email", userData.email);
      setFormData(prev => ({
        ...prev,
        customer_name: userData.full_name || "",
        customer_email: userData.email || ""
      }));
    };
    checkUser();
    
    const cat = searchParams.get("category");
    const serviceId = searchParams.get("service");
    const providerId = searchParams.get("provider");
    const pkgName = searchParams.get("pkg");
    const pkgPrice = searchParams.get("pkg_price");
    const pkgHours = searchParams.get("pkg_hours");

    if (pkgName && cat === "secretariat") {
      // Came directly from a package button - pre-select and skip to details
      const pkg = { name: pkgName, price: pkgPrice, hours: parseInt(pkgHours) || 0 };
      setSelectedPackage(pkg);
      setFormData(prev => ({
        ...prev,
        category: "secretariat",
        service_id: `secretariat_${pkgName.replace(/\s+/g, "_").toLowerCase()}`
      }));
      setStep(2);
    } else if (cat === "bueromanagement") {
      // Stay on step 1: the customer still has to pick a package
      setFormData(prev => ({ ...prev, category: cat, service_id: `${cat}_main` }));
    } else if (serviceId) {
      setFormData(prev => ({ ...prev, service_id: serviceId }));
      if (cat) setFormData(prev => ({ ...prev, category: cat }));
      if (providerId) setFormData(prev => ({ ...prev, provider_id: providerId }));
      setStep(2);
    } else if (cat && categories.find(c => c.key === cat)) {
      setFormData(prev => ({ ...prev, category: cat }));
      if (providerId) setFormData(prev => ({ ...prev, provider_id: providerId }));
      setStep(2);
    }
  }, [searchParams]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    setLoading(true);
    const uploaded = await uploadApi.uploadFiles(files);
    const urls = (uploaded.files || []).map((file) => file.url);
    
    setFormData(prev => ({
      ...prev,
      documents_urls: [...prev.documents_urls, ...urls]
    }));
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const bookingNum = `ES-${Date.now().toString(36).toUpperCase()}`;

      // Get default price from service
      let defaultPrice = null;
      let serviceName = getCategoryName(formData.category);

      // Secretariat package selected
      if (formData.category === "secretariat" && selectedPackage) {
        const priceMatch = String(selectedPackage.price).match(/[\d.,]+/);
        if (priceMatch) {
          defaultPrice = parseFloat(priceMatch[0].replace(/\./g, "").replace(",", "."));
        }
        serviceName = `${getCategoryName("secretariat")} – ${selectedPackage.name}`;
      } else if (formData.category === "secretariat") {
        // Hourly secretariat: hours × 45€
        const hourlyRate = getPriceNumber("secretariat", customPrices) || 45;
        const hrs = formData.hours || 1;
        defaultPrice = hourlyRate * hrs;
        serviceName = `${getCategoryName("secretariat")} (${hrs}h)`;
      } else if (formData.category === "bueromanagement" && selectedPackage) {
        defaultPrice = selectedPackage.price;
        serviceName = `${getCategoryName("bueromanagement")} – ${selectedPackage.name}`;
      } else if (formData.service_id === `${formData.category}_main`) {
          // Priority: PriceSettings -> Service.price_from.
          const priceFromSettings = customPrices && customPrices[formData.category]?.[0]?.price
            ? parseFloat(String(customPrices[formData.category][0].price).replace(/[^\d.,]/g, '').replace(',', '.'))
            : null;
          if (priceFromSettings && !isNaN(priceFromSettings)) {
            defaultPrice = priceFromSettings;
          } else if (categoryServices.length > 0 && categoryServices[0].price_from) {
            defaultPrice = categoryServices[0].price_from;
          } else {
            defaultPrice = getPriceNumber(formData.category, customPrices);
          }
      } else {
        const selectedService = categoryServices.find(s => s.id === formData.service_id);
        if (selectedService) {
          defaultPrice = selectedService.price_from;
          serviceName = (lang === "ar" ? selectedService.name_ar : lang === "en" ? selectedService.name_en : selectedService.name_de) || selectedService.name_de;
        } else if (categoryServices.length > 0) {
          defaultPrice = categoryServices[0].price_from;
        }
      }

      // Use logged in user's email for RLS compliance
      const customerEmail = user?.email;
      
      if (!customerEmail) {
        setShowLoginAlert(true);
        setLoading(false);
        return;
      }
      setSubmitError("");

      const bookingData = {
        booking_number: bookingNum,
        customer_name: formData.customer_name,
        customer_email: customerEmail,
        customer_phone: formData.customer_phone,
        category: formData.category,
        service_id: formData.service_id,
        service_name: serviceName,
        provider_id: selectedProvider?.id ? String(selectedProvider.id) : null,
        provider_name: selectedProvider?.full_name || null,
        address: formData.address,
        description: formData.description,
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
        time: formData.time,
        documents_urls: formData.documents_urls,
        status: "pending",
        payment_status: "unpaid",
        price: defaultPrice,
        duration_hours: (formData.category === "secretariat" && !selectedPackage) ? (formData.hours || 1) : undefined,
        agb_accepted: formData.agb_accepted,
        withdrawal_consent: formData.withdrawal_consent
      };

      const createdBooking = await bookingsApi.createBooking(bookingData);

      setLoading(false);
      navigate(`/Payment?id=${createdBooking.id}`);
    } catch (error) {
      setSubmitError(error.message || "");
      setLoading(false);
    }
  };

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setFormData(prev => ({ ...prev, provider_id: provider?.id || "" }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!(formData.category && formData.service_id && (formData.category !== "bueromanagement" || selectedPackage));
      case 2: return !!(formData.customer_name && formData.customer_email && formData.customer_phone && formData.description);
      case 3: return formData.date !== undefined && formData.time !== "" && formData.agb_accepted;
      default: return true;
    }
  };

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleNextStep = () => {
    // Require login to proceed from step 1
    if (step === 1 && !user) {
      setShowLoginAlert(true);
      return;
    }
    setStep(step + 1);
  };

  const b = B[lang] || B.de;
  const isRTL = lang === "ar";
  const Forward = isRTL ? ArrowLeft : ArrowRight;
  const Backward = isRTL ? ArrowRight : ArrowLeft;
  const steps = b.steps;
  const selectedCategory = categories.find((c) => c.key === formData.category);

  // Price shown in the summary
  const summaryPrice = (() => {
    if (!formData.category) return null;
    if (formData.category === "secretariat" && selectedPackage) return { value: toGrossPrice(selectedPackage.price, lang), note: vatNote(lang) };
    if (formData.category === "secretariat") return { value: `${toGrossPrice((formData.hours || 1) * 45, lang)} €`, note: vatNote(lang) };
    if (formData.category === "bueromanagement") {
      return selectedPackage ? { value: `${displayPrice(selectedPackage.price, lang, "bueromanagement")} € ${(BM_TEXT[lang] || BM_TEXT.de).month}`, note: plusVatNote(lang) } : null;
    }
    const info = getCategoryPriceInfo(formData.category);
    return info ? { value: `${displayPrice(info.price, lang, formData.category)} ${info.unit || ""}`.trim(), note: priceNote(lang, formData.category) } : null;
  })();

  const field = "h-12 rounded-xl border-slate-200 bg-slate-50 text-[15px] focus-visible:border-[#7c3aed] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#7c3aed]/15 focus-visible:ring-offset-0";
  const labelClass = "mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700";

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero kicker={b.kicker} title={t.title} subtitle={b.sub}>
        {/* Progress */}
        <ol className="mt-8 grid max-w-2xl grid-cols-3 gap-2">
          {steps.map((label, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            return (
              <li key={label} className="flex flex-col gap-2">
                <span className={`h-1.5 rounded-full transition-all duration-500 ${step >= num ? "bg-gradient-to-r from-[#4c1d95] to-[#7c3aed]" : "bg-slate-200"}`} />
                <span className={`flex items-center gap-1.5 text-xs font-bold sm:text-sm ${active ? "text-[#4c1d95]" : done ? "text-slate-600" : "text-slate-400"}`}>
                  {done ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> : <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${active ? "bg-[#4c1d95] text-white" : "bg-slate-200 text-slate-500"}`}>{num}</span>}
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </PageHero>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Step content */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 md:p-10">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-black text-[#1f0b52]">{t.step1}</h2>
              <p className="mt-1 text-sm text-slate-500">{b.chooseHint}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.key;
                  const priceInfo = getCategoryPriceInfo(cat.key);
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, category: cat.key, service_id: `${cat.key}_main`, provider_id: "" }));
                        setSelectedProvider(null);
                        setSelectedPackage(null);
                      }}
                      className={`relative flex h-full flex-col rounded-2xl border-2 p-3 text-start transition sm:p-4 ${isSelected ? "border-[#7c3aed] bg-[#f7f3ff] shadow-md shadow-purple-500/10" : "border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"}`}
                    >
                      {isSelected && <CheckCircle className="absolute end-3 top-3 h-5 w-5 text-[#7c3aed]" />}
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? "bg-[#4c1d95] text-white" : "bg-purple-50 text-[#6d28d9]"}`}><Icon className="h-5 w-5" /></span>
                      <span className="mt-3 pe-6 text-sm font-bold leading-snug text-[#1f0b52]">{getCategoryName(cat.key)}</span>
                      {priceInfo && (
                        <span className="mt-auto pt-2 text-xs font-semibold text-[#6d28d9]">
                          <bdi>{displayPrice(priceInfo.price, lang, cat.key)} {priceInfo.unit}</bdi>
                          <span className="block font-medium text-slate-400">{priceNote(lang, cat.key)}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {formData.category === "secretariat" && (
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <div className="text-center">
                    <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-[#6d28d9]">{b.optional}</span>
                    <h3 className="mt-3 text-xl font-bold text-[#1f0b52]">{b.orPackage}</h3>
                    <p className="mt-1 text-sm text-slate-500">{b.save}</p>
                  </div>
                  {selectedPackage && (
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                        <CheckCircle className="h-4 w-4" />{selectedPackage.name} – {toGrossPrice(selectedPackage.price, lang)}
                      </span>
                      <button type="button" onClick={() => setSelectedPackage(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">{b.remove}</button>
                    </div>
                  )}
                  <div className="mt-6">
                    <SecretariatPackages
                      lang={lang}
                      onSelectPackage={(pkg) => {
                        setSelectedPackage(pkg);
                        setFormData((prev) => ({ ...prev, service_id: `secretariat_${pkg.name.replace(/\s+/g, "_").toLowerCase()}` }));
                      }}
                    />
                  </div>
                </div>
              )}

              {formData.category === "bueromanagement" && (() => {
                const bm = BM_TEXT[lang] || BM_TEXT.de;
                return (
                  <div className="mt-10 border-t border-slate-100 pt-8">
                    <h3 className="text-center text-xl font-bold text-[#1f0b52]">{bm.title}</h3>
                    <p className="mt-1 text-center text-sm text-slate-500">{bm.hint}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {BUEROMANAGEMENT_TIERS.map((tier) => {
                        const active = selectedPackage?.tier === tier.key;
                        return (
                          <button
                            key={tier.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelectedPackage({ tier: tier.key, name: `${bm[tier.key]} (${tier.employees} ${bm.employees})`, price: tier.price })}
                            className={`relative rounded-2xl border-2 p-5 text-start transition ${active ? "border-[#7c3aed] bg-[#f7f3ff]" : "border-slate-100 bg-white hover:border-purple-200"}`}
                          >
                            {active && <CheckCircle className="absolute end-3 top-3 h-5 w-5 text-[#7c3aed]" />}
                            <p className="font-bold text-[#1f0b52]">{bm[tier.key]}</p>
                            <p className="text-xs text-slate-500">{tier.employees} {bm.employees}</p>
                            <p className="mt-3 text-2xl font-black text-[#4c1d95]">{displayPrice(tier.price, lang, "bueromanagement")} € <span className="text-sm font-medium text-slate-500">{bm.month}</span></p>
                            <p className="text-[11px] text-slate-400">{plusVatNote(lang)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-black text-[#1f0b52]">{t.step3}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="bk-name" className={labelClass}><User className="h-4 w-4 text-slate-400" />{t.name} *</Label>
                  <Input id="bk-name" className={field} autoComplete="name" value={formData.customer_name} onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="bk-email" className={labelClass}><Mail className="h-4 w-4 text-slate-400" />{t.email} *</Label>
                  <Input id="bk-email" type="email" dir="ltr" className={field} autoComplete="email" value={formData.customer_email} onChange={(e) => setFormData((prev) => ({ ...prev, customer_email: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="bk-phone" className={labelClass}><Phone className="h-4 w-4 text-slate-400" />{t.phone} *</Label>
                  <Input id="bk-phone" type="tel" dir="ltr" className={field} autoComplete="tel" value={formData.customer_phone} onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="bk-address" className={labelClass}><MapPin className="h-4 w-4 text-slate-400" />{t.address}</Label>
                  <Input id="bk-address" className={field} autoComplete="street-address" value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label htmlFor="bk-desc" className={labelClass}>{t.description} *</Label>
                <Textarea id="bk-desc" rows={5} className="rounded-xl border-slate-200 bg-slate-50 text-[15px] focus-visible:border-[#7c3aed] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#7c3aed]/15 focus-visible:ring-offset-0" placeholder={t.description_placeholder} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
              </div>

              {formData.category === "secretariat" && !selectedPackage && (
                <div className="rounded-2xl border-2 border-purple-100 bg-[#f7f3ff] p-5">
                  <Label className="mb-3 flex items-center gap-2 font-bold text-[#1f0b52]"><Clock className="h-4 w-4 text-[#7c3aed]" />{b.hours}</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" size="icon" aria-label="−" onClick={() => setFormData((prev) => ({ ...prev, hours: Math.max(1, (prev.hours || 1) - 1) }))} className="rounded-full">−</Button>
                    <Input type="number" min="1" max="100" value={formData.hours || 1} onChange={(e) => setFormData((prev) => ({ ...prev, hours: Math.max(1, parseInt(e.target.value) || 1) }))} className="w-24 text-center text-xl font-bold" />
                    <Button type="button" variant="outline" size="icon" aria-label="+" onClick={() => setFormData((prev) => ({ ...prev, hours: (prev.hours || 1) + 1 }))} className="rounded-full">+</Button>
                    <span className="text-sm text-slate-600">
                      × {toGrossPrice(45, lang)} € = <span className="text-lg font-black text-[#4c1d95]">{toGrossPrice((formData.hours || 1) * 45, lang)} €</span> <span className="text-xs text-slate-400">{vatNote(lang)}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{b.packageHint}</p>
                </div>
              )}

              {formData.category === "secretariat" && selectedPackage && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-[#7c3aed] bg-[#f7f3ff] p-5">
                  <div>
                    <span className="rounded-full bg-[#4c1d95] px-2.5 py-0.5 text-xs font-bold text-white">{b.monthly}</span>
                    <p className="mt-2 text-lg font-bold text-[#1f0b52]">{selectedPackage.name}</p>
                    <p className="text-2xl font-black text-[#4c1d95]">{toGrossPrice(selectedPackage.price, lang)}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedPackage(null); setFormData((prev) => ({ ...prev, service_id: "secretariat_main" })); }}>{b.change}</Button>
                </div>
              )}

              <div>
                <Label htmlFor="bk-files" className={labelClass}><Upload className="h-4 w-4 text-slate-400" />{t.upload_docs}</Label>
                <label htmlFor="bk-files" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#7c3aed] hover:bg-purple-50/40">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-[#7c3aed]" /> : <Upload className="h-6 w-6 text-[#7c3aed]" />}
                  <span className="text-sm font-semibold text-slate-600">{b.pickFiles}</span>
                </label>
                <input id="bk-files" type="file" multiple className="sr-only" onChange={handleFileUpload} disabled={loading} />
                {formData.documents_urls.length > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle className="h-4 w-4" />{b.filesUploaded.replace("{n}", formData.documents_urls.length)}</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-black text-[#1f0b52]">{t.step4}</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div>
                  <p className={labelClass}><Calendar className="h-4 w-4 text-slate-400" />{t.select_date}</p>
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(newDate) => { if (newDate) setFormData((prev) => ({ ...prev, date: newDate, time: "" })); }}
                    fromDate={new Date()}
                    className="w-fit rounded-2xl border border-slate-200"
                  />
                </div>
                <div>
                  <p className={labelClass}><Clock className="h-4 w-4 text-slate-400" />{t.select_time}</p>
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8 text-slate-500"><Loader2 className="me-2 h-5 w-5 animate-spin" />{t.loading_slots}</div>
                  ) : (
                    <>
                      <p className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${availableSlots.some((s) => s.available) ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {availableSlots.some((s) => s.available) ? `${availableSlots.filter((s) => s.available).length} ${t.slots_available}` : t.no_slots}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
                        {availableSlots.map((slot) => {
                          const chosen = formData.time === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              aria-pressed={chosen}
                              onClick={() => slot.available && setFormData((prev) => ({ ...prev, time: slot.time }))}
                              className={`h-11 rounded-xl border-2 text-sm font-bold transition ${!slot.available ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through" : chosen ? "border-[#7c3aed] bg-[#4c1d95] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#7c3aed]"}`}
                              dir="ltr"
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox checked={formData.agb_accepted} onCheckedChange={(v) => setFormData((prev) => ({ ...prev, agb_accepted: v === true }))} className="mt-0.5" />
                  <span className="text-sm text-slate-700">
                    {b.agbPre}<Link to="/AGB" target="_blank" className="font-semibold text-[#6d28d9] underline">AGB</Link>{b.agbAnd}<Link to="/Datenschutz" target="_blank" className="font-semibold text-[#6d28d9] underline">{b.privacy}</Link>{b.agbPost}
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox checked={formData.withdrawal_consent} onCheckedChange={(v) => setFormData((prev) => ({ ...prev, withdrawal_consent: v === true }))} className="mt-0.5" />
                  <span className="text-sm text-slate-700">{b.withdrawal}</span>
                </label>
              </div>
            </motion.div>
          )}

          {submitError && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{b.bookingError} {submitError}</p>}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="h-12 rounded-xl border-slate-200 px-5">
                <Backward className="me-2 h-4 w-4" />{t.back}
              </Button>
            ) : <span />}
            {step < 3 ? (
              <Button type="button" onClick={handleNextStep} disabled={!canProceed()} className="h-12 rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] px-8 font-bold text-white shadow-lg shadow-purple-500/25 hover:brightness-110">
                {t.next}<Forward className="ms-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading || !canProceed()} className="h-12 rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] px-8 font-bold text-white shadow-lg shadow-purple-500/25 hover:brightness-110">
                {loading ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <CheckCircle className="me-2 h-4 w-4" />}{t.submit}
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#1f0b52]">{b.summary}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#6d28d9]">
                  {selectedCategory ? <selectedCategory.icon className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-slate-400">{b.service}</dt>
                  <dd className="font-bold text-[#1f0b52]">{formData.category ? getCategoryName(formData.category) : b.notChosen}</dd>
                  {selectedPackage && <dd className="text-slate-600">{selectedPackage.name}</dd>}
                  {formData.category === "secretariat" && !selectedPackage && step > 1 && <dd className="text-slate-600">{formData.hours || 1} h</dd>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#6d28d9]"><Calendar className="h-4 w-4" /></span>
                <div>
                  <dt className="text-xs font-semibold text-slate-400">{b.when}</dt>
                  <dd className="font-bold text-[#1f0b52]" dir="ltr">{formData.date ? `${format(formData.date, "dd.MM.yyyy")}${formData.time ? ` · ${formData.time}` : ""}` : <span dir="auto">{b.notChosen}</span>}</dd>
                </div>
              </div>
            </dl>
            {summaryPrice && (
              <div className="mt-5 rounded-2xl bg-[#f7f3ff] p-4">
                <p className="text-xs font-semibold text-slate-500">{b.price}</p>
                <p className="text-2xl font-black text-[#4c1d95]"><bdi>{summaryPrice.value}</bdi></p>
                <p className="text-xs text-slate-500">{summaryPrice.note}</p>
              </div>
            )}
          </div>
          <div className="rounded-[2rem] bg-[#1f0b52] p-6 text-white">
            <p className="font-bold">{b.help}</p>
            <p className="mt-1 text-sm text-purple-200">{b.helpText}</p>
            <a href="tel:+496927246275" className="mt-4 inline-flex items-center gap-2 font-bold text-white hover:underline"><Phone className="h-4 w-4" /><span dir="ltr">069 27246275</span></a>
          </div>
        </aside>
      </div>

      {/* Login required */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-[#7c3aed]" />{t.login_required}</AlertDialogTitle>
            <AlertDialogDescription className="text-base">{b.loginText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{b.later}</AlertDialogCancel>
            <Link to="/Login" className="inline-flex h-10 items-center justify-center rounded-md bg-[#4c1d95] px-5 text-sm font-bold text-white hover:bg-[#5b21b6]">{b.signIn}</Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
