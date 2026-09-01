import React, { useState, useEffect, useMemo } from "react";
import { revenueReportsApi } from "@/api/backendClient";
import { requireStoredUser } from "@/lib/backendAuth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, Euro, Download, FileText, Calendar, CheckCircle,
  Loader2, BarChart2, PieChart as PieIcon, FileDown, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#6B46C1", "#805AD5", "#9F7AEA", "#B794F4", "#D6BCFA", "#EBF8FF", "#2D3748", "#4A5568"];

const CATEGORY_LABELS = {
  office: { de: "Büro", ar: "مكتب", en: "Office" },
  forms: { de: "Formulare", ar: "نماذج", en: "Forms" },
  admin: { de: "Verwaltung", ar: "إدارة", en: "Admin" },
  coordination: { de: "Koordination", ar: "تنسيق", en: "Coordination" },
  mercosur: { de: "Mercosur", ar: "ميركوسور", en: "Mercosur" },
  tutoring: { de: "Nachhilfe", ar: "دروس خصوصية", en: "Tutoring" },
  print: { de: "Druck", ar: "طباعة", en: "Print" },
  education: { de: "Bildung", ar: "تعليم", en: "Education" },
  cleaning: { de: "Reinigung", ar: "تنظيف", en: "Cleaning" },
  transport: { de: "Transport", ar: "نقل", en: "Transport" },
};

