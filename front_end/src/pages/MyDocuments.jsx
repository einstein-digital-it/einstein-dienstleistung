import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BadgeCheck, Share2, Briefcase, Building2, ChevronLeft, ChevronRight, Download, FileText, Folder, GraduationCap,
  HeartPulse, Home as HomeIcon, Sparkles, CalendarClock, ChevronDown, Landmark, Loader2, Lock, PiggyBank, Shield, Trash2, Upload, Users, Globe2, Baby,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerDocumentsApi } from "@/api/backendClient";
import { getStoredAuthUser } from "@/lib/backendAuth";
import { shareFiles } from "@/lib/shareFiles";
import CustomerCases from "@/components/CustomerCases";
import OriginalViewer from "@/components/OriginalViewer";

const FOLDER_META = {
  jobcenter: { icon: Briefcase, color: "bg-blue-600" },
  auslaenderbehoerde: { icon: Globe2, color: "bg-emerald-600" },
  finanzamt: { icon: Landmark, color: "bg-amber-600" },
  familienkasse: { icon: Baby, color: "bg-pink-600" },
  krankenkasse: { icon: HeartPulse, color: "bg-red-600" },
  rentenversicherung: { icon: PiggyBank, color: "bg-teal-600" },
  wohnen: { icon: HomeIcon, color: "bg-orange-600" },
  arbeit: { icon: Building2, color: "bg-indigo-600" },
  schule: { icon: GraduationCap, color: "bg-sky-600" },
  bank: { icon: Landmark, color: "bg-slate-700" },
  versicherung: { icon: Shield, color: "bg-violet-600" },
  sonstiges: { icon: Folder, color: "bg-gray-500" },
};

