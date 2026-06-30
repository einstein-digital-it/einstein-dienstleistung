import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { priceAdminApi, providerDashboardApi, uploadApi } from "@/api/backendClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Save,
  Briefcase,
  FileText,
  AlertCircle,
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProviderDocumentsTab from "../components/ProviderDocumentsTab";
import ProviderDocumentUpload from "../components/ProviderDocumentUpload";
import ProviderTaskTracker from "../components/ProviderTaskTracker";
import ExtensionsTab from "../components/ExtensionsTab";

const translations = {
  de: {
    title: "Mein Fachkraft-Dashboard",
    overview: "Übersicht",
    bookings: "Buchungen",
    profile: "Profil",
    documents: "Dokumente",
    earnings: "Einnahmen",
    upcoming_bookings: "Anstehende Buchungen",
    completed_jobs: "Abgeschlossene Aufträge",
    total_earnings: "Gesamteinnahmen",
    this_month: "Diesen Monat",
    rating: "Bewertung",
    no_bookings: "Keine Buchungen",
    customer: "Kunde",
    service: "Dienstleistung",
    date_time: "Datum & Uhrzeit",
    address: "Adresse",
    status: {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      in_progress: "In Bearbeitung",
      completed: "Abgeschlossen",
      cancelled: "Storniert"
    },
    accept: "Annehmen",
    decline: "Ablehnen",
    complete: "Abschließen",
    edit_profile: "Profil bearbeiten",
    save: "Speichern",
    availability: "Verfügbarkeit",
    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag"
    },
    hourly_rate: "Stundensatz (€)",
    qualifications: "Qualifikationen",
    languages: "Sprachen",
    categories: "Fachgebiete",
    not_approved: "Ihr Profil wurde noch nicht genehmigt",
    not_approved_desc: "Bitte warten Sie auf die Genehmigung durch das Team.",
    no_provider_profile: "Kein Fachkraft-Profil gefunden",
    apply_now: "Jetzt bewerben"
  },
  ar: {
    title: "لوحة تحكم مزود الخدمة",
    overview: "نظرة عامة",
    bookings: "الحجوزات",
    profile: "الملف الشخصي",
    documents: "المستندات",
    earnings: "الأرباح",
    upcoming_bookings: "الحجوزات القادمة",
    completed_jobs: "المهام المكتملة",
    total_earnings: "إجمالي الأرباح",
    this_month: "هذا الشهر",
    rating: "التقييم",
    no_bookings: "لا توجد حجوزات",
    customer: "العميل",
    service: "الخدمة",
    date_time: "التاريخ والوقت",
    address: "العنوان",
    status: {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغى"
    },
    accept: "قبول",
    decline: "رفض",
    complete: "إتمام",
    edit_profile: "تعديل الملف",
    save: "حفظ",
    availability: "أوقات التوفر",
    days: {
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد"
    },
    hourly_rate: "سعر الساعة (€)",
    qualifications: "المؤهلات",
    languages: "اللغات",
    categories: "التخصصات",
    not_approved: "لم تتم الموافقة على ملفك بعد",
    not_approved_desc: "يرجى الانتظار حتى يوافق الفريق على طلبك.",
    no_provider_profile: "لم يتم العثور على ملف مزود خدمة",
    apply_now: "قدم الآن"
  },
  en: {
    title: "My Provider Dashboard",
    overview: "Overview",
    bookings: "Bookings",
    profile: "Profile",
    documents: "Documents",
    earnings: "Earnings",
    upcoming_bookings: "Upcoming Bookings",
    completed_jobs: "Completed Jobs",
    total_earnings: "Total Earnings",
    this_month: "This Month",
    rating: "Rating",
    no_bookings: "No bookings",
    customer: "Customer",
    service: "Service",
    date_time: "Date & Time",
    address: "Address",
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    accept: "Accept",
    decline: "Decline",
    complete: "Complete",
    edit_profile: "Edit Profile",
    save: "Save",
    availability: "Availability",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    hourly_rate: "Hourly Rate (€)",
    qualifications: "Qualifications",
    languages: "Languages",
    categories: "Categories",
    not_approved: "Your profile is not yet approved",
    not_approved_desc: "Please wait for the team to approve your application.",
    no_provider_profile: "No provider profile found",
    apply_now: "Apply Now"
  }
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const categoryLabels = {
  de: {
    office: "Büro- und Organisationsservice",
    forms: "Behörden & Formularhilfe",
    admin: "Administrative Dienstleistungen",
    coordination: "Koordinationsleistungen",
    mercosur: "MERCOSUR (LATAM)",
    tutoring: "Nachhilfe / Lernunterstützung",
    print: "Druck- und Stempeldienstleistungen"
  },
  ar: {
    office: "خدمة المكتب والتنظيم",
    forms: "مساعدة الدوائر والنماذج",
    admin: "الخدمات الإدارية",
    coordination: "خدمات التنسيق",
    mercosur: "ميركوسور (أمريكا اللاتينية)",
    tutoring: "الدروس الخصوصية / دعم التعلم",
    print: "خدمات الطباعة والأختام"
  },
  en: {
    office: "Office & Organization Service",
    forms: "Government & Form Assistance",
    admin: "Administrative Services",
    coordination: "Coordination Services",
    mercosur: "MERCOSUR (LATAM)",
    tutoring: "Tutoring / Learning Support",
    print: "Printing & Stamp Services"
  }
};