export default function RevenueReports() {
  const [lang, setLang] = useState("ar");
  const [user, setUser] = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [chartType, setChartType] = useState("bar"); // bar | line | pie

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
    const init = () => setUser(requireStoredUser({ role: "admin" }));
    init();
  }, []);

  const isRTL = lang === "ar";
  const MONTHS = lang === "ar" ? MONTHS_AR : lang === "en" ? MONTHS_EN : MONTHS_DE;

  const { data: revenueReport = { bookings: [], extensions: [] }, isLoading } = useQuery({
    queryKey: ["revenue-report", yearFilter],
    queryFn: () => revenueReportsApi.getRevenueReport(yearFilter),
    enabled: !!user,
  });
  const bookings = revenueReport.bookings || [];
  const extensions = revenueReport.extensions || [];

  // Completed paid bookings only
  const completedBookings = useMemo(() =>
    bookings.filter(b => b.status === "completed" && (b.payment_status === "paid" || b.payment_status === "authorized")),
    [bookings]
  );

  const paidExtensions = useMemo(() =>
    extensions.filter(e => e.payment_status === "paid"),
    [extensions]
  );

  const selectedYear = parseInt(yearFilter);

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      bookings: 0,
      extensions: 0,
      total: 0,
      count: 0,
    }));

    completedBookings.forEach(b => {
      if (!b.date) return;
      const d = new Date(b.date);
      if (d.getFullYear() !== selectedYear) return;
      const m = d.getMonth();
      const amount = parseFloat(b.price || 0);
      months[m].bookings += amount;
      months[m].total += amount;
      months[m].count += 1;
    });

    paidExtensions.forEach(e => {
      const d = new Date(e.created_date || e.updated_date || Date.now());
      if (d.getFullYear() !== selectedYear) return;
      const m = d.getMonth();
      const amount = parseFloat(e.amount || 15);
      months[m].extensions += amount;
      months[m].total += amount;
    });

    return months.map(m => ({
      ...m,
      bookings: parseFloat(m.bookings.toFixed(2)),
      extensions: parseFloat(m.extensions.toFixed(2)),
      total: parseFloat(m.total.toFixed(2)),
    }));
  }, [completedBookings, paidExtensions, selectedYear, MONTHS]);

  // KPIs
  const totalRevenue = useMemo(() => monthlyData.reduce((s, m) => s + m.total, 0), [monthlyData]);
  const totalBookingRevenue = useMemo(() => monthlyData.reduce((s, m) => s + m.bookings, 0), [monthlyData]);
  const totalExtensionRevenue = useMemo(() => monthlyData.reduce((s, m) => s + m.extensions, 0), [monthlyData]);
  const totalCount = useMemo(() => monthlyData.reduce((s, m) => s + m.count, 0), [monthlyData]);
  const avgPerBooking = totalCount > 0 ? (totalBookingRevenue / totalCount).toFixed(2) : "0.00";

  // Previous year comparison
  const prevYearRevenue = useMemo(() => {
    let sum = 0;
    completedBookings.forEach(b => {
      if (!b.date) return;
      if (new Date(b.date).getFullYear() === selectedYear - 1) sum += parseFloat(b.price || 0);
    });
    paidExtensions.forEach(e => {
      const d = new Date(e.created_date || Date.now());
      if (d.getFullYear() === selectedYear - 1) sum += parseFloat(e.amount || 15);
    });
    return sum;
  }, [completedBookings, paidExtensions, selectedYear]);

  const growthPct = prevYearRevenue > 0
    ? (((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100).toFixed(1)
    : null;

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    completedBookings.forEach(b => {
      if (b.date && new Date(b.date).getFullYear() !== selectedYear) return;
      const cat = b.category || "other";
      if (!map[cat]) map[cat] = 0;
      map[cat] += parseFloat(b.price || 0);
    });
    return Object.entries(map)
      .map(([cat, val]) => ({
        name: CATEGORY_LABELS[cat]?.[lang] || cat,
        value: parseFloat(val.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [completedBookings, selectedYear, lang]);

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set();
    bookings.forEach(b => { if (b.date) years.add(new Date(b.date).getFullYear()); });
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [bookings]);

  // Export CSV
  const exportCSV = () => {
    const header = [t.monthLabel, `${t.bookingRev} (€)`, `${t.extensionRev} (€)`, `${t.totalRevenue} (€)`, t.bookingsLabel];
    const rows = monthlyData.map(m => [m.month, m.bookings, m.extensions, m.total, m.count]);
    const totals = [
      t.totalLabel,
      totalBookingRevenue.toFixed(2),
      totalExtensionRevenue.toFixed(2),
      totalRevenue.toFixed(2),
      totalCount
    ];
    const csvContent = [header, ...rows, [], totals]
      .map(row => row.join(","))
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EinStein_Umsatzbericht_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success({ ar: "تم تصدير CSV", en: "CSV exported", de: "CSV exportiert" }[lang] || "CSV exported");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210;
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(107, 70, 193);
    doc.rect(0, 0, W, 35, "F");
    doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("EinStein Institut", margin, 15);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`${t.title} ${selectedYear}`, margin, 25);
    doc.setFontSize(8); doc.setTextColor(200, 180, 255);
    const generatedLabel = { ar: "تم الإنشاء في", en: "Created on", de: "Erstellt am" }[lang] || "Created on";
    const dateLocale = { ar: "ar", en: "en-GB", de: "de-DE" }[lang] || "en-GB";
    doc.text(`${generatedLabel} ${new Date().toLocaleDateString(dateLocale)}`, W - margin, 30, { align: "right" });
    y = 45;

    // KPI summary
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95);
    doc.text(t.revenueOverview, margin, y);
    y += 8;

    const kpis = [
      [t.totalRevenue, `€${totalRevenue.toFixed(2)}`],
      [t.bookingRev, `€${totalBookingRevenue.toFixed(2)}`],
      [t.extensionRev, `€${totalExtensionRevenue.toFixed(2)}`],
      [t.completedCount, totalCount],
      [t.avgBooking, `€${avgPerBooking}`],
    ];
    kpis.forEach(([label, val], i) => {
      const col = i % 2 === 0 ? margin : W / 2 + 5;
      if (i % 2 === 0 && i > 0) y += 10;
      doc.setFillColor(248, 247, 255);
      doc.rect(col, y - 5, 80, 9, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
      doc.text(label, col + 2, y);
      doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95);
      doc.text(String(val), col + 78, y, { align: "right" });
    });
    y += 15;

    // Monthly table
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95);
    doc.text(t.monthlyRevenue, margin, y);
    y += 6;

    // Table header
    doc.setFillColor(30, 58, 95);
    doc.rect(margin, y, W - margin * 2, 8, "F");
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(t.monthLabel, margin + 2, y + 5.5);
    doc.text(`${t.bookingRev} (€)`, margin + 35, y + 5.5);
    doc.text(`${t.extensionRev} (€)`, margin + 75, y + 5.5);
    doc.text(`${t.totalRevenue} (€)`, margin + 120, y + 5.5);
    doc.text(t.bookingsLabel, margin + 160, y + 5.5);
    y += 8;

    monthlyData.forEach((m, i) => {
      if (i % 2 === 0) { doc.setFillColor(252, 250, 255); doc.rect(margin, y, W - margin * 2, 7, "F"); }
      doc.setFontSize(8); doc.setFont("helvetica", i === new Date().getMonth() && selectedYear === new Date().getFullYear() ? "bold" : "normal");
      doc.setTextColor(34, 34, 34);
      doc.text(m.month, margin + 2, y + 5);
      doc.text(m.bookings > 0 ? `€${m.bookings.toFixed(2)}` : "-", margin + 35, y + 5);
      doc.text(m.extensions > 0 ? `€${m.extensions.toFixed(2)}` : "-", margin + 75, y + 5);
      doc.setFont("helvetica", "bold"); doc.setTextColor(107, 70, 193);
      doc.text(m.total > 0 ? `€${m.total.toFixed(2)}` : "-", margin + 120, y + 5);
      doc.setFont("helvetica", "normal"); doc.setTextColor(34, 34, 34);
      doc.text(m.count > 0 ? String(m.count) : "-", margin + 160, y + 5);
      y += 7;
    });

    // Total row
    doc.setFillColor(107, 70, 193);
    doc.rect(margin, y, W - margin * 2, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255); doc.setFontSize(9);
    doc.text(t.totalLabel.toUpperCase(), margin + 2, y + 5.5);
    doc.text(`€${totalBookingRevenue.toFixed(2)}`, margin + 35, y + 5.5);
    doc.text(`€${totalExtensionRevenue.toFixed(2)}`, margin + 75, y + 5.5);
    doc.text(`€${totalRevenue.toFixed(2)}`, margin + 120, y + 5.5);
    doc.text(String(totalCount), margin + 160, y + 5.5);
    y += 14;

    // Footer
    doc.setDrawColor(200, 200, 200); doc.line(margin, y, W - margin, y);
    y += 5;
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(130, 130, 130);
    doc.text("EinStein Institut UG (haftungsbeschränkt) · Frankfurt, Deutschland · info@einsteindienstleistung.de", W / 2, y, { align: "center" });

    doc.save(`EinStein_Umsatzbericht_${selectedYear}.pdf`);
    toast.success({ ar: "تم تصدير PDF", en: "PDF exported", de: "PDF exportiert" }[lang] || "PDF exported");
  };

  const t = {
    title: { de: "Umsatzbericht", ar: "تقرير الأرباح", en: "Revenue Report", tr: "Gelir Raporu", es: "Informe de Ingresos" }[lang] || "Umsatzbericht",
    subtitle: { de: "Einnahmenübersicht für abgeschlossene Buchungen", ar: "ملخص الإيرادات للعمليات المكتملة", en: "Revenue overview for completed bookings", tr: "Tamamlanan rezervasyonlar için gelir özeti", es: "Resumen de ingresos para reservas completadas" }[lang],
    totalRevenue: { de: "Gesamtumsatz", ar: "إجمالي الإيرادات", en: "Total Revenue", tr: "Toplam Gelir", es: "Ingresos Totales" }[lang],
    bookingRev: { de: "Buchungseinnahmen", ar: "إيرادات الحجوزات", en: "Booking Revenue", tr: "Rezervasyon Geliri", es: "Ingresos por Reservas" }[lang],
    extensionRev: { de: "Erweiterungen", ar: "إيرادات التمديدات", en: "Extension Revenue", tr: "Uzatma Geliri", es: "Ingresos por Extensiones" }[lang],
    completedCount: { de: "Abgeschlossene Buchungen", ar: "الحجوزات المكتملة", en: "Completed Bookings", tr: "Tamamlanan Rezervasyonlar", es: "Reservas Completadas" }[lang],
    avgBooking: { de: "Ø pro Buchung", ar: "متوسط الحجز", en: "Avg. per Booking", tr: "Rezervasyon Başına Ort.", es: "Prom. por Reserva" }[lang],
    monthlyChart: { de: "Monatliche Einnahmen", ar: "الإيرادات الشهرية", en: "Monthly Revenue", tr: "Aylık Gelir", es: "Ingresos Mensuales" }[lang],
    categoryBreakdown: { de: "Einnahmen nach Kategorie", ar: "الإيرادات حسب الفئة", en: "Revenue by Category", tr: "Kategoriye Göre Gelir", es: "Ingresos por Categoría" }[lang],
    exportCSV: { de: "CSV exportieren", ar: "تصدير CSV", en: "Export CSV", tr: "CSV İndir", es: "Exportar CSV" }[lang],
    exportPDF: { de: "PDF exportieren", ar: "تصدير PDF", en: "Export PDF", tr: "PDF İndir", es: "Exportar PDF" }[lang],
    year: { de: "Jahr", ar: "السنة", en: "Year", tr: "Yıl", es: "Año" }[lang],
    growth: { de: "Wachstum ggü. Vorjahr", ar: "النمو مقارنة بالعام الماضي", en: "Growth vs Last Year", tr: "Geçen Yıla Göre Büyüme", es: "Crecimiento vs Año Anterior" }[lang],
    monthLabel: { de: "Monat", ar: "الشهر", en: "Month", tr: "Ay", es: "Mes" }[lang],
    bookingsLabel: { de: "Buchungen", ar: "عدد الحجوزات", en: "Bookings", tr: "Rezervasyonlar", es: "Reservas" }[lang],
    totalLabel: { de: "Gesamt", ar: "الإجمالي", en: "Total", tr: "Toplam", es: "Total" }[lang],
    currentLabel: { de: "Aktuell", ar: "الحالي", en: "Current", tr: "Güncel", es: "Actual" }[lang],
    noData: { de: "Keine Daten", ar: "لا توجد بيانات", en: "No data", tr: "Veri yok", es: "Sin datos" }[lang],
    monthlyDetails: { de: "Monatliche Einnahmen im Detail", ar: "تفاصيل الإيرادات الشهرية", en: "Monthly Revenue Details", tr: "Aylık Gelir Detayları", es: "Detalles de Ingresos Mensuales" }[lang],
    revenueOverview: { de: "Umsatz-Übersicht", ar: "ملخص الإيرادات", en: "Revenue Overview", tr: "Gelir Özeti", es: "Resumen de Ingresos" }[lang],
    monthlyRevenue: { de: "Monatliche Einnahmen", ar: "الإيرادات الشهرية", en: "Monthly Revenue", tr: "Aylık Gelir", es: "Ingresos Mensuales" }[lang],
  };
  const label = t;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" />
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-2">
              <BarChart2 className="w-8 h-8 text-[#6B46C1]" />
              {label.title}
            </h1>
            <p className="text-gray-500 mt-1">{label.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year selector */}
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28">
                <Calendar className="w-4 h-4 me-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} className="gap-2 border-green-200 text-green-700 hover:bg-green-50">
              <FileDown className="w-4 h-4" /> {label.exportCSV}
            </Button>
            <Button onClick={exportPDF} className="gap-2 bg-[#6B46C1] hover:bg-[#805AD5]">
              <Download className="w-4 h-4" /> {label.exportPDF}
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#6B46C1]" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: label.totalRevenue,
                  value: `€${totalRevenue.toFixed(2)}`,
                  icon: <Euro className="w-6 h-6" />,
                  color: "bg-[#6B46C1]",
                  sub: growthPct !== null ? (
                    <span className={`flex items-center gap-1 text-xs mt-1 ${parseFloat(growthPct) >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {parseFloat(growthPct) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {growthPct}% {label.growth}
                    </span>
                  ) : null
                },
                { title: label.bookingRev, value: `€${totalBookingRevenue.toFixed(2)}`, icon: <FileText className="w-6 h-6" />, color: "bg-blue-600" },
                { title: label.extensionRev, value: `€${totalExtensionRevenue.toFixed(2)}`, icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-600" },
                { title: label.completedCount, value: totalCount, icon: <CheckCircle className="w-6 h-6" />, color: "bg-orange-500", sub: <span className="text-xs text-gray-400 mt-1 block">{label.avgBooking}: €{avgPerBooking}</span> },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`${kpi.color} text-white p-3 rounded-xl`}>{kpi.icon}</div>
                      <div>
                        <p className="text-sm text-gray-500">{kpi.title}</p>
                        <p className="text-2xl font-bold text-[#1e3a5f]">{kpi.value}</p>
                        {kpi.sub}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Monthly Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-[#1e3a5f]">{label.monthlyChart} — {selectedYear}</CardTitle>
                  <div className="flex gap-1">
                    {[["bar", <BarChart2 className="w-4 h-4" />], ["line", <TrendingUp className="w-4 h-4" />]].map(([type, icon]) => (
                      <Button key={type} size="sm" variant={chartType === type ? "default" : "outline"}
                        className={chartType === type ? "bg-[#6B46C1] h-7 w-7 p-0" : "h-7 w-7 p-0"}
                        onClick={() => setChartType(type)}>
                        {icon}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    {chartType === "bar" ? (
                      <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
                        <Tooltip formatter={(v, name) => [`€${v}`, name === "bookings" ? label.bookingRev : label.extensionRev]} />
                        <Legend formatter={n => n === "bookings" ? label.bookingRev : label.extensionRev} />
                        <Bar dataKey="bookings" fill="#6B46C1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="extensions" fill="#9F7AEA" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `€${v}`} />
                        <Tooltip formatter={(v) => [`€${v}`]} />
                        <Legend formatter={n => n === "total" ? label.totalRevenue : label.bookingRev} />
                        <Line type="monotone" dataKey="total" stroke="#6B46C1" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="bookings" stroke="#9F7AEA" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-[#6B46C1]" />
                    {label.categoryBreakdown}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                            {categoryData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={v => `€${v}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {categoryData.slice(0, 5).map((cat, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              <span className="text-gray-700">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-[#6B46C1]">€{cat.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <PieIcon className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">{t.noData}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monthly table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#1e3a5f]">
                  {t.monthlyDetails} — {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1e3a5f] text-white">
                        <th className="px-4 py-3 text-start rounded-tl-lg">{t.monthLabel}</th>
                        <th className="px-4 py-3 text-end">{t.bookingRev}</th>
                        <th className="px-4 py-3 text-end">{t.extensionRev}</th>
                        <th className="px-4 py-3 text-end font-bold">{t.totalRevenue}</th>
                        <th className="px-4 py-3 text-center rounded-tr-lg">{t.bookingsLabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((m, i) => {
                        const isCurrent = i === new Date().getMonth() && selectedYear === new Date().getFullYear();
                        return (
                          <tr key={i} className={`border-b border-gray-100 ${isCurrent ? "bg-purple-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-purple-50 transition-colors`}>
                            <td className="px-4 py-3 font-medium text-[#1e3a5f] flex items-center gap-2">
                              {m.month}
                              {isCurrent && <Badge className="bg-purple-100 text-purple-700 text-xs py-0">{t.currentLabel}</Badge>}
                            </td>
                            <td className="px-4 py-3 text-end text-blue-700">{m.bookings > 0 ? `€${m.bookings.toFixed(2)}` : "—"}</td>
                            <td className="px-4 py-3 text-end text-emerald-700">{m.extensions > 0 ? `€${m.extensions.toFixed(2)}` : "—"}</td>
                            <td className="px-4 py-3 text-end font-bold text-[#6B46C1]">{m.total > 0 ? `€${m.total.toFixed(2)}` : "—"}</td>
                            <td className="px-4 py-3 text-center">{m.count > 0 ? m.count : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#6B46C1] text-white font-bold">
                        <td className="px-4 py-3 rounded-bl-lg">{t.totalLabel}</td>
                        <td className="px-4 py-3 text-end">€{totalBookingRevenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-end">€{totalExtensionRevenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-end text-lg">€{totalRevenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center rounded-br-lg">{totalCount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