const T = {
  de: {
    title: "Meine Unterlagen", subtitle: "Alle Ihre Dokumente, sortiert nach Behörde und Thema.",
    private: "Nur Sie und EinStein sehen diese Dateien.",
    folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Ausländerbehörde", finanzamt: "Finanzamt", familienkasse: "Familienkasse / Kindergeld", krankenkasse: "Krankenkasse", rentenversicherung: "Rentenversicherung", wohnen: "Wohnen / Vermieter", arbeit: "Arbeit / Arbeitgeber", schule: "Schule / Kita", bank: "Bank", versicherung: "Versicherungen", sonstiges: "Sonstiges" },
    files: (n) => (n === 1 ? "1 Datei" : `${n} Dateien`), back: "Alle Ordner", upload: "Datei hochladen",
    titleField: "Titel (optional)", empty: "Noch keine Dateien in diesem Ordner.", uploading: "Wird hochgeladen…",
    byEinstein: "von EinStein", deleteConfirm: "Datei wirklich löschen?", login: "Bitte melden Sie sich an, um Ihre Unterlagen zu sehen.",
    error: "Das hat nicht geklappt. Bitte erneut versuchen.", customer: "Kunde (E-Mail)", open: "Öffnen", customers: "Kunden mit Unterlagen",
    hint: "PDF, Foto, Word oder Excel – bis 20 MB.",
    autoTitle: "Hochladen – wir sortieren und übersetzen", autoDesc: "Laden Sie einen Brief hoch (PDF oder Foto). Er wird automatisch dem richtigen Ordner zugeordnet und in Ihre Sprache übersetzt.",
    reminders: "Erinnerungen", daysLeft: (n) => (n < 0 ? "überfällig" : n === 0 ? "heute" : `in ${n} Tagen`), done: "Erledigt", translateMine: "In meine Sprache übersetzen",
    processing: "Wird sortiert und übersetzt…", failed: "Automatische Übersetzung fehlgeschlagen", tooLong: "Dieses Dokument ist zu lang für die automatische Übersetzung. Es wurde nur gespeichert.", summary: "Zusammenfassung", translation: "Übersetzung", showTranslation: "Übersetzung anzeigen", hideTranslation: "Übersetzung ausblenden", deadline: "Frist", from: "Von",
    aiNote: "Die Datei wird zur Sortierung und Übersetzung automatisch mit Claude (Anthropic) ausgewertet. Die Übersetzung ist eine Hilfe, keine beglaubigte Übersetzung.",
    aboTitle: "Sortieren & Übersetzen", aboPitch: "Wir sortieren jeden Brief in den richtigen Ordner, übersetzen ihn in Ihre Sprache und erinnern Sie an Fristen.",
    aboPrice: (p) => `${p} € / Monat inkl. MwSt. · monatlich kündbar`, aboSubscribe: "Jetzt abonnieren", aboActive: "Sortieren & Übersetzen ist aktiv",
    aboUntil: (d) => `Gekündigt – aktiv bis ${d}`, aboCancel: "Abo kündigen", aboCancelConfirm: "Abo kündigen? Es bleibt bis zum Ende des bezahlten Monats aktiv.",
    aboNeeded: "Ohne Abo wird der Brief nur gespeichert, nicht sortiert oder übersetzt.", aboThanks: "Danke! Ihr Abo wird aktiviert, sobald die Zahlung bestätigt ist.", aboTerms: "Es gelten die AGB (§ 8b).", aboLimit: (n) => `Bis zu ${n} Schreiben pro Monat`, aboUsage: (u, n) => `${u} von ${n} Schreiben diesen Monat`, aboReached: "Ihr Monatskontingent ist aufgebraucht. Neue Schreiben werden nur gespeichert.",
  },
  ar: {
    title: "ملفاتي", subtitle: "كل مستنداتك مرتبة حسب الجهة والموضوع.",
    private: "هذه الملفات لا يراها إلا أنت وفريق آينشتاين.",
    folders: { jobcenter: "الجوب سنتر", auslaenderbehoerde: "دائرة الأجانب", finanzamt: "مكتب الضرائب", familienkasse: "صندوق العائلة / الكيندرغلد", krankenkasse: "التأمين الصحي", rentenversicherung: "التأمين التقاعدي", wohnen: "السكن / المؤجر", arbeit: "العمل / صاحب العمل", schule: "المدرسة / الروضة", bank: "البنك", versicherung: "التأمينات", sonstiges: "أخرى" },
    files: (n) => (n === 1 ? "ملف واحد" : `${n} ملفات`), back: "كل المجلدات", upload: "رفع ملف",
    titleField: "اسم الملف (اختياري)", empty: "لا توجد ملفات في هذا المجلد بعد.", uploading: "جارٍ الرفع…",
    byEinstein: "من آينشتاين", deleteConfirm: "هل تريد حذف الملف؟", login: "سجّل الدخول لترى ملفاتك.",
    error: "لم تنجح العملية. حاول مرة أخرى.", customer: "الزبون (الإيميل)", open: "فتح", customers: "زبائن لديهم ملفات",
    hint: "PDF أو صورة أو Word أو Excel – حتى 20 ميغابايت.",
    autoTitle: "ارفع الملف – ونحن نرتّبه ونترجمه", autoDesc: "ارفع الرسالة (PDF أو صورة)، وتنحط تلقائياً بالمجلد الصحيح وتتترجم للغتك.",
    reminders: "تذكيرات", daysLeft: (n) => (n < 0 ? "متأخر" : n === 0 ? "اليوم" : `بعد ${n} يوم`), done: "تم", translateMine: "ترجمها للغتي",
    processing: "جارٍ الترتيب والترجمة…", failed: "فشلت الترجمة التلقائية", tooLong: "هذا الملف طويل جداً على الترجمة التلقائية، لذلك تم حفظه فقط.", summary: "الملخص", translation: "الترجمة", showTranslation: "عرض الترجمة", hideTranslation: "إخفاء الترجمة", deadline: "آخر موعد", from: "من",
    aiNote: "يتم تحليل الملف تلقائياً بواسطة Claude (Anthropic) لترتيبه وترجمته. الترجمة للمساعدة فقط وليست ترجمة محلّفة.",
    aboTitle: "ترتيب وترجمة", aboPitch: "نرتّب كل رسالة في المجلد الصحيح، ونترجمها للغتك، ونذكّرك بالمواعيد.",
    aboPrice: (p) => `${p} € شهرياً شامل الضريبة · يمكن الإلغاء شهرياً`, aboSubscribe: "اشترك الآن", aboActive: "الترتيب والترجمة مفعّلان",
    aboUntil: (d) => `تم الإلغاء – مفعّل حتى ${d}`, aboCancel: "إلغاء الاشتراك", aboCancelConfirm: "إلغاء الاشتراك؟ يبقى مفعّلاً حتى نهاية الشهر المدفوع.",
    aboNeeded: "بدون اشتراك تُحفظ الرسالة فقط، بدون ترتيب أو ترجمة.", aboThanks: "شكراً! يتفعّل اشتراكك فور تأكيد الدفع.", aboTerms: "تسري الشروط العامة (§ 8b).", aboLimit: (n) => `حتى ${n} ورقة في الشهر`, aboUsage: (u, n) => `${u} من ${n} ورقة هذا الشهر`, aboReached: "انتهى رصيدك لهذا الشهر. الأوراق الجديدة تُحفظ فقط دون ترتيب أو ترجمة.",
  },
  en: {
    title: "My documents", subtitle: "All your documents, sorted by authority and topic.",
    private: "Only you and EinStein can see these files.",
    folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Immigration office", finanzamt: "Tax office", familienkasse: "Family benefits / Kindergeld", krankenkasse: "Health insurance", rentenversicherung: "Pension insurance", wohnen: "Housing / landlord", arbeit: "Work / employer", schule: "School / daycare", bank: "Bank", versicherung: "Insurance", sonstiges: "Other" },
    files: (n) => (n === 1 ? "1 file" : `${n} files`), back: "All folders", upload: "Upload file",
    titleField: "Title (optional)", empty: "No files in this folder yet.", uploading: "Uploading…",
    byEinstein: "from EinStein", deleteConfirm: "Delete this file?", login: "Please sign in to see your documents.",
    error: "That didn't work. Please try again.", customer: "Customer (email)", open: "Open", customers: "Customers with documents",
    hint: "PDF, photo, Word or Excel – up to 20 MB.",
    autoTitle: "Upload – we sort and translate it", autoDesc: "Upload a letter (PDF or photo). It is put into the right folder automatically and translated into your language.",
    reminders: "Reminders", daysLeft: (n) => (n < 0 ? "overdue" : n === 0 ? "today" : `in ${n} days`), done: "Done", translateMine: "Translate into my language",
    processing: "Sorting and translating…", failed: "Automatic translation failed", tooLong: "This document is too long for automatic translation. It was only stored.", summary: "Summary", translation: "Translation", showTranslation: "Show translation", hideTranslation: "Hide translation", deadline: "Deadline", from: "From",
    aiNote: "The file is analysed automatically by Claude (Anthropic) to sort and translate it. The translation is a help, not a certified translation.",
    aboTitle: "Sorting & translation", aboPitch: "We sort every letter into the right folder, translate it into your language and remind you of deadlines.",
    aboPrice: (p) => `${p} € / month incl. VAT · cancel monthly`, aboSubscribe: "Subscribe now", aboActive: "Sorting & translation is active",
    aboUntil: (d) => `Cancelled – active until ${d}`, aboCancel: "Cancel subscription", aboCancelConfirm: "Cancel the subscription? It stays active until the end of the paid month.",
    aboNeeded: "Without a subscription the letter is only stored, not sorted or translated.", aboThanks: "Thank you! Your subscription starts as soon as the payment is confirmed.", aboTerms: "Our terms apply (AGB § 8b).", aboLimit: (n) => `Up to ${n} letters a month`, aboUsage: (u, n) => `${u} of ${n} letters this month`, aboReached: "Your monthly allowance is used up. New letters are only stored.",
  },
};
T.tr = {
  title: "Belgelerim", subtitle: "Tüm belgeleriniz kurum ve konuya göre sıralı.",
  private: "Bu dosyaları yalnızca siz ve EinStein görebilir.",
  folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Yabancılar dairesi", finanzamt: "Vergi dairesi", familienkasse: "Çocuk parası / Kindergeld", krankenkasse: "Sağlık sigortası", rentenversicherung: "Emeklilik sigortası", wohnen: "Konut / ev sahibi", arbeit: "İş / işveren", schule: "Okul / kreş", bank: "Banka", versicherung: "Sigorta", sonstiges: "Diğer" },
  files: (n) => `${n} dosya`, back: "Tüm klasörler", upload: "Dosya yükle",
  titleField: "Başlık (isteğe bağlı)", empty: "Bu klasörde henüz dosya yok.", uploading: "Yükleniyor…",
  byEinstein: "EinStein'dan", deleteConfirm: "Bu dosya silinsin mi?", login: "Belgelerinizi görmek için lütfen giriş yapın.",
  error: "Bu işlem olmadı. Lütfen tekrar deneyin.", customer: "Müşteri (e-posta)", open: "Aç", customers: "Belgesi olan müşteriler",
  hint: "PDF, fotoğraf, Word veya Excel – en fazla 20 MB.",
  autoTitle: "Yükleyin – biz sıralayıp çeviririz", autoDesc: "Bir mektup yükleyin (PDF veya fotoğraf). Otomatik olarak doğru klasöre yerleştirilir ve dilinize çevrilir.",
  reminders: "Hatırlatmalar", daysLeft: (n) => (n < 0 ? "süresi geçti" : n === 0 ? "bugün" : `${n} gün sonra`), done: "Tamam", translateMine: "Dilime çevir",
  processing: "Sıralanıyor ve çevriliyor…", failed: "Otomatik çeviri başarısız oldu", tooLong: "Bu belge otomatik çeviri için çok uzun. Yalnızca kaydedildi.", summary: "Özet", translation: "Çeviri", showTranslation: "Çeviriyi göster", hideTranslation: "Çeviriyi gizle", deadline: "Son tarih", from: "Gönderen",
  aiNote: "Dosya, sıralanması ve çevrilmesi için Claude (Anthropic) tarafından otomatik olarak analiz edilir. Çeviri bir yardımdır, yeminli çeviri değildir.",
  aboTitle: "Sıralama ve çeviri", aboPitch: "Her mektubu doğru klasöre yerleştirir, dilinize çevirir ve son tarihleri hatırlatırız.",
  aboPrice: (p) => `${p} € / ay KDV dahil · aylık iptal`, aboSubscribe: "Şimdi abone ol", aboActive: "Sıralama ve çeviri etkin",
  aboUntil: (d) => `İptal edildi – ${d} tarihine kadar etkin`, aboCancel: "Aboneliği iptal et", aboCancelConfirm: "Abonelik iptal edilsin mi? Ödenen ayın sonuna kadar etkin kalır.",
  aboNeeded: "Abonelik olmadan mektup yalnızca kaydedilir; sıralanmaz ve çevrilmez.", aboThanks: "Teşekkürler! Ödeme onaylanır onaylanmaz aboneliğiniz başlar.", aboTerms: "Şartlarımız geçerlidir (AGB § 8b).", aboLimit: (n) => `Ayda en fazla ${n} mektup`, aboUsage: (u, n) => `Bu ay ${n} mektuptan ${u} tanesi`, aboReached: "Aylık hakkınız doldu. Yeni mektuplar yalnızca kaydedilir.",
};
T.es = {
  title: "Mis documentos", subtitle: "Todos sus documentos, ordenados por organismo y tema.",
  private: "Solo usted y EinStein pueden ver estos archivos.",
  folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Oficina de extranjería", finanzamt: "Hacienda", familienkasse: "Prestación por hijos / Kindergeld", krankenkasse: "Seguro médico", rentenversicherung: "Seguro de pensiones", wohnen: "Vivienda / arrendador", arbeit: "Trabajo / empleador", schule: "Escuela / guardería", bank: "Banco", versicherung: "Seguros", sonstiges: "Otros" },
  files: (n) => (n === 1 ? "1 archivo" : `${n} archivos`), back: "Todas las carpetas", upload: "Subir archivo",
  titleField: "Título (opcional)", empty: "Aún no hay archivos en esta carpeta.", uploading: "Subiendo…",
  byEinstein: "de EinStein", deleteConfirm: "¿Eliminar este archivo?", login: "Inicie sesión para ver sus documentos.",
  error: "No ha funcionado. Inténtelo de nuevo.", customer: "Cliente (correo)", open: "Abrir", customers: "Clientes con documentos",
  hint: "PDF, foto, Word o Excel – hasta 20 MB.",
  autoTitle: "Súbalo – nosotros lo ordenamos y traducimos", autoDesc: "Suba una carta (PDF o foto). Se guarda automáticamente en la carpeta correcta y se traduce a su idioma.",
  reminders: "Recordatorios", daysLeft: (n) => (n < 0 ? "vencido" : n === 0 ? "hoy" : `en ${n} días`), done: "Hecho", translateMine: "Traducir a mi idioma",
  processing: "Ordenando y traduciendo…", failed: "La traducción automática ha fallado", tooLong: "Este documento es demasiado largo para la traducción automática. Solo se ha guardado.", summary: "Resumen", translation: "Traducción", showTranslation: "Mostrar traducción", hideTranslation: "Ocultar traducción", deadline: "Plazo", from: "De",
  aiNote: "Claude (Anthropic) analiza el archivo automáticamente para ordenarlo y traducirlo. La traducción es una ayuda, no una traducción jurada.",
  aboTitle: "Ordenar y traducir", aboPitch: "Ordenamos cada carta en la carpeta correcta, la traducimos a su idioma y le recordamos los plazos.",
  aboPrice: (p) => `${p} € / mes IVA incl. · cancelable mensualmente`, aboSubscribe: "Suscribirse ahora", aboActive: "Ordenar y traducir está activo",
  aboUntil: (d) => `Cancelada – activa hasta el ${d}`, aboCancel: "Cancelar suscripción", aboCancelConfirm: "¿Cancelar la suscripción? Sigue activa hasta el final del mes pagado.",
  aboNeeded: "Sin suscripción la carta solo se guarda; no se ordena ni se traduce.", aboThanks: "¡Gracias! Su suscripción empieza en cuanto se confirme el pago.", aboTerms: "Se aplican nuestras condiciones (AGB § 8b).", aboLimit: (n) => `Hasta ${n} cartas al mes`, aboUsage: (u, n) => `${u} de ${n} cartas este mes`, aboReached: "Ha agotado su cupo mensual. Las cartas nuevas solo se guardan.",
};
T.uk = {
  title: "Мої документи", subtitle: "Усі ваші документи, впорядковані за установами та темами.",
  private: "Ці файли бачите лише ви та EinStein.",
  folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Відомство у справах іноземців", finanzamt: "Податкова", familienkasse: "Сімейна каса / Kindergeld", krankenkasse: "Медична каса", rentenversicherung: "Пенсійне страхування", wohnen: "Житло / орендодавець", arbeit: "Робота / роботодавець", schule: "Школа / садок", bank: "Банк", versicherung: "Страхування", sonstiges: "Інше" },
  files: (n) => `Файлів: ${n}`, back: "Усі папки", upload: "Завантажити файл",
  titleField: "Назва (необов’язково)", empty: "У цій папці ще немає файлів.", uploading: "Завантаження…",
  byEinstein: "від EinStein", deleteConfirm: "Видалити цей файл?", login: "Увійдіть, щоб побачити свої документи.",
  error: "Не вдалося. Спробуйте ще раз.", customer: "Клієнт (e-mail)", open: "Відкрити", customers: "Клієнти з документами",
  hint: "PDF, фото, Word або Excel – до 20 МБ.",
  autoTitle: "Завантажте – ми впорядкуємо й перекладемо", autoDesc: "Завантажте лист (PDF або фото). Він автоматично потрапить у потрібну папку й буде перекладений вашою мовою.",
  reminders: "Нагадування", daysLeft: (n) => (n < 0 ? "прострочено" : n === 0 ? "сьогодні" : `через ${n} дн.`), done: "Виконано", translateMine: "Перекласти моєю мовою",
  processing: "Впорядковуємо й перекладаємо…", failed: "Автоматичний переклад не вдався", tooLong: "Цей документ задовгий для автоматичного перекладу. Його лише збережено.", summary: "Коротко", translation: "Переклад", showTranslation: "Показати переклад", hideTranslation: "Сховати переклад", deadline: "Строк", from: "Від",
  aiNote: "Файл автоматично аналізує Claude (Anthropic), щоб упорядкувати й перекласти його. Переклад – це допомога, а не завірений переклад.",
  aboTitle: "Впорядкування та переклад", aboPitch: "Ми розкладаємо кожен лист у потрібну папку, перекладаємо вашою мовою та нагадуємо про строки.",
  aboPrice: (p) => `${p} € / міс. з ПДВ · скасування щомісяця`, aboSubscribe: "Підписатися", aboActive: "Впорядкування та переклад активні",
  aboUntil: (d) => `Скасовано – активно до ${d}`, aboCancel: "Скасувати підписку", aboCancelConfirm: "Скасувати підписку? Вона діє до кінця оплаченого місяця.",
  aboNeeded: "Без підписки лист лише зберігається, без впорядкування й перекладу.", aboThanks: "Дякуємо! Підписка почне діяти, щойно оплату буде підтверджено.", aboTerms: "Діють наші умови (AGB § 8b).", aboLimit: (n) => `До ${n} листів на місяць`, aboUsage: (u, n) => `${u} з ${n} листів цього місяця`, aboReached: "Ваш місячний ліміт вичерпано. Нові листи лише зберігаються.",
};

