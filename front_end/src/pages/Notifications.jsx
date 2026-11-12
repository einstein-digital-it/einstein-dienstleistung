import React from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/api/backendClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Calendar, CheckCheck, CheckCircle, Clock, CreditCard, Trash2 } from "lucide-react";
import { getLang } from "@/lib/lang";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

const T = {
  de: { title: "Benachrichtigungen", eyebrow: "Kundenkonto", desc: "Neuigkeiten zu Ihren Buchungen, Zahlungen und Unterlagen.", deleteRead: "Gelesene löschen", markAll: "Alle als gelesen markieren", all: "Alle", unread: "Ungelesen", read: "Gelesen", newTitle: "Neu", earlier: "Bereits gelesen", badge: "Neu", markRead: "Als gelesen markieren", loginPre: "Bitte ", login: "melden Sie sich an", loginPost: ", um Ihre Benachrichtigungen zu sehen.", loading: "Wird geladen…", none: "Sie haben noch keine Benachrichtigungen.", noneNew: "Keine neuen Benachrichtigungen." },
  ar: { title: "الإشعارات", eyebrow: "حساب العميل", desc: "آخر المستجدات عن حجوزاتك ومدفوعاتك وملفاتك.", deleteRead: "حذف المقروءة", markAll: "تحديد الكل كمقروء", all: "الكل", unread: "غير مقروءة", read: "مقروءة", newTitle: "جديدة", earlier: "مقروءة سابقاً", badge: "جديد", markRead: "تحديد كمقروء", loginPre: "يرجى ", login: "تسجيل الدخول", loginPost: " لعرض إشعاراتك.", loading: "جارٍ التحميل…", none: "لا توجد إشعارات بعد.", noneNew: "لا توجد إشعارات جديدة." },
  en: { title: "Notifications", eyebrow: "Customer account", desc: "News about your bookings, payments and documents.", deleteRead: "Delete read", markAll: "Mark all as read", all: "All", unread: "Unread", read: "Read", newTitle: "New", earlier: "Already read", badge: "New", markRead: "Mark as read", loginPre: "Please ", login: "sign in", loginPost: " to see your notifications.", loading: "Loading…", none: "You have no notifications yet.", noneNew: "No new notifications." },
  tr: { title: "Bildirimler", eyebrow: "Müşteri hesabı", desc: "Rezervasyonlarınız, ödemeleriniz ve belgelerinizle ilgili haberler.", deleteRead: "Okunanları sil", markAll: "Tümünü okundu işaretle", all: "Tümü", unread: "Okunmamış", read: "Okunmuş", newTitle: "Yeni", earlier: "Daha önce okunanlar", badge: "Yeni", markRead: "Okundu işaretle", loginPre: "Bildirimlerinizi görmek için lütfen ", login: "giriş yapın", loginPost: ".", loading: "Yükleniyor…", none: "Henüz bildiriminiz yok.", noneNew: "Yeni bildirim yok." },
  es: { title: "Notificaciones", eyebrow: "Cuenta de cliente", desc: "Novedades sobre sus reservas, pagos y documentos.", deleteRead: "Eliminar leídas", markAll: "Marcar todas como leídas", all: "Todas", unread: "Sin leer", read: "Leídas", newTitle: "Nuevas", earlier: "Ya leídas", badge: "Nueva", markRead: "Marcar como leída", loginPre: "Por favor, ", login: "inicie sesión", loginPost: " para ver sus notificaciones.", loading: "Cargando…", none: "Aún no tiene notificaciones.", noneNew: "No hay notificaciones nuevas." },
  uk: { title: "Сповіщення", eyebrow: "Акаунт клієнта", desc: "Новини про ваші бронювання, платежі та документи.", deleteRead: "Видалити прочитані", markAll: "Позначити всі як прочитані", all: "Усі", unread: "Непрочитані", read: "Прочитані", newTitle: "Нові", earlier: "Уже прочитані", badge: "Нове", markRead: "Позначити як прочитане", loginPre: "Будь ласка, ", login: "увійдіть", loginPost: ", щоб побачити сповіщення.", loading: "Завантаження…", none: "У вас ще немає сповіщень.", noneNew: "Нових сповіщень немає." },
};

const LOCALES = { de: "de-DE", ar: "ar", en: "en-GB", tr: "tr-TR", es: "es-ES", uk: "uk-UA" };

