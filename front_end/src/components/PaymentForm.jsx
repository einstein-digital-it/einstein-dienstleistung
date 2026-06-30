import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { paymentApi } from "@/api/backendClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CreditCard, CheckCircle, AlertCircle, Shield, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = loadStripe("pk_live_51SGK6mGiX448ApQVzXhu2XkReEug0x56HTxfkNzEl18T5BcIwboW7MxPATQkNUdYoMo2y6h1avdiEuxTBOfRsElc00Rsi7U8lZ");



const translations = {
  de: {
    payment: "Zahlung",
    pay_now: "Jetzt bezahlen",
    processing: "Wird verarbeitet...",
    success: "Zahlung erfolgreich!",
    success_desc: "Vielen Dank! Eine Bestätigung wurde an Ihre E-Mail gesendet.",
    error: "Zahlung fehlgeschlagen",
    try_again: "Erneut versuchen",
    amount: "Betrag",
    secure: "Sichere Zahlung mit Stripe",
    step1: "Zahlungsdaten eingeben",
    step2: "Daten überprüfen",
    step3: "Zahlung verarbeiten",
    step4: "Bestätigung",
    receipt_sent: "Rechnung per E-Mail gesendet",
    booking_number: "Buchungsnummer",
    encrypted: "256-Bit SSL verschlüsselt",
    pay_by_card: "Kreditkarte / Online",
    card_declined: "Ihre Karte wurde abgelehnt. Bitte überprüfen Sie Ihre Kartendaten oder verwenden Sie eine andere Karte.",
    insufficient_funds: "Ihre Karte hat kein ausreichendes Guthaben.",
    incorrect_number: "Die Kartennummer ist ungültig. Bitte überprüfen Sie die Nummer.",
    incorrect_cvc: "Der Sicherheitscode (CVC) ist falsch.",
    expired_card: "Ihre Karte ist abgelaufen.",
    generic_error: "Bei der Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder verwenden Sie eine andere Karte."
  },
  ar: {
    payment: "الدفع",
    pay_now: "ادفع الآن",
    processing: "جاري المعالجة...",
    success: "تم الدفع بنجاح!",
    success_desc: "شكراً لك! تم إرسال تأكيد إلى بريدك الإلكتروني.",
    error: "فشل الدفع",
    try_again: "حاول مرة أخرى",
    amount: "المبلغ",
    secure: "دفع آمن عبر Stripe",
    step1: "إدخال بيانات الدفع",
    step2: "مراجعة البيانات",
    step3: "معالجة الدفع",
    step4: "التأكيد",
    receipt_sent: "تم إرسال الإيصال بالبريد الإلكتروني",
    booking_number: "رقم الحجز",
    encrypted: "مشفر بـ 256-بت SSL",
    pay_by_card: "بطاقة / أونلاين",
    card_declined: "تم رفض بطاقتك. يرجى التحقق من بيانات البطاقة أو استخدام بطاقة أخرى.",
    insufficient_funds: "رصيد البطاقة غير كافٍ.",
    incorrect_number: "رقم البطاقة غير صحيح. يرجى التحقق من الرقم.",
    incorrect_cvc: "رمز الأمان (CVC) غير صحيح.",
    expired_card: "انتهت صلاحية بطاقتك.",
    generic_error: "حدث خطأ أثناء الدفع. يرجى المحاولة مرة أخرى أو استخدام بطاقة أخرى."
  },
  en: {
    payment: "Payment",
    pay_now: "Pay Now",
    processing: "Processing...",
    success: "Payment Successful!",
    success_desc: "Thank you! A confirmation has been sent to your email.",
    error: "Payment Failed",
    try_again: "Try Again",
    amount: "Amount",
    secure: "Secure payment with Stripe",
    step1: "Enter payment details",
    step2: "Review information",
    step3: "Process payment",
    step4: "Confirmation",
    receipt_sent: "Receipt sent via email",
    booking_number: "Booking Number",
    encrypted: "256-bit SSL encrypted",
    pay_by_card: "Card / Online",
    card_declined: "Your card was declined. Please check your card details or use a different card.",
    insufficient_funds: "Your card has insufficient funds.",
    incorrect_number: "The card number is invalid. Please check the number.",
    incorrect_cvc: "The security code (CVC) is incorrect.",
    expired_card: "Your card has expired.",
    generic_error: "A payment error occurred. Please try again or use a different card."
  },
  tr: {
    payment: "Odeme",
    pay_now: "Simdi Ode",
    processing: "Isleniyor...",
    success: "Odeme Basarili!",
    success_desc: "Tesekkurler! E-postaniza bir onay gonderildi.",
    error: "Odeme Basarisiz",
    try_again: "Tekrar Dene",
    amount: "Tutar",
    secure: "Stripe ile guvenli odeme",
    step1: "Odeme bilgilerini girin",
    step2: "Bilgileri inceleyin",
    step3: "Odemeyi isleyin",
    step4: "Onay",
    receipt_sent: "Makbuz e-posta ile gonderildi",
    booking_number: "Rezervasyon Numarasi",
    encrypted: "256-bit SSL sifreli",
    pay_by_card: "Kart / Online",
    card_declined: "Kartınız reddedildi. Kart bilgilerini kontrol edin veya farklı bir kart kullanın.",
    insufficient_funds: "Kartınızda yeterli bakiye yok.",
    incorrect_number: "Kart numarası geçersiz.",
    incorrect_cvc: "Güvenlik kodu (CVC) hatalı.",
    expired_card: "Kartınızın süresi dolmuş.",
    generic_error: "Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin."
  }
};

