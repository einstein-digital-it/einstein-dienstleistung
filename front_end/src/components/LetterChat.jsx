import React, { useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { customerDocumentsApi } from "@/api/backendClient";

/** Ask the AI questions about one letter. Part of the Unterlagen-Abo; the plan sets how many per month. */
const T = {
  de: { copy: "Kopieren", copied: "Kopiert", letter: "Text auf Deutsch", quick: { explain: ["Erklären", "Erkläre mir den Brief: Was muss ich tun und bis wann?"], reply: ["Antwort schreiben", "Schreibe mir eine Antwort an die Behörde auf diesen Brief."], form: ["Formular ausfüllen", "Hilf mir, das Formular auszufüllen: Was schreibe ich in jedes Feld?"] }, ask: "Frage zu diesem Brief stellen", hide: "Fragen ausblenden", placeholder: "z. B. Schreib eine Antwort, dass ich die Unterlagen nachreiche", send: "Fragen", thinking: "Die KI liest den Brief…", left: (u, n) => (n == null ? "Unbegrenzte Fragen" : `${u} von ${n} Fragen diesen Monat`), note: "Die KI erklärt Briefe und schreibt einfache Antworten. Bitte prüfen Sie alles vor dem Absenden. Keine Rechtsberatung, keine Widersprüche.", needs: "Fragen zu Briefen gehören zum Abo.", limit: "Ihre Fragen für diesen Monat sind aufgebraucht. Wechseln Sie den Tarif für mehr Fragen.", tooLong: "Dieser Brief ist zu lang für die KI.", unavailable: "Die KI ist gerade nicht verfügbar.", failed: "Die KI konnte nicht antworten. Bitte erneut versuchen." },
  ar: { copy: "نسخ", copied: "تم النسخ", letter: "النص بالألمانية", quick: { explain: ["اشرح لي", "اشرح لي الرسالة: شو لازم أعمل ولإيمتى؟"], reply: ["اكتب رد", "اكتب لي رد على هالرسالة للدائرة."], form: ["عبّي الاستمارة", "ساعدني عبّي الاستمارة: شو بكتب بكل خانة؟"] }, ask: "اسأل عن هذه الرسالة", hide: "إخفاء الأسئلة", placeholder: "مثلاً: اكتب رد إني رح أبعت الأوراق الناقصة", send: "اسأل", thinking: "الذكاء الاصطناعي يقرأ الرسالة…", left: (u, n) => (n == null ? "أسئلة غير محدودة" : `${u} من ${n} سؤالاً هذا الشهر`), note: "الذكاء الاصطناعي يشرح الرسائل ويكتب ردوداً بسيطة. راجع كل شيء قبل الإرسال. ليس استشارة قانونية ولا يكتب اعتراضات.", needs: "الأسئلة عن الرسائل جزء من الاشتراك.", limit: "انتهت أسئلتك لهذا الشهر. غيّر الباقة لتحصل على أسئلة أكثر.", tooLong: "هذه الرسالة طويلة جداً على الذكاء الاصطناعي.", unavailable: "الذكاء الاصطناعي غير متاح حالياً.", failed: "لم يتمكن الذكاء الاصطناعي من الإجابة. حاول مرة أخرى." },
  en: { copy: "Copy", copied: "Copied", letter: "Text in German", quick: { explain: ["Explain", "Explain the letter to me: what do I have to do, and by when?"], reply: ["Write a reply", "Write me a reply to the authority about this letter."], form: ["Fill in the form", "Help me fill in the form: what do I write in each field?"] }, ask: "Ask about this letter", hide: "Hide questions", placeholder: "e.g. Write a reply that I will send the missing papers", send: "Ask", thinking: "The AI is reading the letter…", left: (u, n) => (n == null ? "Unlimited questions" : `${u} of ${n} questions this month`), note: "The AI explains letters and writes simple replies. Please check everything before sending. No legal advice, no objections.", needs: "Questions about letters are part of the subscription.", limit: "Your questions for this month are used up. Switch plans for more questions.", tooLong: "This letter is too long for the AI.", unavailable: "The AI is not available right now.", failed: "The AI could not answer. Please try again." },
  tr: { copy: "Kopyala", copied: "Kopyalandı", letter: "Almanca metin", quick: { explain: ["Açıkla", "Mektubu bana açıkla: ne yapmam gerekiyor ve ne zamana kadar?"], reply: ["Cevap yaz", "Bu mektup için kuruma bir cevap yaz."], form: ["Formu doldur", "Formu doldurmama yardım et: her alana ne yazmalıyım?"] }, ask: "Bu mektup hakkında soru sor", hide: "Soruları gizle", placeholder: "örn. Ne yapmam gerekiyor ve ne zamana kadar?", send: "Sor", thinking: "Yapay zekâ mektubu okuyor…", left: (u, n) => (n == null ? "Sınırsız soru" : `Bu ay ${n} sorudan ${u} kullanıldı`), note: "Yapay zekâ mektupları açıklar ve basit cevaplar yazar. Göndermeden önce her şeyi kontrol edin. Hukuki danışmanlık ve itiraz yazımı yoktur.", needs: "Mektuplar hakkında sorular aboneliğe dahildir.", limit: "Bu ayki sorularınız bitti. Daha fazla soru için paketinizi değiştirin.", tooLong: "Bu mektup yapay zekâ için çok uzun.", unavailable: "Yapay zekâ şu anda kullanılamıyor.", failed: "Yapay zekâ cevap veremedi. Lütfen tekrar deneyin." },
  es: { copy: "Copiar", copied: "Copiado", letter: "Texto en alemán", quick: { explain: ["Explicar", "Explícame la carta: ¿qué tengo que hacer y hasta cuándo?"], reply: ["Escribir respuesta", "Escríbeme una respuesta a la autoridad sobre esta carta."], form: ["Rellenar formulario", "Ayúdame a rellenar el formulario: ¿qué escribo en cada campo?"] }, ask: "Preguntar sobre esta carta", hide: "Ocultar preguntas", placeholder: "p. ej. ¿Qué tengo que hacer y hasta cuándo?", send: "Preguntar", thinking: "La IA está leyendo la carta…", left: (u, n) => (n == null ? "Preguntas ilimitadas" : `${u} de ${n} preguntas este mes`), note: "La IA explica cartas y redacta respuestas sencillas. Revise todo antes de enviarlo. Sin asesoramiento jurídico ni recursos.", needs: "Las preguntas sobre cartas forman parte de la suscripción.", limit: "Ha usado todas las preguntas de este mes. Cambie de plan para tener más.", tooLong: "Esta carta es demasiado larga para la IA.", unavailable: "La IA no está disponible ahora.", failed: "La IA no pudo responder. Inténtelo de nuevo." },
  uk: { copy: "Копіювати", copied: "Скопійовано", letter: "Текст німецькою", quick: { explain: ["Пояснити", "Поясни мені лист: що мені треба зробити і до коли?"], reply: ["Написати відповідь", "Напиши мені відповідь установі на цей лист."], form: ["Заповнити форму", "Допоможи заповнити форму: що писати в кожному полі?"] }, ask: "Запитати про цей лист", hide: "Сховати запитання", placeholder: "напр. Що мені треба зробити і до коли?", send: "Запитати", thinking: "ШІ читає лист…", left: (u, n) => (n == null ? "Необмежено запитань" : `${u} з ${n} запитань цього місяця`), note: "ШІ пояснює листи й пише прості відповіді. Перевірте все перед надсиланням. Без юридичних консультацій і заперечень.", needs: "Запитання про листи входять у підписку.", limit: "Запитання на цей місяць вичерпано. Змініть тариф, щоб мати більше.", tooLong: "Цей лист задовгий для ШІ.", unavailable: "ШІ зараз недоступний.", failed: "ШІ не зміг відповісти. Спробуйте ще раз." },
};

/** Splits an answer into text and the German letter between ---BRIEF--- and ---ENDE---. */
function splitAnswer(answer) {
  const parts = [];
  const re = /---BRIEF---\s*\n?([\s\S]*?)\n?\s*---ENDE---/g;
  let last = 0;
  let m;
  while ((m = re.exec(answer))) {
    if (m.index > last) parts.push({ text: answer.slice(last, m.index).trim() });
    parts.push({ letter: m[1].trim() });
    last = re.lastIndex;
  }
  if (last < answer.length) parts.push({ text: answer.slice(last).trim() });
  return parts.filter((p) => p.text || p.letter);
}

function LetterBox({ text, t }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the text can still be selected */ }
  };
  return (
    <div className="my-2 rounded-xl border border-purple-200 bg-white" dir="ltr">
      <div className="flex items-center justify-between gap-2 border-b border-purple-100 px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t.letter}</span>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#6B46C1] hover:bg-purple-50">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? t.copied : t.copy}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words px-3 py-2 font-sans text-sm leading-relaxed text-gray-800">{text}</pre>
    </div>
  );
}

