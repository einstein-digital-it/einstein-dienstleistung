import React from "react";
import { customerApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Filter,
  MapPin,
  Search
} from "lucide-react";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

const bookings = [
  {
    id: "ES-2048",
    service: "مساعدة الدوائر والنماذج",
    date: "12 يونيو 2026",
    time: "10:30",
    address: "فرانكفورت",
    payment: "مدفوع",
    status: "مؤكد",
    tone: "green",
    price: "85 €"
  },
  {
    id: "ES-2049",
    service: "خدمة المكتب والسكرتارية",
    date: "15 يونيو 2026",
    time: "13:00",
    address: "أونلاين",
    payment: "غير مدفوع",
    status: "بانتظار الدفع",
    tone: "gold",
    price: "120 €"
  },
  {
    id: "ES-2031",
    service: "التعليم ومرافقة التعلم",
    date: "28 مايو 2026",
    time: "16:00",
    address: "Offenbach",
    payment: "مدفوع",
    status: "مكتمل",
    tone: "blue",
    price: "60 €"
  }
];

const customerEmail = () => localStorage.getItem("einstein_customer_email") || "customer@example.com";

const bookingStatus = {
  pending: { label: "Pending", tone: "gold" },
  confirmed: { label: "Confirmed", tone: "green" },
  in_progress: { label: "In progress", tone: "blue" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

const normalizeBooking = (booking) => {
  const status = bookingStatus[booking.status] || bookingStatus.pending;
  return {
    id: booking.booking_number || booking.id,
    service: booking.service_name || booking.category || "-",
    date: booking.date || "-",
    time: booking.time || "-",
    address: booking.address || "-",
    payment: booking.payment_status === "paid" ? "Paid" : "Unpaid",
    status: status.label,
    tone: status.tone,
    price: booking.price !== null && booking.price !== undefined ? `${Number(booking.price).toFixed(2)} EUR` : "-",
  };
};

export default function MyBookings() {
  const { data: backendBookings = [] } = useQuery({
    queryKey: ["customer-bookings", customerEmail()],
    queryFn: () => customerApi.listBookings(customerEmail()),
  });

  const displayedBookings = backendBookings.length > 0 ? backendBookings.map(normalizeBooking) : bookings;

  return (
    <PageScaffold
      title="حجوزاتي"
      eyebrow="إدارة المواعيد"
      icon={Calendar}
      description="تصميم صفحة الحجوزات الشخصية مع حالات الدفع، تفاصيل الموعد، وإجراءات سريعة."
      actions={
        <>
          <SecondaryButton>
            <Filter className="h-4 w-4" />
            تصفية
          </SecondaryButton>
          <PrimaryButton>
            <Calendar className="h-4 w-4" />
            حجز جديد
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={Calendar} label="الكل" value="12" tone="blue" />
        <StatCard icon={Clock} label="قادمة" value="2" tone="gold" />
        <StatCard icon={CheckCircle} label="مكتملة" value="8" tone="green" />
        <StatCard icon={CreditCard} label="تحتاج دفع" value="1" tone="purple" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <DesignCard>
          <CardHeader
            title="قائمة الحجوزات"
            description="الحالات والأزرار هنا للتصميم فقط."
            action={
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea0b7]" />
                <input className="h-10 w-56 rounded-[10px] border border-[#d9e4f2] pr-10 text-sm outline-none focus:ring-2 focus:ring-[#d5e2f5]" placeholder="بحث" />
              </div>
            }
          />
          <div className="flex gap-2 border-b border-[#e5edf7] px-5 py-3">
            {["القادمة", "السابقة", "الملغاة"].map((tab, index) => (
              <button key={tab} type="button" className={`rounded-[10px] px-4 py-2 text-sm font-extrabold ${index === 0 ? "bg-[#122238] text-white" : "bg-[#f8fbff] text-[#60718d]"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-4 p-5">
            {displayedBookings.map((booking) => (
              <article key={booking.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <StatusPill tone={booking.tone}>{booking.status}</StatusPill>
                      <StatusPill tone={booking.payment === "مدفوع" ? "green" : "gold"}>{booking.payment}</StatusPill>
                      <span className="font-mono text-xs font-bold text-[#8ea0b7]">{booking.id}</span>
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
                <div className="mt-5 flex flex-wrap gap-3">
                  <PrimaryButton>عرض التفاصيل</PrimaryButton>
                  <SecondaryButton>تعديل الموعد</SecondaryButton>
                  <SecondaryButton>فاتورة</SecondaryButton>
                </div>
              </article>
            ))}
          </div>
        </DesignCard>

        <DesignCard className="h-fit p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#e8f0fd] text-[#1e3a5f]">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-black text-[#13233a]">تفاصيل الحجز المحدد</h2>
          <p className="mt-2 text-sm leading-7 text-[#65758b]">
            تعرض هذه المساحة المستندات، ملاحظات المزود، وحالة الدفع عند اختيار أي حجز من القائمة.
          </p>
          <div className="mt-5 space-y-3">
            {["المستندات المطلوبة", "ملاحظات الموعد", "سجل الدفع"].map((item) => (
              <div key={item} className="rounded-[12px] border border-[#e2ebf6] bg-[#f8fbff] px-4 py-3 text-sm font-extrabold text-[#334155]">
                {item}
              </div>
            ))}
          </div>
        </DesignCard>
      </div>
    </PageScaffold>
  );
}
