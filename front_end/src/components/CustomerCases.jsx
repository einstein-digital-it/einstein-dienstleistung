import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Folder, FolderOpen, FolderPlus, ListChecks, Loader2, Share2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerDocumentsApi } from "@/api/backendClient";
import { shareFiles } from "@/lib/shareFiles";
import OriginalViewer from "@/components/OriginalViewer";

const OVERVIEW = "__overview";
const UNSORTED = "__unsorted";
const OVERVIEW_LABEL = "00_Uebersicht";

const T = {
  de: { title: "Meine eigenen Akten", intro: "Erstellen Sie eine Akte und laden Sie Ihre Unterlagen hoch. Mit dem Abo werden sie automatisch in nummerierte Ordner sortiert.", add: "Neue Akte", name: "Name, z. B. Max Mustermann", create: "Erstellen", cancel: "Abbrechen", files: (n) => (n === 1 ? "1 Datei" : `${n} Dateien`), back: "Zurück", upload: "Unterlagen hochladen", uploading: (d, a) => `Lade ${d} von ${a} hoch…`, failed: (n) => `${n} Dateien konnten nicht hochgeladen werden.`, empty: "Noch keine Unterlagen. Sie können mehrere Dateien auf einmal auswählen.", unsorted: "Nicht sortiert", translateNow: "Übersetzen", processing: "Wird bearbeitet…", remove: "Akte löschen", removeConfirm: "Diese Akte und alle Unterlagen endgültig löschen?", removeDoc: "Datei wirklich löschen?", share: "Teilen", downloaded: "Ihr Browser kann diese Dateien nicht teilen. Sie wurden heruntergeladen, damit Sie sie weiterschicken können.", error: "Das hat nicht geklappt. Bitte erneut versuchen.", aboHint: "Ohne Abo werden die Unterlagen nur gespeichert, nicht sortiert.", limitReached: "Ihr Monatskontingent ist aufgebraucht. Neue Unterlagen werden nur gespeichert.", tooLong: "Dieses Dokument ist zu lang für die automatische Übersetzung. Es wurde nur gespeichert.", aiFailed: "Automatische Übersetzung fehlgeschlagen", summary: "Kurz gefasst", translation: "Übersetzung" },
  ar: { title: "ملفاتي الخاصة", intro: "أنشئ ملفاً وارفع أوراقك، ومع الاشتراك تترتب تلقائياً في مجلدات مرقمة.", add: "ملف جديد", name: "الاسم، مثلاً Max Mustermann", create: "إنشاء", cancel: "إلغاء", files: (n) => (n === 1 ? "ملف واحد" : `${n} ملفات`), back: "رجوع", upload: "ارفع الأوراق", uploading: (d, a) => `جارٍ رفع ${d} من ${a}…`, failed: (n) => `تعذر رفع ${n} ملف.`, empty: "لا توجد أوراق بعد. يمكنك اختيار عدة ملفات مرة واحدة.", unsorted: "بدون ترتيب", translateNow: "ترجمة", processing: "جارٍ المعالجة…", remove: "حذف الملف", removeConfirm: "هل تريد حذف هذا الملف وكل أوراقه نهائياً؟", removeDoc: "هل تريد حذف هذه الورقة؟", share: "مشاركة", downloaded: "متصفحك لا يدعم مشاركة هذه الملفات، لذلك تم تنزيلها لتتمكن من إرسالها.", error: "لم تنجح العملية. حاول مرة أخرى.", aboHint: "بدون اشتراك تُحفظ الأوراق فقط دون ترتيب.", limitReached: "انتهى رصيدك لهذا الشهر. الأوراق الجديدة تُحفظ فقط دون ترتيب.", tooLong: "هذا الملف طويل جداً على الترجمة التلقائية، لذلك تم حفظه فقط.", aiFailed: "فشلت الترجمة التلقائية", summary: "باختصار", translation: "الترجمة" },
  en: { title: "My own files", intro: "Create a file and upload your papers. With the subscription they are sorted into numbered folders automatically.", add: "New file", name: "Name, e.g. Max Mustermann", create: "Create", cancel: "Cancel", files: (n) => (n === 1 ? "1 file" : `${n} files`), back: "Back", upload: "Upload papers", uploading: (d, a) => `Uploading ${d} of ${a}…`, failed: (n) => `${n} files could not be uploaded.`, empty: "No papers yet. You can choose several files at once.", unsorted: "Not sorted", translateNow: "Translate", processing: "Processing…", remove: "Delete file", removeConfirm: "Delete this file and all its papers for good?", removeDoc: "Delete this paper?", share: "Share", downloaded: "Your browser cannot share these files, so they were downloaded for you to send on.", error: "That didn't work. Please try again.", aboHint: "Without a subscription the papers are only stored, not sorted.", limitReached: "Your monthly allowance is used up. New papers are only stored.", tooLong: "This document is too long for automatic translation. It was only stored.", aiFailed: "Automatic translation failed", summary: "In short", translation: "Translation" },
};
T.tr = { title: "Kendi dosyalarım", intro: "Bir dosya oluşturun ve belgelerinizi yükleyin. Abonelikle otomatik olarak numaralı klasörlere sıralanır.", add: "Yeni dosya", name: "Ad, örn. Max Mustermann", create: "Oluştur", cancel: "İptal", files: (n) => `${n} belge`, back: "Geri", upload: "Belge yükle", uploading: (d, a) => `${a} belgeden ${d}. yükleniyor…`, failed: (n) => `${n} belge yüklenemedi.`, empty: "Henüz belge yok. Birden fazla dosyayı aynı anda seçebilirsiniz.", unsorted: "Sıralanmamış", translateNow: "Çevir", processing: "İşleniyor…", remove: "Dosyayı sil", removeConfirm: "Bu dosya ve tüm belgeleri kalıcı olarak silinsin mi?", removeDoc: "Bu belge silinsin mi?", share: "Paylaş", downloaded: "Tarayıcınız bu dosyaları paylaşamıyor; gönderebilmeniz için indirildi.", error: "Bu işlem olmadı. Lütfen tekrar deneyin.", aboHint: "Abonelik olmadan belgeler yalnızca kaydedilir, sıralanmaz.", limitReached: "Aylık hakkınız doldu. Yeni belgeler yalnızca kaydedilir.", tooLong: "Bu belge otomatik çeviri için çok uzun. Yalnızca kaydedildi.", aiFailed: "Otomatik çeviri başarısız oldu", summary: "Özet", translation: "Çeviri" };
T.es = { title: "Mis expedientes", intro: "Cree un expediente y suba sus documentos. Con la suscripción se ordenan automáticamente en carpetas numeradas.", add: "Nuevo expediente", name: "Nombre, p. ej. Max Mustermann", create: "Crear", cancel: "Cancelar", files: (n) => (n === 1 ? "1 archivo" : `${n} archivos`), back: "Atrás", upload: "Subir documentos", uploading: (d, a) => `Subiendo ${d} de ${a}…`, failed: (n) => `No se pudieron subir ${n} archivos.`, empty: "Aún no hay documentos. Puede elegir varios archivos a la vez.", unsorted: "Sin ordenar", translateNow: "Traducir", processing: "Procesando…", remove: "Eliminar expediente", removeConfirm: "¿Eliminar definitivamente este expediente y todos sus documentos?", removeDoc: "¿Eliminar este documento?", share: "Compartir", downloaded: "Su navegador no puede compartir estos archivos; se han descargado para que pueda enviarlos.", error: "No ha funcionado. Inténtelo de nuevo.", aboHint: "Sin suscripción los documentos solo se guardan, no se ordenan.", limitReached: "Ha agotado su cupo mensual. Los documentos nuevos solo se guardan.", tooLong: "Este documento es demasiado largo para la traducción automática. Solo se ha guardado.", aiFailed: "La traducción automática ha fallado", summary: "Resumen", translation: "Traducción" };
T.uk = { title: "Мої власні справи", intro: "Створіть справу й завантажте документи. З підпискою вони автоматично впорядкуються в нумеровані папки.", add: "Нова справа", name: "Назва, напр. Max Mustermann", create: "Створити", cancel: "Скасувати", files: (n) => `Файлів: ${n}`, back: "Назад", upload: "Завантажити документи", uploading: (d, a) => `Завантаження ${d} з ${a}…`, failed: (n) => `Не вдалося завантажити файлів: ${n}.`, empty: "Документів ще немає. Можна обрати кілька файлів одразу.", unsorted: "Не впорядковано", translateNow: "Перекласти", processing: "Обробляємо…", remove: "Видалити справу", removeConfirm: "Видалити цю справу та всі її документи назавжди?", removeDoc: "Видалити цей документ?", share: "Поділитися", downloaded: "Ваш браузер не може поділитися цими файлами, тому їх завантажено, щоб ви могли їх надіслати.", error: "Не вдалося. Спробуйте ще раз.", aboHint: "Без підписки документи лише зберігаються, без впорядкування.", limitReached: "Ваш місячний ліміт вичерпано. Нові документи лише зберігаються.", tooLong: "Цей документ задовгий для автоматичного перекладу. Його лише збережено.", aiFailed: "Автоматичний переклад не вдався", summary: "Коротко", translation: "Переклад" };

