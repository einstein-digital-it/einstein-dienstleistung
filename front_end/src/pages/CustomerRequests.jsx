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
import { getStaffLang } from "@/lib/lang";

const TEXT = {
  de: {
    status: { new: "Neu", reviewing: "In Prüfung", accepted: "Angenommen", rejected: "Abgelehnt" },
    title: "Kundenanfragen", eyebrow: "Anfragen verwalten",
    description: "Neue Anfragen ansehen, Details prüfen und annehmen oder ablehnen.",
    statNew: "Neue Anfragen", statReviewing: "In Bearbeitung", statAccepted: "Angenommen", statRejected: "Abgelehnt",
    listTitle: "Anfragen", listDescription: "Alle Anfragen vom Server.",
    loading: "Wird geladen…", empty: "Zurzeit keine Anfragen.",
    accept: "Annehmen", reject: "Ablehnen",
    checkTitle: "Kurz prüfen", checkText: "Die wichtigsten Angaben stehen bei jeder Anfrage, damit die Entscheidung schnell und klar ist.",
    checklist: ["Unterlagen prüfen", "Preis prüfen", "Zuständige Person festlegen"],
  },
  ar: {
    status: { new: "جديد", reviewing: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" },
    title: "طلبات العملاء", eyebrow: "إدارة الطلبات",
    description: "عرض الطلبات الجديدة، مراجعة التفاصيل، وقبول الطلب أو رفضه.",
    statNew: "طلبات جديدة", statReviewing: "قيد المعالجة", statAccepted: "مقبولة", statRejected: "مرفوضة",
    listTitle: "قائمة الطلبات", listDescription: "كل الطلبات من الخادم.",
    loading: "جارٍ التحميل…", empty: "لا توجد طلبات حالياً.",
    accept: "قبول الطلب", reject: "رفض",
    checkTitle: "لوحة المراجعة السريعة", checkText: "يتم عرض أهم تفاصيل الطلب قبل اتخاذ القرار حتى تبقى عملية القبول واضحة وسريعة.",
    checklist: ["التحقق من المستندات", "مراجعة السعر", "تعيين مسؤول متابعة"],
  },
  en: {
    status: { new: "New", reviewing: "In review", accepted: "Accepted", rejected: "Rejected" },
    title: "Customer requests", eyebrow: "Manage requests",
    description: "See new requests, check the details and accept or reject them.",
    statNew: "New requests", statReviewing: "In progress", statAccepted: "Accepted", statRejected: "Rejected",
    listTitle: "Requests", listDescription: "All requests from the server.",
    loading: "Loading…", empty: "No requests at the moment.",
    accept: "Accept", reject: "Reject",
    checkTitle: "Quick check", checkText: "The key details are shown with each request so the decision stays quick and clear.",
    checklist: ["Check the documents", "Check the price", "Assign a person"],
  },
};

const STATUS_TONES = { new: "gold", reviewing: "blue", accepted: "green", rejected: "red" };

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "-";
  return `${Number(price).toFixed(2)} EUR`;
};

const normalizeRequest = (request, t) => {
  const status = STATUS_TONES[request.status] ? request.status : "new";

  return {
    id: request.request_number || request.id,
    backendId: request.id,
    customer: request.customer_name || "-",
    service: request.service_name || request.category || "-",
    date: request.date || "-",
    time: request.time || "-",
    address: request.address || "-",
    price: formatPrice(request.price),
    status: t.status[status],
    tone: STATUS_TONES[status],
    description: request.description || "",
  };
};

export default function CustomerRequests() {
  const queryClient = useQueryClient();
  const t = TEXT[getStaffLang()] || TEXT.de;

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

  const busy = acceptMutation.isPending || rejectMutation.isPending;
  const displayedRequests = backendRequests.map((request) => normalizeRequest(request, t));
  const statCounts = backendRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <PageScaffold
      title={t.title}
      eyebrow={t.eyebrow}
      icon={AlertCircle}
      description={t.description}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard icon={AlertCircle} label={t.statNew} value={String(statCounts.new || 0)} tone="gold" />
        <StatCard icon={Clock} label={t.statReviewing} value={String(statCounts.reviewing || 0)} tone="blue" />
        <StatCard icon={CheckCircle} label={t.statAccepted} value={String(statCounts.accepted || 0)} tone="green" />
        <StatCard icon={XCircle} label={t.statRejected} value={String(statCounts.rejected || 0)} tone="red" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <DesignCard>
          <CardHeader
            title={t.listTitle}
            description={t.listDescription}
          />
          <div className="space-y-4 p-5">
            {isLoading && <p className="text-sm font-semibold text-[#65758b]">{t.loading}</p>}
            {!isLoading && displayedRequests.length === 0 && (
              <p className="text-sm font-semibold text-[#65758b]">{t.empty}</p>
            )}
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <PrimaryButton disabled={busy} onClick={() => acceptMutation.mutate(request.backendId)}>{t.accept}</PrimaryButton>
                  <SecondaryButton disabled={busy} className="text-red-700" onClick={() => rejectMutation.mutate(request.backendId)}>{t.reject}</SecondaryButton>
                </div>
              </article>
            ))}
          </div>
        </DesignCard>

        <DesignCard className="h-fit p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#fff7df] text-[#9a6b00]">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-[#13233a]">{t.checkTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-[#65758b]">
            {t.checkText}
          </p>
          <div className="mt-5 space-y-3">
            {t.checklist.map((item) => (
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
