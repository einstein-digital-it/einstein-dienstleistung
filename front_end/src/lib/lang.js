// The language the visitor picked in the header (German until they choose one).
export const LANGS = ["de", "ar", "en", "tr", "es", "uk"];

export const LANGUAGE_NAMES = {
  de: "Deutsch",
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
  es: "Español",
  uk: "Українська",
};

export function getLang() {
  try {
    const saved = localStorage.getItem("einstein_lang");
    return LANGS.includes(saved) ? saved : "de";
  } catch {
    return "de";
  }
}

/** Booking states in every language (used by the customer pages). */
export const BOOKING_STATUS = {
  de: { pending: "Ausstehend", confirmed: "Bestätigt", in_progress: "In Bearbeitung", completed: "Abgeschlossen", cancelled: "Storniert", paid: "Bezahlt", unpaid: "Offen" },
  ar: { pending: "قيد الانتظار", confirmed: "مؤكد", in_progress: "قيد التنفيذ", completed: "مكتمل", cancelled: "ملغى", paid: "مدفوع", unpaid: "غير مدفوع" },
  en: { pending: "Pending", confirmed: "Confirmed", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled", paid: "Paid", unpaid: "Unpaid" },
  tr: { pending: "Beklemede", confirmed: "Onaylandı", in_progress: "İşlemde", completed: "Tamamlandı", cancelled: "İptal edildi", paid: "Ödendi", unpaid: "Ödenmedi" },
  es: { pending: "Pendiente", confirmed: "Confirmada", in_progress: "En curso", completed: "Completada", cancelled: "Cancelada", paid: "Pagada", unpaid: "Sin pagar" },
  uk: { pending: "Очікує", confirmed: "Підтверджено", in_progress: "Виконується", completed: "Завершено", cancelled: "Скасовано", paid: "Оплачено", unpaid: "Не оплачено" },
};

export const STATUS_TONES = { pending: "gold", confirmed: "green", in_progress: "blue", completed: "green", cancelled: "red" };
