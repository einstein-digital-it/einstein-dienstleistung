import React, { useState } from "react";
import { CreditCard, Loader2, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentApi } from "@/api/backendClient";

const TEXT = {
  de: { title: "Sicher bezahlen", pay: "Jetzt bezahlen", subscribe: "Abo starten", monthly: "/ Monat", methods: "Karte, PayPal, SEPA-Lastschrift, Klarna, Apple Pay, Google Pay", secure: "Sie werden zur sicheren Zahlungsseite von Stripe weitergeleitet.", canceled: "Die Zahlung wurde abgebrochen. Sie können es erneut versuchen.", error: "Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es später erneut.", noVat: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet." },
  ar: { title: "دفع آمن", pay: "ادفع الآن", subscribe: "ابدأ الاشتراك", monthly: "/ شهرياً", methods: "بطاقة، PayPal، خصم SEPA، Klarna، Apple Pay، Google Pay", secure: "سيتم تحويلك إلى صفحة الدفع الآمنة لدى Stripe.", canceled: "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى.", error: "تعذّر بدء الدفع. يرجى المحاولة لاحقاً.", noVat: "لا تُحتسب ضريبة القيمة المضافة وفق § 19 UStG." },
  en: { title: "Secure payment", pay: "Pay now", subscribe: "Start subscription", monthly: "/ month", methods: "Card, PayPal, SEPA Direct Debit, Klarna, Apple Pay, Google Pay", secure: "You will be redirected to Stripe's secure payment page.", canceled: "The payment was canceled. You can try again.", error: "The payment could not be started. Please try again later.", noVat: "No VAT is charged under § 19 UStG." },
  tr: { title: "Güvenli ödeme", pay: "Şimdi öde", subscribe: "Aboneliği başlat", monthly: "/ ay", methods: "Kart, PayPal, SEPA, Klarna, Apple Pay, Google Pay", secure: "Stripe'ın güvenli ödeme sayfasına yönlendirileceksiniz.", canceled: "Ödeme iptal edildi. Tekrar deneyebilirsiniz.", error: "Ödeme başlatılamadı. Lütfen daha sonra tekrar deneyin.", noVat: "§ 19 UStG uyarınca KDV alınmaz." },
  es: { title: "Pago seguro", pay: "Pagar ahora", subscribe: "Iniciar suscripción", monthly: "/ mes", methods: "Tarjeta, PayPal, débito SEPA, Klarna, Apple Pay, Google Pay", secure: "Será redirigido a la página de pago segura de Stripe.", canceled: "El pago fue cancelado. Puede intentarlo de nuevo.", error: "No se pudo iniciar el pago. Inténtelo más tarde.", noVat: "No se cobra IVA según § 19 UStG." },
};

/** Sends the customer to Stripe Checkout. The booking is marked paid by the Stripe webhook. */
export default function StripeCheckoutButton({ booking, amount, lang = "de", canceled = false }) {
  const t = TEXT[lang] || TEXT.de;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSubscription = booking?.category === "dokumentabo";

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await paymentApi.startCheckout(booking.id, lang);
      window.location.href = data.url;
    } catch (e) {
      setError(e?.message || t.error);
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
          <Lock className="h-5 w-5 text-[#6B46C1]" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-[#1e3a5f]/10 to-[#c9a227]/10 p-4">
          <p className="text-3xl font-bold text-[#1e3a5f]">
            {Number(amount).toFixed(2)} €{isSubscription && <span className="text-base font-medium"> {t.monthly}</span>}
          </p>
          <p className="mt-1 text-xs text-gray-500">{t.noVat}</p>
        </div>

        {canceled && !error && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.canceled}</p>
        )}
        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        <Button onClick={start} disabled={loading} className="w-full bg-[#6B46C1] py-6 text-base font-semibold text-white hover:bg-[#805AD5]">
          {loading ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <CreditCard className="me-2 h-5 w-5" />}
          {isSubscription ? t.subscribe : t.pay}
        </Button>

        <p className="text-center text-xs text-gray-500">{t.methods}</p>
        <p className="text-center text-xs text-gray-400">{t.secure}</p>
      </CardContent>
    </Card>
  );
}
