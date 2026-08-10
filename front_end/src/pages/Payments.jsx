import React, { useState, useEffect } from "react";
import { paymentsApi } from "@/api/backendClient";
import { requireStoredUser } from "@/lib/backendAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  Euro,
  Calendar,
  FileText,
  MoreVertical,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import InvoicePreview from "@/components/InvoicePreview";

const translations = {
  de: {
    title: "Zahlungen",
    all_payments: "Alle Zahlungen",
    search: "Suchen nach Kunde oder Buchungsnummer...",
    filter_status: "Status filtern",
    filter_date: "Datum filtern",
    all_statuses: "Alle Status",
    total_revenue: "Gesamteinnahmen",
    pending_payments: "Ausstehend",
    successful: "Erfolgreich",
    failed_payments: "Fehlgeschlagen",
    payment_status: {
      unpaid: "Unbezahlt",
      paid: "Bezahlt",
      refunded: "Erstattet",
      failed: "Fehlgeschlagen"
    },
    customer: "Kunde",
    booking: "Buchung",
    amount: "Betrag",
    date: "Datum",
    status: "Status",
    actions: "Aktionen",
    mark_paid: "Als bezahlt markieren",
    mark_unpaid: "Als unbezahlt markieren",
    refund: "Erstatten",
    view_booking: "Buchung ansehen",
    no_payments: "Keine Zahlungen gefunden",
    update_status: "Status aktualisieren",
    refund_payment: "Zahlung erstatten",
    refund_reason: "Erstattungsgrund",
    refund_confirm: "Erstattung bestätigen",
    cancel: "Abbrechen",
    save: "Speichern",
    from_date: "Von",
    to_date: "Bis",
    clear_filter: "Filter zurücksetzen",
    export: "Exportieren",
    service: "Dienstleistung",
    net_amount: "Nettobetrag",
    vat: "MwSt. (19%)",
    total: "Gesamt (inkl. MwSt.)",
    view_invoice: "Rechnung anzeigen",
    invoice: "Rechnung",
    delete_booking: "Buchung löschen",
    delete_confirm: "Möchten Sie diese Buchung wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
    delete_success: "Buchung wurde gelöscht"
  },
  ar: {
    title: "المدفوعات",
    all_payments: "جميع المدفوعات",
    search: "بحث بالعميل أو رقم الحجز...",
    filter_status: "تصفية الحالة",
    filter_date: "تصفية التاريخ",
    all_statuses: "جميع الحالات",
    total_revenue: "إجمالي الإيرادات",
    pending_payments: "قيد الانتظار",
    successful: "ناجح",
    failed_payments: "فاشل",
    payment_status: {
      unpaid: "غير مدفوع",
      paid: "مدفوع",
      refunded: "مسترد",
      failed: "فاشل"
    },
    customer: "العميل",
    booking: "الحجز",
    amount: "المبلغ",
    date: "التاريخ",
    status: "الحالة",
    actions: "الإجراءات",
    mark_paid: "تحديد كمدفوع",
    mark_unpaid: "تحديد كغير مدفوع",
    refund: "استرداد",
    view_booking: "عرض الحجز",
    no_payments: "لا توجد مدفوعات",
    update_status: "تحديث الحالة",
    refund_payment: "استرداد الدفع",
    refund_reason: "سبب الاسترداد",
    refund_confirm: "تأكيد الاسترداد",
    cancel: "إلغاء",
    save: "حفظ",
    from_date: "من",
    to_date: "إلى",
    clear_filter: "مسح الفلتر",
    export: "تصدير",
    service: "الخدمة",
    net_amount: "المبلغ الصافي",
    vat: "ضريبة (19%)",
    total: "الإجمالي (شامل الضريبة)",
    view_invoice: "عرض الفاتورة",
    invoice: "فاتورة",
    delete_booking: "حذف الحجز",
    delete_confirm: "هل تريد حذف هذا الحجز؟ لا يمكن التراجع عن هذا.",
    delete_success: "تم حذف الحجز"
  },
  en: {
    title: "Payments",
    all_payments: "All Payments",
    search: "Search by customer or booking number...",
    filter_status: "Filter by status",
    filter_date: "Filter by date",
    all_statuses: "All Statuses",
    total_revenue: "Total Revenue",
    pending_payments: "Pending",
    successful: "Successful",
    failed_payments: "Failed",
    payment_status: {
      unpaid: "Unpaid",
      paid: "Paid",
      refunded: "Refunded",
      failed: "Failed"
    },
    customer: "Customer",
    booking: "Booking",
    amount: "Amount",
    date: "Date",
    status: "Status",
    actions: "Actions",
    mark_paid: "Mark as Paid",
    mark_unpaid: "Mark as Unpaid",
    refund: "Refund",
    view_booking: "View Booking",
    no_payments: "No payments found",
    update_status: "Update Status",
    refund_payment: "Refund Payment",
    refund_reason: "Refund Reason",
    refund_confirm: "Confirm Refund",
    cancel: "Cancel",
    save: "Save",
    from_date: "From",
    to_date: "To",
    clear_filter: "Clear Filter",
    export: "Export",
    service: "Service",
    net_amount: "Net Amount",
    vat: "VAT (19%)",
    total: "Total (incl. VAT)",
    view_invoice: "View Invoice",
    invoice: "Invoice",
    delete_booking: "Delete Booking",
    delete_confirm: "Are you sure you want to delete this booking? This cannot be undone.",
    delete_success: "Booking deleted successfully"
  }
};