const paymentSteps = ["step1", "step2", "step3", "step4"];



function CheckoutForm({ booking, amount, lang, onSuccess, onError, onStepChange }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const t = translations[lang] || translations.de;

  const updateStep = (step) => {
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      const code = submitError.code || "";
      let userMsg = submitError.message;
      if (code === "card_declined" || code === "do_not_honor") userMsg = t.card_declined;
      else if (code === "insufficient_funds") userMsg = t.insufficient_funds;
      else if (code === "incorrect_number" || code === "invalid_number") userMsg = t.incorrect_number;
      else if (code === "incorrect_cvc" || code === "invalid_cvc") userMsg = t.incorrect_cvc;
      else if (code === "expired_card") userMsg = t.expired_card;
      else if (submitError.type === "card_error" || submitError.type === "validation_error") userMsg = t.generic_error;
      setError(userMsg);
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/Payment?payment_intent_redirect=success",
      },
      redirect: "if_required",
    });

    if (confirmError) {
      // Map Stripe error codes to user-friendly messages
      const code = confirmError.code || "";
      let userMsg = confirmError.message;
      if (code === "card_declined" || code === "do_not_honor") userMsg = t.card_declined;
      else if (code === "insufficient_funds") userMsg = t.insufficient_funds;
      else if (code === "incorrect_number" || code === "invalid_number") userMsg = t.incorrect_number;
      else if (code === "incorrect_cvc" || code === "invalid_cvc") userMsg = t.incorrect_cvc;
      else if (code === "expired_card") userMsg = t.expired_card;
      else if (confirmError.type === "card_error" || confirmError.type === "validation_error") userMsg = t.generic_error;
      setError(userMsg);
      onError?.(confirmError);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        await paymentApi.updatePaymentStatus(booking.id, "paid");
      } catch (e) {
        console.error('Post-payment confirm error:', e);
      }
      onSuccess?.();
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-[#1e3a5f] hover:bg-[#2d5a8a] py-6 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 me-2" />
            {t.pay_now} - {Number(amount).toFixed(2)}€
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {t.encrypted}
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {t.secure}
        </span>
      </div>
    </form>
  );
}



export default function PaymentForm({ booking, amount, lang = "de", onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);


  const t = translations[lang] || translations.de;
  const progressPercentage = ((currentStep + 1) / paymentSteps.length) * 100;

  React.useEffect(() => {
    if (booking?.id && amount) {
      setLoading(false);
    }
  }, [booking?.id, amount]);

  const handleBackendPayment = async () => {
    try {
      setLoading(true);
      await paymentApi.updatePaymentStatus(booking.id, "paid");
      setCurrentStep(3);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || t.generic_error);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1" />
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">{t.success}</h3>
            <p className="text-gray-600 mb-4">{t.success_desc}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">{t.booking_number}</p>
              <p className="text-lg font-bold text-[#1e3a5f]">{booking?.booking_number}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{t.receipt_sent}</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-600 mb-2">{t.error}</h3>
          <p className="text-gray-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#c9a227] p-1" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <CreditCard className="w-5 h-5" />
            {t.payment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-[#1e3a5f]/10 to-[#c9a227]/10 rounded-xl">
            <p className="text-sm text-gray-600">{t.amount}</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{Number(amount).toFixed(2)}â‚¬</p>
            {booking?.booking_number && (
              <p className="text-xs text-gray-500 mt-1">{t.booking_number}: {booking.booking_number}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleBackendPayment}
            disabled={loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#2d5a8a] py-6 text-lg"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 me-2 animate-spin" />{t.processing}</>
            ) : (
              <><CreditCard className="w-5 h-5 me-2" />{t.pay_now} - {Number(amount).toFixed(2)}â‚¬</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1e3a5f',
        colorBackground: '#ffffff',
        colorText: '#1e3a5f',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            {paymentSteps.map((step, index) => (
              <div key={step} className={`flex items-center ${index < paymentSteps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStep ? 'bg-[#c9a227] text-[#1e3a5f]' : 'bg-gray-300 text-gray-500'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < paymentSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-[#c9a227]' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 font-medium">{t[paymentSteps[currentStep]]}</p>
          <Progress value={progressPercentage} className="mt-2 h-2" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <CreditCard className="w-5 h-5" />
            {t.payment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gradient-to-r from-[#1e3a5f]/10 to-[#c9a227]/10 rounded-xl">
            <p className="text-sm text-gray-600">{t.amount}</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{Number(amount).toFixed(2)}€</p>
            {booking?.booking_number && (
              <p className="text-xs text-gray-500 mt-1">{t.booking_number}: {booking.booking_number}</p>
            )}
          </div>
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              booking={booking}
              amount={amount}
              lang={lang}
              onStepChange={setCurrentStep}
              onSuccess={() => {
                setCurrentStep(3);
                setSuccess(true);
                onSuccess?.();
              }}
              onError={onError}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
