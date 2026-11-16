import React from "react";
import { Bot, ChevronRight, FileText, Sparkles } from "lucide-react";

/** "Ask the AI" card on the main page of My documents: pick a letter, the chat opens under it. */
const T = {
  de: { title: "Fragen Sie die KI zu Ihren Briefen", desc: "Die KI erklärt jeden Brief in Ihrer Sprache, schreibt Antworten an die Behörde und hilft beim Ausfüllen von Formularen.", pick: "Wählen Sie einen Brief:", empty: "Laden Sie zuerst einen Brief hoch – dann können Sie hier Fragen stellen.", needs: "Teil des Unterlagen-Abos – ab 6,99 € im Monat.", plans: "Tarife ansehen", more: (n) => `Alle Briefe finden Sie in den Ordnern unten (${n}).`, questions: (u, n) => (n == null ? "Unbegrenzte Fragen" : `${u} von ${n} Fragen diesen Monat`) },
  ar: { title: "اسأل الذكاء الاصطناعي عن رسائلك", desc: "الذكاء الاصطناعي يشرح كل رسالة بلغتك، يكتب ردوداً للدائرة ويساعدك في تعبئة الاستمارات.", pick: "اختر رسالة:", empty: "ارفع رسالة أولاً، وبعدها بتقدر تسأل هون.", needs: "جزء من اشتراك الأوراق – من 6.99 يورو شهرياً.", plans: "شوف الباقات", more: (n) => `كل الرسائل موجودة بالمجلدات تحت (${n}).`, questions: (u, n) => (n == null ? "أسئلة غير محدودة" : `${u} من ${n} سؤالاً هذا الشهر`) },
  en: { title: "Ask the AI about your letters", desc: "The AI explains every letter in your language, writes replies to the authority and helps you fill in forms.", pick: "Choose a letter:", empty: "Upload a letter first – then you can ask questions here.", needs: "Part of the document subscription – from €6.99 a month.", plans: "See plans", more: (n) => `All letters are in the folders below (${n}).`, questions: (u, n) => (n == null ? "Unlimited questions" : `${u} of ${n} questions this month`) },
  tr: { title: "Mektuplarınızı yapay zekâya sorun", desc: "Yapay zekâ her mektubu dilinizde açıklar, kuruma cevap yazar ve form doldurmanıza yardım eder.", pick: "Bir mektup seçin:", empty: "Önce bir mektup yükleyin – sonra burada soru sorabilirsiniz.", needs: "Belge aboneliğine dahil – ayda 6,99 €'dan başlayan fiyatlarla.", plans: "Paketleri gör", more: (n) => `Tüm mektuplar aşağıdaki klasörlerde (${n}).`, questions: (u, n) => (n == null ? "Sınırsız soru" : `Bu ay ${n} sorudan ${u} kullanıldı`) },
  es: { title: "Pregunte a la IA sobre sus cartas", desc: "La IA explica cada carta en su idioma, redacta respuestas a la autoridad y le ayuda a rellenar formularios.", pick: "Elija una carta:", empty: "Suba primero una carta; después podrá hacer preguntas aquí.", needs: "Incluido en la suscripción de documentos, desde 6,99 € al mes.", plans: "Ver planes", more: (n) => `Todas las cartas están en las carpetas de abajo (${n}).`, questions: (u, n) => (n == null ? "Preguntas ilimitadas" : `${u} de ${n} preguntas este mes`) },
  uk: { title: "Запитайте ШІ про ваші листи", desc: "ШІ пояснює кожен лист вашою мовою, пише відповіді установам і допомагає заповнювати форми.", pick: "Оберіть лист:", empty: "Спершу завантажте лист – тоді тут можна ставити запитання.", needs: "Входить у підписку на документи – від 6,99 € на місяць.", plans: "Переглянути тарифи", more: (n) => `Усі листи – у папках нижче (${n}).`, questions: (u, n) => (n == null ? "Необмежено запитань" : `${u} з ${n} запитань цього місяця`) },
};

const SHOWN = 4;

export default function AskAiCard({ documents, lang, abo, onPick, onShowPlans }) {
  const t = T[lang] || T.de;
  const letters = (documents || []).filter((d) => d.ai_status === "done")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const active = Boolean(abo?.active);

  return (
    <div className="mb-6 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4c2f9e] text-white">
          <Bot className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-[#2e1065]">{t.title}</p>
          <p className="mt-1 text-sm text-[#2e1065]/75">{t.desc}</p>
          {active && abo && <p className="mt-1 text-xs font-semibold text-[#6B46C1]">{t.questions(abo.questions_used ?? 0, abo.questions_limit)}</p>}
        </div>
      </div>

      {!active ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-purple-50 p-3 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm font-semibold text-[#2e1065]">{t.needs}</p>
          <button type="button" onClick={onShowPlans} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6B46C1] px-4 py-2 text-sm font-bold text-white hover:bg-[#805AD5]">
            <Sparkles className="h-4 w-4" />{t.plans}
          </button>
        </div>
      ) : letters.length === 0 ? (
        <p className="mt-4 rounded-xl bg-purple-50 p-3 text-sm text-[#2e1065]/80">{t.empty}</p>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[#2e1065]">{t.pick}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {letters.slice(0, SHOWN).map((doc) => (
              <button key={doc.id} type="button" onClick={() => onPick(doc)}
                className="group flex items-center gap-3 rounded-xl border border-purple-100 bg-white p-3 text-start transition hover:border-[#7c3aed] hover:bg-purple-50">
                <FileText className="h-5 w-5 shrink-0 text-[#6B46C1]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#2e1065]">{doc.title}</span>
                  {doc.sender && <span className="block truncate text-xs text-gray-500">{doc.sender}</span>}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#6B46C1] transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </button>
            ))}
          </div>
          {letters.length > SHOWN && <p className="mt-2 text-xs text-gray-500">{t.more(letters.length)}</p>}
        </div>
      )}
    </div>
  );
}