/** Text in the visitor's language; Ukrainian falls back to English, everything to German. */
const localized = (item, field, lang) =>
  item[`${field}_${lang}`] || (lang !== "de" && lang !== "ar" && item[`${field}_en`]) || item[`${field}_de`] || item[`${field}_en`] || item[`${field}_ar`] || "";

function NotificationRow({ item, t, onRead }) {
  const Icon = item.icon;
  return (
    <article className={`rounded-[15px] border p-4 ${item.unread ? "border-[#7c3aed]/30 bg-[#faf7ff]" : "border-[#e2ebf6] bg-[#fbfdff]"}`}>
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-white text-[#2e1065] shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-black text-[#1f0b52]">{item.title}</h2>
            <div className="flex items-center gap-2">
              {item.unread && <StatusPill tone="purple">{t.badge}</StatusPill>}
              <span className="text-xs font-bold text-[#8ea0b7]"><bdi>{item.time}</bdi></span>
            </div>
          </div>
          {item.message && <p className="mt-2 text-sm leading-7 text-[#65758b]">{item.message}</p>}
          {item.unread && (
            <div className="mt-3">
              <SecondaryButton className="h-9 px-3" onClick={() => onRead(item.id)}>{t.markRead}</SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Notifications() {
  const lang = getLang();
  const t = T[lang] || T.de;
  const queryClient = useQueryClient();
  const email = localStorage.getItem("einstein_customer_email") || "";
  const queryKey = ["customer-notifications", email];
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const { data: backendNotifications = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => customerApi.listNotifications(email),
    enabled: Boolean(email),
  });

  const markReadMutation = useMutation({ mutationFn: (id) => customerApi.markNotificationRead(id), onSuccess: refresh });
  const markAllReadMutation = useMutation({ mutationFn: () => customerApi.markAllNotificationsRead(email), onSuccess: refresh });
  const deleteReadMutation = useMutation({ mutationFn: () => customerApi.deleteReadNotifications(email), onSuccess: refresh });

  const items = backendNotifications.map((item) => ({
    id: item.id,
    icon: item.type === "payment_received" ? CreditCard : item.type?.includes("booking") ? Calendar : Bell,
    title: localized(item, "title", lang) || item.type,
    message: localized(item, "message", lang),
    time: item.created_at ? new Date(item.created_at).toLocaleString(LOCALES[lang] || "de-DE", { dateStyle: "medium", timeStyle: "short" }) : "",
    unread: !item.is_read,
  }));
  const unread = items.filter((item) => item.unread);
  const read = items.filter((item) => !item.unread);

  return (
    <PageScaffold
      title={t.title}
      eyebrow={t.eyebrow}
      icon={Bell}
      description={t.desc}
      maxWidth="max-w-5xl"
      actions={email && items.length > 0 && (
        <>
          <SecondaryButton onClick={() => deleteReadMutation.mutate()} disabled={read.length === 0 || deleteReadMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            {t.deleteRead}
          </SecondaryButton>
          <PrimaryButton onClick={() => markAllReadMutation.mutate()} disabled={unread.length === 0 || markAllReadMutation.isPending}>
            <CheckCheck className="h-4 w-4" />
            {t.markAll}
          </PrimaryButton>
        </>
      )}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Bell} label={t.all} value={String(items.length)} tone="blue" />
        <StatCard icon={Clock} label={t.unread} value={String(unread.length)} tone="gold" />
        <StatCard icon={CheckCircle} label={t.read} value={String(read.length)} tone="green" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title={t.newTitle} />
        <div className="space-y-4 p-5">
          {!email && (
            <p className="text-sm font-semibold text-[#65758b]">
              {t.loginPre}<Link to="/Login" className="text-[#6B46C1] underline">{t.login}</Link>{t.loginPost}
            </p>
          )}
          {email && isLoading && <p className="text-sm font-semibold text-[#65758b]">{t.loading}</p>}
          {email && !isLoading && unread.length === 0 && <p className="text-sm font-semibold text-[#65758b]">{items.length === 0 ? t.none : t.noneNew}</p>}
          {unread.map((item) => <NotificationRow key={item.id} item={item} t={t} onRead={(id) => markReadMutation.mutate(id)} />)}
        </div>
      </DesignCard>

      {read.length > 0 && (
        <DesignCard className="mt-6">
          <CardHeader title={t.earlier} />
          <div className="space-y-4 p-5">
            {read.map((item) => <NotificationRow key={item.id} item={item} t={t} onRead={() => {}} />)}
          </div>
        </DesignCard>
      )}
    </PageScaffold>
  );
}
