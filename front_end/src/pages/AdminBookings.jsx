import React, { useState, useEffect } from "react";
import { bookingsApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireStoredUser } from "@/lib/backendAuth";
import {
  MoreHorizontal, Download, User, Calendar, Clock, Package,
  Loader2, AlertCircle, Trash2, CheckCircle, XCircle, Receipt,
  CreditCard, Search, Phone, Mail, PlusCircle, FileText
} from "lucide-react";

const translations = {
  de: {
    title: "Alle Buchungen",
    loading: "Buchungen werden geladen...",
    no_bookings: "Keine Buchungen gefunden.",
    search: "Suchen...",
    all_statuses: "Alle Status",
    all_payments: "Alle Zahlungen",
    statuses: { pending: "Ausstehend", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert" },
    payment_statuses: { paid: "Bezahlt", unpaid: "Unbezahlt", authorized: "Autorisiert", failed: "Fehlgeschlagen", refunded: "Erstattet" },
    mark_paid: "Als bezahlt markieren",
    mark_unpaid: "Als unbezahlt markieren",
    confirm: "Bestätigen",
    reject: "Ablehnen",
    complete: "Abschließen",
    delete: "Löschen",
    invoice: "Rechnung",
    document: "Dokument",
    no_documents: "Keine Dokumente",
    edit_price: "Preis ändern",
    price_prompt: "Neuen Preis eingeben (€):",
  },
  ar: {
    title: "كل الحجوزات",
    loading: "جاري تحميل الحجوزات...",
    no_bookings: "لم يتم العثور على حجوزات.",
    search: "بحث...",
    all_statuses: "كل الحالات",
    all_payments: "كل المدفوعات",
    statuses: { pending: "قيد الانتظار", confirmed: "مؤكد", in_progress: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى" },
    payment_statuses: { paid: "مدفوع", unpaid: "غير مدفوع", authorized: "مصرح", failed: "فشل", refunded: "مسترد" },
    mark_paid: "وضع علامة كمدفوع",
    mark_unpaid: "وضع علامة كغير مدفوع",
    confirm: "تأكيد",
    reject: "رفض",
    complete: "إكمال",
    delete: "حذف",
    invoice: "فاتورة",
    document: "مستند",
    no_documents: "لا توجد مستندات",
    edit_price: "تعديل السعر",
    price_prompt: "أدخل السعر الجديد (€):",
  },
  en: {
    title: "All Bookings",
    loading: "Loading bookings...",
    no_bookings: "No bookings found.",
    search: "Search...",
    all_statuses: "All Statuses",
    all_payments: "All Payments",
    statuses: { pending: "Pending", confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled" },
    payment_statuses: { paid: "Paid", unpaid: "Unpaid", authorized: "Authorized", failed: "Failed", refunded: "Refunded" },
    mark_paid: "Mark as Paid",
    mark_unpaid: "Mark as Unpaid",
    confirm: "Confirm",
    reject: "Reject",
    complete: "Complete",
    delete: "Delete",
    invoice: "Invoice",
    document: "Document",
    no_documents: "No documents",
    edit_price: "Edit Price",
    price_prompt: "Enter new price (€):",
  }
};

const statusConfig = {
  pending:     { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed:   { color: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completed:   { color: "bg-green-100 text-green-800 border-green-200" },
  cancelled:   { color: "bg-red-100 text-red-800 border-red-200" },
};

const paymentConfig = {
  paid:     { color: "bg-green-100 text-green-800 border-green-200" },
  unpaid:   { color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  authorized: { color: "bg-blue-100 text-blue-800 border-blue-200" },
  failed:   { color: "bg-red-100 text-red-800 border-red-200" },
  refunded: { color: "bg-gray-100 text-gray-700 border-gray-200" },
};

export default function AdminBookings() {
  const [lang, setLang] = useState("de");
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const t = translations[lang] || translations.de;

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang") || "de";
    setLang(savedLang);
    const checkUser = () => setUser(requireStoredUser({ role: "admin" }));
    checkUser();
  }, []);

  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: bookingsApi.listBookings,
    enabled: !!user
  });

  const { data: extensions = [], isLoading: extensionsLoading, refetch: refetchExtensions } = useQuery({
    queryKey: ['all-extensions'],
    queryFn: bookingsApi.listServiceExtensions,
    enabled: !!user
  });

  const handleStatusUpdate = async (bookingId, newStatus) => {
    await bookingsApi.updateBooking(bookingId, { status: newStatus });
    refetch();
  };

  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus) => {
    await bookingsApi.updateBooking(bookingId, { payment_status: newPaymentStatus });
    refetch();
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm(lang === 'ar' ? "هل أنت متأكد من الحذف؟" : "Sicher löschen?")) {
      await bookingsApi.deleteBooking(bookingId);
      refetch();
    }
  };

  const handleConfirmBooking = async (booking) => {
    await bookingsApi.updateBooking(booking.id, {
      status: 'confirmed',
      ...(booking.payment_status === 'authorized' ? { payment_status: 'paid' } : {}),
    });
    refetch();
  };

  const handleRejectBooking = async (booking) => {
    await bookingsApi.updateBooking(booking.id, {
      status: 'cancelled',
      ...(booking.payment_status === 'authorized' || booking.payment_status === 'paid' ? { payment_status: 'refunded' } : {}),
    });
    refetch();
  };

  const handleEditPrice = async (bookingId, currentPrice) => {
    const input = window.prompt(t.price_prompt, currentPrice ?? "");
    if (input === null) return;
    const newPrice = parseFloat(input);
    if (isNaN(newPrice) || newPrice < 0) return;
    await bookingsApi.updateBooking(bookingId, { price: newPrice });
    refetch();
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
      b.service_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchPayment = paymentFilter === "all" || b.payment_status === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#6B46C1] animate-spin" />
          <p className="text-lg text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700">Error</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{t.title}</h1>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 bg-white border shadow-sm">
            <TabsTrigger value="bookings">
              {lang === 'ar' ? 'الحجوزات' : lang === 'en' ? 'Bookings' : 'Buchungen'}
              <span className="ms-1.5 bg-[#6B46C1] text-white text-xs rounded-full px-1.5 py-0.5">{bookings.length}</span>
            </TabsTrigger>
            <TabsTrigger value="extensions">
              🔁 {lang === 'ar' ? 'التمديدات' : lang === 'en' ? 'Extensions' : 'Erweiterungen'}
              {extensions.length > 0 && <span className="ms-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">{extensions.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t.all_statuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all_statuses}</SelectItem>
              {Object.entries(t.statuses).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder={t.all_payments} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all_payments}</SelectItem>
              {Object.entries(t.payment_statuses).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#6B46C1] animate-spin" />
          </div>
        )}

        {/* Booking Cards */}
        {!isLoading && filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t.no_bookings}</p>
          </div>
        ) : !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3"
              >
                {/* Top row: booking number + status + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#6B46C1] bg-purple-50 px-2 py-1 rounded-lg">
                    #{booking.booking_number || booking.id?.slice(-6)}
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <Badge className={`text-xs ${statusConfig[booking.status]?.color || "bg-gray-100 text-gray-700"}`}>
                      {t.statuses[booking.status] || booking.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleConfirmBooking(booking)}>
                          <CheckCircle className="w-4 h-4 me-2 text-green-600" />
                          {booking.payment_status === 'authorized' ? (lang === 'ar' ? '✅ قبول وتحصيل الدفع' : '✅ Bestätigen & Zahlung einziehen') : t.confirm}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRejectBooking(booking)}>
                          <XCircle className="w-4 h-4 me-2 text-red-600" />
                          {booking.payment_status === 'authorized' ? (lang === 'ar' ? '❌ رفض واسترداد الدفع' : '❌ Ablehnen & Erstatten') : t.reject}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "completed")}>
                          <CheckCircle className="w-4 h-4 me-2 text-blue-600" />{t.complete}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePaymentStatusUpdate(booking.id, "paid")}>
                          <CreditCard className="w-4 h-4 me-2 text-green-600" />{t.mark_paid}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePaymentStatusUpdate(booking.id, "unpaid")}>
                          <CreditCard className="w-4 h-4 me-2 text-yellow-600" />{t.mark_unpaid}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPrice(booking.id, booking.price)}>
                          <CreditCard className="w-4 h-4 me-2 text-purple-600" />{t.edit_price}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBooking(booking.id)}>
                          <Trash2 className="w-4 h-4 me-2" />{t.delete}
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {booking.customer_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate">{booking.customer_email}</p>
                    {booking.customer_phone && (
                      <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Service + Date */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{booking.service_name || booking.category || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{booking.date ? new Date(booking.date).toLocaleDateString(lang) : "—"}</span>
                  </div>
                  {booking.time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{booking.time}</span>
                    </div>
                  )}
                  {booking.provider_name && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{booking.provider_name}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="bg-purple-50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-bold text-[#6B46C1]">
                        {booking.price != null ? `€${booking.price}` : (lang === 'ar' ? 'لا يوجد سعر' : 'Kein Preis')}
                      </span>
                      {booking.price != null && (
                        <span className="text-xs text-gray-500 ms-2">
                          (inkl. 19% MwSt: €{(booking.price * 1.19).toFixed(2)})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleEditPrice(booking.id, booking.price)}
                      className="text-xs text-[#6B46C1] hover:underline flex items-center gap-1 font-medium"
                    >
                      <CreditCard className="w-3.5 h-3.5" />{t.edit_price}
                    </button>
                  </div>
                </div>

                {/* Payment + Documents */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Badge className={`text-xs ${paymentConfig[booking.payment_status]?.color || "bg-gray-100 text-gray-700"}`}>
                    {t.payment_statuses[booking.payment_status] || booking.payment_status || "—"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {booking.invoice_url && (
                      <button
                        onClick={async () => {
                          const res = await fetch(booking.invoice_url);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `invoice-${booking.booking_number || booking.id}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-xs text-[#6B46C1] hover:underline flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5" />{t.invoice}
                      </button>
                    )}
                    {booking.documents_urls?.map((url, i) => (
                      <button key={i}
                        onClick={async () => {
                          const res = await fetch(url);
                          const blob = await res.blob();
                          const burl = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = burl;
                          a.download = `document-${i + 1}`;
                          a.click();
                          URL.revokeObjectURL(burl);
                        }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />{t.document} {i + 1}
                      </button>
                    ))}
                    {!booking.invoice_url && !booking.documents_urls?.length && (
                      <span className="text-xs text-gray-400">{t.no_documents}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Extensions Tab */}
          <TabsContent value="extensions">
            {extensionsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#6B46C1] animate-spin" /></div>
            ) : extensions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <PlusCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{lang === 'ar' ? 'لا توجد طلبات تمديد' : lang === 'en' ? 'No extension requests' : 'Keine Erweiterungsanträge'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {extensions.map((ext, idx) => (
                  <motion.div key={ext.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Badge className={
                        ext.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        ext.payment_status === 'authorized' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        💳 {ext.payment_status === 'paid' ? (lang === 'ar' ? 'مدفوع' : 'Bezahlt') :
                            ext.payment_status === 'authorized' ? (lang === 'ar' ? 'مخصوم' : 'Autorisiert') :
                            (lang === 'ar' ? 'غير مدفوع' : 'Unbezahlt')}
                      </Badge>
                      <Badge className={
                        ext.status === 'completed' ? 'bg-green-100 text-green-800' :
                        ext.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        ext.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {ext.status}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {ext.customer_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{ext.customer_name}</p>
                        <p className="text-xs text-gray-500">{ext.customer_email}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100" />
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">{lang === 'ar' ? 'الخدمة:' : 'Dienst:'}</span> {ext.service_name}</p>
                      <p><span className="font-medium">{lang === 'ar' ? 'المزود:' : 'Anbieter:'}</span> {ext.provider_name || '-'}</p>
                      {ext.booking_number && <p><span className="font-medium">{lang === 'ar' ? 'رقم الحجز:' : 'Buchung:'}</span> {ext.booking_number}</p>}
                    </div>
                    {ext.description && (
                      <p className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-100 text-gray-700">{ext.description}</p>
                    )}
                    {ext.documents_urls?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ext.documents_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100">
                            <FileText className="w-3 h-3" /> Doc {i+1}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="bg-orange-50 rounded-lg px-3 py-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-orange-700">€{ext.amount || 15}</span>
                        <span className="text-xs text-gray-500 ms-2">(inkl. 19% MwSt.)</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {ext.payment_status === 'paid' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => window.alert(lang === 'ar' ? 'سيتم إضافة API الفواتير لاحقاً.' : 'Rechnungs-API wird spaeter ergaenzt.')}>
                            <Receipt className="w-3 h-3 me-1" /> {lang === 'ar' ? 'فاتورة' : 'Rechnung'}
                          </Button>
                        )}
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"
                          onClick={async () => { await bookingsApi.updateServiceExtension(ext.id, { status: 'accepted' }); refetchExtensions(); }}>
                          <CheckCircle className="w-3 h-3 me-1" /> {lang === 'ar' ? 'قبول' : 'Annehmen'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          onClick={async () => { await bookingsApi.updateServiceExtension(ext.id, { status: 'cancelled' }); refetchExtensions(); }}>
                          <XCircle className="w-3 h-3 me-1" /> {lang === 'ar' ? 'رفض' : 'Ablehnen'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
