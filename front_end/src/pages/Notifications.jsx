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
  Trash2,
  UserCheck
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

const today = [
  {
    icon: Calendar,
    title: "طلب جديد بانتظار المراجعة",
    message: "تم استلام طلب مساعدة النماذج رقم ES-2048.",
    time: "منذ 8 دقائق",
    tone: "gold",
    unread: true
  },
  {
    icon: CreditCard,
    title: "دفعة مستلمة",
    message: "تم تسجيل دفعة بقيمة 85 € لحجز مؤكد.",
    time: "منذ 42 دقيقة",
    tone: "green",
    unread: true
  },
  {
    icon: UserCheck,
    title: "مزود خدمة متاح",
    message: "مزود جديد متاح لخدمات التعليم ومرافقة التعلم.",
    time: "قبل ساعتين",
    tone: "blue",
    unread: false
  }
];

const earlier = [
  {
    icon: CheckCircle,
    title: "اكتمل حجز",
    message: "تم إغلاق حجز السكرتارية بنجاح وإصدار الفاتورة.",
    time: "أمس",
    tone: "green",
    unread: false
  },
  {
    icon: Clock,
    title: "تذكير بموعد",
    message: "موعد متابعة المستندات غداً الساعة 10:30.",
    time: "قبل يومين",
    tone: "purple",
    unread: false
  }
];

function NotificationRow({ item }) {
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
              {item.unread && <StatusPill tone="gold">جديد</StatusPill>}
              <span className="text-xs font-bold text-[#8ea0b7]">{item.time}</span>
            </div>
          </div>
          <p className="mt-2 text-sm leading-7 text-[#65758b]">{item.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SecondaryButton className="h-9 px-3">عرض</SecondaryButton>
            {item.unread && <SecondaryButton className="h-9 px-3">تحديد كمقروء</SecondaryButton>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Notifications() {
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

  const liveNotifications = backendNotifications.map((item) => ({
    icon: item.type === "payment_received" ? CreditCard : item.type?.includes("booking") ? Calendar : Bell,
    title: item.title_ar || item.title_en || item.title_de || item.type,
    message: item.message_ar || item.message_en || item.message_de || "",
    time: item.created_at ? new Date(item.created_at).toLocaleString() : "",
    tone: item.is_read ? "blue" : "gold",
    unread: !item.is_read,
  }));
  const todayItems = liveNotifications.length > 0 ? liveNotifications : today;
  const unreadCount = todayItems.filter((item) => item.unread).length;

  return (
    <PageScaffold
      title="الإشعارات"
      eyebrow="مركز التنبيهات"
      icon={Bell}
      description="تصميم صفحة الإشعارات مع تجميع اليوم والسابق، وأزرار إدارة التنبيهات."
      maxWidth="max-w-5xl"
      actions={
        <>
          <SecondaryButton onClick={() => deleteReadMutation.mutate()}>
            <Trash2 className="h-4 w-4" />
            حذف المقروء
          </SecondaryButton>
          <PrimaryButton onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4" />
            تحديد الكل كمقروء
          </PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Bell} label="كل الإشعارات" value="24" tone="blue" />
        <StatCard icon={Clock} label="غير مقروءة" value="2" tone="gold" />
        <StatCard icon={CheckCircle} label="مقروءة" value="22" tone="green" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title="اليوم" description="أحدث التنبيهات المهمة." />
        <div className="space-y-4 p-5">
          {todayItems.map((item) => <NotificationRow key={item.title} item={item} />)}
        </div>
      </DesignCard>

      <DesignCard className="mt-6">
        <CardHeader title="سابقاً" />
        <div className="space-y-4 p-5">
          {earlier.map((item) => <NotificationRow key={item.title} item={item} />)}
        </div>
      </DesignCard>
    </PageScaffold>
  );
}
