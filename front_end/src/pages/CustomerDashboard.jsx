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
  LayoutDashboard,
  MapPin,
  User
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { toGrossPrice } from "@/lib/priceUtils";
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

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "";

const bookingStatus = {
  pending: { label: "قيد الانتظار", tone: "gold" },
  confirmed: { label: "مؤكد", tone: "green" },
  in_progress: { label: "قيد التنفيذ", tone: "blue" },
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return value || "-";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getUTCDate())}.${two(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
};

const normalizeUpcoming = (booking) => {
  const status = bookingStatus[booking.status] || bookingStatus.pending;
  const hasPrice = booking.price !== null && booking.price !== undefined && booking.price !== "";
  return {
    id: booking.booking_number || booking.id,
    title: booking.service_name || booking.category || "-",
    date: formatDate(booking.date),
    time: booking.time || "-",
    address: booking.address || "-",
    status: status.label,
    tone: status.tone,
    category: booking.category,
    customerName: booking.customer_name || "",
    customerEmail: booking.customer_email || "",
    // Stored net; customers see the gross price incl. VAT.
    price: hasPrice ? `${toGrossPrice(Number(booking.price), "ar")} €` : "",
  };
};

// Dokumenten-Abo can be cancelled any time to the end of the month (§ 312k BGB)
const cancelUrl = (booking) =>
  `/Cancellation?${new URLSearchParams({ name: booking.customerName, email: booking.customerEmail, reference: booking.id }).toString()}`;

export default function CustomerDashboard() {
  const email = customerEmail();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["customer-dashboard", email],
    queryFn: () => customerApi.getDashboard(email),
    enabled: Boolean(email),
  });

  const profile = dashboard?.profile || {};
  const summary = dashboard?.summary || {};
  const upcomingBookings = (dashboard?.upcoming_bookings || []).map(normalizeUpcoming);

  return (
    <PageScaffold
      title="لوحتي"
      eyebrow="مساحة العميل"
      icon={LayoutDashboard}
      description="حجوزاتك القادمة والمدفوعات وإعدادات حسابك."
      actions={
        <>
          <Link to={createPageUrl("Notifications")}>
            <SecondaryButton>
              <Bell className="h-4 w-4" />
              الإشعارات
            </SecondaryButton>
          </Link>
          <Link to={createPageUrl("Booking")}>
            <PrimaryButton>
              <Calendar className="h-4 w-4" />
              حجز جديد
            </PrimaryButton>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label="الحجوزات" value={String(summary.total_bookings ?? 0)} tone="blue" />
        <StatCard icon={Clock} label="قادمة" value={String(summary.upcoming ?? 0)} tone="gold" />
        <StatCard icon={CheckCircle} label="مكتملة" value={String(summary.completed ?? 0)} tone="green" />
        <StatCard icon={CreditCard} label="بانتظار الدفع" value={String(summary.open_payments ?? 0)} tone="purple" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <DesignCard>
          <CardHeader title="الحجوزات القادمة" />
          <div className="space-y-4 p-5">
            {!email && (
              <p className="text-sm font-semibold text-[#65758b]">
                يرجى <Link to="/Login" className="text-[#6B46C1] underline">تسجيل الدخول</Link>.
              </p>
            )}
            {email && isLoading && <p className="text-sm font-semibold text-[#65758b]">جارٍ التحميل…</p>}
            {email && !isLoading && upcomingBookings.length === 0 && (
              <p className="text-sm font-semibold text-[#65758b]">
                لا توجد حجوزات قادمة.{" "}
                <Link to={createPageUrl("Booking")} className="text-[#6B46C1] underline">احجز خدمة</Link>
              </p>
            )}
            {upcomingBookings.map((booking) => (
              <article key={booking.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill tone={booking.tone}>{booking.status}</StatusPill>
                      <span className="font-mono text-xs font-bold text-[#8ea0b7]">{booking.id}</span>
                    </div>
                    <h2 className="text-xl font-black text-[#13233a]">{booking.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#65758b]">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{booking.date}</span>
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{booking.time}</span>
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {booking.price && <div className="text-xl font-black text-[#1e3a5f]">{booking.price}</div>}
                    <div className="flex gap-2">
                      {booking.category === "dokumentabo" && (
                        <Link to={cancelUrl(booking)} className="inline-flex h-11 items-center justify-center rounded-[10px] border border-red-200 bg-white px-4 text-sm font-extrabold text-red-600 hover:bg-red-50">
                          إلغاء الاشتراك
                        </Link>
                      )}
                      <Link to={createPageUrl("MyBookings")}>
                        <PrimaryButton className="px-4">تفاصيل</PrimaryButton>
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
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#122238] text-white">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#13233a]">{profile.full_name || profile.name || "-"}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <FieldPreview label="البريد الإلكتروني" value={profile.email || email || "-"} />
            </div>
          </DesignCard>

          <DesignCard>
            <CardHeader title="اختصارات" />
            <div className="space-y-3 p-5">
              <Link to={createPageUrl("MyBookings")} className="block">
                <QuickLink icon={CreditCard} title="حجوزاتي والدفع" description="كل حجوزاتك وحالة الدفع." />
              </Link>
              <Link to={createPageUrl("NotificationSettings")} className="block">
                <QuickLink icon={Bell} title="إعدادات التنبيه" description="تفضيلات البريد والإشعارات." />
              </Link>
            </div>
          </DesignCard>
        </div>
      </div>
    </PageScaffold>
  );
}
