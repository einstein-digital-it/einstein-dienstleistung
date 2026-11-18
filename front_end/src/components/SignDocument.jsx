import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, PenLine, Share2, X } from "lucide-react";
import { customerDocumentsApi } from "@/api/backendClient";
import { shareFiles } from "@/lib/shareFiles";
import SignaturePad, { loadSignature } from "@/components/SignaturePad";

/**
 * Sign any PDF or photo from "My documents": pick the page, drag the signature to its place,
 * then download, share or e-mail the signed PDF. Everything happens in the browser;
 * the signature and the signed file are not sent to the server.
 */
const T = {
  de: { title: "Dokument unterschreiben", loading: "Dokument wird geladen…", page: "Seite", of: "von", drag: "Ziehen Sie die Unterschrift an die richtige Stelle. Größe:", sign: "Unterschrift zeichnen", resign: "Neu zeichnen", needSign: "Zeichnen Sie zuerst Ihre Unterschrift.", pdf: "Unterschriebenes PDF herunterladen", share: "Teilen", mail: "Per E-Mail senden", mailHint: "Das PDF wurde heruntergeladen – hängen Sie es an die E-Mail an.", close: "Schließen", error: "Das Dokument konnte nicht geöffnet werden.", unsupported: "Nur PDF und Fotos (JPG, PNG) können unterschrieben werden.", note: "Einfache elektronische Unterschrift. Wo die Behörde Schriftform verlangt, bitte ausdrucken und von Hand unterschreiben." },
  ar: { title: "توقيع المستند", loading: "جارٍ تحميل المستند…", page: "الصفحة", of: "من", drag: "اسحب التوقيع إلى المكان الصحيح. الحجم:", sign: "ارسم توقيعك", resign: "أعد الرسم", needSign: "ارسم توقيعك أولاً.", pdf: "تنزيل ملف PDF الموقّع", share: "مشاركة", mail: "إرسال بالبريد الإلكتروني", mailHint: "تم تنزيل ملف PDF – أرفقه بالرسالة الإلكترونية.", close: "إغلاق", error: "تعذّر فتح المستند.", unsupported: "يمكن توقيع ملفات PDF والصور (JPG وPNG) فقط.", note: "توقيع إلكتروني بسيط. إذا طلبت الجهة الرسمية نسخة موقّعة بخط اليد، فاطبع المستند ووقّعه بيدك." },
  en: { title: "Sign document", loading: "Loading the document…", page: "Page", of: "of", drag: "Drag the signature to the right place. Size:", sign: "Draw signature", resign: "Draw again", needSign: "Draw your signature first.", pdf: "Download signed PDF", share: "Share", mail: "Send by e-mail", mailHint: "The PDF was downloaded – attach it to the e-mail.", close: "Close", error: "The document could not be opened.", unsupported: "Only PDFs and photos (JPG, PNG) can be signed.", note: "Simple electronic signature. Where the authority requires a handwritten original, please print and sign by hand." },
  tr: { title: "Belgeyi imzala", loading: "Belge yükleniyor…", page: "Sayfa", of: "/", drag: "İmzayı doğru yere sürükleyin. Boyut:", sign: "İmza çiz", resign: "Yeniden çiz", needSign: "Önce imzanızı çizin.", pdf: "İmzalı PDF'i indir", share: "Paylaş", mail: "E-posta ile gönder", mailHint: "PDF indirildi – e-postaya ekleyin.", close: "Kapat", error: "Belge açılamadı.", unsupported: "Yalnızca PDF ve fotoğraflar (JPG, PNG) imzalanabilir.", note: "Basit elektronik imza. Kurum ıslak imza istiyorsa yazdırıp elle imzalayın." },
  es: { title: "Firmar documento", loading: "Cargando el documento…", page: "Página", of: "de", drag: "Arrastre la firma al lugar correcto. Tamaño:", sign: "Dibujar firma", resign: "Dibujar de nuevo", needSign: "Dibuje primero su firma.", pdf: "Descargar PDF firmado", share: "Compartir", mail: "Enviar por correo", mailHint: "Se ha descargado el PDF: adjúntelo al correo.", close: "Cerrar", error: "No se pudo abrir el documento.", unsupported: "Solo se pueden firmar PDF y fotos (JPG, PNG).", note: "Firma electrónica simple. Si la autoridad exige el original firmado a mano, imprímalo y fírmelo." },
  uk: { title: "Підписати документ", loading: "Документ завантажується…", page: "Сторінка", of: "з", drag: "Перетягніть підпис у потрібне місце. Розмір:", sign: "Намалювати підпис", resign: "Намалювати знову", needSign: "Спершу намалюйте підпис.", pdf: "Завантажити підписаний PDF", share: "Поділитися", mail: "Надіслати поштою", mailHint: "PDF завантажено – додайте його до листа.", close: "Закрити", error: "Не вдалося відкрити документ.", unsupported: "Підписати можна лише PDF і фото (JPG, PNG).", note: "Проста електронна підпис. Якщо установа вимагає власноручний підпис, роздрукуйте й підпишіть від руки." },
};

