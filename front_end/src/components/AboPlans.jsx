import React from "react";
import { Check, Loader2 } from "lucide-react";

/** The three Unterlagen-Abo plans (price and AI questions per month come from the server). */
const T = {
  de: { vat: "Alle Preise inkl. MwSt. · monatlich kündbar", names: { basic: "Basis", silver: "Silber", unlimited: "Unbegrenzt" }, month: "/ Monat", questions: (n) => (n == null ? "Unbegrenzt Fragen an die KI" : `${n} Fragen an die KI pro Monat`), sort: "Sortieren & Übersetzen", choose: "Wählen", current: "Ihr Tarif", change: "Wechseln", changeConfirm: (name) => `Zum Tarif „${name}" wechseln? Der Unterschied wird für den Rest des Monats anteilig berechnet.` },
  ar: { vat: "جميع الأسعار شاملة الضريبة · يمكن الإلغاء شهرياً", names: { basic: "الأساسي", silver: "الفضي", unlimited: "غير محدود" }, month: "/ شهرياً", questions: (n) => (n == null ? "أسئلة غير محدودة للذكاء الاصطناعي" : `${n} سؤالاً للذكاء الاصطناعي شهرياً`), sort: "الترتيب والترجمة", choose: "اختيار", current: "باقتك", change: "تغيير", changeConfirm: (name) => `التبديل إلى باقة «${name}»؟ يُحسب الفرق لبقية الشهر بشكل نسبي.` },
  en: { vat: "All prices incl. VAT · cancel monthly", names: { basic: "Basic", silver: "Silver", unlimited: "Unlimited" }, month: "/ month", questions: (n) => (n == null ? "Unlimited questions to the AI" : `${n} questions to the AI per month`), sort: "Sorting & translation", choose: "Choose", current: "Your plan", change: "Switch", changeConfirm: (name) => `Switch to the "${name}" plan? The difference is charged pro rata for the rest of the month.` },
  tr: { vat: "Tüm fiyatlar KDV dahil · aylık iptal", names: { basic: "Temel", silver: "Gümüş", unlimited: "Sınırsız" }, month: "/ ay", questions: (n) => (n == null ? "Yapay zekâya sınırsız soru" : `Ayda ${n} yapay zekâ sorusu`), sort: "Sıralama ve çeviri", choose: "Seç", current: "Paketiniz", change: "Değiştir", changeConfirm: (name) => `"${name}" paketine geçilsin mi? Fark, ayın geri kalanı için orantılı olarak hesaplanır.` },
  es: { vat: "Todos los precios con IVA · cancelable mensualmente", names: { basic: "Básico", silver: "Plata", unlimited: "Ilimitado" }, month: "/ mes", questions: (n) => (n == null ? "Preguntas ilimitadas a la IA" : `${n} preguntas a la IA al mes`), sort: "Ordenar y traducir", choose: "Elegir", current: "Su plan", change: "Cambiar", changeConfirm: (name) => `¿Cambiar al plan «${name}»? La diferencia se cobra proporcionalmente por el resto del mes.` },
  uk: { vat: "Усі ціни з ПДВ · скасування щомісяця", names: { basic: "Базовий", silver: "Срібний", unlimited: "Безлімітний" }, month: "/ міс.", questions: (n) => (n == null ? "Необмежено запитань до ШІ" : `${n} запитань до ШІ на місяць`), sort: "Впорядкування та переклад", choose: "Обрати", current: "Ваш тариф", change: "Змінити", changeConfirm: (name) => `Перейти на тариф «${name}»? Різниця нараховується пропорційно до кінця місяця.` },
};

export const planTexts = (lang) => T[lang] || T.de;

const euro = (p) => Number(p).toFixed(2).replace(".", ",");

/**
 * mode "choose": not subscribed yet → each card starts the checkout for its plan.
 * mode "change": paid Abo runs → the other cards switch the plan.
 */
export default function AboPlans({ abo, lang, busy, mode = "choose", onPick }) {
  const t = planTexts(lang);
  const plans = abo?.plans || [];
  if (!plans.length) return null;

  const pick = (plan) => {
    if (mode === "change" && !window.confirm(t.changeConfirm(t.names[plan.key] || plan.key))) return;
    onPick(plan.key);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {plans.map((plan) => {
        const current = mode === "change" && abo.plan === plan.key;
        const featured = plan.key === "silver";
        return (
          <div
            key={plan.key}
            className={`flex flex-col rounded-xl border bg-white p-4 ${current ? "border-emerald-300 ring-2 ring-emerald-100" : featured ? "border-[#7c3aed]" : "border-purple-100"}`}
          >
            <p className="text-sm font-bold text-[#2e1065]">{t.names[plan.key] || plan.key}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#6B46C1]" dir="ltr">
              {euro(plan.price)} € <span className="text-xs font-medium text-gray-500">{t.month}</span>
            </p>
            <ul className="mt-3 flex-1 space-y-1.5 text-sm text-gray-800">
              <li className="flex gap-1.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t.sort}</li>
              <li className="flex gap-1.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{t.questions(plan.questions)}</li>
            </ul>
            {current ? (
              <p className="mt-3 rounded-lg bg-emerald-50 py-2 text-center text-sm font-semibold text-emerald-700">{t.current}</p>
            ) : (
              <button
                type="button"
                onClick={() => pick(plan)}
                disabled={busy}
                className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition disabled:opacity-60 ${featured || mode === "choose" ? "bg-[#6B46C1] text-white hover:bg-[#805AD5]" : "border border-purple-200 text-[#6B46C1] hover:bg-purple-50"}`}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "change" ? t.change : t.choose}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
