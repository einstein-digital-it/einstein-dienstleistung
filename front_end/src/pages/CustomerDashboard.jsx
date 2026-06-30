import React from "react";
import { customerApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  MapPin,
  User
} from "lucide-react";
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

const upcoming = [
  { id: "ES-2048", title: "مساعدة الدوائر والنماذج", date: "12 يونيو", time: "10:30", status: "مؤكد", tone: "green" },
  { id: "ES-2049", title: "خدمة المكتب والسكرتارية", date: "15 يونيو", time: "13:00", status: "بانتظار الدفع", tone: "gold" }
];

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "customer@example.com";

const normalizeUpcoming = (booking) => ({
  id: booking.booking_number || booking.id,
  title: booking.service_name || booking.category || "-",
  date: booking.date || "-",
  time: booking.time || "-",
  address: booking.address || "-",
  status: booking.status || "pending",
  tone: booking.status === "confirmed" ? "green" : "gold",
});

export default function CustomerDashboard() {
  const { data: dashboard } = useQuery({
    queryKey: ["customer-dashboard", customerEmail()],
    queryFn: () => customerApi.getDashboard(customerEmail()),
  });

  const profile = dashboard?.profile || {};
  const upcomingBookings = dashboard?.upcoming_bookings?.length
    ? dashboard.upcoming_bookings.map(normalizeUpcoming)
    : upcoming;

  return (
    <PageScaffold
      title="لوحتي"
      eyebrow="مساحة العميل"
      icon={LayoutDashboard}
      description="تصميم لوحة العميل بعد تسجيل الدخول، مع الحجوزات القادمة، المدفوعات، المستندات، وإعدادات الحساب."
      actions={
        <>
          <SecondaryButton>
            <Bell className="h-4 w-4" />
            الإشعارات
          </SecondaryButton>
          <PrimaryButton>
            <Calendar className="h-4 w-4" />
            حجز جديد
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label="الحجوزات" value="12" tone="blue" note="2 قادمة" />
        <StatCard icon={Clock} label="قيد المتابعة" value="3" tone="gold" note="تحتاج إجراء" />
        <StatCard icon={CheckCircle} label="مكتملة" value="8" tone="green" note="هذا العام" />
        <StatCard icon={CreditCard} label="فواتير مفتوحة" value="1" tone="purple" note="85 €" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <DesignCard>
          <CardHeader title="الحجوزات القادمة" description="بطاقات تصميمية لتوضيح حالة خدمات العميل." />
          <div className="space-y-4 p-5">
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
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />فرانكفورت</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton className="px-4">تعديل</SecondaryButton>
                    <PrimaryButton className="px-4">تفاصيل</PrimaryButton>
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
                <h2 className="text-xl font-black text-[#13233a]">{profile.full_name || "A.A"}</h2>
                <p className="text-sm font-semibold text-[#65758b]">عميل تجريبي للتصميم</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4">
              <FieldPreview label="البريد الإلكتروني" value={profile.email || customerEmail()} />
              <FieldPreview label="اللغة" value="العربية" />
            </div>
          </DesignCard>

          <DesignCard>
            <CardHeader title="اختصارات" />
            <div className="space-y-3 p-5">
              <QuickLink icon={CreditCard} title="الدفع والفواتير" description="مراجعة الفواتير المفتوحة والمدفوعة." />
              <QuickLink icon={FileText} title="المستندات" description="الملفات المطلوبة والمرفقة لكل خدمة." />
              <QuickLink icon={Bell} title="إعدادات التنبيه" description="تفضيلات البريد والإشعارات." />
            </div>
          </DesignCard>
        </div>
      </div>
    </PageScaffold>
  );
}
