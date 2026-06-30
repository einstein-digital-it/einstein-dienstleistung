import React, { useState, useEffect, Fragment } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { paymentApi } from "@/api/backendClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  CheckCircle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PaymentForm from "@/components/PaymentForm";
import InvoicePreview from "@/components/InvoicePreview";

const translations = {
  de: {
    title: "Zahlung",
    booking_details: "Buchungsdetails",
    booking_number: "Buchungsnummer",
    service: "Dienstleistung",
    provider: "Fachkraft",
    date: "Datum",
    time: "Uhrzeit",
    address: "Adresse",
    back: "Zurück",
    already_paid: "Diese Buchung wurde bereits bezahlt",
    go_to_bookings: "Zu meinen Buchungen",
    payment_success: "Zahlung erfolgreich!",
    payment_success_msg: "Vielen Dank für Ihre Zahlung. Ihre Buchung ist nun bestätigt.",
    no_price: "Der Preis wurde noch nicht festgelegt",
    no_price_msg: "Bitte warten Sie, bis wir den Preis für Ihre Buchung festgelegt haben. Wir werden Sie kontaktieren.",
    price_breakdown: "Preisübersicht",
    net_amount: "Nettobetrag",
    vat: "MwSt. (19%)",
    total: "Gesamtbetrag",
    categories: {
      education: "Bildung & Nachhilfe",
      bureaucracy: "Antragshilfe",
      cleaning: "Reinigung",
      transport: "Transport & Umzug",
      handwerk: "Handwerk",
      design: "Design & Druck"
    }
  },
  ar: {
    title: "الدفع",
    booking_details: "تفاصيل الحجز",
    booking_number: "رقم الحجز",
    service: "الخدمة",
    provider: "مزود الخدمة",
    date: "التاريخ",
    time: "الوقت",
    address: "العنوان",
    back: "رجوع",
    already_paid: "هذا الحجز مدفوع بالفعل",
    go_to_bookings: "إلى حجوزاتي",
    payment_success: "تم الدفع بنجاح!",
    payment_success_msg: "شكراً لدفعتك. تم تأكيد حجزك الآن.",
    no_price: "لم يتم تحديد السعر بعد",
    no_price_msg: "يرجى الانتظار حتى نحدد سعر حجزك. سنتواصل معك قريباً.",
    price_breakdown: "تفاصيل السعر",
    net_amount: "المبلغ الصافي",
    vat: "ضريبة القيمة المضافة (19%)",
    total: "المبلغ الإجمالي",
    categories: {
      education: "التعليم والدروس",
      bureaucracy: "مساعدة الطلبات",
      cleaning: "التنظيف",
      transport: "النقل والانتقال",
      handwerk: "الحرف اليدوية",
      design: "التصميم والطباعة"
    }
  },
  tr: {
    title: "Ödeme",
    booking_details: "Rezervasyon Detayları",
    booking_number: "Rezervasyon Numarası",
    service: "Hizmet",
    provider: "Sağlayıcı",
    date: "Tarih",
    time: "Saat",
    address: "Adres",
    back: "Geri",
    already_paid: "Bu rezervasyon zaten ödendi",
    go_to_bookings: "Rezervasyonlarıma Git",
    payment_success: "Ödeme Başarılı!",
    payment_success_msg: "Ödemeniz için teşekkürler. Rezervasyonunuz onaylandı.",
    no_price: "Fiyat henüz belirlenmedi",
    no_price_msg: "Rezervasyonunuzun fiyatını belirleyene kadar lütfen bekleyin.",
    price_breakdown: "Fiyat Dökümü",
    net_amount: "Net Tutar",
    vat: "KDV (%19)",
    total: "Toplam Tutar",
    categories: {}
  },
  es: {
    title: "Pago",
    booking_details: "Detalles de Reserva",
    booking_number: "Número de Reserva",
    service: "Servicio",
    provider: "Proveedor",
    date: "Fecha",
    time: "Hora",
    address: "Dirección",
    back: "Volver",
    already_paid: "Esta reserva ya fue pagada",
    go_to_bookings: "Ir a Mis Reservas",
    payment_success: "¡Pago Exitoso!",
    payment_success_msg: "Gracias por tu pago. Tu reserva está confirmada.",
    no_price: "Precio no establecido aún",
    no_price_msg: "Por favor espera hasta que establezcamos el precio.",
    price_breakdown: "Desglose de Precio",
    net_amount: "Monto Neto",
    vat: "IVA (19%)",
    total: "Monto Total",
    categories: {}
  },
  en: {
    title: "Payment",
    booking_details: "Booking Details",
    booking_number: "Booking Number",
    service: "Service",
    provider: "Provider",
    date: "Date",
    time: "Time",
    address: "Address",
    back: "Back",
    already_paid: "This booking has already been paid",
    go_to_bookings: "Go to My Bookings",
    payment_success: "Payment Successful!",
    payment_success_msg: "Thank you for your payment. Your booking is now confirmed.",
    no_price: "Price not set yet",
    no_price_msg: "Please wait until we set the price for your booking. We will contact you soon.",
    price_breakdown: "Price Breakdown",
    net_amount: "Net Amount",
    vat: "VAT (19%)",
    total: "Total Amount",
    categories: {
      education: "Education & Tutoring",
      bureaucracy: "Application Help",
      cleaning: "Cleaning",
      transport: "Transport & Moving",
      handwerk: "Handcraft",
      design: "Design & Print"
    }
  }
};

