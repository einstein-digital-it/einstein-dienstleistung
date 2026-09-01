import React, { useState, useEffect } from "react";
import { providersApi, reportsApi } from "@/api/backendClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Loader2,
  FileText,
  Euro,
  AlertCircle,
  Check,
  Upload,
  Lock,
  Info
} from "lucide-react";
import ProviderDocumentUpload from "@/components/ProviderDocumentUpload";
import { requireStoredUser } from "@/lib/backendAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const translations = {
  de: {
    title: "Buchungsübersicht",
    subtitle: "Alle eingehenden Buchungsanfragen",
    pending: "Ausstehend",
    confirmed: "Bestätigt",
    in_progress: "In Bearbeitung",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
    confirm_booking: "Buchung bestätigen",
    confirmed_by: "Bestätigt von",
    no_bookings: "Keine Buchungen gefunden",
    customer: "Kunde",
    service: "Dienstleistung",
    date: "Datum",
    time: "Uhrzeit",
    address: "Adresse",
    description: "Beschreibung",
    confirm_dialog_title: "Buchung bestätigen?",
    confirm_dialog_desc: "Möchten Sie diese Buchung übernehmen? Der Kunde wird benachrichtigt.",
    yes: "Ja, bestätigen",
    cancel: "Abbrechen",
    you_confirmed: "Sie haben diese Buchung bestätigt"
  },
  ar: {
    title: "تقارير الحجوزات",
    subtitle: "جميع طلبات الحجز الواردة",
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
    confirm_booking: "تأكيد الحجز",
    confirmed_by: "تم التأكيد بواسطة",
    no_bookings: "لا توجد حجوزات",
    customer: "العميل",
    service: "الخدمة",
    date: "التاريخ",
    time: "الوقت",
    address: "العنوان",
    description: "الوصف",
    confirm_dialog_title: "تأكيد الحجز؟",
    confirm_dialog_desc: "هل تريد قبول هذا الحجز؟ سيتم إبلاغ العميل.",
    yes: "نعم، تأكيد",
    cancel: "إلغاء",
    you_confirmed: "لقد أكدت هذا الحجز"
  },
  en: {
    title: "Booking Reports",
    subtitle: "All incoming booking requests",
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    confirm_booking: "Confirm Booking",
    confirmed_by: "Confirmed by",
    no_bookings: "No bookings found",
    customer: "Customer",
    service: "Service",
    date: "Date",
    time: "Time",
    address: "Address",
    description: "Description",
    confirm_dialog_title: "Confirm Booking?",
    confirm_dialog_desc: "Do you want to accept this booking? The customer will be notified.",
    yes: "Yes, confirm",
    cancel: "Cancel",
    you_confirmed: "You confirmed this booking"
  },
  tr: {
    title: "Rezervasyon Raporlari",
    subtitle: "Tum gelen rezervasyon talepleri",
    pending: "Beklemede",
    confirmed: "Onaylandi",
    in_progress: "Devam Ediyor",
    completed: "Tamamlandi",
    cancelled: "Iptal Edildi",
    confirm_booking: "Rezervasyonu Onayla",
    confirmed_by: "Onaylayan",
    no_bookings: "Rezervasyon bulunamadi",
    customer: "Musteri",
    service: "Hizmet",
    date: "Tarih",
    time: "Saat",
    address: "Adres",
    description: "Aciklama",
    confirm_dialog_title: "Rezervasyonu Onayla?",
    confirm_dialog_desc: "Bu rezervasyonu kabul etmek istiyor musunuz? Musteri bilgilendirilecek.",
    yes: "Evet, onayla",
    cancel: "Iptal",
    you_confirmed: "Bu rezervasyonu onayladiniz"
  },
  es: {
    title: "Informes de Reservas",
    subtitle: "Todas las solicitudes de reserva entrantes",
    pending: "Pendiente",
    confirmed: "Confirmado",
    in_progress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado",
    confirm_booking: "Confirmar Reserva",
    confirmed_by: "Confirmado por",
    no_bookings: "No se encontraron reservas",
    customer: "Cliente",
    service: "Servicio",
    date: "Fecha",
    time: "Hora",
    address: "Dirección",
    description: "Descripción",
    confirm_dialog_title: "¿Confirmar Reserva?",
    confirm_dialog_desc: "¿Desea aceptar esta reserva? El cliente será notificado.",
    yes: "Sí, confirmar",
    cancel: "Cancelar",
    you_confirmed: "Ha confirmado esta reserva"
  }
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800"
};

const bookingReportText = {
  ar: {
    confirmedToast: "تم تأكيد الحجز بنجاح",
    confirmError: "تعذر تأكيد الحجز",
    all: "الكل",
    requiredDocuments: "الأوراق المطلوبة",
    customerDocuments: "مستندات العميل",
    providerDocuments: "مستندات المزوّد",
    document: "مستند",
    paymentRequired: "يتطلب دفعًا من العميل",
  },
  en: {
    confirmedToast: "Booking confirmed successfully",
    confirmError: "Could not confirm the booking",
    all: "All",
    requiredDocuments: "Required Documents",
    customerDocuments: "Customer Documents",
    providerDocuments: "Provider Documents",
    document: "Document",
    paymentRequired: "payment required from customer",
  },
  de: {
    confirmedToast: "Buchung wurde bestaetigt",
    confirmError: "Buchung konnte nicht bestaetigt werden",
    all: "Alle",
    requiredDocuments: "Benoetigte Dokumente",
    customerDocuments: "Kundendokumente",
    providerDocuments: "Anbieter-Dokumente",
    document: "Dokument",
    paymentRequired: "zahlungspflichtig fuer den Kunden",
  },
};

