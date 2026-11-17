import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { CalendarClock, CheckCircle2, Copy, Download, Loader2, Mail, PenLine, Share2, Wand2 } from "lucide-react";
import { customerDocumentsApi } from "@/api/backendClient";
import { shareFiles } from "@/lib/shareFiles";
import SignaturePad, { loadSignature } from "@/components/SignaturePad";

/**
 * "What do I do with this letter?" The AI says whether a reply is needed; if so the customer
 * edits the German reply / form values, signs, and gets a PDF to download, share or e-mail.
 */
const T = {
  de: { start: "Was soll ich tun?", again: "Neu vorbereiten", working: "Die KI liest den Brief und bereitet alles vor…", none: "Keine Antwort nötig", required: "Antwort nötig", optional: "Antwort empfohlen", until: "bis", letter: "Antwortschreiben (Deutsch)", form: "Formular – Ihre Angaben", missing: "Bitte noch ergänzen", attach: "Beilegen", sign: "Unterschreiben", resign: "Neu unterschreiben", signed: "Unterschrieben", pdf: "PDF herunterladen", share: "Teilen", mail: "Per E-Mail öffnen", copy: "Text kopieren", copied: "Kopiert", mailHint: "Das PDF wird heruntergeladen – hängen Sie es an die E-Mail an.", sendBy: { email: "Per E-Mail senden", post: "Per Post senden", portal: "Über das Online-Portal der Behörde senden", in_person: "Persönlich abgeben", none: "" }, lawyer: "Für Widersprüche oder Klagen wenden Sie sich bitte an eine Anwältin, einen Anwalt oder eine Beratungsstelle.", note: "Bitte prüfen Sie alles vor dem Absenden. Die Unterschrift bleibt nur in diesem Browser gespeichert.", errors: { needs_subscription: "Teil des Abos.", limit_reached: "Ihre Fragen für diesen Monat sind aufgebraucht.", too_long: "Dieser Brief ist zu lang für die KI.", not_available: "Die KI ist gerade nicht verfügbar.", failed: "Die KI konnte nichts vorbereiten. Bitte erneut versuchen." } },
  ar: { start: "شو لازم أعمل؟", again: "حضّر من جديد", working: "الذكاء الاصطناعي يقرأ الرسالة ويحضّر كل شي…", none: "ما بدها رد", required: "بدها رد", optional: "يُفضّل الرد", until: "حتى", letter: "رسالة الرد (بالألماني)", form: "الاستمارة – معلوماتك", missing: "لازم تكمّل", attach: "أرفق", sign: "وقّع", resign: "وقّع من جديد", signed: "موقّع", pdf: "نزّل PDF", share: "مشاركة", mail: "افتح بالإيميل", copy: "انسخ النص", copied: "تم النسخ", mailHint: "رح ينزل ملف PDF – أرفقه بالإيميل.", sendBy: { email: "ابعتها بالإيميل", post: "ابعتها بالبريد", portal: "ابعتها عبر موقع الدائرة", in_person: "سلّمها شخصياً", none: "" }, lawyer: "للاعتراض أو الدعاوى راجع محامي أو مركز استشارات.", note: "راجع كل شي قبل الإرسال. التوقيع بينحفظ بس بهالمتصفح.", errors: { needs_subscription: "جزء من الاشتراك.", limit_reached: "خلصت أسئلتك لهالشهر.", too_long: "هالرسالة طويلة كتير على الذكاء الاصطناعي.", not_available: "الذكاء الاصطناعي مو متاح هلق.", failed: "ما قدر الذكاء الاصطناعي يحضّر شي. جرّب مرة تانية." } },
  en: { start: "What do I do?", again: "Prepare again", working: "The AI is reading the letter and preparing everything…", none: "No reply needed", required: "Reply needed", optional: "Reply recommended", until: "by", letter: "Reply letter (German)", form: "Form – your details", missing: "Please add", attach: "Enclose", sign: "Sign", resign: "Sign again", signed: "Signed", pdf: "Download PDF", share: "Share", mail: "Open in e-mail", copy: "Copy text", copied: "Copied", mailHint: "The PDF is downloaded – attach it to the e-mail.", sendBy: { email: "Send by e-mail", post: "Send by post", portal: "Send through the authority's online portal", in_person: "Hand it in in person", none: "" }, lawyer: "For objections or lawsuits please see a lawyer or an advice centre.", note: "Please check everything before sending. Your signature is kept in this browser only.", errors: { needs_subscription: "Part of the subscription.", limit_reached: "Your questions for this month are used up.", too_long: "This letter is too long for the AI.", not_available: "The AI is not available right now.", failed: "The AI could not prepare anything. Please try again." } },
  tr: { start: "Ne yapmalıyım?", again: "Yeniden hazırla", working: "Yapay zekâ mektubu okuyor ve hazırlıyor…", none: "Cevap gerekmiyor", required: "Cevap gerekli", optional: "Cevap önerilir", until: "son tarih", letter: "Cevap mektubu (Almanca)", form: "Form – bilgileriniz", missing: "Lütfen ekleyin", attach: "Ekleyin", sign: "İmzala", resign: "Yeniden imzala", signed: "İmzalandı", pdf: "PDF indir", share: "Paylaş", mail: "E-postada aç", copy: "Metni kopyala", copied: "Kopyalandı", mailHint: "PDF indirilir – e-postaya ekleyin.", sendBy: { email: "E-posta ile gönderin", post: "Posta ile gönderin", portal: "Kurumun çevrimiçi portalından gönderin", in_person: "Şahsen teslim edin", none: "" }, lawyer: "İtiraz veya dava için avukata ya da danışma merkezine başvurun.", note: "Göndermeden önce her şeyi kontrol edin. İmzanız yalnızca bu tarayıcıda saklanır.", errors: { needs_subscription: "Aboneliğe dahildir.", limit_reached: "Bu ayki sorularınız bitti.", too_long: "Bu mektup yapay zekâ için çok uzun.", not_available: "Yapay zekâ şu anda kullanılamıyor.", failed: "Yapay zekâ hazırlayamadı. Tekrar deneyin." } },
  es: { start: "¿Qué tengo que hacer?", again: "Preparar de nuevo", working: "La IA está leyendo la carta y preparándolo todo…", none: "No hace falta responder", required: "Hay que responder", optional: "Se recomienda responder", until: "hasta", letter: "Carta de respuesta (alemán)", form: "Formulario – sus datos", missing: "Complete por favor", attach: "Adjuntar", sign: "Firmar", resign: "Firmar de nuevo", signed: "Firmado", pdf: "Descargar PDF", share: "Compartir", mail: "Abrir en el correo", copy: "Copiar texto", copied: "Copiado", mailHint: "Se descarga el PDF: adjúntelo al correo.", sendBy: { email: "Enviar por correo electrónico", post: "Enviar por correo postal", portal: "Enviar por el portal de la autoridad", in_person: "Entregar en persona", none: "" }, lawyer: "Para recursos o demandas consulte a un abogado o a un centro de asesoramiento.", note: "Revise todo antes de enviarlo. Su firma solo se guarda en este navegador.", errors: { needs_subscription: "Incluido en la suscripción.", limit_reached: "Ha usado todas las preguntas de este mes.", too_long: "Esta carta es demasiado larga para la IA.", not_available: "La IA no está disponible ahora.", failed: "La IA no pudo prepararlo. Inténtelo de nuevo." } },
  uk: { start: "Що мені робити?", again: "Підготувати знову", working: "ШІ читає лист і все готує…", none: "Відповідь не потрібна", required: "Потрібна відповідь", optional: "Відповідь бажана", until: "до", letter: "Лист-відповідь (німецькою)", form: "Форма – ваші дані", missing: "Будь ласка, доповніть", attach: "Додайте", sign: "Підписати", resign: "Підписати знову", signed: "Підписано", pdf: "Завантажити PDF", share: "Поділитися", mail: "Відкрити в пошті", copy: "Копіювати текст", copied: "Скопійовано", mailHint: "PDF завантажується – додайте його до листа.", sendBy: { email: "Надішліть електронною поштою", post: "Надішліть поштою", portal: "Надішліть через онлайн-портал установи", in_person: "Подайте особисто", none: "" }, lawyer: "Щодо заперечень чи позовів зверніться до адвоката або консультаційного центру.", note: "Перевірте все перед надсиланням. Підпис зберігається лише в цьому браузері.", errors: { needs_subscription: "Входить у підписку.", limit_reached: "Запитання на цей місяць вичерпано.", too_long: "Цей лист задовгий для ШІ.", not_available: "ШІ зараз недоступний.", failed: "ШІ не зміг підготувати. Спробуйте ще раз." } },
};