export default function Payment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id") || searchParams.get("booking");
  const [lang, setLang] = useState("de");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const queryClient = useQueryClient();


  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);

    // Check for Stripe redirect
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (paymentIntent && redirectStatus === "succeeded") {
      setPaymentSuccess(true);
    }

    // Listen for language changes
    const handleStorage = () => {
      const newLang = localStorage.getItem("einstein_lang");
      if (newLang) setLang(newLang);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [searchParams]);

  const t = translations[lang] || translations.de;
  const isRTL = lang === "ar";

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-payment", bookingId],
    queryFn: () => paymentApi.getBooking(bookingId),
    enabled: !!bookingId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg p-8 text-center">
          <p className="text-gray-600">Booking not found</p>
          <Link to={createPageUrl("CustomerDashboard")}>
            <Button className="mt-4">{t.back}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (booking.payment_status === 'authorized') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-0 shadow-lg text-center p-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                {lang === 'ar' ? '✅ تم الدفع - بانتظار الموافقة' : lang === 'en' ? '✅ Payment Authorized – Awaiting Approval' : '✅ Zahlung autorisiert – Warte auf Bestätigung'}
              </h2>
              <p className="text-gray-600 mb-2">
                {lang === 'ar' ? 'تم الاحتفاظ بمبلغ الدفع. سيتم تحصيله عند قبول الطلب أو استرداده عند الرفض.' :
                 lang === 'en' ? 'Your payment is held. It will be captured upon approval or refunded if rejected.' :
                 'Ihre Zahlung wird gehalten. Bei Bestätigung wird sie eingezogen, bei Ablehnung erstattet.'}
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mt-4 mb-6">
                <p className="text-sm font-semibold text-blue-700">{booking.booking_number}</p>
              </div>
              <Link to="/CustomerDashboard">
                <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">{t.go_to_bookings}</Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (paymentSuccess || booking.payment_status === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-lg text-center p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                {paymentSuccess ? t.payment_success : t.already_paid}
              </h2>
              {paymentSuccess && (
                <p className="text-gray-600 mb-6">{t.payment_success_msg}</p>
              )}
              <Link to="/CustomerDashboard">
                <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  {t.go_to_bookings}
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Calculate prices with VAT
  const netAmount = booking.price || 0;
  const vatRate = 0.19;
  const vatAmount = netAmount * vatRate;
  const totalAmount = netAmount + vatAmount;

  // Show message if no price set
  if (!booking.price) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-lg text-center p-8">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                {t.no_price}
              </h2>
              <p className="text-gray-600 mb-6">{t.no_price_msg}</p>
              <Link to={createPageUrl("CustomerDashboard")}>
                <Button className="bg-[#1e3a5f] hover:bg-[#2d5a8a]">
                  {t.go_to_bookings}
                </Button>
              </Link>
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
        <div className="mb-8">
          <Link to={createPageUrl("CustomerDashboard")}>
            <Button variant="ghost" className="mb-4 text-gray-500 hover:text-[#6B46C1] rounded-xl">
              <ArrowLeft className="w-4 h-4 me-2" />
              {t.back}
            </Button>
          </Link>
          <div className="bg-gradient-to-r from-[#1e3a5f] via-[#2d5a8a] to-[#6B46C1] rounded-3xl p-6 text-white mb-6 shadow-xl shadow-slate-300/40">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-6 h-6" />
              <h1 className="text-2xl font-bold">{t.title}</h1>
            </div>
            <p className="text-white/80 text-sm">
              {lang === "ar" ? "أكمل الدفع بأمان لتأكيد حجزك نهائياً" : lang === "en" ? "Complete your secure payment to confirm your booking" : lang === "tr" ? "Rezervasyonunuzu onaylamak için güvenli ödemeyi tamamlayın" : lang === "es" ? "Completa tu pago seguro para confirmar tu reserva" : "Zahlung sicher abschließen, um Ihre Buchung zu bestätigen"}
            </p>
            {/* Steps indicator */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { label: lang === "ar" ? "تفاصيل الحجز" : lang === "en" ? "Booking Details" : lang === "tr" ? "Rezervasyon Detayı" : lang === "es" ? "Detalles" : "Buchungsdetails", done: true },
                { label: lang === "ar" ? "الدفع الآمن" : lang === "en" ? "Secure Payment" : lang === "tr" ? "Güvenli Ödeme" : lang === "es" ? "Pago Seguro" : "Sichere Zahlung", done: false },
                { label: lang === "ar" ? "التأكيد" : lang === "en" ? "Confirmation" : lang === "tr" ? "Onay" : lang === "es" ? "Confirmación" : "Bestätigung", done: false },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.done ? "bg-green-400" : i === 1 ? "bg-white text-[#6B46C1]" : "bg-white/20"}`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${i === 1 ? "font-bold" : "text-white/70"}`}>{s.label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-0.5 bg-white/20 max-w-8" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/60 rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#6B46C1] to-[#c9a227]" />
              <CardHeader className="pb-4">
                <CardTitle className="text-[#1e3a5f] text-xl font-black tracking-tight">{t.booking_details}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">{t.booking_number}</span>
                  <Badge className="bg-[#1e3a5f]">{booking.booking_number}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.service}</p>
                      <p className="font-medium text-[#1e3a5f]">
                        {booking.service_name || t.categories[booking.category]}
                      </p>
                    </div>
                  </div>

                  {booking.provider_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.provider}</p>
                        <p className="font-medium text-[#1e3a5f]">{booking.provider_name}</p>
                      </div>
                    </div>
                  )}

                  {booking.date && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.date}</p>
                        <p className="font-medium text-[#1e3a5f]">
                          {format(new Date(booking.date), "dd.MM.yyyy")}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.time && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.time}</p>
                        <p className="font-medium text-[#1e3a5f]">{booking.time}</p>
                      </div>
                    </div>
                  )}

                  {booking.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.address}</p>
                        <p className="font-medium text-[#1e3a5f]">{booking.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-semibold text-[#1e3a5f] mb-3">{t.price_breakdown}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>{t.net_amount}</span>
                      <span>{netAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t.vat}</span>
                      <span>{vatAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-[#1e3a5f] pt-2 border-t">
                      <span>{t.total}</span>
                      <span>{totalAmount.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Preview */}
            <div className="mt-6">
              <InvoicePreview 
                booking={booking}
                netAmount={netAmount}
                vatAmount={vatAmount}
                totalAmount={totalAmount}
                lang={lang}
              />
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <PaymentForm
              booking={booking}
              amount={totalAmount}
              lang={lang}
              onSuccess={() => {
                setPaymentSuccess(true);
                queryClient.invalidateQueries({ queryKey: ["booking-payment", bookingId] });
                queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
