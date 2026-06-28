import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, Upload, PlusCircle, CreditCard } from "lucide-react";

const stripePromise = loadStripe("pk_live_51QxWijGKJr0RFWgp1Xn5A4AkNjwXVlLGb0Lq3P8G6c9bI1Bif6q9mUDGUvMKK9s0avMQV3MWYQ37M4R1y5gL7pC00p4kMYA8f");

const labels = {
  de: {
    title: "Antrag Erweiterung",
    subtitle: "Beschreiben Sie, was Sie zusätzlich benötigen",
    description_label: "Was möchten Sie erweitern?",
    description_placeholder: "Beschreiben Sie Ihre zusätzlichen Anforderungen...",
    upload: "Dokumente hochladen (optional)",
    amount: "Betrag: 15€ + 19% MwSt. = 17,85€",
    pay: "Jetzt bezahlen – 17,85€",
    success: "Antrag Erweiterung erfolgreich eingereicht!",
    success_msg: "Wir werden uns mit Ihnen in Verbindung setzen.",
    cancel: "Abbrechen",
    uploading: "Hochladen...",
    paying: "Zahlung wird verarbeitet...",
  },
  ar: {
    title: "تمديد الخدمة",
    subtitle: "اشرح ما تريد إضافته",
    description_label: "ماذا تريد أن تضيف؟",
    description_placeholder: "اشرح متطلباتك الإضافية...",
    upload: "رفع ملفات (اختياري)",
    amount: "المبلغ: 15€ + 19% ضريبة = 17.85€",
    pay: "ادفع الآن – 17.85€",
    success: "تم تقديم طلب التمديد بنجاح!",
    success_msg: "سنتواصل معك قريباً.",
    cancel: "إلغاء",
    uploading: "جاري الرفع...",
    paying: "جاري معالجة الدفع...",
  },
  en: {
    title: "Service Extension",
    subtitle: "Describe what you need additionally",
    description_label: "What would you like to extend?",
    description_placeholder: "Describe your additional requirements...",
    upload: "Upload documents (optional)",
    amount: "Amount: 15€ + 19% VAT = 17.85€",
    pay: "Pay Now – 17.85€",
    success: "Extension request submitted successfully!",
    success_msg: "We will contact you shortly.",
    cancel: "Cancel",
    uploading: "Uploading...",
    paying: "Processing payment...",
  }
};

function CheckoutForm({ extensionId, lang, onSuccess, t }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setPaying(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded")) {
      await base44.entities.ServiceExtension.update(extensionId, {
        payment_status: "authorized",
        status: "pending"
      });
      onSuccess();
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || paying}
        className="w-full bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white h-11 text-base font-bold"
      >
        {paying ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t.paying}</> : <><CreditCard className="w-4 h-4 me-2" />{t.pay}</>}
      </Button>
    </form>
  );
}

export default function ExtensionDialog({ booking, lang, open, onClose }) {
  const t = labels[lang] || labels.de;
  const [step, setStep] = useState(1); // 1: form, 2: payment, 3: success
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);
  const [extensionId, setExtensionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    setUploading(true);
    const urls = [];
    for (const file of selectedFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setUploadedUrls(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleProceedToPayment = async () => {
    if (!description.trim()) return;
    setLoading(true);

    // Create extension record
    const ext = await base44.entities.ServiceExtension.create({
      booking_id: booking.id,
      booking_number: booking.booking_number,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      provider_id: booking.provider_id || booking.confirmed_by_provider_id,
      provider_name: booking.confirmed_by_provider_name || booking.provider_name,
      provider_email: booking.confirmed_by_provider_email,
      service_name: booking.service_name || booking.category,
      description,
      documents_urls: uploadedUrls,
      amount: 15,
      status: "pending",
      payment_status: "unpaid"
    });

    setExtensionId(ext.id);

    // Create payment intent
    const res = await base44.functions.invoke('createExtensionPayment', { extension_id: ext.id });
    setClientSecret(res.data.clientSecret);
    setStep(2);
    setLoading(false);
  };

  const handleSuccess = () => {
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setDescription("");
    setUploadedUrls([]);
    setClientSecret(null);
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
            {/* Original booking info */}
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="text-gray-500 text-xs mb-1">{booking.booking_number}</p>
              <p className="font-semibold text-[#1e3a5f]">{booking.service_name || booking.category}</p>
            </div>

            <div>
              <Label className="mb-1.5 block">{t.description_label} *</Label>
              <Textarea
                rows={4}
                placeholder={t.description_placeholder}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-1.5">
                <Upload className="w-4 h-4" /> {t.upload}
              </Label>
              <Input type="file" multiple onChange={handleFileUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.uploading}</p>}
              {uploadedUrls.length > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {uploadedUrls.length} {lang === "ar" ? "ملف تم رفعه" : lang === "en" ? "file(s) uploaded" : "Datei(en) hochgeladen"}
                </p>
              )}
            </div>

            <div className="bg-[#6B46C1]/10 rounded-xl p-3 border border-[#6B46C1]/20">
              <p className="text-sm font-semibold text-[#6B46C1]">{t.amount}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>{t.cancel}</Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#6B46C1] to-[#805AD5] text-white"
                disabled={!description.trim() || loading || uploading}
                onClick={handleProceedToPayment}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 me-1" /> {lang === "ar" ? "متابعة للدفع" : lang === "en" ? "Proceed to Payment" : "Weiter zur Zahlung"}</>}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && clientSecret && (
          <div className="space-y-4">
            <div className="bg-[#6B46C1]/10 rounded-xl p-3 border border-[#6B46C1]/20">
              <p className="text-sm font-semibold text-[#6B46C1]">{t.amount}</p>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <CheckoutForm extensionId={extensionId} lang={lang} onSuccess={handleSuccess} t={t} />
            </Elements>
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