const GREETING = /mit freundlichen grüßen/i;

/** A4 PDF: the German reply (signature under the greeting) and/or the form values. */
function buildPdf({ letter, fields, signature, formTitle }) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const left = 20;
  const width = 170;
  let y = 22;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const write = (text) => {
    for (const line of pdf.splitTextToSize(text, width)) {
      if (y > 280) { pdf.addPage(); y = 22; }
      pdf.text(line, left, y);
      y += 5.4;
    }
  };
  const sign = () => {
    if (!signature) { y += 12; return; }
    if (y > 255) { pdf.addPage(); y = 22; }
    pdf.addImage(signature, "PNG", left, y, 55, 20);
    y += 23;
  };

  if (letter) {
    const lines = letter.split("\n");
    const at = lines.findIndex((l) => GREETING.test(l));
    if (at >= 0) {
      write(lines.slice(0, at + 1).join("\n"));
      sign();
      write(lines.slice(at + 1).join("\n"));
    } else {
      write(letter);
      sign();
    }
  }
  if (fields?.length) {
    if (letter) { pdf.addPage(); y = 22; }
    pdf.setFont("helvetica", "bold");
    write(formTitle);
    y += 2;
    for (const f of fields) {
      pdf.setFont("helvetica", "bold");
      write(f.label);
      pdf.setFont("helvetica", "normal");
      write(f.value || "—");
      y += 1.5;
    }
    if (!letter) sign();
  }
  return pdf.output("blob");
}

