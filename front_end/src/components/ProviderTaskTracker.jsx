import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, User, MapPin, FileText,
  CheckCircle, XCircle, Loader2, AlertCircle, Filter
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusIcons = {
  pending: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  confirmed: <Clock className="w-4 h-4 text-blue-500" />,
  in_progress: <Loader2 className="w-4 h-4 text-purple-500" />,
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  cancelled: <XCircle className="w-4 h-4 text-red-500" />
};

const translations = {
  de: {
    title: "Aufgaben-Tracker",
    all: "Alle",
    pending: "Ausstehend",
    confirmed: "Bestätigt",
    in_progress: "In Bearbeitung",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
    no_tasks: "Keine Aufgaben in dieser Kategorie",
    customer: "Kunde",
    date: "Datum",
    address: "Adresse",
    documents: "Dokument",
    price: "Preis"
  },
  ar: {
    title: "متابعة المهام",
    all: "الكل",
    pending: "معلق",
    confirmed: "مؤكد",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغى",
    no_tasks: "لا توجد مهام في هذه الفئة",
    customer: "العميل",
    date: "التاريخ",
    address: "العنوان",
    documents: "مستند",
    price: "السعر"
  },
  en: {
    title: "Task Tracker",
    all: "All",
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_tasks: "No tasks in this category",
    customer: "Customer",
    date: "Date",
    address: "Address",
    documents: "Document",
    price: "Price"
  }
};

const FILTERS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"];

export default function ProviderTaskTracker({ bookings = [], providerId, providerEmail, lang = "de" }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const t = translations[lang] || translations.de;

  // Only show bookings that belong to this provider (not open pending ones)
  const myBookings = bookings.filter(b =>
    b.provider_id === providerId ||
    b.confirmed_by_provider_id === providerId ||
    b.confirmed_by_provider_email?.toLowerCase() === providerEmail?.toLowerCase()
  );

  const filtered = activeFilter === "all"
    ? myBookings
    : myBookings.filter(b => b.status === activeFilter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? myBookings.length : myBookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeFilter === f
                ? "bg-[#6B46C1] text-white border-[#6B46C1]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#6B46C1] hover:text-[#6B46C1]"
            }`}
          >
            {f !== "all" && statusIcons[f]}
            {t[f]}
            {counts[f] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                activeFilter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["pending", "confirmed", "completed", "cancelled"].map(s => (
          <div key={s} className={`rounded-xl p-3 border-2 ${
            s === "pending" ? "bg-yellow-50 border-yellow-100" :
            s === "confirmed" ? "bg-blue-50 border-blue-100" :
            s === "completed" ? "bg-green-50 border-green-100" :
            "bg-red-50 border-red-100"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {statusIcons[s]}
              <span className="text-xs text-gray-500">{t[s]}</span>
            </div>
            <p className="text-2xl font-bold text-[#1e3a5f]">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">{t.no_tasks}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={statusColors[booking.status]}>
                        {t[booking.status] || booking.status}
                      </Badge>
                      {booking.booking_number && (
                        <span className="font-mono text-xs text-gray-400">{booking.booking_number}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#1e3a5f] text-base">
                      {booking.service_name || booking.category}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {booking.customer_name}
                        {booking.customer_phone && <span className="text-gray-400">· {booking.customer_phone}</span>}
                      </p>
                      {booking.date && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {format(new Date(booking.date), "dd.MM.yyyy")}
                          {booking.time && <span>· {booking.time}</span>}
                        </p>
                      )}
                      {booking.address && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{booking.address}</span>
                        </p>
                      )}
                    </div>
                    {booking.description && (
                      <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg line-clamp-2">
                        {booking.description}
                      </p>
                    )}
                    {booking.documents_urls?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {booking.documents_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#6B46C1]/10 text-[#6B46C1] rounded text-xs hover:bg-[#6B46C1]/20 transition-colors">
                            <FileText className="w-3 h-3" />
                            {t.documents} {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {booking.price && (
                    <div className="text-end flex-shrink-0">
                      <p className="text-lg font-bold text-[#1e3a5f]">€{booking.price}</p>
                      {booking.payment_status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          booking.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {booking.payment_status}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}