function formatSize(bytes) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MyDocuments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = (() => { try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; } })();
  const t = T[lang] || T.de;
  const isRTL = lang === "ar";
  const user = getStoredAuthUser();
  // Admins and providers can open every customer's file
  const isAdmin = user?.role === "admin" || user?.role === "provider";
  const adminEmail = isAdmin ? (searchParams.get("email") || "") : "";

  const [data, setData] = useState({ folders: Object.keys(FOLDER_META), documents: [] });
  const [customers, setCustomers] = useState([]);
  const [folder, setFolder] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState(adminEmail);
  const fileInput = useRef(null);
  const autoInput = useRef(null);
  const [openId, setOpenId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [abo, setAbo] = useState(null);
  const [aboBusy, setAboBusy] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const aboReturn = searchParams.get("abo");

  const loadAbo = () => customerDocumentsApi.subscription().then(setAbo).catch(() => {});

  const subscribe = async () => {
    setAboBusy(true);
    setError("");
    try {
      const res = await customerDocumentsApi.subscribe(lang);
      window.location.href = res.url;
    } catch (e) {
      setError(e?.message || t.error);
      setAboBusy(false);
    }
  };

  const cancelAbo = async () => {
    if (!window.confirm(t.aboCancelConfirm)) return;
    setAboBusy(true);
    try {
      setAbo(await customerDocumentsApi.cancelSubscription());
    } catch (e) {
      setError(e?.message || t.error);
    } finally {
      setAboBusy(false);
    }
  };

  useEffect(() => {
    if (!user || isAdmin) return undefined;
    loadAbo();
    // Back from Stripe: the webhook may need a few seconds to activate the Abo
    if (aboReturn !== "1") return undefined;
    const timer = setInterval(loadAbo, 4000);
    const stop = setTimeout(() => clearInterval(timer), 40000);
    return () => { clearInterval(timer); clearTimeout(stop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aboReturn]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin && !adminEmail) {
        const res = await customerDocumentsApi.adminCustomers();
        setCustomers(res.customers || []);
      } else {
        const res = isAdmin ? await customerDocumentsApi.adminList(adminEmail) : await customerDocumentsApi.list();
        setData({ folders: res.folders || Object.keys(FOLDER_META), documents: res.documents || [] });
        customerDocumentsApi.reminders(isAdmin ? adminEmail : undefined).then((r) => setReminders(Array.isArray(r) ? r : [])).catch(() => {});
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmail]);

  // Refresh while documents are still being sorted/translated
  const hasPending = data.documents.some((d) => d.ai_status === "pending");
  useEffect(() => {
    if (!hasPending) return undefined;
    const timer = setInterval(() => { load(); }, 6000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPending]);

  const byFolder = useMemo(() => {
    const map = {};
    data.documents.forEach((d) => { (map[d.folder] = map[d.folder] || []).push(d); });
    return map;
  }, [data.documents]);

  const onUpload = async (event, targetFolder = folder) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !targetFolder) return;
    setUploading(true);
    setError("");
    try {
      if (isAdmin) await customerDocumentsApi.adminUpload({ email: adminEmail, file, folder: targetFolder, title });
      else await customerDocumentsApi.upload({ file, folder: targetFolder, title, lang });
      setTitle("");
      await load();
      if (!isAdmin) loadAbo();
    } catch (e) {
      setError(e?.message || t.error);
    } finally {
      setUploading(false);
    }
  };

  const onShare = async (doc) => {
    try {
      const blob = await customerDocumentsApi.blob(doc);
      await shareFiles([{ blob, name: doc.original_name || "document" }], doc.title);
    } catch {
      setError(t.error);
    }
  };

  const onDelete = async (doc) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await customerDocumentsApi.remove(doc.id);
      await load();
    } catch {
      setError(t.error);
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  if (!user) {
    return <div className="min-h-[60vh] flex items-center justify-center p-6 text-center text-gray-600">{t.login}</div>;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#2e1065]">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500"><Lock className="w-3.5 h-3.5" />{t.private}</p>
        </div>

        {isAdmin && (
          <form
            className="mb-6 flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => { e.preventDefault(); setFolder(null); setSearchParams(emailInput.trim() ? { email: emailInput.trim() } : {}); }}
          >
            <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={t.customer} type="email" className="sm:max-w-sm bg-white" />
            <Button type="submit" className="bg-[#2e1065] hover:bg-[#4c1d95]"><Users className="w-4 h-4 me-2" />{t.open}</Button>
          </form>
        )}

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" /></div>
        ) : isAdmin && !adminEmail ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-[#2e1065] mb-3">{t.customers}</h2>
            {customers.length === 0 ? <p className="text-sm text-gray-500">—</p> : (
              <ul className="divide-y">
                {customers.map((c) => (
                  <li key={c.user_email}>
                    <button className="w-full flex justify-between py-3 text-start hover:text-[#6B46C1]" onClick={() => { setEmailInput(c.user_email); setSearchParams({ email: c.user_email }); }}>
                      <span>{c.user_email}</span><span className="text-sm text-gray-500">{t.files(Number(c.documents))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : !folder ? (
          <>
          {!caseOpen && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#6B46C1] to-[#4c2f9e] p-5 md:p-6 text-white flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="flex items-center gap-2 text-lg font-bold"><Sparkles className="w-5 h-5 text-[#e8c547]" />{t.autoTitle}</p>
              <p className="text-sm text-white/80 mt-1">{t.autoDesc}</p>
              <p className="text-[11px] text-white/60 mt-2">{t.aiNote}</p>
            </div>
            <input ref={autoInput} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => onUpload(e, "auto")} />
            <Button onClick={() => autoInput.current?.click()} disabled={uploading} className="bg-white text-[#4c2f9e] hover:bg-white/90 font-bold">
              {uploading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Upload className="w-4 h-4 me-2" />}
              {uploading ? t.uploading : t.upload}
            </Button>
          </div>
          )}
          {abo && (abo.active ? (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white p-4">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <p className="flex-1 font-semibold text-[#2e1065]">
                {abo.ends_at ? t.aboUntil(new Date(abo.ends_at).toLocaleDateString(lang === "ar" ? "ar" : lang)) : t.aboActive}
              </p>
              {abo.limit > 0 && (
                <p className={`order-last w-full text-sm ${abo.used >= abo.limit ? "font-semibold text-amber-700" : "text-gray-500"}`}>
                  {abo.used >= abo.limit ? t.aboReached : t.aboUsage(abo.used, abo.limit)}
                </p>
              )}
              {!abo.ends_at && (
                <Button variant="ghost" onClick={cancelAbo} disabled={aboBusy} className="text-gray-600">{t.aboCancel}</Button>
              )}
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50 p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-[#2e1065]">{t.aboTitle}</p>
                <p className="text-sm text-[#2e1065]/80 mt-1">{aboReturn === "1" ? t.aboThanks : `${t.aboPitch} ${t.aboNeeded}`}</p>
                <p className="mt-2 font-bold text-[#6B46C1]">{t.aboPrice(Number(abo.price).toFixed(2).replace(".", ","))}</p>
                {abo.limit > 0 && <p className="text-sm text-[#2e1065]/80">{t.aboLimit(abo.limit)}</p>}
                <p className="text-[11px] text-gray-500 mt-1">{t.aboTerms}</p>
              </div>
              <Button onClick={subscribe} disabled={aboBusy || aboReturn === "1"} className="bg-[#6B46C1] hover:bg-[#805AD5] font-bold">
                {aboBusy ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Sparkles className="w-4 h-4 me-2" />}
                {t.aboSubscribe}
              </Button>
            </div>
          ))}
          {!isAdmin && <CustomerCases lang={lang} abo={abo} onOpenChange={setCaseOpen} onUploaded={loadAbo} />}
          {!caseOpen && (
          <>
          {reminders.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-[#2e1065] mb-3">{t.reminders}</h2>
              <ul className="space-y-2">
                {reminders.map((r) => {
                  const days = Math.round((new Date(r.due_date) - new Date(new Date().toDateString())) / 86400000);
                  const tone = days < 0 ? "bg-red-50 text-red-700" : days <= 14 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700";
                  return (
                    <li key={r.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                      <CalendarClock className="w-5 h-5 text-[#6B46C1] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#2e1065]">{r.title}</p>
                        <p className="text-xs text-gray-500">{t.folders[r.folder] || r.folder} · {new Date(r.due_date).toLocaleDateString(lang === "ar" ? "ar" : lang)}</p>
                        {r.details && <p className="text-xs text-gray-600 mt-1">{r.details}</p>}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{(t.daysLeft || T.en.daysLeft)(days)}</span>
                      {!isAdmin && (
                        <Button size="sm" variant="outline" onClick={() => customerDocumentsApi.updateReminder(r.id, { status: "done" }).then(() => setReminders((x) => x.filter((y) => y.id !== r.id))).catch(() => setError(t.error))}>
                          {t.done || T.en.done}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {hasPending && (
            <p className="mb-4 flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-3 text-sm text-[#6B46C1]"><Loader2 className="w-4 h-4 animate-spin" />{t.processing}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.folders.map((key) => {
              const meta = FOLDER_META[key] || FOLDER_META.sonstiges;
              const Icon = meta.icon;
              const count = byFolder[key]?.length || 0;
              return (
                <button key={key} onClick={() => setFolder(key)} className="group bg-white rounded-2xl border border-gray-100 p-5 text-start shadow-sm hover:shadow-md hover:border-[#6B46C1]/40 transition">
                  <div className={`w-11 h-11 ${meta.color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5 text-white" /></div>
                  <p className="font-semibold text-[#2e1065] leading-tight">{t.folders[key] || key}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.files(count)}</p>
                </button>
              );
            })}
          </div>
          </>
          )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
            <button onClick={() => setFolder(null)} className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline"><BackIcon className="w-4 h-4" />{t.back}</button>
            <h2 className="text-xl font-bold text-[#2e1065] mb-4">{t.folders[folder] || folder}</h2>

            <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titleField} className="sm:max-w-xs" />
              <input ref={fileInput} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,.xls,.xlsx,.txt" onChange={onUpload} />
              <Button onClick={() => fileInput.current?.click()} disabled={uploading} className="bg-[#6B46C1] hover:bg-[#805AD5]">
                {uploading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Upload className="w-4 h-4 me-2" />}
                {uploading ? t.uploading : t.upload}
              </Button>
              <span className="text-xs text-gray-400">{t.hint}</span>
            </div>

            {(byFolder[folder] || []).length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t.empty}</p>
            ) : (
              <ul className="divide-y">
                {byFolder[folder].map((doc) => (
                  <li key={doc.id} className="py-3">
                   <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#6B46C1] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#2e1065] truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString(lang === "ar" ? "ar" : lang)} · {formatSize(doc.size)}
                        {doc.uploaded_by === "einstein" && <span className="ms-2 rounded bg-purple-50 px-1.5 py-0.5 text-[#6B46C1]">{t.byEinstein}</span>}
                      </p>
                    </div>
                    <OriginalViewer doc={doc} lang={lang} />
                    <Button variant="outline" size="icon" onClick={() => onShare(doc)} aria-label="Share" title="Share"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => customerDocumentsApi.download(doc).catch(() => setError(t.error))} aria-label="Download"><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(doc)} aria-label="Delete" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                   </div>
                   {doc.ai_status === "pending" && (
                     <p className="mt-2 ms-8 flex items-center gap-2 text-xs text-[#6B46C1]"><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.processing}</p>
                   )}
                   {doc.ai_status === "failed" && <p className="mt-2 ms-8 text-xs text-red-600">{t.failed}</p>}
                   {doc.ai_status === "too_long" && <p className="mt-2 ms-8 text-xs text-amber-700">{t.tooLong}</p>}
                   {doc.ai_status === "done" && (
                     <div className="mt-2 ms-8 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 space-y-2">
                       {(doc.sender || doc.deadline) && (
                         <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                           {doc.sender && <span><strong>{t.from}:</strong> {doc.sender}</span>}
                           {doc.deadline && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800"><CalendarClock className="w-3.5 h-3.5" />{t.deadline}: {new Date(doc.deadline).toLocaleDateString(lang === "ar" ? "ar" : lang)}</span>}
                         </p>
                       )}
                       {doc.summary && <p><strong>{t.summary}:</strong> {doc.summary}</p>}
                       {doc.translation && (
                         <div>
                           <button onClick={() => setOpenId(openId === doc.id ? null : doc.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B46C1]">
                             <ChevronDown className={`w-3.5 h-3.5 transition ${openId === doc.id ? "rotate-180" : ""}`} />
                             {openId === doc.id ? t.hideTranslation : t.showTranslation}
                           </button>
                           {openId === doc.id && <p className="mt-2 whitespace-pre-line rounded-lg bg-white p-3 border border-gray-100 leading-relaxed">{doc.translation}</p>}
                           {doc.translation_language && doc.translation_language !== lang && !isAdmin && (
                             <button
                               onClick={() => customerDocumentsApi.translate(doc.id, lang).then(load).catch(() => setError(t.error))}
                               className="ms-3 text-xs font-semibold text-[#6B46C1] underline"
                             >
                               {t.translateMine || T.en.translateMine}
                             </button>
                           )}
                         </div>
                       )}
                     </div>
                   )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
