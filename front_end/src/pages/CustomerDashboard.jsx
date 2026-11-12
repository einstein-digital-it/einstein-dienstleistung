import React from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  MapPin,
  User
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toGrossPrice, SUBSCRIPTION_CATEGORIES } from "@/lib/priceUtils";
import { BOOKING_STATUS, STATUS_TONES, getLang } from "@/lib/lang";
import {
  CardHeader,
  DesignCard,
  FieldPreview,
  PageScaffold,
  PrimaryButton,
  QuickLink,
  SecondaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

const T = {
  de: { title: "Mein Bereich", eyebrow: "Kundenkonto", desc: "Ihre nächsten Termine, Zahlungen und Kontoeinstellungen.", notifications: "Benachrichtigungen", newBooking: "Neue Buchung", bookings: "Buchungen", upcoming: "Anstehend", completed: "Abgeschlossen", openPayments: "Offene Zahlungen", upcomingTitle: "Anstehende Buchungen", loginPre: "Bitte ", login: "melden Sie sich an", loginPost: ".", loading: "Wird geladen…", none: "Keine anstehenden Buchungen.", book: "Dienstleistung buchen", cancelAbo: "Abo kündigen", details: "Details", email: "E-Mail", shortcuts: "Schnellzugriff", q1: "Meine Buchungen & Zahlung", q1d: "Alle Buchungen und der Zahlungsstatus.", q2: "Meine Unterlagen", q2d: "Briefe hochladen, sortieren und übersetzen.", q3: "Benachrichtigungen einstellen", q3d: "E-Mail und Hinweise auf der Website." },
  ar: { title: "لوحتي", eyebrow: "حساب العميل", desc: "حجوزاتك القادمة والمدفوعات وإعدادات حسابك.", notifications: "الإشعارات", newBooking: "حجز جديد", bookings: "الحجوزات", upcoming: "قادمة", completed: "مكتملة", openPayments: "بانتظار الدفع", upcomingTitle: "الحجوزات القادمة", loginPre: "يرجى ", login: "تسجيل الدخول", loginPost: ".", loading: "جارٍ التحميل…", none: "لا توجد حجوزات قادمة.", book: "احجز خدمة", cancelAbo: "إلغاء الاشتراك", details: "التفاصيل", email: "البريد الإلكتروني", shortcuts: "اختصارات", q1: "حجوزاتي والدفع", q1d: "جميع حجوزاتك وحالة الدفع.", q2: "ملفاتي", q2d: "ارفع رسائلك لترتيبها وترجمتها.", q3: "إعدادات الإشعارات", q3d: "البريد الإلكتروني والتنبيهات على الموقع." },
  en: { title: "My area", eyebrow: "Customer account", desc: "Your upcoming bookings, payments and account settings.", notifications: "Notifications", newBooking: "New booking", bookings: "Bookings", upcoming: "Upcoming", completed: "Completed", openPayments: "Open payments", upcomingTitle: "Upcoming bookings", loginPre: "Please ", login: "sign in", loginPost: ".", loading: "Loading…", none: "No upcoming bookings.", book: "Book a service", cancelAbo: "Cancel subscription", details: "Details", email: "Email", shortcuts: "Shortcuts", q1: "My bookings & payment", q1d: "All your bookings and their payment status.", q2: "My documents", q2d: "Upload letters to have them sorted and translated.", q3: "Notification settings", q3d: "Email and notices on the website." },
  tr: { title: "Hesabım", eyebrow: "Müşteri hesabı", desc: "Yaklaşan rezervasyonlarınız, ödemeleriniz ve hesap ayarlarınız.", notifications: "Bildirimler", newBooking: "Yeni rezervasyon", bookings: "Rezervasyonlar", upcoming: "Yaklaşan", completed: "Tamamlanan", openPayments: "Bekleyen ödemeler", upcomingTitle: "Yaklaşan rezervasyonlar", loginPre: "Lütfen ", login: "giriş yapın", loginPost: ".", loading: "Yükleniyor…", none: "Yaklaşan rezervasyon yok.", book: "Hizmet rezerve edin", cancelAbo: "Aboneliği iptal et", details: "Ayrıntılar", email: "E-posta", shortcuts: "Kısayollar", q1: "Rezervasyonlarım ve ödeme", q1d: "Tüm rezervasyonlarınız ve ödeme durumu.", q2: "Belgelerim", q2d: "Mektuplarınızı yükleyin; sıralansın ve çevrilsin.", q3: "Bildirim ayarları", q3d: "E-posta ve sitedeki bildirimler." },
  es: { title: "Mi área", eyebrow: "Cuenta de cliente", desc: "Sus próximas reservas, pagos y ajustes de la cuenta.", notifications: "Notificaciones", newBooking: "Nueva reserva", bookings: "Reservas", upcoming: "Próximas", completed: "Completadas", openPayments: "Pagos pendientes", upcomingTitle: "Próximas reservas", loginPre: "Por favor, ", login: "inicie sesión", loginPost: ".", loading: "Cargando…", none: "No hay reservas próximas.", book: "Reservar un servicio", cancelAbo: "Cancelar suscripción", details: "Detalles", email: "Correo electrónico", shortcuts: "Accesos rápidos", q1: "Mis reservas y pago", q1d: "Todas sus reservas y el estado del pago.", q2: "Mis documentos", q2d: "Suba sus cartas para ordenarlas y traducirlas.", q3: "Ajustes de notificaciones", q3d: "Correo y avisos en la web." },
  uk: { title: "Мій кабінет", eyebrow: "Акаунт клієнта", desc: "Ваші найближчі бронювання, платежі та налаштування акаунта.", notifications: "Сповіщення", newBooking: "Нове бронювання", bookings: "Бронювання", upcoming: "Найближчі", completed: "Завершені", openPayments: "Очікують оплати", upcomingTitle: "Найближчі бронювання", loginPre: "Будь ласка, ", login: "увійдіть", loginPost: ".", loading: "Завантаження…", none: "Найближчих бронювань немає.", book: "Забронювати послугу", cancelAbo: "Скасувати підписку", details: "Деталі", email: "E-mail", shortcuts: "Швидкий доступ", q1: "Мої бронювання та оплата", q1d: "Усі бронювання та стан оплати.", q2: "Мої документи", q2d: "Завантажуйте листи для впорядкування й перекладу.", q3: "Налаштування сповіщень", q3d: "E-mail і сповіщення на сайті." },
};

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "";

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return value || "-";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getUTCDate())}.${two(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
};

// Dokumenten-Abo can be cancelled any time to the end of the month (§ 312k BGB)
const cancelUrl = (booking) =>
  `/Cancellation?${new URLSearchParams({ name: booking.customerName, email: booking.customerEmail, reference: booking.id }).toString()}`;

export default function CustomerDashboard() {
  const lang = getLang();
  const t = T[lang] || T.de;
  const statusText = BOOKING_STATUS[lang] || BOOKING_STATUS.de;
  const email = customerEmail();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["customer-dashboard", email],
    queryFn: () => customerApi.getDashboard(email),
    enabled: Boolean(email),
  });

  const profile = dashboard?.profile || {};
  const summary = dashboard?.summary || {};
  const upcomingBookings = (dashboard?.upcoming_bookings || []).map((booking) => {
    const statusKey = statusText[booking.status] ? booking.status : "pending";
    const hasPrice = booking.price !== null && booking.price !== undefined && booking.price !== "";
    return {
      id: booking.booking_number || booking.id,
      title: booking.service_name || booking.category || "-",
      date: formatDate(booking.date),
      time: booking.time || "-",
      address: booking.address || "-",
      status: statusText[statusKey],
      tone: STATUS_TONES[statusKey],
      category: booking.category,
      customerName: booking.customer_name || "",
      customerEmail: booking.customer_email || "",
      // Stored net; customers see the gross price incl. VAT.
      price: hasPrice ? `${toGrossPrice(Number(booking.price), lang)} €` : "",
    };
  });

  return (
    <PageScaffold
      title={t.title}
      eyebrow={t.eyebrow}
      icon={LayoutDashboard}
      description={t.desc}
      actions={
        <>
          <Link to={createPageUrl("Notifications")}>
            <SecondaryButton>
              <Bell className="h-4 w-4" />
              {t.notifications}
            </SecondaryButton>
          </Link>
          <Link to={createPageUrl("Booking")}>
            <PrimaryButton>
              <Calendar className="h-4 w-4" />
              {t.newBooking}
            </PrimaryButton>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label={t.bookings} value={String(summary.total_bookings ?? 0)} tone="blue" />
        <StatCard icon={Clock} label={t.upcoming} value={String(summary.upcoming ?? 0)} tone="gold" />
        <StatCard icon={CheckCircle} label={t.completed} value={String(summary.completed ?? 0)} tone="green" />
        <StatCard icon={CreditCard} label={t.openPayments} value={String(summary.open_payments ?? 0)} tone="purple" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <DesignCard>
          <CardHeader title={t.upcomingTitle} />
          <div className="space-y-4 p-5">
            {!email && (
              <p className="text-sm font-semibold text-[#65758b]">
                {t.loginPre}<Link to="/Login" className="text-[#6B46C1] underline">{t.login}</Link>{t.loginPost}
              </p>
            )}
            {email && isLoading && <p className="text-sm font-semibold text-[#65758b]">{t.loading}</p>}
            {email && !isLoading && upcomingBookings.length === 0 && (
              <p className="text-sm font-semibold text-[#65758b]">
                {t.none}{" "}
                <Link to={createPageUrl("Booking")} className="text-[#6B46C1] underline">{t.book}</Link>
              </p>
            )}
            {upcomingBookings.map((booking) => (
              <article key={booking.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill tone={booking.tone}>{booking.status}</StatusPill>
                      <span className="font-mono text-xs font-bold text-[#8ea0b7]" dir="ltr">{booking.id}</span>
                    </div>
                    <h2 className="text-xl font-black text-[#1f0b52]">{booking.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#65758b]">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /><bdi>{booking.date}</bdi></span>
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4" /><bdi>{booking.time}</bdi></span>
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {booking.price && <div className="text-xl font-black text-[#2e1065]"><bdi>{booking.price}</bdi></div>}
                    <div className="flex gap-2">
                      {SUBSCRIPTION_CATEGORIES.includes(booking.category) && (
                        <Link to={cancelUrl(booking)} className="inline-flex h-11 items-center justify-center rounded-[10px] border border-red-200 bg-white px-4 text-sm font-extrabold text-red-600 hover:bg-red-50">
                          {t.cancelAbo}
                        </Link>
                      )}
                      <Link to={createPageUrl("MyBookings")}>
                        <PrimaryButton className="px-4">{t.details}</PrimaryButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </DesignCard>

        <div className="space-y-6">
          <DesignCard className="p-5">
            <Link to={createPageUrl("Profile")} className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f0b52] text-white">
                <User className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-black text-[#1f0b52]">{profile.full_name || profile.name || "-"}</h2>
            </Link>
            <div className="mt-5 grid gap-4">
              <FieldPreview label={t.email} value={profile.email || email || "-"} />
            </div>
          </DesignCard>

          <DesignCard>
            <CardHeader title={t.shortcuts} />
            <div className="space-y-3 p-5">
              <Link to={createPageUrl("MyBookings")} className="block">
                <QuickLink icon={CreditCard} title={t.q1} description={t.q1d} />
              </Link>
              <Link to={createPageUrl("MyDocuments")} className="block">
                <QuickLink icon={FolderOpen} title={t.q2} description={t.q2d} />
              </Link>
              <Link to={createPageUrl("NotificationSettings")} className="block">
                <QuickLink icon={Bell} title={t.q3} description={t.q3d} />
              </Link>
            </div>
          </DesignCard>
        </div>
      </div>
    </PageScaffold>
  );
}