const statusColors = {
  unpaid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800"
};

const statusIcons = {
  unpaid: Clock,
  paid: CheckCircle,
  refunded: RefreshCw,
  failed: XCircle
};

export default function Payments() {
  const [lang, setLang] = useState("ar");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang] || translations.de;

  useEffect(() => {
    const checkUser = () => {
      const userData = requireStoredUser({ role: "admin" });
      if (!userData) return;
      setUser(userData);
    };
    checkUser();
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["all-bookings-payments"],
    queryFn: paymentsApi.listPayments,
    enabled: !!user
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }) => {
      if (data.payment_status === "refunded") {
        return paymentsApi.refundPayment(id, data.refund_reason || "");
      }

      return paymentsApi.updatePaymentStatus(id, data.payment_status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-bookings-payments"] });
      setSelectedPayment(null);
      setShowRefundDialog(false);
      setRefundReason("");
    }
  });

  // Filter bookings with prices (payments)
  const payments = bookings.filter(b => b.price && b.price > 0);

  // Apply filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const paymentDate = new Date(payment.created_date);
      if (dateFrom && paymentDate < dateFrom) matchesDate = false;
      if (dateTo && paymentDate > dateTo) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const stats = {
    total: payments.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + (p.price || 0), 0),
    pending: payments.filter(p => p.payment_status === "unpaid").length,
    successful: payments.filter(p => p.payment_status === "paid").length,
    failed: payments.filter(p => p.payment_status === "failed").length
  };

  const handleMarkPaid = async (booking) => {
    setProcessing(true);
    await updatePaymentMutation.mutateAsync({
      id: booking.id,
      data: { payment_status: "paid" }
    });
    setProcessing(false);
  };

  const handleMarkUnpaid = async (booking) => {
    setProcessing(true);
    await updatePaymentMutation.mutateAsync({
      id: booking.id,
      data: { payment_status: "unpaid" }
    });
    setProcessing(false);
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setProcessing(true);
    await updatePaymentMutation.mutateAsync({
      id: selectedPayment.id,
      data: { 
        payment_status: "refunded",
        refund_reason: refundReason
      }
    });
    setProcessing(false);
  };

  const handleDeleteBooking = async (booking) => {
    if (!window.confirm(t.delete_confirm)) return;
    setDeletingId(booking.id);
    await paymentsApi.deleteUnpaidBooking(booking.id);
    queryClient.invalidateQueries({ queryKey: ["all-bookings-payments"] });
    setDeletingId(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom(null);
    setDateTo(null);
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            {t.title}
          </h1>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.total_revenue}</p>
                  <p className="text-2xl font-bold text-[#6B46C1]">€{stats.total.toFixed(2)}</p>
                </div>
                <Euro className="w-8 h-8 text-[#6B46C1]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.pending_payments}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.successful}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.failed_payments}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t.filter_status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all_statuses}</SelectItem>
                  <SelectItem value="unpaid">{t.payment_status.unpaid}</SelectItem>
                  <SelectItem value="paid">{t.payment_status.paid}</SelectItem>
                  <SelectItem value="refunded">{t.payment_status.refunded}</SelectItem>
                  <SelectItem value="failed">{t.payment_status.failed}</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Calendar className="w-4 h-4 me-2" />
                    {t.filter_date}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">{t.from_date}</Label>
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        className="rounded-md border mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">{t.to_date}</Label>
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        className="rounded-md border mt-1"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <XCircle className="w-4 h-4 me-2" />
                  {t.clear_filter}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{t.all_payments} ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.no_payments}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.customer}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.booking}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.service}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.net_amount}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.vat}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.total}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.date}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.status}</th>
                      <th className="text-start py-3 px-4 font-medium text-gray-600">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => {
                      const StatusIcon = statusIcons[payment.payment_status] || Clock;
                      return (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-[#1e3a5f]">{payment.customer_name}</p>
                              <p className="text-sm text-gray-500">{payment.customer_email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">{payment.booking_number}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{payment.service_name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700">€{payment.price?.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-500">€{(payment.price * 0.19)?.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#1e3a5f]">€{(payment.price * 1.19)?.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {format(new Date(payment.created_date), "dd.MM.yyyy")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[payment.payment_status]}>
                              <StatusIcon className="w-3 h-3 me-1" />
                              {t.payment_status[payment.payment_status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {payment.payment_status === "unpaid" && (
                                  <DropdownMenuItem onClick={() => handleMarkPaid(payment)}>
                                    <CheckCircle className="w-4 h-4 me-2 text-green-600" />
                                    {t.mark_paid}
                                  </DropdownMenuItem>
                                )}
                                {payment.payment_status === "paid" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkUnpaid(payment)}>
                                      <Clock className="w-4 h-4 me-2 text-yellow-600" />
                                      {t.mark_unpaid}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedPayment(payment);
                                      setShowRefundDialog(true);
                                    }}>
                                      <RefreshCw className="w-4 h-4 me-2 text-blue-600" />
                                      {t.refund}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => window.open(createPageUrl(`Bookings?search=${payment.booking_number}`), '_blank')}>
                                  <FileText className="w-4 h-4 me-2" />
                                  {t.view_booking}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                   setSelectedPayment(payment);
                                   setShowInvoiceDialog(true);
                                 }}>
                                   <FileText className="w-4 h-4 me-2 text-[#6B46C1]" />
                                   {t.view_invoice}
                                 </DropdownMenuItem>
                                 {(payment.payment_status === "unpaid" || payment.payment_status === "failed") && (
                                   <>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem
                                       onClick={() => handleDeleteBooking(payment)}
                                       disabled={deletingId === payment.id}
                                       className="text-red-600 focus:text-red-600"
                                     >
                                       {deletingId === payment.id
                                         ? <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                         : <Trash2 className="w-4 h-4 me-2" />
                                       }
                                       {t.delete_booking}
                                     </DropdownMenuItem>
                                   </>
                                 )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6B46C1]" />
                {t.invoice}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPayment && (
              <InvoicePreview
                booking={selectedPayment}
                netAmount={selectedPayment.price}
                vatAmount={selectedPayment.price * 0.19}
                totalAmount={selectedPayment.price * 1.19}
                lang={lang}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                {t.refund_payment}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">{t.customer}</p>
                      <p className="font-medium">{selectedPayment.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t.amount}</p>
                      <p className="font-bold text-[#1e3a5f]">€{selectedPayment.price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t.booking}</p>
                      <p className="font-mono text-sm">{selectedPayment.booking_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t.service}</p>
                      <p className="text-sm">{selectedPayment.service_name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>{t.refund_reason}</Label>
                  <Textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handleRefund}
                disabled={processing || !refundReason}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <RefreshCw className="w-4 h-4 me-2" />}
                {t.refund_confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
