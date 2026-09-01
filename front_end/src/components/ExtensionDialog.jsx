import React, { useState } from "react";
import { bookingsApi, uploadApi } from "@/api/backendClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, Upload, PlusCircle, CreditCard } from "lucide-react";

const labels = {
  de: {
    title: "Antrag Erweiterung",
    subtitle: "Beschreiben Sie, was Sie zusaetzlich benoetigen",
    description_label: "Was moechten Sie erweitern?",
    description_placeholder: "Beschreiben Sie Ihre zusaetzlichen Anforderungen...",
    upload: "Dokumente hochladen (optional)",
    amount: "Betrag: 15 EUR + 19% MwSt. = 17,85 EUR",
    pay: "Zahlung autorisieren",
    success: "Antrag Erweiterung erfolgreich eingereicht!",
    success_msg: "Wir werden uns mit Ihnen in Verbindung setzen.",
    cancel: "Abbrechen",
    uploading: "Hochladen...",
    paying: "Zahlung wird verarbeitet...",
    proceed: "Weiter zur Zahlung"
  },
  ar: {
    title: "تمديد الخدمة",
    subtitle: "اشرح ما تريد إضافته",
    description_label: "ماذا تريد أن تضيف؟",
    description_placeholder: "اشرح متطلباتك الإضافية...",
    upload: "رفع ملفات (اختياري)",
    amount: "المبلغ: 15 EUR + 19% ضريبة = 17.85 EUR",
    pay: "تأكيد الدفع",
    success: "تم تقديم طلب التمديد بنجاح!",
    success_msg: "سنتواصل معك قريباً.",
    cancel: "إلغاء",
    uploading: "جاري الرفع...",
    paying: "جاري معالجة الدفع...",
    proceed: "متابعة للدفع"
  },
  en: {
    title: "Service Extension",
    subtitle: "Describe what you need additionally",
    description_label: "What would you like to extend?",
    description_placeholder: "Describe your additional requirements...",
    upload: "Upload documents (optional)",
    amount: "Amount: 15 EUR + 19% VAT = 17.85 EUR",
    pay: "Authorize payment",
    success: "Extension request submitted successfully!",
    success_msg: "We will contact you shortly.",
    cancel: "Cancel",
    uploading: "Uploading...",
    paying: "Processing payment...",
    proceed: "Proceed to payment"
  }
};

export default function ExtensionDialog({ booking, lang = "de", open, onClose }) {
  const t = labels[lang] || labels.de;
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [extensionId, setExtensionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setUploading(true);
    try {
      const uploaded = await uploadApi.uploadFiles(selectedFiles);
      const urls = (uploaded.files || []).map((file) => file.url).filter(Boolean);
      setUploadedUrls((current) => [...current, ...urls]);
    } finally {
      setUploading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const extension = await bookingsApi.createServiceExtension({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        provider_id: booking.confirmed_by_provider_id || booking.provider_id || null,
        provider_email: booking.confirmed_by_provider_email || null,
        provider_name: booking.confirmed_by_provider_name || booking.provider_name,
        service_name: booking.service_name || booking.category,
        description,
        documents_urls: uploadedUrls,
        amount: 17.85,
        status: "pending",
        payment_status: "unpaid"
      });

      setExtensionId(extension.id);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizePayment = async () => {
    if (!extensionId) return;
    setLoading(true);
    try {
      await bookingsApi.authorizeServiceExtensionPayment(extensionId);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setDescription("");
    setUploadedUrls([]);
    setExtensionId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <PlusCircle className="w-5 h-5 text-[#6B46C1]" />
            {t.title}
          </DialogTitle>
          {step === 1 && <p className="text-sm text-gray-500">{t.subtitle}</p>}
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-gray-500 text-xs mb-1">{booking.booking_number}</p>
              <p className="font-semibold text-[#1e3a5f]">{booking.service_name || booking.category}</p>
            </div>

            <div>
              <Label className="mb-1.5 block">{t.description_label} *</Label>
              <Textarea rows={4} placeholder={t.description_placeholder} value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Upload className="w-4 h-4" /> {t.upload}
              </Label>
              <Input type="file" multiple onChange={handleFileUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.uploading}</p>}
              {uploadedUrls.length > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {uploadedUrls.length} file(s) uploaded
                </p>
              )}
            </div>

            <div className="bg-[#6B46C1]/10 rounded-xl p-3 border border-[#6B46C1]/20">
              <p className="text-sm font-semibold text-[#6B46C1]">{t.amount}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>{t.cancel}</Button>
              <Button className="flex-1 bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white" disabled={!description.trim() || loading || uploading} onClick={handleProceedToPayment}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 me-1" /> {t.proceed}</>}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-[#6B46C1]/10 rounded-xl p-3 border border-[#6B46C1]/20">
              <p className="text-sm font-semibold text-[#6B46C1]">{t.amount}</p>
            </div>
            <Button className="w-full bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white h-11 text-base font-bold" disabled={loading} onClick={handleAuthorizePayment}>
              {loading ? <><Loader2 className="w-4 h-4 me-1 animate-spin" />{t.paying}</> : <><CreditCard className="w-4 h-4 me-2" />{t.pay}</>}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{t.success}</h3>
            <p className="text-gray-500 text-sm mb-6">{t.success_msg}</p>
            <Button className="bg-[#6B46C1] hover:bg-[#805AD5] text-white" onClick={handleClose}>OK</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