export default function BookingReports() {
  const [lang, setLang] = useState("ar");
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null });
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);

    const checkAuth = async () => {
      const userData = requireStoredUser();
      if (!userData) return;
      setUser(userData);

      if (userData.role !== "admin") {
        const providers = await providersApi.listProviders("approved");
        const approvedProvider = providers.find((item) => item.email?.toLowerCase() === userData.email?.toLowerCase());
        if (approvedProvider) {
          setProvider(approvedProvider);
        } else {
          window.location.href = "/";
        }
      }
    };
    checkAuth();
  }, []);

  const t = translations[lang] || translations.de;
  const ui = bookingReportText[lang] || bookingReportText.de;
  const isAdmin = user?.role === "admin";

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings-reports"],
    queryFn: async () => {
      const report = await reportsApi.listBookingReports();
      return report.bookings || [];
    },
    enabled: !!user
  });

  // Confirm booking mutation
  const confirmMutation = useMutation({
    mutationFn: async (booking) => {
      await reportsApi.confirmBooking(booking.id, {
        confirmed_by_provider_id: provider?.id || "admin",
        confirmed_by_provider_name: provider?.full_name || user?.full_name || "Admin",
        confirmed_by_provider_email: provider?.email || user?.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings-reports"] });
      toast.success(ui.confirmedToast);
      setConfirmDialog({ open: false, booking: null });
    },
    onError: (error) => {
      toast.error(ui.confirmError);
      console.error(error);
    }
  });

  const handleConfirm = (booking) => {
    setConfirmDialog({ open: true, booking });
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  if (!user || (!isAdmin && !provider)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={filter === status ? "bg-[#6B46C1]" : ""}
            >
              {status === "all" ? ui.all : t[status]}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t.no_bookings}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Booking Info */}
                      <div className="flex-grow space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={statusColors[booking.status]}>
                            {t[booking.status]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            #{booking.booking_number || booking.id?.slice(-6)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{booking.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{booking.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{booking.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{booking.service_name || booking.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{booking.time}</span>
                          </div>
                          {booking.address && (
                            <div className="flex items-center gap-2 text-sm md:col-span-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{booking.address}</span>
                            </div>
                          )}
                        </div>

                        {booking.description && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {booking.description}
                          </p>
                        )}

                        {/* Required docs hint (for admin/provider) */}
                        {booking.required_documents_hint && (
                          <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-0.5">{ui.requiredDocuments}</p>
                              <p>{booking.required_documents_hint}</p>
                            </div>
                          </div>
                        )}

                        {/* Customer Documents */}
                        {booking.documents_urls && booking.documents_urls.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {ui.customerDocuments}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {booking.documents_urls.map((url, i) => {
                                const isImage = url && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                                return isImage ? (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`doc ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                                  </a>
                                ) : (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors border border-blue-200">
                                    <FileText className="w-4 h-4" />
                                    {ui.document} {i + 1}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Show who confirmed */}
                        {booking.confirmed_by_provider_name && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              {t.confirmed_by}: <strong>{booking.confirmed_by_provider_name}</strong>
                              {booking.confirmed_by_provider_email && (
                                <span className="text-gray-500 ms-1">({booking.confirmed_by_provider_email})</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Provider can upload completed docs — only if they confirmed this booking */}
                        {!isAdmin && provider && String(booking.confirmed_by_provider_id) === String(provider.id) && (
                          <ProviderDocumentUpload booking={booking} lang={lang} />
                        )}

                        {/* Admin sees provider docs */}
                        {isAdmin && booking.provider_documents_urls?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              {ui.providerDocuments}
                              <span className="ms-1 text-amber-600 flex items-center gap-0.5">
                                <Lock className="w-3 h-3" />
                                ({ui.paymentRequired})
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {booking.provider_documents_urls.map((url, i) => {
                                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                                return isImage ? (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    <img src={url} alt={`pdoc ${i+1}`} className="w-20 h-20 object-cover rounded-lg border-2 border-[#6B46C1]/30" />
                                  </a>
                                ) : (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-[#6B46C1] rounded-lg text-sm hover:bg-purple-100 border border-[#6B46C1]/30">
                                    <FileText className="w-4 h-4" /> Doc {i+1}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {booking.status === "pending" && (
                          <Button
                            onClick={() => handleConfirm(booking)}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {t.confirm_booking}
                          </Button>
                        )}
                        
                        {booking.confirmed_by_provider_email === (provider?.email || user?.email) && (
                          <Badge className="bg-purple-100 text-purple-800 justify-center">
                            {t.you_confirmed}
                          </Badge>
                        )}

                        {booking.price && (
                          <div className="flex items-center gap-1 text-lg font-bold text-[#6B46C1]">
                            <Euro className="w-5 h-5" />
                            {booking.price}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, booking: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirm_dialog_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirm_dialog_desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmMutation.mutate(confirmDialog.booking)}
              className="bg-green-600 hover:bg-green-700"
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t.yes
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