const kindOf = (doc) => {
  const name = String(doc.original_name || "").toLowerCase();
  const mime = String(doc.mime_type || "").toLowerCase();
  if (name.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (/\.(jpe?g|png)$/.test(name) || ["image/jpeg", "image/png"].includes(mime)) return "image";
  return null;
};

export const canSign = (doc) => kindOf(doc) !== null;

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

export default function SignDocument({ doc, lang, onClose }) {
  const t = T[lang] || T.de;
  const kind = kindOf(doc);
  const canvas = useRef(null);
  const stage = useRef(null);
  const [bytes, setBytes] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(kind ? "" : t.unsupported);
  const [signature, setSignature] = useState(loadSignature);
  const [drawing, setDrawing] = useState(false);
  // Position (top-left) and width of the signature as a share of the page
  const [pos, setPos] = useState({ x: 0.55, y: 0.78, w: 0.3 });
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const drag = useRef(null);

  useEffect(() => {
    if (!kind) return;
    let cancelled = false;
    (async () => {
      try {
        const blob = await customerDocumentsApi.blob(doc);
        const data = new Uint8Array(await blob.arrayBuffer());
        if (cancelled) return;
        setBytes(data);
        if (kind === "pdf") {
          const pdfjs = await loadPdfJs();
          const loaded = await pdfjs.getDocument({ data: data.slice() }).promise;
          if (cancelled) return;
          setPdf(loaded);
          setPages(loaded.numPages);
          setPage(loaded.numPages); // signatures usually go on the last page
        }
      } catch {
        if (!cancelled) setError(t.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doc, kind, t.error]);

  // Draw the chosen page (or the photo) as the background to place the signature on
  useEffect(() => {
    const c = canvas.current;
    if (!c || !bytes) return;
    let task;
    (async () => {
      const maxWidth = Math.min(stage.current?.clientWidth || 600, 720);
      if (kind === "pdf" && pdf) {
        const p = await pdf.getPage(page);
        const base = p.getViewport({ scale: 1 });
        const viewport = p.getViewport({ scale: (maxWidth / base.width) * (window.devicePixelRatio || 1) });
        c.width = viewport.width;
        c.height = viewport.height;
        c.style.width = `${maxWidth}px`;
        c.style.height = `${(maxWidth / base.width) * base.height}px`;
        task = p.render({ canvasContext: c.getContext("2d"), viewport });
        await task.promise.catch(() => {});
      } else if (kind === "image") {
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([bytes]));
        await img.decode();
        const scale = maxWidth / img.naturalWidth;
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.style.width = `${maxWidth}px`;
        c.style.height = `${img.naturalHeight * scale}px`;
        c.getContext("2d").drawImage(img, 0, 0);
        URL.revokeObjectURL(img.src);
      }
    })();
    return () => task?.cancel?.();
  }, [bytes, pdf, page, kind]);

  const startDrag = (e) => {
    e.preventDefault();
    const box = canvas.current.getBoundingClientRect();
    drag.current = { box, dx: e.clientX - box.left - pos.x * box.width, dy: e.clientY - box.top - pos.y * box.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e) => {
    if (!drag.current) return;
    const { box, dx, dy } = drag.current;
    const sigH = (pos.w * box.width) / 2.75 / box.height;
    setPos((p) => ({
      ...p,
      x: Math.min(Math.max((e.clientX - box.left - dx) / box.width, 0), 1 - p.w),
      y: Math.min(Math.max((e.clientY - box.top - dy) / box.height, 0), 1 - sigH),
    }));
  };
  const endDrag = () => { drag.current = null; };

  /** The signed file: the original PDF with the signature on the chosen page, or the photo as a PDF page. */
  const signedPdf = async () => {
    const { PDFDocument } = await import("pdf-lib");
    const sigBytes = await (await fetch(signature)).arrayBuffer();
    let out;
    let target;
    if (kind === "pdf") {
      out = await PDFDocument.load(bytes, { ignoreEncryption: true });
      target = out.getPage(page - 1);
    } else {
      out = await PDFDocument.create();
      const isPng = String(doc.original_name || "").toLowerCase().endsWith(".png") || doc.mime_type === "image/png";
      const img = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);
      target = out.addPage([img.width, img.height]);
      target.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const sig = await out.embedPng(sigBytes);
    const { width, height } = target.getSize();
    const w = pos.w * width;
    const h = w * (sig.height / sig.width);
    target.drawImage(sig, { x: pos.x * width, y: height - pos.y * height - h, width: w, height: h });
    return new Blob([await out.save()], { type: "application/pdf" });
  };

  const fileName = `${String(doc.title || "Dokument").replace(/[^\p{L}\p{N} _-]+/gu, "").trim().slice(0, 60) || "Dokument"} - unterschrieben.pdf`;
  const run = async (action) => {
    if (!signature) { setHint(t.needSign); return; }
    setBusy(true);
    setHint("");
    try {
      const blob = await signedPdf();
      if (action === "share") {
        await shareFiles([{ blob, name: fileName }], doc.title);
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (action === "mail") {
        setHint(t.mailHint);
        window.location.href = `mailto:?subject=${encodeURIComponent(doc.title || "")}`;
      }
    } catch {
      setHint(t.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-[#2e1065]">{t.title}</p>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <p className="truncate text-xs text-gray-500">{doc.title}</p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        ) : loading ? (
          <p className="mt-6 flex items-center justify-center gap-2 py-10 text-sm text-[#6B46C1]"><Loader2 className="h-4 w-4 animate-spin" />{t.loading}</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setDrawing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50">
                <PenLine className="h-3.5 w-3.5" />{signature ? t.resign : t.sign}
              </button>
              {pages > 1 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded p-1 hover:bg-gray-100 disabled:opacity-40" aria-label="‹"><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></button>
                  {t.page} {page} {t.of} {pages}
                  <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded p-1 hover:bg-gray-100 disabled:opacity-40" aria-label="›"><ChevronRight className="h-4 w-4 rtl:rotate-180" /></button>
                </div>
              )}
              {signature && (
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  {t.drag}
                  <input type="range" min="0.12" max="0.6" step="0.01" value={pos.w} onChange={(e) => setPos((p) => ({ ...p, w: Math.min(Number(e.target.value), 1 - p.x) }))} />
                </label>
              )}
            </div>

            <div ref={stage} className="mt-3 flex justify-center overflow-hidden rounded-lg bg-gray-100 p-2" dir="ltr">
              <div className="relative">
                <canvas ref={canvas} className="block bg-white shadow" />
                {signature && (
                  <img
                    src={signature}
                    alt=""
                    draggable={false}
                    onPointerDown={startDrag}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, width: `${pos.w * 100}%` }}
                    className="absolute cursor-move touch-none rounded border-2 border-dashed border-[#7c3aed] bg-white/30"
                  />
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => run("download")} className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B46C1] px-3 py-2 text-xs font-bold text-white hover:bg-[#805AD5] disabled:opacity-60">
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{t.pdf}
              </button>
              <button type="button" disabled={busy} onClick={() => run("mail")} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50 disabled:opacity-60"><Mail className="h-3.5 w-3.5" />{t.mail}</button>
              <button type="button" disabled={busy} onClick={() => run("share")} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50 disabled:opacity-60"><Share2 className="h-3.5 w-3.5" />{t.share}</button>
            </div>
            {hint && <p className="mt-2 text-xs font-semibold text-[#6B46C1]">{hint}</p>}
            <p className="mt-2 text-[11px] text-gray-500">{t.note}</p>
          </>
        )}
      </div>
      {drawing && <SignaturePad lang={lang} onCancel={() => setDrawing(false)} onDone={(url) => { setSignature(url); setDrawing(false); }} />}
    </div>
  );
}
