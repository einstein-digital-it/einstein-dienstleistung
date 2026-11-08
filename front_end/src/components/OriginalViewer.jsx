import React, { useEffect, useState } from "react";
import { Eye, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { customerDocumentsApi } from "@/api/backendClient";
import { mimeOf } from "@/lib/shareFiles";

const T = {
  de: { view: "Original", newTab: "In neuem Tab öffnen", none: "Diese Datei kann hier nicht angezeigt werden. Bitte laden Sie sie herunter.", error: "Die Datei konnte nicht geladen werden." },
  ar: { view: "الأصل", newTab: "فتح في تبويب جديد", none: "لا يمكن عرض هذا الملف هنا. يرجى تنزيله.", error: "تعذر تحميل الملف." },
  en: { view: "Original", newTab: "Open in a new tab", none: "This file cannot be shown here. Please download it.", error: "The file could not be loaded." },
  tr: { view: "Orijinal", newTab: "Yeni sekmede aç", none: "Bu dosya burada gösterilemiyor. Lütfen indirin.", error: "Dosya yüklenemedi." },
  es: { view: "Original", newTab: "Abrir en una pestaña nueva", none: "Este archivo no se puede mostrar aquí. Descárguelo, por favor.", error: "No se pudo cargar el archivo." },
  uk: { view: "Оригінал", newTab: "Відкрити в новій вкладці", none: "Цей файл не можна показати тут. Завантажте його, будь ласка.", error: "Не вдалося завантажити файл." },
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Button that shows the uploaded paper itself on the page. */
export default function OriginalViewer({ doc, lang }) {
  const t = T[lang] || T.de;
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const type = mimeOf(doc.original_name);
  const canShow = type === "application/pdf" || IMAGE_TYPES.includes(type);

  useEffect(() => {
    if (!open || !canShow) return undefined;
    let objectUrl = "";
    let cancelled = false;
    setFailed(false);
    customerDocumentsApi.blob(doc)
      .then((blob) => {
        if (cancelled) return;
        // The browser needs the real type to display the file instead of saving it
        objectUrl = URL.createObjectURL(new Blob([blob], { type }));
        setUrl(objectUrl);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl("");
    };
  }, [open, doc.id, canShow, type]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title={t.view} aria-label={t.view}>
        <Eye className="w-4 h-4 sm:me-1.5" /><span className="hidden sm:inline">{t.view}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-4xl flex-col gap-3 p-4">
          <DialogTitle className="truncate pe-8 text-base">{doc.title}</DialogTitle>
          {!canShow && <p className="py-10 text-center text-sm text-gray-500">{t.none}</p>}
          {failed && <p className="py-10 text-center text-sm text-red-600">{t.error}</p>}
          {canShow && !failed && !url && <div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#6B46C1]" /></div>}
          {url && (type === "application/pdf"
            ? <iframe src={url} title={doc.title} className="min-h-0 w-full flex-1 rounded-lg border" />
            : <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto"><img src={url} alt={doc.title} className="max-h-full max-w-full object-contain" /></div>)}
          {/* Many phone browsers cannot show a PDF inside a page, but open it fine in a tab */}
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#6B46C1] hover:underline">
              <ExternalLink className="h-4 w-4" />{t.newTab}
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
