import React from "react";
import { customerRequestsApi } from "@/api/backendClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  Search,
  User,
  XCircle
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

const requests = [
  {
    id: "ES-2048",
    customer: "مريم الخطيب",
    service: "مساعدة الدوائر والنماذج",
    date: "12 يونيو 2026",
    time: "10:30",
    address: "فرانكفورت، شارع Kaiser 24",
    price: "85 €",
    status: "جديد",
    tone: "gold",
    description: "مراجعة طلب إقامة وتجهيز المستندات المطلوبة قبل الموعد."
  },
  {
    id: "ES-2047",
    customer: "أحمد منصور",
    service: "خدمة المكتب والسكرتارية",
    date: "13 يونيو 2026",
    time: "14:00",
    address: "أونلاين",
    price: "120 €",
    status: "قيد المراجعة",
    tone: "blue",
    description: "تنظيم رسائل البريد وجدولة مواعيد أسبوعية للشركة."
  },
  {
    id: "ES-2046",
    customer: "سارة النجار",
    service: "التعليم ومرافقة التعلم",
    date: "14 يونيو 2026",
    time: "16:30",
    address: "Offenbach",
    price: "60 €",
    status: "ينتظر المستندات",
    tone: "purple",
    description: "جلسة دعم دراسي للرياضيات مع متابعة خطة أسبوعية."
  }
];

const statusMeta = {
  new: { label: "New", tone: "gold" },
  reviewing: { label: "In review", tone: "blue" },
  accepted: { label: "Accepted", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "-";
  return `${Number(price).toFixed(2)} EUR`;
};

const normalizeRequest = (request) => {
  const meta = statusMeta[request.status] || statusMeta.new;

  return {
    id: request.request_number || request.id,
    backendId: request.id,
    customer: request.customer_name || "-",
    service: request.service_name || request.category || "-",
    date: request.date || "-",
    time: request.time || "-",
    address: request.address || "-",
    price: formatPrice(request.price),
    status: meta.label,
    tone: meta.tone,
    description: request.description || "",
    isBackend: true,
  };
};

export default function CustomerRequests() {
  const queryClient = useQueryClient();

  const { data: backendRequests = [], isLoading } = useQuery({
    queryKey: ["customer-requests"],
    queryFn: () => customerRequestsApi.listRequests("all"),
  });

  const acceptMutation = useMutation({
    mutationFn: customerRequestsApi.acceptRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-requests"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: customerRequestsApi.rejectRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-requests"] }),
  });

  const displayedRequests = backendRequests.length > 0 ? backendRequests.map(normalizeRequest) : requests;
  const statCounts = backendRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageScaffold
      title="طلبات العملاء"
      eyebrow="إدارة الطلبات"
      icon={AlertCircle}
      description="عرض الطلبات الجديدة، مراجعة التفاصيل، وتحديد الإجراء المناسب بسرعة مع واجهة قريبة من لوحة الموقع."
      actions={
        <>
          <SecondaryButton>
            <Search className="h-4 w-4" />
            بحث
          </SecondaryButton>
          <PrimaryButton>
            <CheckCircle className="h-4 w-4" />
            قبول المحدد
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={AlertCircle} label="طلبات جديدة" value="18" tone="gold" note="+4 اليوم" />
        <StatCard icon={Clock} label="قيد المعالجة" value="9" tone="blue" note="متوسط الرد 22 دقيقة" />
        <StatCard icon={CheckCircle} label="مقبولة" value="42" tone="green" note="هذا الشهر" />
        <StatCard icon={XCircle} label="مرفوضة" value="3" tone="red" note="تحتاج مراجعة" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <DesignCard>
          <CardHeader
            title="قائمة الطلبات"
            description="بيانات تجريبية للتصميم فقط، بدون اتصال بالخادم."
            action={<StatusPill tone="slate">آخر تحديث الآن</StatusPill>}
          />
          <div className="space-y-4 p-5">
            {displayedRequests.map((request) => (
              <article key={request.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <StatusPill tone={request.tone}>{request.status}</StatusPill>
                      <span className="font-mono text-xs font-bold text-[#8ea0b7]">{request.id}</span>
                    </div>
                    <h2 className="text-xl font-black text-[#13233a]">{request.service}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#65758b]">{request.description}</p>
                  </div>
                  <div className="text-2xl font-black text-[#1e3a5f]">{request.price}</div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm font-semibold text-[#334155] md:grid-cols-2 xl:grid-cols-4">
                  <span className="flex items-center gap-2"><User className="h-4 w-4 text-[#8ea0b7]" />{request.customer}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#8ea0b7]" />{request.date}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#8ea0b7]" />{request.time}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#8ea0b7]" />{request.address}</span>
                </div>

                <div
                  className="mt-5 flex flex-wrap gap-3"
                  onClick={(event) => {
                    if (!request.isBackend || acceptMutation.isPending || rejectMutation.isPending) return;
                    const button = event.target.closest("button");
                    if (!button || !request.backendId) return;
                    const index = Array.from(button.parentElement.children).indexOf(button);
                    if (index === 0) acceptMutation.mutate(request.backendId);
                    if (index === 2) rejectMutation.mutate(request.backendId);
                  }}
                >
                  <PrimaryButton>قبول الطلب</PrimaryButton>
                  <SecondaryButton>تفاصيل الطلب</SecondaryButton>
                  <SecondaryButton className="text-red-700">رفض</SecondaryButton>
                </div>
              </article>
            ))}
          </div>
        </DesignCard>

        <DesignCard className="h-fit p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#fff7df] text-[#9a6b00]">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-[#13233a]">لوحة المراجعة السريعة</h2>
          <p className="mt-2 text-sm leading-7 text-[#65758b]">
            يتم عرض أهم تفاصيل الطلب قبل اتخاذ القرار حتى تبقى عملية القبول واضحة وسريعة.
          </p>
          <div className="mt-5 space-y-3">
            {["التحقق من المستندات", "مراجعة السعر", "تعيين مسؤول متابعة"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-[12px] bg-[#f8fbff] px-4 py-3">
                <span className="text-sm font-bold text-[#334155]">{item}</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            ))}
          </div>
        </DesignCard>
      </div>
    </PageScaffold>
  );
}