const baseName = (name) => String(name || "document").split(/[/\\]/).pop();

export default function CustomerCases({ lang, abo, onOpenChange, onUploaded }) {
  const t = T[lang] || T.de;
  const BackIcon = lang === "ar" ? ChevronRight : ChevronLeft;
  const [cases, setCases] = useState([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState(null);
  const [view, setView] = useState(null); // OVERVIEW, UNSORTED or a section name
  const [progress, setProgress] = useState("");
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState("");
  const [openId, setOpenId] = useState(null);
  const input = useRef(null);

  const loadCases = () => customerDocumentsApi.cases().then((list) => setCases(Array.isArray(list) ? list : [])).catch(() => {});
  const refresh = (id) => customerDocumentsApi.caseDetail(id).then(setDetail).catch(() => setNotice(t.error));

  useEffect(() => { loadCases(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // While the AI is sorting, keep the folders up to date
  const hasPending = detail?.documents.some((d) => d.ai_status === "pending");
  useEffect(() => {
    if (!hasPending) return undefined;
    const timer = setInterval(() => refresh(detail.id), 6000);
    return () => clearInterval(timer);
  }, [hasPending, detail?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = async (id) => {
    setNotice("");
    try {
      setDetail(await customerDocumentsApi.caseDetail(id));
      setView(null);
      onOpenChange?.(true);
    } catch {
      setNotice(t.error);
    }
  };

  const close = () => {
    setDetail(null);
    setView(null);
    setNotice("");
    onOpenChange?.(false);
    loadCases();
  };

  const create = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const created = await customerDocumentsApi.createCase(name.trim());
      setName("");
      setCreating(false);
      await open(created.id);
    } catch {
      setNotice(t.error);
    }
  };

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !detail) return;
    setNotice("");
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      setProgress(t.uploading(i + 1, files.length));
      try {
        await customerDocumentsApi.uploadToCase(detail.id, { file: files[i], lang });
      } catch {
        failed++;
      }
    }
    setProgress("");
    if (failed) setNotice(t.failed(failed));
    await refresh(detail.id);
    onUploaded?.();
  };

  const removeCase = async () => {
    if (!window.confirm(t.removeConfirm)) return;
    try {
      await customerDocumentsApi.deleteCase(detail.id);
      close();
    } catch {
      setNotice(t.error);
    }
  };

  const removeDoc = async (doc) => {
    if (!window.confirm(t.removeDoc)) return;
    try {
      await customerDocumentsApi.remove(doc.id);
      await refresh(detail.id);
    } catch {
      setNotice(t.error);
    }
  };

  /** Sharing a whole file keeps the folder number in each file name. */
  const share = async (docs, title, withFolderNumber = false) => {
    if (!docs.length || sharing) return;
    setSharing(true);
    setNotice("");
    try {
      const used = new Set();
      const items = [];
      for (const doc of docs) {
        const label = detail.sections.find((s) => s.name === doc.section)?.label || t.unsorted;
        let fileName = withFolderNumber ? `${label}_${baseName(doc.original_name)}` : baseName(doc.original_name);
        if (used.has(fileName)) fileName = `${doc.id}_${fileName}`;
        used.add(fileName);
        items.push({ blob: await customerDocumentsApi.blob(doc), name: fileName });
      }
      if ((await shareFiles(items, title)) === "downloaded") setNotice(t.downloaded);
    } catch {
      setNotice(t.error);
    } finally {
      setSharing(false);
    }
  };

  const ShareButton = ({ docs, title, withFolderNumber }) => (
    <Button variant="outline" size="icon" onClick={() => share(docs, title, withFolderNumber)} disabled={sharing || !docs.length} aria-label={t.share} title={t.share}>
      {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
    </Button>
  );

  const noticeBox = notice && <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>;

  // ------------------------------------------------------------ list
  if (!detail) {
    return (
      <section className="mb-6 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <h2 className="font-bold text-[#2e1065]">{t.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.intro}</p>
          </div>
          <Button onClick={() => setCreating((v) => !v)} className="bg-[#6B46C1] hover:bg-[#805AD5] font-bold"><FolderPlus className="w-4 h-4 me-2" />{t.add}</Button>
        </div>
        {creating && (
          <form onSubmit={create} className="mt-4 flex flex-col sm:flex-row gap-2">
            <Input autoFocus maxLength={120} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.name} className="sm:max-w-sm" />
            <Button type="submit" className="bg-[#2e1065] hover:bg-[#4c1d95]">{t.create}</Button>
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>{t.cancel}</Button>
          </form>
        )}
        {notice && <p className="mt-3 text-sm text-red-700">{notice}</p>}
        {cases.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cases.map((item) => (
              <button key={item.id} onClick={() => open(item.id)} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 text-start hover:border-[#6B46C1]/40 hover:shadow-sm transition">
                <Folder className="w-6 h-6 text-[#6B46C1] shrink-0" />
                <span className="min-w-0">
                  <span className="block font-semibold text-[#2e1065] truncate">{item.name}</span>
                  <span className="block text-xs text-gray-500">{t.files(Number(item.documents_count || 0))}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }

  // ------------------------------------------------------------ one folder
  if (view) {
    const docs = view === OVERVIEW ? detail.documents : detail.documents.filter((d) => (view === UNSORTED ? !d.section : d.section === view));
    const label = view === OVERVIEW ? OVERVIEW_LABEL : view === UNSORTED ? t.unsorted : detail.sections.find((s) => s.name === view)?.label;
    return (
      <section className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
        <button onClick={() => { setNotice(""); setView(null); }} className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline"><BackIcon className="w-4 h-4" />{detail.name}</button>
        {noticeBox}
        <div className="mb-4 flex items-center gap-3">
          <h2 dir="ltr" className="flex-1 text-xl font-bold text-[#2e1065] text-start">{label}</h2>
          <ShareButton docs={docs} title={label} />
        </div>
        <ul className="divide-y">
          {docs.map((doc) => (
            <li key={doc.id} className="py-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#6B46C1] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#2e1065] truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString(lang === "ar" ? "ar" : lang)}</p>
                </div>
                <OriginalViewer doc={doc} lang={lang} />
                <ShareButton docs={[doc]} title={doc.title} />
                <Button variant="outline" size="icon" onClick={() => customerDocumentsApi.download(doc).catch(() => setNotice(t.error))} aria-label="Download"><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => removeDoc(doc)} aria-label="Delete" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
              </div>
              {doc.ai_status === "pending" && <p className="mt-2 ms-8 flex items-center gap-2 text-xs text-[#6B46C1]"><Loader2 className="w-3.5 h-3.5 animate-spin" />{t.processing}</p>}
              {doc.ai_status === "too_long" && <p className="mt-2 ms-8 text-xs text-amber-700">{t.tooLong}</p>}
              {doc.ai_status === "failed" && <p className="mt-2 ms-8 text-xs text-red-600">{t.aiFailed}</p>}
              {doc.summary && <p className="mt-2 ms-8 rounded-xl bg-gray-50 p-3 text-sm text-gray-700"><strong>{t.summary}:</strong> {doc.summary}</p>}
              {doc.ai_status === "done" && !doc.translation && (
                <button
                  onClick={() => customerDocumentsApi.translate(doc.id, lang).then(() => refresh(detail.id)).catch((err) => setNotice(err.status === 402 ? t.aboHint : err.status === 429 ? t.limitReached : t.error))}
                  className="mt-2 ms-8 inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#6B46C1] transition hover:border-[#7c3aed] hover:bg-purple-50"
                >
                  {t.translateNow}
                </button>
              )}
              {doc.translation && (
                <div className="mt-2 ms-8">
                  <button onClick={() => setOpenId(openId === doc.id ? null : doc.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B46C1]">
                    <ChevronDown className={`w-3.5 h-3.5 transition ${openId === doc.id ? "rotate-180" : ""}`} />{t.translation}
                  </button>
                  {openId === doc.id && <p className="mt-2 whitespace-pre-line rounded-lg border border-gray-100 p-3 text-sm leading-relaxed">{doc.translation}</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // ------------------------------------------------------------ one file
  const unsorted = detail.documents.filter((d) => !d.section);
  const row = (label, count, Icon, key) => (
    <button key={key} onClick={() => { setNotice(""); setView(key); }} className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 hover:border-[#6B46C1]/40 hover:shadow-sm transition">
      <Icon className="w-5 h-5 text-[#7c3aed] shrink-0" />
      <span dir="ltr" className="flex-1 truncate text-start font-semibold text-[#2e1065]">{label}</span>
      <span className="text-sm font-bold text-gray-400">{count}</span>
    </button>
  );

  return (
    <section className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
      <button onClick={close} className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline"><BackIcon className="w-4 h-4" />{t.back}</button>
      {noticeBox}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="min-w-[180px] flex-1 text-xl font-bold text-[#2e1065]">{detail.name}</h2>
        <input ref={input} type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,.xls,.xlsx,.txt" onChange={upload} />
        <Button onClick={() => input.current?.click()} disabled={Boolean(progress)} className="bg-[#6B46C1] hover:bg-[#805AD5] font-bold">
          {progress ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Upload className="w-4 h-4 me-2" />}{progress || t.upload}
        </Button>
        <ShareButton docs={detail.documents} title={detail.name} withFolderNumber />
        <Button variant="ghost" size="icon" onClick={removeCase} aria-label={t.remove} title={t.remove} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
      </div>
      {abo && !abo.active && <p className="mb-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-[#6B46C1]">{t.aboHint}</p>}
      {abo?.active && abo.limit > 0 && abo.used >= abo.limit && <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{t.limitReached}</p>}
      {hasPending && <p className="mb-4 flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-3 text-sm text-[#6B46C1]"><Loader2 className="w-4 h-4 animate-spin" />{t.processing}</p>}
      {detail.documents.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">{t.empty}</p>
      ) : (
        <div className="space-y-2">
          {row(OVERVIEW_LABEL, detail.documents.length, ListChecks, OVERVIEW)}
          {detail.sections.map((s) => row(s.label, detail.documents.filter((d) => d.section === s.name).length, Folder, s.name))}
          {unsorted.length > 0 && row(t.unsorted, unsorted.length, FolderOpen, UNSORTED)}
        </div>
      )}
    </section>
  );
}
