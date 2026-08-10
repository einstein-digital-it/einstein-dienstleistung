import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Euro,
  FileSearch,
  Search,
  ShieldCheck,
  Users,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminDashboardApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";

const translations = {
  ar: {
    area: "منطقة الإدارة", title: "لوحة التحكم", subtitle: "نظرة عامة على الحجوزات والمستخدمين والمزودين وتحسين محركات البحث والإيرادات.",
    bookings: "الحجوزات", revenueReport: "تقرير الإيرادات", totalBookings: "إجمالي الحجوزات", pending: "قيد الانتظار أو المراجعة",
    revenue: "الإيرادات", liveApi: "بيانات مباشرة من Laravel API", users: "المستخدمون", adminAccounts: "حسابات المديرين",
    seoPages: "صفحات SEO", indexable: "صفحات قابلة للفهرسة", interfaces: "واجهات الإدارة", activityTitle: "النشاط",
    links: [
      { label: "الحجوزات", href: "/AdminBookings", icon: ClipboardList, note: "عرض الحجوزات الحالية" },
      { label: "التقارير", href: "/BookingReports", icon: BarChart3, note: "تقارير الحجوزات والحالات" },
      { label: "تقرير الإيرادات", href: "/RevenueReports", icon: Euro, note: "الإيرادات والمقارنة الشهرية" },
      { label: "المستخدمون", href: "/Users", icon: Users, note: "حسابات العملاء والمديرين" },
      { label: "طلبات المزودين", href: "/SupplierRequests", icon: UserCheck, note: "مراجعة طلبات المزودين الجدد" },
      { label: "SEO", href: "/SEO", icon: Search, note: "بيانات الميتا وخريطة الموقع" }
    ],
    activityItems: [
      { title: "وصل حجز جديد", detail: "التنسيق والتواصل", time: "اليوم، 10:00", status: "جديد" },
      { title: "تم تسجيل مستخدم", detail: "حساب عميل جديد", time: "25.05.2026", status: "عميل" },
      { title: "تم تحديث سجل SEO", detail: "الصفحة الرئيسية والخدمات", time: "هذا الأسبوع", status: "SEO" },
      { title: "تمت مراجعة حالة الدفع", detail: "الحجوزات المكتملة", time: "مايو 2026", status: "المالية" }
    ]
  },
  en: {
    area: "Admin area", title: "Administration", subtitle: "Overview of bookings, users, providers, SEO and revenue.", bookings: "Bookings", revenueReport: "Revenue report", totalBookings: "Total bookings", pending: "pending or under review", revenue: "Revenue", liveApi: "Live Laravel API", users: "Users", adminAccounts: "Admin accounts", seoPages: "SEO pages", indexable: "Indexable pages", interfaces: "Admin interfaces", activityTitle: "Activity", links: [], activityItems: []
  },
  de: {
    area: "Adminbereich", title: "Administration", subtitle: "Uebersicht fuer Buchungen, Benutzer, Fachkraefte, SEO und Umsatzberichte.", bookings: "Buchungen", revenueReport: "Umsatzbericht", totalBookings: "Buchungen gesamt", pending: "offen oder in Pruefung", revenue: "Umsatz", liveApi: "Live Laravel API", users: "Benutzer", adminAccounts: "Admin-Konten", seoPages: "SEO Seiten", indexable: "Indexierbare Seiten", interfaces: "Admin-Interfaces", activityTitle: "Aktivitaet", links: [], activityItems: []
  }
};

function formatCurrency(value, lang) {
  return new Intl.NumberFormat(lang === "ar" ? "ar" : "de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

export default function Dashboard() {
  const [lang, setLang] = useState(() => localStorage.getItem("einstein_lang") || "ar");
  useEffect(() => {
    const syncLanguage = () => setLang(localStorage.getItem("einstein_lang") || "ar");
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);
  const t = translations[lang] || translations.ar;
  const quickLinks = t.links.length ? t.links : translations.ar.links;
  const activity = t.activityItems.length
    ? t.activityItems
    : translations.ar.activityItems;
  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminDashboardApi.getDashboard,
  });
  const liveStats = dashboard?.stats || {};
  const liveActivity = dashboard?.activity?.length ? dashboard.activity : activity;

  const stats = [
    {
      label: t.totalBookings,
      value: liveStats.total_bookings ?? 0,
      note: `${liveStats.pending_bookings ?? 0} ${t.pending}`,
      icon: CalendarCheck,
      tone: "bg-blue-50 text-blue-700"
    },
    {
      label: t.revenue,
      value: formatCurrency(liveStats.revenue ?? 0, lang),
      note: t.liveApi,
      icon: Euro,
      tone: "bg-emerald-50 text-emerald-700"
    },
    {
      label: t.users,
      value: liveStats.users ?? 0,
      note: `${liveStats.admins ?? 0} ${t.adminAccounts}`,
      icon: Users,
      tone: "bg-violet-50 text-violet-700"
    },
    {
      label: t.seoPages,
      value: liveStats.seo_pages ?? 0,
      note: t.indexable,
      icon: FileSearch,
      tone: "bg-amber-50 text-amber-700"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#dbe3ee] bg-white px-3 py-1 text-sm font-semibold text-[#65758b]">
              <ShieldCheck className="h-4 w-4 text-[#c9a227]" />
              {t.area}
            </div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#65758b]">
              {t.subtitle}
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-[#dbe3ee]">
              <a href="/AdminBookings">{t.bookings}</a>
            </Button>
            <Button asChild className="bg-[#1e3a5f] text-white hover:bg-[#2d5a8a]">
              <a href="/RevenueReports">{t.revenueReport}</a>
            </Button>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[#e3e9f2] shadow-sm">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className={`rounded-md p-3 ${stat.tone}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#65758b]">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">{stat.value}</p>
                    <p className="mt-1 text-xs text-[#8ea0b7]">{stat.note}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_390px]">
          <Card className="border-[#e3e9f2] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f]">{t.interfaces}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {quickLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-4 rounded-md border border-[#e3e9f2] bg-white p-4 transition-colors hover:border-[#c9a227] hover:bg-[#fffdf5]"
                  >
                    <div className="rounded-md bg-[#eef3f9] p-3 text-[#1e3a5f] group-hover:bg-[#c9a227] group-hover:text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1e3a5f]">{item.label}</p>
                      <p className="mt-1 text-sm text-[#65758b]">{item.note}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e3e9f2] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#1e3a5f]">{t.activityTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-md border border-[#e3e9f2] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#1e3a5f]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#65758b]">{item.detail}</p>
                      <p className="mt-2 text-xs text-[#8ea0b7]">{item.time}</p>
                    </div>
                    <Badge className="bg-[#eef3f9] text-[#1e3a5f] hover:bg-[#eef3f9]">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
