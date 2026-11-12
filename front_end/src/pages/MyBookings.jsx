import React from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, CreditCard, MapPin } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toGrossPrice, vatNote } from "@/lib/priceUtils";
import { BOOKING_STATUS, STATUS_TONES, getLang } from "@/lib/lang";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

const T = {
  de: { title: "Meine Buchungen", eyebrow: "Termine", desc: "Ihre Termine und der Zahlungsstatus an einem Ort.", newBooking: "Neue Buchung", all: "Alle", upcoming: "Anstehend", completed: "Abgeschlossen", toPay: "Zu bezahlen", list: "Buchungsliste", prices: "Preise", loginPre: "Bitte ", login: "melden Sie sich an", loginPost: ", um Ihre Buchungen zu sehen.", loading: "Wird geladen…", none: "Noch keine Buchungen.", first: "Erste Dienstleistung buchen", pay: "Jetzt bezahlen" },
  ar: { title: "حجوزاتي", eyebrow: "المواعيد", desc: "مواعيدك وحالة الدفع في مكان واحد.", newBooking: "حجز جديد", all: "الكل", upcoming: "قادمة", completed: "مكتملة", toPay: "بانتظار الدفع", list: "قائمة الحجوزات", prices: "الأسعار", loginPre: "يرجى ", login: "تسجيل الدخول", loginPost: " لعرض حجوزاتك.", loading: "جارٍ التحميل…", none: "لا توجد حجوزات بعد.", first: "احجز خدمتك الأولى", pay: "ادفع الآن" },
  en: { title: "My bookings", eyebrow: "Appointments", desc: "Your appointments and payment status in one place.", newBooking: "New booking", all: "All", upcoming: "Upcoming", completed: "Completed", toPay: "To pay", list: "Booking list", prices: "Prices", loginPre: "Please ", login: "sign in", loginPost: " to see your bookings.", loading: "Loading…", none: "No bookings yet.", first: "Book your first service", pay: "Pay now" },
  tr: { title: "Rezervasyonlarım", eyebrow: "Randevular", desc: "Randevularınız ve ödeme durumu tek yerde.", newBooking: "Yeni rezervasyon", all: "Tümü", upcoming: "Yaklaşan", completed: "Tamamlanan", toPay: "Ödenecek", list: "Rezervasyon listesi", prices: "Fiyatlar", loginPre: "Rezervasyonlarınızı görmek için lütfen ", login: "giriş yapın", loginPost: ".", loading: "Yükleniyor…", none: "Henüz rezervasyon yok.", first: "İlk hizmetinizi rezerve edin", pay: "Şimdi öde" },
  es: { title: "Mis reservas", eyebrow: "Citas", desc: "Sus citas y el estado del pago en un solo lugar.", newBooking: "Nueva reserva", all: "Todas", upcoming: "Próximas", completed: "Completadas", toPay: "Por pagar", list: "Lista de reservas", prices: "Precios", loginPre: "Por favor, ", login: "inicie sesión", loginPost: " para ver sus reservas.", loading: "Cargando…", none: "Aún no hay reservas.", first: "Reserve su primer servicio", pay: "Pagar ahora" },
  uk: { title: "Мої бронювання", eyebrow: "Зустрічі", desc: "Ваші зустрічі та стан оплати в одному місці.", newBooking: "Нове бронювання", all: "Усі", upcoming: "Найближчі", completed: "Завершені", toPay: "До сплати", list: "Список бронювань", prices: "Ціни", loginPre: "Будь ласка, ", login: "увійдіть", loginPost: ", щоб побачити свої бронювання.", loading: "Завантаження…", none: "Бронювань ще немає.", first: "Забронюйте першу послугу", pay: "Оплатити" },
};

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "";

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return value || "-";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getUTCDate())}.${two(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
};

export default function MyBookings() {
  const lang = getLang();
  const t = T[lang] || T.de;
  const statusText = BOOKING_STATUS[lang] || BOOKING_STATUS.de;
  const email = customerEmail();
  const { data: backendBookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings", email],
    queryFn: () => customerApi.listBookings(email),
    enabled: Boolean(email),
  });

  const bookings = backendBookings.map((booking) => {
    const statusKey = STATUS_TONES[booking.status] ? booking.status : "pending";
    const hasPrice = booking.price !== null && booking.price !== undefined && booking.price !== "";
    return {
      id: booking.id,
      number: booking.booking_number || booking.id,
      service: booking.service_name || booking.category || "-",
      date: formatDate(booking.date),
      time: booking.time || "-",
      address: booking.address || "-",
      statusKey,
      status: statusText[statusKey],
      tone: STATUS_TONES[statusKey],
      isPaid: booking.payment_status === "paid",
      // Stored net; customers see the gross price incl. VAT.
      price: hasPrice ? `${toGrossPrice(Number(booking.price), lang)} €` : "-",
    };
  });
  const upcoming = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.statusKey)).length;
  const completed = bookings.filter((b) => b.statusKey === "completed").length;
  const unpaid = bookings.filter((b) => !b.isPaid && b.statusKey !== "cancelled").length;

  return (
    <PageScaffold
      title={t.title}
      eyebrow={t.eyebrow}
      icon={Calendar}
      description={t.desc}
      actions={
        <Link to={createPageUrl("Booking")}>
          <PrimaryButton>
            <Calendar className="h-4 w-4" />
            {t.newBooking}
          </PrimaryButton>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label={t.all} value={String(bookings.length)} tone="blue" />
        <StatCard icon={Clock} label={t.upcoming} value={String(upcoming)} tone="gold" />
        <StatCard icon={CheckCircle} label={t.completed} value={String(completed)} tone="green" />
        <StatCard icon={CreditCard} label={t.toPay} value={String(unpaid)} tone="purple" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title={t.list} description={`${t.prices} ${vatNote(lang)}.`} />
        <div className="space-y-4 p-5">
          {!email && (
            <p className="text-sm font-semibold text-[#65758b]">
              {t.loginPre}<Link to="/Login" className="text-[#6B46C1] underline">{t.login}</Link>{t.loginPost}
            </p>
          )}
          {email && isLoading && <p className="text-sm font-semibold text-[#65758b]">{t.loading}</p>}
          {email && !isLoading && bookings.length === 0 && (
            <p className="text-sm font-semibold text-[#65758b]">
              {t.none}{" "}
              <Link to={createPageUrl("Booking")} className="text-[#6B46C1] underline">{t.first}</Link>
            </p>
          )}
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone={booking.tone}>{booking.status}</StatusPill>
                    <StatusPill tone={booking.isPaid ? "green" : "gold"}>{booking.isPaid ? statusText.paid : statusText.unpaid}</StatusPill>
                    <span className="font-mono text-xs font-bold text-[#8ea0b7]" dir="ltr">{booking.number}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#1f0b52]">{booking.service}</h2>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-[#65758b] sm:grid-cols-3">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /><bdi>{booking.date}</bdi></span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /><bdi>{booking.time}</bdi></span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.address}</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#2e1065]"><bdi>{booking.price}</bdi></div>
              </div>
              {!booking.isPaid && booking.statusKey !== "cancelled" && (
                <div className="mt-5">
                  <Link to={`${createPageUrl("Payment")}?id=${encodeURIComponent(booking.id)}`}>
                    <PrimaryButton>
                      <CreditCard className="h-4 w-4" />
                      {t.pay}
                    </PrimaryButton>
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </DesignCard>
    </PageScaffold>
  );
}
