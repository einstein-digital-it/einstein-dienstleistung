import React from "react";
import { Link } from "react-router-dom";
import { Bot, FileSignature, FolderOpen, Languages, MessageCircleQuestion, PenLine, Sparkles } from "lucide-react";
import { createPageUrl } from "../utils";

/** Home page: what the AI assistant does, so every visitor sees it at once. */
const T = {
  de: {
    kicker: "Neu: KI-Assistent", title: "Ihre Briefe – verstanden, beantwortet, unterschrieben",
    sub: "Laden Sie einen Brief hoch. Unsere KI erledigt den Rest – in Ihrer Sprache.",
    items: [
      ["sort", "Sortieren & zusammenfassen", "Jeder Brief landet automatisch im richtigen Ordner, mit kurzer Zusammenfassung und Frist."],
      ["translate", "Übersetzen oder einfach erklären", "In Arabisch, Deutsch, Englisch, Türkisch, Spanisch oder Ukrainisch – ist der Brief schon in Ihrer Sprache, erklärt die KI ihn in einfachen Worten."],
      ["ask", "Fragen stellen", "„Was muss ich tun? Bis wann?“ – die KI erklärt den Brief in einfachen Worten."],
      ["reply", "Antwort & Formular", "Sie sagt, ob eine Antwort nötig ist, schreibt sie auf Deutsch und füllt Formulare mit Ihren Daten aus."],
      ["sign", "Unterschreiben & senden", "Mit dem Finger unterschreiben, als PDF speichern, teilen oder direkt per E-Mail senden."],
    ],
    plans: "Ab 6,99 € im Monat · monatlich kündbar", cta: "Jetzt ausprobieren", note: "Die KI erklärt und schreibt einfache Antworten – keine Rechtsberatung.",
  },
  ar: {
    kicker: "جديد: مساعد بالذكاء الاصطناعي", title: "رسائلك – مفهومة، ومردود عليها، وموقّعة",
    sub: "ارفع رسالتك، ويتولّى الذكاء الاصطناعي الباقي بلغتك.",
    items: [
      ["sort", "الترتيب والتلخيص", "تُحفظ كل رسالة تلقائياً في المجلد الصحيح، مع ملخص قصير والموعد النهائي."],
      ["translate", "الترجمة أو الشرح المبسّط", "بالعربية أو الألمانية أو الإنجليزية أو التركية أو الإسبانية أو الأوكرانية – وإذا كانت الرسالة بلغتك أصلاً، يشرحها الذكاء الاصطناعي بكلمات بسيطة."],
      ["ask", "اطرح أسئلتك", "«ما الذي يجب عليّ فعله؟ وما هو الموعد النهائي؟» – يشرح لك الذكاء الاصطناعي الرسالة بكلمات بسيطة."],
      ["reply", "الرد والاستمارات", "يخبرك إن كانت الرسالة تحتاج إلى رد، ويكتبه بالألمانية، ويملأ الاستمارات ببياناتك."],
      ["sign", "التوقيع والإرسال", "وقّع بإصبعك، واحفظ الملف بصيغة PDF، وشاركه أو أرسله مباشرة بالبريد الإلكتروني."],
    ],
    plans: "ابتداءً من 6.99 يورو شهرياً · يمكن الإلغاء شهرياً", cta: "جرّبه الآن", note: "يشرح الذكاء الاصطناعي الرسائل ويكتب ردوداً بسيطة – وهذه ليست استشارة قانونية.",
  },
  en: {
    kicker: "New: AI assistant", title: "Your letters – understood, answered, signed",
    sub: "Upload a letter. Our AI does the rest – in your language.",
    items: [
      ["sort", "Sort & summarise", "Every letter goes into the right folder automatically, with a short summary and the deadline."],
      ["translate", "Translate or explain simply", "In Arabic, German, English, Turkish, Spanish or Ukrainian – if the letter is already in your language, the AI explains it in plain words."],
      ["ask", "Ask questions", "“What do I have to do? By when?” – the AI explains the letter in plain words."],
      ["reply", "Reply & forms", "It tells you whether a reply is needed, writes it in German and fills in forms with your details."],
      ["sign", "Sign & send", "Sign with your finger, save as PDF, share it or send it straight by e-mail."],
    ],
    plans: "From €6.99 a month · cancel monthly", cta: "Try it now", note: "The AI explains and writes simple replies – no legal advice.",
  },
  tr: {
    kicker: "Yeni: Yapay zekâ asistanı", title: "Mektuplarınız – anlaşıldı, cevaplandı, imzalandı",
    sub: "Bir mektup yükleyin. Gerisini yapay zekâ dilinizde halleder.",
    items: [
      ["sort", "Sırala ve özetle", "Her mektup kısa bir özet ve son tarihle otomatik olarak doğru klasöre gider."],
      ["translate", "Çevir veya basitçe açıkla", "Arapça, Almanca, İngilizce, Türkçe, İspanyolca veya Ukraynaca – mektup zaten sizin dilinizdeyse yapay zekâ onu basit kelimelerle açıklar."],
      ["ask", "Soru sor", "“Ne yapmalıyım? Ne zamana kadar?” – yapay zekâ mektubu basitçe açıklar."],
      ["reply", "Cevap ve form", "Cevap gerekip gerekmediğini söyler, Almanca yazar ve formları bilgilerinizle doldurur."],
      ["sign", "İmzala ve gönder", "Parmağınızla imzalayın, PDF olarak kaydedin, paylaşın veya e-postayla gönderin."],
    ],
    plans: "Ayda 6,99 €'dan başlayan fiyatlar · aylık iptal", cta: "Hemen deneyin", note: "Yapay zekâ açıklar ve basit cevaplar yazar – hukuki danışmanlık değildir.",
  },
  es: {
    kicker: "Nuevo: asistente de IA", title: "Sus cartas: entendidas, respondidas y firmadas",
    sub: "Suba una carta. Nuestra IA hace el resto, en su idioma.",
    items: [
      ["sort", "Ordenar y resumir", "Cada carta va sola a la carpeta correcta, con un breve resumen y el plazo."],
      ["translate", "Traducir o explicar fácil", "En árabe, alemán, inglés, turco, español o ucraniano; si la carta ya está en su idioma, la IA la explica con palabras sencillas."],
      ["ask", "Hacer preguntas", "«¿Qué tengo que hacer? ¿Hasta cuándo?»: la IA explica la carta con palabras sencillas."],
      ["reply", "Respuesta y formulario", "Le dice si hace falta responder, redacta la respuesta en alemán y rellena formularios con sus datos."],
      ["sign", "Firmar y enviar", "Firme con el dedo, guárdelo en PDF, compártalo o envíelo por correo."],
    ],
    plans: "Desde 6,99 € al mes · cancelable mensualmente", cta: "Probar ahora", note: "La IA explica y redacta respuestas sencillas; no es asesoramiento jurídico.",
  },
  uk: {
    kicker: "Нове: ШІ-помічник", title: "Ваші листи – зрозумілі, з відповіддю, підписані",
    sub: "Завантажте лист. Решту зробить наш ШІ – вашою мовою.",
    items: [
      ["sort", "Впорядкувати й підсумувати", "Кожен лист автоматично потрапляє в потрібну папку з коротким підсумком і строком."],
      ["translate", "Перекласти або просто пояснити", "Арабською, німецькою, англійською, турецькою, іспанською чи українською – якщо лист уже вашою мовою, ШІ пояснить його простими словами."],
      ["ask", "Ставити запитання", "«Що мені робити? До коли?» – ШІ пояснює лист простими словами."],
      ["reply", "Відповідь і форми", "Підкаже, чи потрібна відповідь, напише її німецькою й заповнить форми вашими даними."],
      ["sign", "Підписати й надіслати", "Підпишіть пальцем, збережіть PDF, поділіться або надішліть поштою."],
    ],
    plans: "Від 6,99 € на місяць · скасування щомісяця", cta: "Спробувати", note: "ШІ пояснює й пише прості відповіді – це не юридична консультація.",
  },
};

const ICONS = { sort: FolderOpen, translate: Languages, ask: MessageCircleQuestion, reply: FileSignature, sign: PenLine };

export default function AiFeatures({ lang }) {
  const t = T[lang] || T.de;
  return (
    <section className="px-4 pt-20" aria-labelledby="ai-features-title">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#6d28d9] p-6 text-white shadow-xl shadow-purple-900/20 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-[#e8c547]">
              <Bot className="h-4 w-4" />{t.kicker}
            </span>
            <h2 id="ai-features-title" className="mt-4 text-3xl font-black leading-tight md:text-4xl">{t.title}</h2>
            <p className="mt-3 text-lg text-white/80">{t.sub}</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <Link to={createPageUrl("MyDocuments")} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-bold text-[#4c1d95] transition hover:bg-purple-50">
              <Sparkles className="h-5 w-5" />{t.cta}
            </Link>
            <span className="text-sm text-white/75">{t.plans}</span>
          </div>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {t.items.map(([key, title, text]) => {
            const Icon = ICONS[key];
            return (
              <li key={key} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <Icon className="h-6 w-6 text-[#e8c547]" />
                <p className="mt-3 font-bold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{text}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-xs text-white/60">{t.note}</p>
      </div>
    </section>
  );
}
