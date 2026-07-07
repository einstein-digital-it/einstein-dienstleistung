import React, { useState } from "react";
import { bookingsApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, FileText, CheckCircle, Download, Printer } from "lucide-react";

async function downloadExtensionInvoice(ext, setLoadingId) {
  setLoadingId(ext.id);
  try {
    const payload = encodeURIComponent(JSON.stringify(ext, null, 2));
    window.open(`data:application/json;charset=utf-8,${payload}`, "_blank");
  } finally {
    setLoadingId(null);
  }
}

export default function ExtensionsTab({ providerEmail, lang }) {
  const [loadingId, setLoadingId] = useState(null);
  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ["provider-extensions", providerEmail],
    queryFn: () => bookingsApi.listServiceExtensions({ provider_email: providerEmail }),
    enabled: !!providerEmail
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#6B46C1] animate-spin" />
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
        <PlusCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          {lang === "ar" ? "لا توجد طلبات تمديد" : lang === "en" ? "No extension requests" : "Keine Erweiterungsanträge"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        {lang === "ar" ? `${extensions.length} طلب تمديد من عملائك` : lang === "en" ? `${extensions.length} extension request(s) from your clients` : `${extensions.length} Erweiterungsantrag/Anträge von Ihren Kunden`}
      </p>
      {extensions.map((ext, idx) => (
        <motion.div key={ext.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
          className="bg-white border border-orange-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                {ext.customer_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-[#1e3a5f]">{ext.customer_name}</p>
                <p className="text-xs text-gray-500">{ext.customer_email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={
                ext.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                ext.payment_status === 'authorized' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                💳 {ext.payment_status === 'paid' ? (lang === 'ar' ? 'مدفوع' : 'Bezahlt') :
                    ext.payment_status === 'authorized' ? (lang === 'ar' ? 'مخصوم' : 'Autorisiert') :
                    (lang === 'ar' ? 'غير مدفوع' : 'Unbezahlt')}
              </Badge>
              <span className="text-lg font-bold text-orange-600">€{ext.amount || 15}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-3 space-y-1">
            {ext.booking_number && (
              <p><span className="font-medium">{lang === "ar" ? "رقم الحجز:" : "Buchungsnr.:"}</span> {ext.booking_number}</p>
            )}
            <p><span className="font-medium">{lang === "ar" ? "الخدمة:" : "Dienst:"}</span> {ext.service_name}</p>
          </div>

          {ext.description && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-gray-700 mb-3">
              <p className="font-medium text-xs text-orange-700 mb-1">
                {lang === "ar" ? "ما يريد العميل إضافته:" : "Was der Kunde hinzufügen möchte:"}
              </p>
              {ext.description}
            </div>
          )}

          {ext.documents_urls?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ext.documents_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs hover:bg-blue-100">
                  <FileText className="w-3.5 h-3.5" />
                  {lang === "ar" ? "مستند" : "Dokument"} {i + 1}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <Badge className={
              ext.status === 'completed' ? 'bg-green-100 text-green-800' :
              ext.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
              ext.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }>
              {ext.status === 'pending' ? (lang === "ar" ? "⏳ قيد الانتظار" : "⏳ Ausstehend") :
               ext.status === 'accepted' ? (lang === "ar" ? "✅ مقبول" : "✅ Angenommen") :
               ext.status === 'completed' ? (lang === "ar" ? "✅ مكتمل" : "✅ Abgeschlossen") :
               (lang === "ar" ? "❌ ملغى" : "❌ Abgelehnt")}
            </Badge>
            {ext.payment_status === 'paid' && (
              <Button size="sm" variant="outline"
                className="h-7 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                disabled={loadingId === ext.id}
                onClick={() => downloadExtensionInvoice(ext, setLoadingId)}>
                {loadingId === ext.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><Printer className="w-3.5 h-3.5 me-1" />{lang === "ar" ? "فاتورة PDF" : "Rechnung PDF"}</>
                }
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
