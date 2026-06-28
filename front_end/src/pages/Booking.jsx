import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
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
  Star,
  Users,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { format, isSameDay, addDays, startOfDay } from "date-fns";
import { defaultPrices, getPriceNumber } from "@/lib/defaultPrices";
import SecretariatPackages from "@/components/SecretariatPackages";

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
      tutoring: "Nachhilfe / Lernunterstützung",
      print: "Druck- & Stempeldienstleistungen",
      secretariat: "Büro & Sekretariat (Vor-Ort)"
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
      tutoring: "الدروس الخصوصية / دعم التعلم",
      print: "خدمات الطباعة والأختام",
      secretariat: "المكتب والسكرتارية (حضوري)"
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
      tutoring: "Tutoring / Learning Support",
      print: "Printing & Stamp Services",
      secretariat: "Office & Secretariat (On-Site)"
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
      tutoring: "Tutoría / Apoyo al Aprendizaje",
      print: "Servicios de Impresión y Sellos",
      secretariat: "Oficina & Secretariado (Presencial)"
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
      tutoring: "Özel Ders / Öğrenme Desteği",
      print: "Baskı ve Damga Hizmetleri",
      secretariat: "Ofis & Sekreterlik (Yerinde)"
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
  }
    };

const categories = [
  { key: "forms", icon: ClipboardList, color: "bg-teal-500" },
  { key: "admin", icon: FileText, color: "bg-green-500" },
  { key: "coordination", icon: Settings, color: "bg-indigo-500" },
  { key: "mercosur", icon: Globe, color: "bg-amber-500" },
  { key: "tutoring", icon: BookOpen, color: "bg-blue-500" },
  { key: "print", icon: Printer, color: "bg-pink-500" },
  { key: "secretariat", icon: Building2, color: "bg-violet-600" }
];

const allTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Maximum bookings per time slot
const MAX_BOOKINGS_PER_SLOT = 3;

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("de");
  
  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);
  
  const t = translations[lang] || translations.de;
  
  // Load custom prices from database
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: () => base44.entities.PriceSettings.list(),
  });

  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.prices;
    });
    return pricesObj;
  }, [priceSettingsData]);

  const getLabelByLang = (p) => {
    if (!p) return "";
    if (lang === "ar") return p.label_ar || p.label_de;
    if (lang === "en") return p.label_en || p.label_de;
    if (lang === "tr") return p.label_tr || p.label_de;
    if (lang === "es") return p.label_es || p.label_de;
    return p.label_de;
  };

  const getUnitByLang = (p) => {
    if (!p) return "";
    if (lang === "ar") return p.unit_ar || p.unit_de;
    if (lang === "en") return p.unit_en || p.unit_de;
    if (lang === "tr") return p.unit_tr || p.unit_de;
    if (lang === "es") return p.unit_es || p.unit_de;
    return p.unit_de;
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
  const [success, setSuccess] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");
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
    hours: 1
  });

  // Fetch providers for selected category
  const { data: categoryProviders = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["category-providers", formData.category],
    queryFn: () => base44.entities.ServiceProvider.filter({ 
      status: "approved"
    }),
    enabled: !!formData.category,
    select: (providers) => providers.filter(p => p.categories?.includes(formData.category))
  });

  // Fetch selected provider details
  const { data: providerDetails } = useQuery({
    queryKey: ["provider-details", formData.provider_id],
    queryFn: async () => {
      const providers = await base44.entities.ServiceProvider.filter({ id: formData.provider_id });
      return providers[0];
    },
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
    queryFn: () => base44.entities.Booking.filter(
      { category: formData.category, status: { $ne: "cancelled" } },
      "-date",
      500
    ),
    enabled: !!formData.category
  });

  // Fetch service price for selected category
  const { data: categoryServices = [] } = useQuery({
    queryKey: ["category-services", formData.category],
    queryFn: () => base44.entities.Service.filter({ category: formData.category, is_active: true }),
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
    const checkUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        console.log("User data:", userData);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          customer_name: userData.full_name || "",
          customer_email: userData.email || ""
        }));
      }
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
    const urls = [];
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    
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
      } else if (formData.service_id === `${formData.category}_main`) {
          // Priority: PriceSettings -> Service.price_from -> defaultPrices
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
        alert("يجب تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }

      console.log("Creating booking with:", {
        customer_email: customerEmail,
        category: formData.category,
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
        time: formData.time,
        full_form_data: formData
      });

      const bookingData = {
        booking_number: bookingNum,
        customer_name: formData.customer_name,
        customer_email: customerEmail,
        customer_phone: formData.customer_phone,
        category: formData.category,
        service_id: formData.service_id,
        service_name: serviceName,
        provider_id: null,
        provider_name: null,
        address: formData.address,
        description: formData.description,
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
        time: formData.time,
        documents_urls: formData.documents_urls,
        status: "pending",
        payment_status: "unpaid",
        price: defaultPrice,
        duration_hours: (formData.category === "secretariat" && !selectedPackage) ? (formData.hours || 1) : undefined
      };

      console.log("Booking data to create:", bookingData);

      const createdBooking = await base44.entities.Booking.create(bookingData);

      // Send confirmation email
      try {
        await base44.functions.invoke('sendBookingConfirmation', { bookingId: bookingData.booking_number });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Create notification for customer
      await base44.entities.Notification.create({
        user_email: customerEmail,
        type: "booking_confirmed",
        title_de: "Buchung eingegangen",
        title_ar: "تم استلام الحجز",
        title_en: "Booking Received",
        message_de: `Ihre Buchung ${bookingNum} wurde erfolgreich eingereicht. Wir werden uns in Kürze bei Ihnen melden.`,
        message_ar: `تم تقديم حجزك ${bookingNum} بنجاح. سنتواصل معك قريباً.`,
        message_en: `Your booking ${bookingNum} has been successfully submitted. We will contact you shortly.`,
        link: "CustomerDashboard",
        is_read: false
      });

      // Create notification for admin
      try {
        const admins = await base44.entities.User.filter({ role: "admin" });
        for (const admin of admins) {
          await base44.entities.Notification.create({
            user_email: admin.email,
            type: "new_booking_request",
            title_de: "Neue Buchung eingegangen",
            title_ar: "حجز جديد وارد",
            title_en: "New Booking Received",
            message_de: `Neue Buchung ${bookingNum} von ${formData.customer_name} - ${serviceName}`,
            message_ar: `حجز جديد ${bookingNum} من ${formData.customer_name} - ${serviceName}`,
            message_en: `New booking ${bookingNum} from ${formData.customer_name} - ${serviceName}`,
            link: "BookingReports",
            booking_id: bookingNum,
            is_read: false
          });
        }
      } catch (adminNotifError) {
        console.error("Error notifying admins:", adminNotifError);
      }

      setLoading(false);
      navigate(`/Payment?id=${createdBooking.id}`);
    } catch (error) {
      console.error("Booking error:", error);
      alert(`خطأ في الحجز: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setFormData(prev => ({ ...prev, provider_id: provider?.id || "" }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!(formData.category && formData.service_id);
      case 2: return !!(formData.customer_name && formData.customer_email && formData.customer_phone && formData.description);
      case 3: return formData.date !== undefined && formData.time !== "";
      default: return true;
    }
  };

  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleNextStep = () => {
    // Require login to proceed from step 1
    if (step === 1 && !user) {
      setShowLoginAlert(true);
      return;
    }
    setStep(step + 1);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Card className="text-center p-10 border-0 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6B46C1] via-[#805AD5] to-[#c9a227]" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-black text-[#1e3a5f] mb-3 tracking-tight">{t.success_title}</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">{t.success_message}</p>
              <div className="bg-gradient-to-br from-[#6B46C1]/5 to-[#805AD5]/10 rounded-2xl p-6 inline-block border border-[#6B46C1]/10">
                <p className="text-sm text-gray-400 font-medium mb-1">{t.booking_number}</p>
                <p className="text-3xl font-black text-[#1e3a5f] tracking-wide">{bookingNumber}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-sm font-semibold mb-4 tracking-wide">
            {lang === "ar" ? "احجز خدمتك" : lang === "en" ? "BOOK YOUR SERVICE" : "JETZT BUCHEN"}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[#1e3a5f] mb-3 tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {lang === "ar" ? "خطوات بسيطة لحجز الخدمة التي تحتاجها" : lang === "en" ? "A few simple steps to book the service you need" : "In wenigen Schritten zur gewünschten Dienstleistung"}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: lang === "ar" ? "اختر الخدمة" : lang === "en" ? "Choose Service" : "Dienst wählen" },
              { num: 2, label: lang === "ar" ? "بياناتك" : lang === "en" ? "Your Details" : "Ihre Daten" },
              { num: 3, label: lang === "ar" ? "الموعد" : lang === "en" ? "Date & Time" : "Termin" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                      step >= s.num ? "bg-gradient-to-br from-[#6B46C1] to-[#805AD5] text-white shadow-purple-200 shadow-md" : "bg-white border-2 border-gray-200 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-1.5 hidden sm:block font-medium ${step >= s.num ? "text-[#6B46C1]" : "text-gray-400"}`}>{s.label}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-12 md:w-24 h-0.5 mb-5 rounded-full transition-all duration-500 ${step > s.num ? "bg-gradient-to-r from-[#6B46C1] to-[#805AD5]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl shadow-slate-200/60 rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-10">
            {/* Step 1: Category + Service combined */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-black text-[#1e3a5f] mb-1 tracking-tight">{t.step1}</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {lang === "ar" ? "اختر نوع الخدمة التي تحتاجها" : lang === "en" ? "Choose the service you need" : "Wählen Sie die gewünschte Dienstleistung"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.key;
                    const priceInfo = getCategoryPriceInfo(cat.key);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          const newServiceId = `${cat.key}_main`;
                          setFormData(prev => ({ ...prev, category: cat.key, service_id: newServiceId, provider_id: "" }));
                          setSelectedProvider(null);
                          setSelectedPackage(null);
                        }}
                        className={`p-5 rounded-2xl border-2 transition-all duration-200 text-start relative shadow-sm hover:shadow-md ${
                          isSelected ? "border-[#6B46C1] bg-gradient-to-br from-[#6B46C1]/10 to-[#805AD5]/5 shadow-purple-100" : "border-gray-100 hover:border-[#6B46C1]/40 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#6B46C1] absolute top-2 end-2" />}
                        <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="font-semibold text-[#1e3a5f] text-sm leading-tight">{getCategoryName(cat.key)}</p>
                        <p className="text-xs text-[#c9a227] font-medium mt-1">
                          {priceInfo
                            ? `${priceInfo.price} ${priceInfo.unit}`
                            : (() => {
                                const d = defaultPrices[cat.key];
                                if (!d) return "";
                                const unit = lang === "ar" ? d.unit_ar : lang === "en" ? d.unit_en : d.unit_de;
                                return `${d.display}${unit ? " " + unit : ""}`;
                              })()
                          }
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Optional packages for secretariat */}
                {formData.category === "secretariat" && (
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <div className="text-center mb-2">
                      <span className="inline-block px-3 py-1 bg-purple-50 text-[#6B46C1] rounded-full text-xs font-semibold">
                        {lang === "ar" ? "اختياري" : lang === "en" ? "OPTIONAL" : "OPTIONAL"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-center text-[#1e3a5f] mb-2">
                      {lang === "ar" ? "أو اختر باكيج شهري جاهز" : lang === "en" ? "Or choose a monthly package" : "Oder wählen Sie ein Monatspaket"}
                    </h3>
                    <p className="text-center text-gray-400 text-sm mb-6">
                      {lang === "ar" ? "وفّر مع باقاتنا الشهرية" : lang === "en" ? "Save with our monthly plans" : "Sparen Sie mit unseren Monatsplänen"}
                    </p>
                    {selectedPackage && (
                      <div className="text-center mb-4">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 me-1" />
                          {selectedPackage.name} – {selectedPackage.price}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPackage(null)}
                          className="text-xs text-gray-500 ms-2"
                        >
                          {lang === "ar" ? "إزالة" : lang === "en" ? "Remove" : "Entfernen"}
                        </Button>
                      </div>
                    )}
                    <SecretariatPackages
                      lang={lang}
                      onSelectPackage={(pkg) => {
                        setSelectedPackage(pkg);
                        setFormData(prev => ({
                          ...prev,
                          service_id: `secretariat_${pkg.name.replace(/\s+/g, "_").toLowerCase()}`,
                        }));
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-[#1e3a5f] mb-6 tracking-tight">{t.step3}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" /> {t.name}
                    </Label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" /> {t.email}
                    </Label>
                    <Input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" /> {t.phone}
                    </Label>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> {t.address}
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">{t.description}</Label>
                  <Textarea
                    rows={4}
                    placeholder={t.description_placeholder}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Hours selector for secretariat (only if no package selected) */}
                {formData.category === "secretariat" && !selectedPackage && (
                  <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-2xl p-5">
                    <Label className="flex items-center gap-2 mb-3 font-semibold text-[#1e3a5f]">
                      <Clock className="w-4 h-4 text-[#6B46C1]" />
                      {lang === "ar" ? "عدد الساعات المطلوبة" : lang === "en" ? "Number of hours" : "Anzahl der Stunden"}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, hours: Math.max(1, (prev.hours || 1) - 1) }))}
                        className="rounded-full"
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.hours || 1}
                        onChange={(e) => {
                          const v = parseInt(e.target.value) || 1;
                          setFormData(prev => ({ ...prev, hours: Math.max(1, v) }));
                        }}
                        className="text-center text-xl font-bold w-24"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, hours: (prev.hours || 1) + 1 }))}
                        className="rounded-full"
                      >
                        +
                      </Button>
                      <span className="text-sm text-gray-500 ms-2">
                        × 45 € = <span className="font-bold text-[#6B46C1] text-lg">{(formData.hours || 1) * 45} €</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {lang === "ar" ? "أو يمكنك العودة لاختيار باكيج شهري بسعر مخفّض" : lang === "en" ? "Or go back and choose a discounted monthly package" : "Oder wählen Sie ein vergünstigtes Monatspaket"}
                    </p>
                  </div>
                )}

                {/* Show selected package summary */}
                {formData.category === "secretariat" && selectedPackage && (
                  <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-[#6B46C1] rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-[#6B46C1] text-white mb-2">
                          {lang === "ar" ? "باكيج شهري" : lang === "en" ? "Monthly Package" : "Monatspaket"}
                        </Badge>
                        <p className="font-bold text-[#1e3a5f] text-lg">{selectedPackage.name}</p>
                        <p className="text-2xl font-black text-[#6B46C1]">{selectedPackage.price}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPackage(null);
                          setFormData(prev => ({ ...prev, service_id: "secretariat_main" }));
                        }}
                      >
                        {lang === "ar" ? "تغيير" : lang === "en" ? "Change" : "Ändern"}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4" /> {t.upload_docs}
                  </Label>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                  {formData.documents_urls.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      {formData.documents_urls.length} file(s) uploaded
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-6">{t.step4}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4" /> {t.select_date}
                    </Label>
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(newDate) => {
                        console.log("Selected date:", newDate);
                        if (newDate) {
                          setFormData(prev => ({ ...prev, date: newDate, time: "" }));
                        }
                      }}
                      fromDate={new Date()}
                      className="rounded-md border"
                    />
                    
                    {/* Legend */}
                    <div className="flex gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                        <span className="text-gray-600">{t.available}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                        <span className="text-gray-600">{t.booked}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" /> {t.select_time}
                    </Label>
                    
                    {loadingBookings ? (
                      <div className="flex items-center justify-center py-8 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin me-2" />
                        {t.loading_slots}
                      </div>
                    ) : (
                      <>
                        {/* Available slots count */}
                        <div className="mb-4">
                          <Badge 
                            className={`${
                              availableSlots.filter(s => s.available).length > 0 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {availableSlots.filter(s => s.available).length > 0 
                              ? `${availableSlots.filter(s => s.available).length} ${t.slots_available}`
                              : t.no_slots
                            }
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => {
                                if (slot.available) {
                                  setFormData(prev => ({ ...prev, time: slot.time }));
                                }
                              }}
                              disabled={!slot.available}
                              className={`p-3 rounded-lg border-2 transition-all relative ${
                                !slot.available 
                                  ? "border-red-200 bg-red-50 text-red-400 cursor-not-allowed line-through"
                                  : formData.time === slot.time 
                                    ? "border-[#6B46C1] bg-[#6B46C1]/10 font-medium" 
                                    : "border-gray-200 hover:border-[#6B46C1]/50 bg-green-50"
                              }`}
                            >
                              <span>{slot.time}</span>
                              {slot.available && (
                                <span className="absolute top-1 end-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl border-gray-200 hover:border-[#6B46C1]/30 hover:text-[#6B46C1] px-6">
                  <ArrowLeft className="w-4 h-4 me-2" />
                  {t.back}
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button 
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-[#6B46C1] to-[#805AD5] hover:from-[#805AD5] hover:to-[#6B46C1] text-white px-8 rounded-xl shadow-lg shadow-purple-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4 ms-2" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="bg-gradient-to-r from-[#6B46C1] to-[#805AD5] hover:from-[#805AD5] hover:to-[#6B46C1] text-white px-8 rounded-xl shadow-lg shadow-purple-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <CheckCircle className="w-4 h-4 me-2" />}
                  {loading ? "..." : t.submit}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Required Alert */}
        <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#c9a227]" />
                {t.login_required}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {t.login_required_message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{lang === "ar" ? "حسناً" : lang === "en" ? "OK" : "OK"}</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}