export default function LetterReply({ doc, lang, onUsed }) {
  const t = T[lang] || T.de;
  const [draft, setDraft] = useState(null);
  const [letter, setLetter] = useState("");
  const [fields, setFields] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signature, setSignature] = useState(loadSignature);
  const [signing, setSigning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState("");

  const apply = (d) => {
    setDraft(d);
    setLetter(d?.letter || "");
    setFields(d?.form_fields || []);
  };

  useEffect(() => {
    customerDocumentsApi.draft(doc.id).then((d) => d && apply(d)).catch(() => {});
  }, [doc.id]);

  const prepare = async () => {
    setBusy(true);
    setError("");
    try {
      apply(await customerDocumentsApi.prepareDraft(doc.id, lang));
      onUsed?.();
    } catch (err) {
      setError(t.errors[err.code] || t.errors.failed);
    } finally {
      setBusy(false);
    }
  };

  const fileName = `${(draft?.subject || doc.title || "Antwort").replace(/[^\p{L}\p{N} _-]+/gu, "").trim().slice(0, 60) || "Antwort"}.pdf`;
  const pdfBlob = () => buildPdf({ letter, fields, signature, formTitle: draft?.subject || doc.title || "Formular" });
  const download = () => {
    const url = URL.createObjectURL(pdfBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const share = () => shareFiles([{ blob: pdfBlob(), name: fileName }], draft?.subject || doc.title);
  const plainText = () => [letter, ...fields.map((f) => `${f.label}: ${f.value}`)].filter(Boolean).join("\n");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };
  const mail = () => {
    download();
    setHint(t.mailHint);
    const to = draft?.recipient_email || "";
    const q = new URLSearchParams({ subject: draft?.subject || doc.title || "", body: plainText() }).toString().replace(/\+/g, "%20");
    window.location.href = `mailto:${to}?${q}`;
  };

  if (!draft) {
    return (
      <div>
        <button type="button" onClick={prepare} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#6B46C1] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B46C1] transition hover:bg-purple-50 disabled:opacity-60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}{busy ? t.working : t.start}
        </button>
        {error && <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{error}</p>}
      </div>
    );
  }

  const needs = draft.reply_needed;
  const badge = needs === "none" ? "bg-emerald-50 text-emerald-700" : needs === "required" ? "bg-amber-100 text-amber-800" : "bg-sky-50 text-sky-700";
  const hasOutput = Boolean(letter || fields.length);

  return (
    <div className="rounded-xl border border-purple-100 bg-white p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${badge}`}>
          {needs === "none" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
          {t[needs]}{needs !== "none" && draft.deadline ? ` ${t.until} ${new Date(draft.deadline).toLocaleDateString(lang === "ar" ? "ar" : lang)}` : ""}
        </span>
        <button type="button" onClick={prepare} disabled={busy} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:underline disabled:opacity-60">
          {busy && <Loader2 className="h-3 w-3 animate-spin" />}{t.again}
        </button>
      </div>
      <p className="mt-2 text-[#2e1065]">{draft.reason}</p>
      {draft.next_steps && <p className="mt-1 whitespace-pre-line text-[#2e1065]/80">{draft.next_steps}</p>}
      {needs !== "none" && !hasOutput && <p className="mt-1 text-xs text-gray-500">{t.lawyer}</p>}
      {draft.send_by && t.sendBy[draft.send_by] && hasOutput && (
        <p className="mt-1 text-xs font-semibold text-[#6B46C1]">{t.sendBy[draft.send_by]}{draft.recipient_email ? `: ${draft.recipient_email}` : ""}</p>
      )}

      {draft.missing?.length > 0 && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          <p className="font-bold">{t.missing}</p>
          <ul className="list-disc ps-4">{draft.missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      {draft.attachments?.length > 0 && (
        <div className="mt-2 rounded-lg bg-purple-50 p-2 text-xs text-[#2e1065]">
          <p className="font-bold">{t.attach}</p>
          <ul className="list-disc ps-4">{draft.attachments.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}

      {letter !== "" && (
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-gray-500">{t.letter}</span>
          <textarea dir="ltr" value={letter} onChange={(e) => setLetter(e.target.value)} rows={12}
            className="mt-1 w-full rounded-lg border border-purple-200 p-2 font-sans text-sm leading-relaxed outline-none focus:border-[#7c3aed]" />
        </label>
      )}
      {fields.length > 0 && (
        <div className="mt-3" dir="ltr">
          <p className="text-xs font-semibold text-gray-500">{t.form}</p>
          <div className="mt-1 space-y-1.5">
            {fields.map((f, i) => (
              <label key={i} className="grid gap-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center">
                <span className="text-xs text-gray-600">{f.label}</span>
                <input value={f.value} onChange={(e) => setFields((x) => x.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))}
                  className="h-9 rounded-lg border border-purple-200 px-2 text-sm outline-none focus:border-[#7c3aed]" />
              </label>
            ))}
          </div>
        </div>
      )}

      {hasOutput && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setSigning(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50">
              <PenLine className="h-3.5 w-3.5" />{signature ? t.resign : t.sign}
            </button>
            {signature && <img src={signature} alt={t.signed} className="h-8 rounded border border-gray-100 bg-white" />}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={download} className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B46C1] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#805AD5]"><Download className="h-3.5 w-3.5" />{t.pdf}</button>
            <button type="button" onClick={mail} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50"><Mail className="h-3.5 w-3.5" />{t.mail}</button>
            <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50"><Share2 className="h-3.5 w-3.5" />{t.share}</button>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50"><Copy className="h-3.5 w-3.5" />{copied ? t.copied : t.copy}</button>
          </div>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
          <p className="mt-2 text-[11px] text-gray-500">{t.note}</p>
        </>
      )}
      {error && <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{error}</p>}
      {signing && <SignaturePad lang={lang} onCancel={() => setSigning(false)} onDone={(url) => { setSignature(url); setSigning(false); }} />}
    </div>
  );
}
