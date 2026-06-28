import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";

const tr = {
  de: {
    title: "Bewertung abgeben",
    subtitle: "Wie war Ihre Erfahrung mit diesem Service?",
    rating_label: "Ihre Bewertung",
    review_label: "Ihr Kommentar (optional)",
    review_placeholder: "Teilen Sie Ihre Erfahrung...",
    submit: "Bewertung senden",
    submitting: "Wird gesendet...",
    success: "Vielen Dank für Ihre Bewertung!",
    cancel: "Abbrechen",
    select_rating: "Bitte wählen Sie eine Bewertung"
  },
  ar: {
    title: "أضف تقييمك",
    subtitle: "كيف كانت تجربتك مع هذه الخدمة؟",
    rating_label: "تقييمك",
    review_label: "تعليقك (اختياري)",
    review_placeholder: "شارك تجربتك...",
    submit: "إرسال التقييم",
    submitting: "جاري الإرسال...",
    success: "شكراً على تقييمك!",
    cancel: "إلغاء",
    select_rating: "الرجاء اختيار تقييم"
  },
  en: {
    title: "Leave a Review",
    subtitle: "How was your experience with this service?",
    rating_label: "Your Rating",
    review_label: "Your Comment (optional)",
    review_placeholder: "Share your experience...",
    submit: "Submit Review",
    submitting: "Submitting...",
    success: "Thank you for your review!",
    cancel: "Cancel",
    select_rating: "Please select a rating"
  },
  tr: {
    title: "Değerlendirme Yap",
    subtitle: "Bu hizmetle deneyiminiz nasıldı?",
    rating_label: "Puanınız",
    review_label: "Yorumunuz (isteğe bağlı)",
    review_placeholder: "Deneyiminizi paylaşın...",
    submit: "Değerlendirme Gönder",
    submitting: "Gönderiliyor...",
    success: "Değerlendirmeniz için teşekkürler!",
    cancel: "İptal",
    select_rating: "Lütfen bir puan seçin"
  },
  es: {
    title: "Dejar una Reseña",
    subtitle: "¿Cómo fue tu experiencia con este servicio?",
    rating_label: "Tu Puntuación",
    review_label: "Tu Comentario (opcional)",
    review_placeholder: "Comparte tu experiencia...",
    submit: "Enviar Reseña",
    submitting: "Enviando...",
    success: "¡Gracias por tu reseña!",
    cancel: "Cancelar",
    select_rating: "Por favor selecciona una puntuación"
  }
};

export default function ReviewDialog({ booking, lang = "de", open, onClose }) {
  const [rating, setRating] = useState(booking?.rating || 0);
  const [review, setReview] = useState(booking?.review || "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();
  const t = tr[lang] || tr.de;

  const mutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Booking.update(booking.id, { rating, review });
      // Send notification to provider if available
      if (booking.confirmed_by_provider_email) {
        await base44.entities.Notification.create({
          user_email: booking.confirmed_by_provider_email,
          type: "review_received",
          title_ar: "تلقيت تقييماً جديداً",
          title_de: "Neue Bewertung erhalten",
          title_en: "New Review Received",
          message_ar: `${booking.customer_name} أعطاك ${rating} نجوم على خدمة ${booking.service_name || booking.category}`,
          message_de: `${booking.customer_name} hat ${rating} Sterne für ${booking.service_name || booking.category} gegeben.`,
          message_en: `${booking.customer_name} rated ${rating} stars for ${booking.service_name || booking.category}.`,
          link: `ProviderDashboard`,
          booking_id: booking.id,
          is_read: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1500);
    }
  });

  const handleSubmit = () => {
    if (!rating) { setError(t.select_rating); return; }
    setError("");
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-700">{t.success}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">{t.subtitle}</p>
            <p className="text-sm font-medium text-[#1e3a5f]">{booking?.service_name || booking?.category}</p>

            <div>
              <p className="text-sm font-medium mb-2">{t.rating_label}</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            <div>
              <p className="text-sm font-medium mb-1">{t.review_label}</p>
              <Textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder={t.review_placeholder}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>{t.cancel}</Button>
              <Button
                className="flex-1 bg-[#6B46C1] hover:bg-[#805AD5]"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? <><Loader2 className="w-4 h-4 me-1 animate-spin" />{t.submitting}</>
                  : t.submit}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}