const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function ProviderDashboard() {
  const [lang, setLang] = useState("de");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang] || translations.de;
  const catLabels = categoryLabels[lang] || categoryLabels.de;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        } else {
          base44.auth.redirectToLogin();
        }
      } catch(e) {
        base44.auth.redirectToLogin();
      } finally {
        setUserLoading(false);
      }
    };
    checkUser();
  }, []);

  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings-provider-dashboard"],
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
    return p.label_de || p.label;
  };

  const getCategoryName = (cat) => {
    if (customPrices && customPrices[cat] && customPrices[cat][0]) {
      const customName = getLabelByLang(customPrices[cat][0]);
      if (customName) return customName;
    }
    return catLabels[cat] || cat;
  }

  // Fetch provider profile + bookings via backend function (bypasses RLS)
  const { data: providerData = { provider: null, bookings: [] }, isLoading: loadingProfile, error: providerError } = useQuery({
    queryKey: ["provider-data", user?.email],
    queryFn: async () => {
      try {
        return await providerDashboardApi.getDashboard(user.email);
      } catch (error) {
        console.error('Error fetching provider data:', error);
        throw error;
      }
    },
    enabled: !!user?.email && !userLoading,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1
  });

  // Hooks must be declared before any conditional returns
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, action }) =>
      providerDashboardApi.handleBookingAction(bookingId, providerData?.provider?.id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-data"] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      const profile = providerData?.provider;
      if (!profile?.id) throw new Error("No provider profile");
      return providerDashboardApi.updateProfile(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-data"] });
      setEditMode(false);
    }
  });


  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-gray-600">جارى التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">يرجى تسجيل الدخول أولاً</p>
        </div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f] mx-auto mb-4" />
          <p className="text-gray-600">جارى تحميل البيانات...</p>
          <p className="text-xs text-gray-400 mt-2">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">فشل تحميل البيانات</p>
        </div>
      </div>
    );
  }

  if (providerError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">حدث خطأ في تحميل البيانات</p>
          <p className="text-sm text-gray-500 mt-2">{providerError.message}</p>
        </div>
      </div>
    );
  }

  const providerProfile = providerData?.provider;
  const bookings = providerData?.bookings || [];

  const handleAcceptBooking = (booking) => {
    updateBookingMutation.mutate({ bookingId: booking.id, action: 'accept' });
  };

  const handleDeclineBooking = (booking) => {
    updateBookingMutation.mutate({ bookingId: booking.id, action: 'decline' });
  };

  const handleCompleteBooking = (booking) => {
    updateBookingMutation.mutate({ bookingId: booking.id, action: 'complete' });
  };

  const handleSaveProfile = async () => {
    // If email changed, check if it's already in use
    if (editedProfile.email !== providerProfile.email) {
      try {
        // Check if new email exists as another ServiceProvider
        const existingProviders = [];
        
        if (existingProviders.length > 0) {
          alert(lang === "ar" 
            ? "هذا البريد مسجل بالفعل كمزود خدمة" 
            : lang === "en" 
              ? "This email is already registered as a service provider" 
              : "Diese E-Mail ist bereits als Dienstleister registriert");
          return;
        }

      } catch (error) {
        console.error("Error checking email:", error);
      }
    }
    
    updateProfileMutation.mutate(editedProfile);
  };

  const toggleAvailability = (day) => {
    const current = editedProfile.availability || [];
    if (current.includes(day)) {
      setEditedProfile(prev => ({
        ...prev,
        availability: current.filter(d => d !== day)
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        availability: [...current, day]
      }));
    }
  };

  // No provider profile found
  if (!loadingProfile && !providerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">{t.no_provider_profile}</h2>
            <p className="text-gray-600 mb-4">{lang === "ar" ? "أنت لم تسجل كمزود خدمة بعد" : lang === "en" ? "You haven't registered as a service provider yet" : "Sie haben sich noch nicht als Dienstleister registriert"}</p>
            <Button 
              onClick={() => window.location.href = "/ProviderApplication"}
              className="mt-4 bg-[#6B46C1] hover:bg-[#805AD5] text-white"
            >
              {t.apply_now}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Profile not approved
  if (providerProfile && providerProfile.status !== "approved") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center p-8">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">{t.not_approved}</h2>
            <p className="text-gray-600">{t.not_approved_desc}</p>
            <Badge className="mt-4 bg-yellow-100 text-yellow-800">
              Status: {providerProfile.status}
            </Badge>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate stats - only for THIS provider's bookings (not pending open ones)
  const myBookings = bookings.filter(b =>
    b.provider_id === providerProfile?.id ||
    b.confirmed_by_provider_email?.toLowerCase() === providerProfile?.email?.toLowerCase() ||
    b.confirmed_by_provider_id === providerProfile?.id
  );
  const upcomingBookings = myBookings.filter(b => 
    ["pending", "confirmed", "in_progress"].includes(b.status)
  );
  const completedBookings = myBookings.filter(b => b.status === "completed");
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const monthlyEarnings = completedBookings
    .filter(b => new Date(b.date).getMonth() === currentMonth)
    .reduce((sum, b) => sum + (b.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-[#6B46C1]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">{t.title}</h1>
              <p className="text-gray-600">{providerProfile.full_name}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-white shadow-sm flex flex-wrap h-auto">
            <TabsTrigger value="requests" className="relative">
              {lang === "ar" ? "طلبات جديدة" : lang === "en" ? "New Requests" : "Neue Anfragen"}
              {bookings.filter(b => b.status === "pending" && !b.provider_id).length > 0 && (
                <span className="ms-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {bookings.filter(b => b.status === "pending" && !b.provider_id).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mywork" className="relative">
               {lang === "ar" ? "مهامي" : lang === "en" ? "My Work" : "Meine Aufgaben"}
               {bookings.filter(b => ["confirmed","in_progress"].includes(b.status) && (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id)).length > 0 && (
                 <span className="ms-1.5 bg-[#6B46C1] text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                   {bookings.filter(b => ["confirmed","in_progress"].includes(b.status) && (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id)).length}
                 </span>
               )}
             </TabsTrigger>
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="bookings">{t.bookings}</TabsTrigger>
            <TabsTrigger value="profile">{t.profile}</TabsTrigger>
            <TabsTrigger value="documents">{t.documents}</TabsTrigger>
            <TabsTrigger value="tasks">
              {lang === "ar" ? "متابعة المهام" : lang === "en" ? "Task Tracker" : "Aufgaben-Tracker"}
            </TabsTrigger>
            <TabsTrigger value="extensions">
              {lang === "ar" ? "🔁 التمديدات" : lang === "en" ? "🔁 Extensions" : "🔁 Erweiterungen"}
            </TabsTrigger>
          </TabsList>

          {/* My Active Work Tab */}
          <TabsContent value="mywork">
            <div className="space-y-4">
              {bookings
                .filter(b => ["confirmed","in_progress"].includes(b.status) && 
                  (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id))
                .length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">{lang === "ar" ? "لا توجد مهام نشطة حالياً" : lang === "en" ? "No active tasks at the moment" : "Keine aktiven Aufgaben"}</p>
                  </CardContent>
                </Card>
              ) : (
                bookings
                  .filter(b => ["confirmed","in_progress"].includes(b.status) &&
                    (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id))
                  .map((booking) => (
                    <Card key={booking.id} className="border-2 border-[#6B46C1]/20">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={statusColors[booking.status]}>{t.status[booking.status]}</Badge>
                              <span className="font-mono text-xs text-gray-400">{booking.booking_number}</span>
                            </div>
                            <h3 className="font-bold text-[#1e3a5f] text-lg">{booking.service_name || booking.category}</h3>
                          </div>
                          {booking.price && <p className="text-xl font-bold text-[#1e3a5f]">€{booking.price}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <strong>{booking.customer_name}</strong>
                            {booking.customer_phone && <span>· {booking.customer_phone}</span>}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {booking.customer_email}
                          </p>
                          {booking.date && (
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {format(new Date(booking.date), "dd.MM.yyyy")} {booking.time && `· ${booking.time}`}
                            </p>
                          )}
                          {booking.address && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {booking.address}
                            </p>
                          )}
                        </div>

                        {booking.description && (
                          <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">{booking.description}</p>
                        )}

                        {/* Customer documents */}
                        {booking.documents_urls?.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              {lang === "ar" ? "مستندات العميل:" : lang === "en" ? "Customer Documents:" : "Kundendokumente:"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {booking.documents_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100 transition-colors">
                                  <FileText className="w-4 h-4" />
                                  {lang === "ar" ? "مستند" : lang === "en" ? "Document" : "Dokument"} {i+1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                          {booking.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteBooking(booking)}
                              className="bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                            >
                              <CheckCircle className="w-4 h-4 me-1" />
                              {t.complete}
                            </Button>
                          )}
                        </div>

                        {/* Upload completed documents */}
                        <ProviderDocumentUpload booking={booking} lang={lang} onUploaded={() => queryClient.invalidateQueries({ queryKey: ["provider-data"] })} />
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          {/* Customer Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Section 1: My accepted work */}
              <Card className="border-2 border-[#6B46C1]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1e3a5f] text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {lang === "ar" ? "✅ طلباتي - أنا قبلتها" : lang === "en" ? "✅ My Accepted Jobs" : "✅ Meine angenommenen Aufträge"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {lang === "ar" ? "هذه الطلبات قبلتها وتحتاج للعمل عليها" : lang === "en" ? "These are jobs you accepted and need to work on" : "Diese Aufträge haben Sie angenommen"}
                  </p>
                </CardHeader>
                <CardContent>
                  {bookings.filter(b => 
                      ["confirmed","in_progress"].includes(b.status) && 
                      (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id)
                    ).length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">{lang === "ar" ? "لم تقبل أي طلب بعد" : lang === "en" ? "No accepted jobs yet" : "Noch keine angenommenen Aufträge"}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.filter(b => 
                        ["confirmed","in_progress"].includes(b.status) && 
                        (b.provider_id === providerProfile?.id || b.confirmed_by_provider_email === providerProfile?.email || b.confirmed_by_provider_id === providerProfile?.id)
                      ).map((booking) => (
                        <div key={booking.id} className="border-2 border-green-100 rounded-xl p-4 bg-green-50/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={statusColors[booking.status]}>{t.status[booking.status]}</Badge>
                                {booking.booking_number && <span className="font-mono text-xs text-gray-400">{booking.booking_number}</span>}
                              </div>
                              <h3 className="font-bold text-[#1e3a5f] text-lg">{booking.service_name || booking.category}</h3>
                              <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><strong>{booking.customer_name}</strong>{booking.customer_phone && <span>- {booking.customer_phone}</span>}</p>
                                {booking.date && <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{format(new Date(booking.date), "dd.MM.yyyy")}{booking.time && <span>- {booking.time}</span>}</p>}
                                {booking.address && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{booking.address}</p>}
                              </div>
                              {booking.description && <p className="mt-3 text-sm bg-white p-3 rounded-lg border border-gray-100 text-gray-700">{booking.description}</p>}
                              {booking.documents_urls?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {booking.documents_urls.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-md text-sm hover:bg-[#6B46C1]/20 transition-colors">
                                      <FileText className="w-4 h-4" />
                                      {lang === 'ar' ? 'مستند' : lang === 'de' ? 'Dokument' : 'Document'} {i + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              {booking.price && <p className="text-xl font-bold text-[#1e3a5f]">€{booking.price}</p>}
                              {booking.status === "confirmed" && (
                                <Button size="sm" onClick={() => handleCompleteBooking(booking)} className="bg-[#6B46C1] hover:bg-[#805AD5] text-white">
                                  <CheckCircle className="w-4 h-4 me-1" />{t.complete}
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <ProviderDocumentUpload booking={booking} lang={lang} onUploaded={() => queryClient.invalidateQueries({ queryKey: ["provider-data"] })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 2: Open requests - nobody accepted yet */}
              <Card className="border-2 border-orange-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1e3a5f] text-lg">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    {lang === "ar" ? "🆕 طلبات مفتوحة - ماحدا قبلها" : lang === "en" ? "🆕 Open Requests - Not Accepted Yet" : "🆕 Offene Anfragen - Noch nicht angenommen"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {lang === "ar" ? "هذه الطلبات متاحة، يمكنك قبولها للعمل عليها" : lang === "en" ? "These requests are available - you can accept them" : "Diese Anfragen sind verfügbar - Sie können sie annehmen"}
                  </p>
                </CardHeader>
                <CardContent>
                  {bookings.filter(b => b.status === "pending" && !b.provider_id && !b.confirmed_by_provider_id).length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400">{lang === "ar" ? "لا توجد طلبات مفتوحة حالياً" : lang === "en" ? "No open requests at the moment" : "Keine offenen Anfragen"}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                    {bookings.filter(b => b.status === "pending" && !b.provider_id && !b.confirmed_by_provider_id).map((booking) => (
                      <div key={booking.id} className="border-2 border-orange-100 rounded-xl p-4 bg-orange-50/30 hover:border-orange-300 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-orange-100 text-orange-700 border-0">
                                {lang === "ar" ? "طلب جديد" : lang === "en" ? "New Request" : "Neue Anfrage"}
                              </Badge>
                              {booking.booking_number && (
                                <span className="font-mono text-xs text-gray-400">{booking.booking_number}</span>
                              )}
                            </div>
                            <h3 className="font-bold text-[#1e3a5f] text-lg">{booking.service_name || booking.category}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <strong>{booking.customer_name}</strong>
                                {booking.customer_phone && <span>- {booking.customer_phone}</span>}
                              </p>
                              {booking.date && (
                                <p className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {format(new Date(booking.date), "dd.MM.yyyy")}
                                  {booking.time && <span>- {booking.time}</span>}
                                </p>
                              )}
                              {booking.address && (
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  {booking.address}
                                </p>
                              )}
                            </div>
                            {booking.description && (
                              <p className="mt-3 text-sm bg-white p-3 rounded-lg border border-gray-100 text-gray-700">{booking.description}</p>
                            )}
                            {booking.documents_urls?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {booking.documents_urls.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-md text-sm hover:bg-[#6B46C1]/20 transition-colors">
                                    <FileText className="w-4 h-4" />
                                    {lang === 'ar' ? 'مستند' : lang === 'de' ? 'Dokument' : 'Document'} {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {booking.price && (
                              <p className="text-xl font-bold text-[#1e3a5f]">€{booking.price}</p>
                            )}
                            <Button
                              size="sm"
                              onClick={() => handleAcceptBooking(booking)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 me-1" />
                              {t.accept}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineBooking(booking)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 me-1" />
                              {t.decline}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>{/* end space-y-6 wrapper */}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.upcoming_bookings}</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">{upcomingBookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.completed_jobs}</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">{completedBookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#6B46C1]/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[#6B46C1]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.total_earnings}</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">€{totalEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.rating}</p>
                      <p className="text-2xl font-bold text-[#1e3a5f]">
                        {providerProfile.rating ? `${providerProfile.rating.toFixed(1)}/5` : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Bookings Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t.upcoming_bookings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{t.no_bookings}</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{booking.service_name}</span>
                            <Badge className={statusColors[booking.status]}>
                              {t.status[booking.status]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {booking.customer_name}
                            </span>
                            {booking.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(booking.date), "dd.MM.yyyy")}
                              </span>
                            )}
                            {booking.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.time}
                              </span>
                            )}
                          </div>
                          {booking.documents_urls && booking.documents_urls.length > 0 && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 text-xs text-[#6B46C1]">
                                <FileText className="w-3 h-3" />
                                {booking.documents_urls.length} {lang === 'ar' ? 'مستندات' : lang === 'de' ? 'Dokumente' : 'Documents'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptBooking(booking)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {t.accept}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeclineBooking(booking)}
                                className="text-red-600 border-red-300"
                              >
                                {t.decline}
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteBooking(booking)}
                              className="bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                            >
                              {t.complete}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardContent className="p-6">
                {bookings.filter(b => 
                    b.provider_id === providerProfile?.id || 
                    b.confirmed_by_provider_email === providerProfile?.email || 
                    b.confirmed_by_provider_id === providerProfile?.id
                  ).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{t.no_bookings}</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.filter(b => 
                      b.provider_id === providerProfile?.id || 
                      b.confirmed_by_provider_email === providerProfile?.email || 
                      b.confirmed_by_provider_id === providerProfile?.id
                    ).map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm text-gray-500">{booking.booking_number}</span>
                              <Badge className={statusColors[booking.status]}>
                                {t.status[booking.status]}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg">{booking.service_name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {booking.customer_name} - {booking.customer_phone}
                              </p>
                              {booking.date && (
                                <p className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {format(new Date(booking.date), "dd.MM.yyyy")} {booking.time && `- ${booking.time}`}
                                </p>
                              )}
                              {booking.address && (
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {booking.address}
                                </p>
                              )}
                            </div>
                            {booking.description && (
                              <p className="mt-2 text-sm bg-gray-50 p-2 rounded">{booking.description}</p>
                            )}
                            {booking.documents_urls && booking.documents_urls.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {booking.documents_urls.map((url, i) => (
                                  <a 
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-md text-sm hover:bg-[#6B46C1]/20 transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                    {lang === 'ar' ? 'مستند' : lang === 'de' ? 'Dokument' : 'Document'} {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-end">
                            {booking.price && (
                              <p className="text-xl font-bold text-[#1e3a5f]">€{booking.price}</p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap justify-end">
                              {booking.status === "pending" && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptBooking(booking)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {t.accept}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDeclineBooking(booking)}
                                    className="text-red-600 border-red-300"
                                  >
                                    {t.decline}
                                  </Button>
                                </>
                              )}
                              {booking.status === "confirmed" && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCompleteBooking(booking)}
                                  className="bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                                >
                                  {t.complete}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Upload completed documents - shown when provider confirmed this booking */}
                        {(booking.confirmed_by_provider_id === providerProfile?.id || 
                         booking.confirmed_by_provider_email === providerProfile?.email) && (
                          <div className="mt-4 border-t pt-4">
                            <ProviderDocumentUpload booking={booking} lang={lang} onUploaded={() => queryClient.invalidateQueries({ queryKey: ["provider-bookings"] })} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t.profile}</CardTitle>
                  {!editMode ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditedProfile({...providerProfile});
                        setEditMode(true);
                      }}
                    >
                      <Edit className="w-4 h-4 me-2" />
                      {t.edit_profile}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                      >
                        <XCircle className="w-4 h-4 me-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-[#6B46C1] hover:bg-[#805AD5] text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4 me-2" />
                        {t.save}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  <>
                    {/* Profile Image Upload */}

                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {editedProfile.profile_image ? (
                          <img
                            src={editedProfile.profile_image}
                            alt={editedProfile.full_name}
                            className="w-20 h-20 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-[#1e3a5f] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                            {editedProfile.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <label className="absolute -bottom-2 -right-2 bg-[#6B46C1] rounded-full p-1.5 cursor-pointer hover:bg-[#805AD5] transition-colors">
                          <Camera className="w-3.5 h-3.5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const uploaded = await uploadApi.uploadFiles([file]);
                              const fileUrl = uploaded.files?.[0]?.url;
                              if (fileUrl) setEditedProfile(prev => ({ ...prev, profile_image: fileUrl }));
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {lang === "ar" ? "اضغط على الأيقونة لتغيير الصورة" : lang === "en" ? "Click the icon to change your photo" : "Klicken Sie auf das Symbol, um das Foto zu ändern"}
                      </p>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>{t.customer}</Label>
                        <Input 
                          value={editedProfile.full_name || ""} 
                          onChange={(e) => setEditedProfile(prev => ({...prev, full_name: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={editedProfile.email || ""} disabled />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={editedProfile.phone || ""} 
                          onChange={(e) => setEditedProfile(prev => ({...prev, phone: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label>{t.hourly_rate}</Label>
                        <Input 
                          type="number"
                          value={editedProfile.hourly_rate || ""} 
                          onChange={(e) => setEditedProfile(prev => ({...prev, hourly_rate: parseFloat(e.target.value) || 0}))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>{t.qualifications}</Label>
                      <Textarea 
                        rows={3}
                        value={editedProfile.qualifications || ""} 
                        onChange={(e) => setEditedProfile(prev => ({...prev, qualifications: e.target.value}))}
                      />
                    </div>

                    {/* Availability */}
                    <div>
                      <Label className="mb-3 block">{t.availability}</Label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleAvailability(day)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              (editedProfile.availability || []).includes(day)
                                ? "border-[#6B46C1] bg-[#6B46C1]/10"
                                : "border-gray-200"
                            }`}
                          >
                            {t.days[day]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Display Profile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{providerProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{providerProfile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t.hourly_rate}</p>
                          <p className="font-medium">€{providerProfile.hourly_rate || "-"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">{t.rating}</p>
                          <p className="font-medium">{providerProfile.rating || "-"}/5</p>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{t.categories}</p>
                      <div className="flex flex-wrap gap-2">
                        {(providerProfile.categories || []).map((cat) => (
                          <Badge key={cat} className="bg-[#1e3a5f]">
                            {getCategoryName(cat)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{t.languages}</p>
                      <div className="flex flex-wrap gap-2">
                        {(providerProfile.languages || []).map((lang) => (
                          <Badge key={lang} variant="outline">{lang}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{t.availability}</p>
                      <div className="flex flex-wrap gap-2">
                        {(providerProfile.availability || []).map((day) => (
                          <Badge key={day} className="bg-green-100 text-green-800">
                            {t.days[day] || day}
                          </Badge>
                        ))}
                        {(!providerProfile.availability || providerProfile.availability.length === 0) && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    {/* Qualifications */}
                    {providerProfile.qualifications && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">{t.qualifications}</p>
                        <p className="bg-gray-50 p-3 rounded-lg">{providerProfile.qualifications}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <ProviderDocumentsTab providerId={providerProfile.id} lang={lang} />
          </TabsContent>

          {/* Task Tracker Tab */}
          <TabsContent value="tasks">
            <ProviderTaskTracker
              bookings={bookings}
              providerId={providerProfile.id}
              providerEmail={providerProfile.email}
              lang={lang}
            />
          </TabsContent>

          {/* Extensions Tab */}
          <TabsContent value="extensions">
            <ExtensionsTab providerEmail={providerProfile.email} lang={lang} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
