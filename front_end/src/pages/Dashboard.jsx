import React from "react";
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
import { staticAdminBookings, staticAdminUsers, staticSEOSettings } from "@/lib/staticAdminData";

const quickLinks = [
  { label: "Buchungen", href: "/AdminBookings", icon: ClipboardList, note: "Aktuelle Buchungsuebersicht" },
  { label: "Berichte", href: "/BookingReports", icon: BarChart3, note: "Buchungs- und Statusberichte" },
  { label: "Umsatzbericht", href: "/EarningsReports", icon: Euro, note: "Einnahmen und Monatsvergleich" },
  { label: "Benutzer", href: "/Users", icon: Users, note: "Kunden und Admin-Konten" },
  { label: "Fachkraft-Antraege", href: "/SupplierRequests", icon: UserCheck, note: "Neue Anbieter pruefen" },
  { label: "SEO", href: "/SEO", icon: Search, note: "Meta-Daten und Sitemap" }
];

const activity = [
  { title: "Neue Buchung eingegangen", detail: "Koordination und Kommunikation", time: "Heute, 10:00", status: "Neu" },
  { title: "Benutzer registriert", detail: "ENG. MOHAMMED K. M. ABDELRAHMAN", time: "25.05.2026", status: "Kunde" },
  { title: "SEO-Eintrag aktualisiert", detail: "Startseite und Dienstleistungen", time: "Diese Woche", status: "SEO" },
  { title: "Zahlungsstatus geprueft", detail: "Abgeschlossene Buchungen", time: "Mai 2026", status: "Finanzen" }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

export default function Dashboard() {
  const completed = staticAdminBookings.filter((booking) => booking.status === "completed");
  const paidRevenue = completed
    .filter((booking) => booking.payment_status === "paid" || booking.payment_status === "authorized")
    .reduce((sum, booking) => sum + Number(booking.price || 0), 0);
  const pendingBookings = staticAdminBookings.filter((booking) => booking.status !== "completed").length;
  const adminCount = staticAdminUsers.filter((item) => item.role === "admin").length;

  const stats = [
    {
      label: "Buchungen gesamt",
      value: staticAdminBookings.length,
      note: `${pendingBookings} offen oder in Pruefung`,
      icon: CalendarCheck,
      tone: "bg-blue-50 text-blue-700"
    },
    {
      label: "Umsatz",
      value: formatCurrency(paidRevenue),
      note: "Statische lokale Ansicht",
      icon: Euro,
      tone: "bg-emerald-50 text-emerald-700"
    },
    {
      label: "Benutzer",
      value: staticAdminUsers.length,
      note: `${adminCount} Admin-Konto`,
      icon: Users,
      tone: "bg-violet-50 text-violet-700"
    },
    {
      label: "SEO Seiten",
      value: staticSEOSettings.length,
      note: "Indexierbare Seiten",
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
              Adminbereich
            </div>
            <h1 className="text-3xl font-bold text-[#1e3a5f]">Administration</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#65758b]">
              Uebersicht fuer Buchungen, Benutzer, Fachkraefte, SEO und Umsatzberichte.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-[#dbe3ee]">
              <a href="/AdminBookings">Buchungen</a>
            </Button>
            <Button asChild className="bg-[#1e3a5f] text-white hover:bg-[#2d5a8a]">
              <a href="/EarningsReports">Umsatzbericht</a>
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
              <CardTitle className="text-xl text-[#1e3a5f]">Admin-Interfaces</CardTitle>
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
              <CardTitle className="text-xl text-[#1e3a5f]">Aktivitaet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.map((item) => (
                <div key={item.title} className="rounded-md border border-[#e3e9f2] bg-white p-4">
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
