import React from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, CreditCard, MapPin } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toGrossPrice, vatNote } from "@/lib/priceUtils";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "";

const bookingStatus = {
  pending: { label: "قيد الانتظار", tone: "gold" },
  confirmed: { label: "مؤكد", tone: "green" },
  in_progress: { label: "قيد التنفيذ", tone: "blue" },
  completed: { label: "مكتمل", tone: "green" },
  cancelled: { label: "ملغى", tone: "red" },
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return value || "-";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getUTCDate())}.${two(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
};

const normalizeBooking = (booking) => {
  const status = bookingStatus[booking.status] || bookingStatus.pending;
  const isPaid = booking.payment_status === "paid";
  const hasPrice = booking.price !== null && booking.price !== undefined && booking.price !== "";
  return {
    id: booking.id,
    number: booking.booking_number || booking.id,
    service: booking.service_name || booking.category || "-",
    date: formatDate(booking.date),
    time: booking.time || "-",
    address: booking.address || "-",
    statusKey: booking.status,
    status: status.label,
    tone: status.tone,
    isPaid,
    // Stored net; customers see the gross price incl. VAT.
    price: hasPrice ? `${toGrossPrice(Number(booking.price), "ar")} €` : "-",
  };
};

export default function MyBookings() {
  const email = customerEmail();
  const { data: backendBookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings", email],
    queryFn: () => customerApi.listBookings(email),
    enabled: Boolean(email),
  });

  const bookings = backendBookings.map(normalizeBooking);
  const upcoming = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.statusKey)).length;
  const completed = bookings.filter((b) => b.statusKey === "completed").length;
  const unpaid = bookings.filter((b) => !b.isPaid && b.statusKey !== "cancelled").length;

  return (
    <PageScaffold
      title="حجوزاتي"
      eyebrow="إدارة المواعيد"
      icon={Calendar}
      description="مواعيدك وحالة الدفع في مكان واحد."
      actions={
        <Link to={createPageUrl("Booking")}>
          <PrimaryButton>
            <Calendar className="h-4 w-4" />
            حجز جديد
          </PrimaryButton>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label="الكل" value={String(bookings.length)} tone="blue" />
        <StatCard icon={Clock} label="قادمة" value={String(upcoming)} tone="gold" />
        <StatCard icon={CheckCircle} label="مكتملة" value={String(completed)} tone="green" />
        <StatCard icon={CreditCard} label="تحتاج دفع" value={String(unpaid)} tone="purple" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title="قائمة الحجوزات" description={`الأسعار ${vatNote("ar")}.`} />
        <div className="space-y-4 p-5">
          {!email && (
            <p className="text-sm font-semibold text-[#65758b]">
              يرجى <Link to="/Login" className="text-[#6B46C1] underline">تسجيل الدخول</Link> لعرض حجوزاتك.
            </p>
          )}
          {email && isLoading && <p className="text-sm font-semibold text-[#65758b]">جارٍ التحميل…</p>}
          {email && !isLoading && bookings.length === 0 && (
            <p className="text-sm font-semibold text-[#65758b]">
              لا توجد حجوزات بعد.{" "}
              <Link to={createPageUrl("Booking")} className="text-[#6B46C1] underline">احجز خدمتك الأولى</Link>
            </p>
          )}
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <StatusPill tone={booking.tone}>{booking.status}</StatusPill>
                    <StatusPill tone={booking.isPaid ? "green" : "gold"}>{booking.isPaid ? "مدفوع" : "غير مدفوع"}</StatusPill>
                    <span className="font-mono text-xs font-bold text-[#8ea0b7]">{booking.number}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#13233a]">{booking.service}</h2>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-[#65758b] sm:grid-cols-3">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{booking.date}</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{booking.time}</span>
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.address}</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1e3a5f]">{booking.price}</div>
              </div>
              {!booking.isPaid && booking.statusKey !== "cancelled" && (
                <div className="mt-5">
                  <Link to={`${createPageUrl("Payment")}?id=${encodeURIComponent(booking.id)}`}>
                    <PrimaryButton>
                      <CreditCard className="h-4 w-4" />
                      ادفع الآن
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