const ERRORS = { needs_subscription: "needs", limit_reached: "limit", too_long: "tooLong", not_available: "unavailable", failed: "failed" };

export default function LetterChat({ doc, lang, abo, onAsked }) {
  const t = T[lang] || T.de;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (!open || items) return;
    customerDocumentsApi.questions(doc.id).then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
  }, [open, items, doc.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [items, busy]);

  const ask = async (event, preset) => {
    event?.preventDefault?.();
    const q = (preset ?? question).trim();
    if (q.length < 2 || busy) return;
    setBusy(true);
    setError("");
    try {
      const list = await customerDocumentsApi.askQuestion(doc.id, q, lang);
      setItems(Array.isArray(list) ? list : []);
      setQuestion("");
      onAsked?.();
    } catch (err) {
      setError(t[ERRORS[err.code]] || t.failed);
    } finally {
      setBusy(false);
    }
  };

  const limitReached = abo && abo.questions_limit != null && abo.questions_used >= abo.questions_limit;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B46C1] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#805AD5]">
        <MessageCircleQuestion className="h-3.5 w-3.5" />{t.ask}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-purple-100 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2e1065]"><Bot className="h-4 w-4 text-[#6B46C1]" />{t.ask}</p>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:underline">{t.hide}</button>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {items === null && <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#6B46C1]" />}
        {(items || []).map((item) => (
          <div key={item.id} className="space-y-1.5">
            <p className="ms-auto w-fit max-w-[85%] whitespace-pre-line rounded-2xl rounded-ee-sm bg-[#6B46C1] px-3 py-2 text-white">{item.question}</p>
            <div className="w-fit max-w-[95%] rounded-2xl rounded-es-sm bg-purple-50 px-3 py-2 leading-relaxed text-[#2e1065]">
              {splitAnswer(item.answer).map((part, i) => (part.letter
                ? <LetterBox key={i} text={part.letter} t={t} />
                : <p key={i} className="whitespace-pre-line">{part.text}</p>))}
            </div>
          </div>
        ))}
        {busy && <p className="flex items-center gap-2 text-xs text-[#6B46C1]"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t.thinking}</p>}
        <div ref={endRef} />
      </div>

      {/* Quick questions in the customer's language */}
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.values(t.quick).map(([label, text]) => (
          <button key={label} type="button" disabled={busy || limitReached} onClick={() => ask(null, text)}
            className="rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-[#6B46C1] transition hover:bg-purple-50 disabled:opacity-50">
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={ask} className="mt-2 flex items-end gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) ask(e); }}
          placeholder={t.placeholder}
          rows={2}
          maxLength={1000}
          disabled={busy || limitReached}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-purple-200 px-3 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15 disabled:bg-gray-50"
        />
        <button type="submit" disabled={busy || limitReached || question.trim().length < 2} aria-label={t.send}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#6B46C1] px-3 text-sm font-bold text-white transition hover:bg-[#805AD5] disabled:opacity-50">
          <Send className="h-4 w-4 rtl:-scale-x-100" /><span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-semibold text-red-600" role="alert">{error}</p>}
      {!error && limitReached && <p className="mt-2 text-xs font-semibold text-amber-700">{t.limit}</p>}
      <p className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-gray-500">
        <span>{t.note}</span>
        {abo && <span>{t.left(abo.questions_used ?? 0, abo.questions_limit)}</span>}
      </p>
    </div>
  );
}
