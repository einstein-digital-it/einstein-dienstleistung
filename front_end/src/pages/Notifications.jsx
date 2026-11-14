import React from "react";
import { customerApi } from "@/api/backendClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle,
  Clock,
  CreditCard,
  Trash2
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

const texts = {
  de: {
    title: "Benachrichtigungen", eyebrow: "Benachrichtigungscenter", description: "Alle Hinweise zu Ihren Buchungen, Zahlungen und Terminen.",
    deleteRead: "Gelesene löschen", markAllRead: "Alle als gelesen markieren",
    all: "Alle Benachrichtigungen", unread: "Ungelesen", read: "Gelesen",
    today: "Heute", todayHint: "Die neuesten Hinweise.", earlier: "Früher",
    empty: "Keine Benachrichtigungen vorhanden.", isNew: "Neu",
  },
  en: {
    title: "Notifications", eyebrow: "Notification center", description: "All updates about your bookings, payments and appointments.",
    deleteRead: "Delete read", markAllRead: "Mark all as read",
    all: "All notifications", unread: "Unread", read: "Read",
    today: "Today", todayHint: "The latest updates.", earlier: "Earlier",
    empty: "No notifications yet.", isNew: "New",
  },
  tr: {
    title: "Bildirimler", eyebrow: "Bildirim merkezi", description: "Rezervasyonlarınız, ödemeleriniz ve randevularınızla ilgili tüm bildirimler.",
    deleteRead: "Okunanları sil", markAllRead: "Tümünü okundu işaretle",
    all: "Tüm bildirimler", unread: "Okunmamış", read: "Okunmuş",
    today: "Bugün", todayHint: "En son bildirimler.", earlier: "Daha önce",
    empty: "Henüz bildirim yok.", isNew: "Yeni",
  },
  ar: {
    title: "الإشعارات", eyebrow: "مركز التنبيهات", description: "كل التنبيهات المتعلقة بحجوزاتك ومدفوعاتك ومواعيدك.",
    deleteRead: "حذف المقروء", markAllRead: "تحديد الكل كمقروء",
    all: "كل الإشعارات", unread: "غير مقروءة", read: "مقروءة",
    today: "اليوم", todayHint: "أحدث التنبيهات.", earlier: "سابقاً",
    empty: "لا توجد إشعارات حالياً.", isNew: "جديد",
  },
};

const dateLocales = { de: "de-DE", en: "en-GB", tr: "tr-TR", ar: "ar" };

function getLang() {
  try {
    const saved = localStorage.getItem("einstein_lang");
    return texts[saved] ? saved : "de";
  } catch {
    return "de";
  }
}

// Pick the text in the selected language; fall back to German, then English, then Arabic.
function pickLocalized(item, field, lang) {
  return item[`${field}_${lang}`] || item[`${field}_de`] || item[`${field}_en`] || item[`${field}_ar`] || "";
}

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function NotificationRow({ item, newLabel }) {
  const Icon = item.icon;
  return (
    <article className={`rounded-[15px] border p-4 ${item.unread ? "border-[#d4af25]/40 bg-[#fffaf0]" : "border-[#e2ebf6] bg-[#fbfdff]"}`}>
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-white text-[#1e3a5f] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-black text-[#13233a]">{item.title}</h2>
            <div className="flex items-center gap-2">
              {item.unread && <StatusPill tone="gold">{newLabel}</StatusPill>}
              <span className="text-xs font-bold text-[#8ea0b7]">{item.time}</span>
            </div>
          </div>
          <p className="mt-2 text-sm leading-7 text-[#65758b]">{item.message}</p>
        </div>
      </div>
    </article>
  );
}

export default function Notifications() {
  const lang = getLang();
  const t = texts[lang];
  const queryClient = useQueryClient();
  const email = localStorage.getItem("einstein_customer_email") || "customer@example.com";

  const { data: backendNotifications = [] } = useQuery({
    queryKey: ["customer-notifications", email],
    queryFn: () => customerApi.listNotifications(email),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => customerApi.markAllNotificationsRead(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-notifications", email] }),
  });

  const deleteReadMutation = useMutation({
    mutationFn: () => customerApi.deleteReadNotifications(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer-notifications", email] }),
  });

  const notifications = backendNotifications.map((item) => ({
    id: item.id,
    icon: item.type === "payment_received" ? CreditCard : item.type?.includes("booking") ? Calendar : Bell,
    title: pickLocalized(item, "title", lang) || item.type,
    message: pickLocalized(item, "message", lang),
    time: item.created_at ? new Date(item.created_at).toLocaleString(dateLocales[lang]) : "",
    createdAt: item.created_at,
    unread: !item.is_read,
  }));

  const todayItems = notifications.filter((item) => isToday(item.createdAt));
  const earlierItems = notifications.filter((item) => !isToday(item.createdAt));
  const unreadCount = notifications.filter((item) => item.unread).length;

  const renderList = (items) => (
    items.length > 0
      ? items.map((item) => <NotificationRow key={item.id ?? item.title} item={item} newLabel={t.isNew} />)
      : <p className="text-sm text-[#8ea0b7]">{t.empty}</p>
  );

  return (
    <PageScaffold
      title={t.title}
      eyebrow={t.eyebrow}
      icon={Bell}
      description={t.description}
      maxWidth="max-w-5xl"
      actions={
        <>
          <SecondaryButton onClick={() => deleteReadMutation.mutate()}>
            <Trash2 className="h-4 w-4" />
            {t.deleteRead}
          </SecondaryButton>
          <PrimaryButton onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4" />
            {t.markAllRead}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Bell} label={t.all} value={String(notifications.length)} tone="blue" />
        <StatCard icon={Clock} label={t.unread} value={String(unreadCount)} tone="gold" />
        <StatCard icon={CheckCircle} label={t.read} value={String(notifications.length - unreadCount)} tone="green" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title={t.today} description={t.todayHint} />
        <div className="space-y-4 p-5">{renderList(todayItems)}</div>
      </DesignCard>

      {earlierItems.length > 0 && (
        <DesignCard className="mt-6">
          <CardHeader title={t.earlier} />
          <div className="space-y-4 p-5">{renderList(earlierItems)}</div>
        </DesignCard>
      )}
    </PageScaffold>
  );
}
