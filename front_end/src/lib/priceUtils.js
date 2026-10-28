// Prices are stored and charged net; 19 % VAT is added on top (the server
// charges the same total through Stripe). Customers must see the final
// gross price (PAngV), so every public price goes through toGrossPrice().
export const VAT_RATE = 0.19;

const NUMBER_LOCALES = { de: "de-DE", tr: "tr-TR", es: "es-ES" };

const VAT_NOTES = {
  de: "inkl. 19 % MwSt.",
  en: "incl. 19% VAT",
  ar: "شامل ضريبة 19%",
  tr: "%19 KDV dahil",
  es: "IVA del 19 % incluido",
};

const ALL_PRICES_NOTES = {
  de: "Alle Preise inkl. 19 % MwSt.",
  en: "All prices incl. 19% VAT.",
  ar: "جميع الأسعار شاملة ضريبة القيمة المضافة 19%.",
  tr: "Tüm fiyatlara %19 KDV dahildir.",
  es: "Todos los precios incluyen el 19 % de IVA.",
};

// Business-only services (B2B) are quoted net, "zzgl. 19 % MwSt.", like on
// the offer documents. The gross-price rule (PAngV) only covers consumers.
export const NET_PRICED_CATEGORIES = ["bueromanagement"];
export const isNetPriced = (category) => NET_PRICED_CATEGORIES.includes(category);

const PLUS_VAT_NOTES = {
  de: "zzgl. 19 % MwSt.",
  en: "plus 19% VAT",
  ar: "غير شامل ضريبة 19%",
  tr: "%19 KDV hariç",
  es: "más 19 % de IVA",
};

export const vatNote = (lang = "de") => VAT_NOTES[lang] || VAT_NOTES.de;
export const plusVatNote = (lang = "de") => PLUS_VAT_NOTES[lang] || PLUS_VAT_NOTES.de;
/** VAT note matching how this category's prices are shown. */
export const priceNote = (lang = "de", category) => (isNetPriced(category) ? plusVatNote(lang) : vatNote(lang));
export const allPricesNote = (lang = "de") => ALL_PRICES_NOTES[lang] || ALL_PRICES_NOTES.de;

export function grossAmount(net) {
  return Math.round(Number(net) * (1 + VAT_RATE) * 100) / 100;
}

export function formatAmount(value, lang = "de") {
  const whole = Number.isInteger(value);
  return new Intl.NumberFormat(NUMBER_LOCALES[lang] || "en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// "1.099" / "1,099" are thousands, "17,85" / "17.85" are decimals.
function parseLooseNumber(text) {
  const thousands = /^\d{1,3}([.,]\d{3})+$/;
  if (thousands.test(text)) return Number(text.replace(/[.,]/g, ""));
  return Number(text.replace(",", "."));
}

/**
 * Net price or net price label -> gross label in the same wording,
 * e.g. 40 -> "47,60", "ab 150 €" -> "ab 178,50 €", "from €150" -> "from €178.50".
 */
export function toGrossPrice(price, lang = "de") {
  if (price === null || price === undefined || price === "") return price;
  if (typeof price === "number") return formatAmount(grossAmount(price), lang);
  return String(price).replace(/\d+(?:[.,]\d+)*/, (match) => {
    const net = parseLooseNumber(match);
    return Number.isFinite(net) ? formatAmount(grossAmount(net), lang) : match;
  });
}

/** Price as shown for a category: net for business services, gross otherwise. */
export function displayPrice(price, lang = "de", category) {
  if (!isNetPriced(category)) return toGrossPrice(price, lang);
  return typeof price === "number" ? formatAmount(price, lang) : price;
}

// Fallback prices for services that may not have an entry in the price settings yet
const DEFAULT_PRICES = { eur1: 150, dokumentabo: 49, bueromanagement: 200 };

/** Büro-Management packages: net monthly price by number of employees (Minijobber included). */
export const BUEROMANAGEMENT_TIERS = [
  { key: "klein", price: 200, employees: "1–4" },
  { key: "mittel", price: 300, employees: "5–6" },
  { key: "gross", price: 400, employees: "7+" },
];

/** Categories billed monthly through a Stripe subscription. */
export const SUBSCRIPTION_CATEGORIES = ["dokumentabo", "bueromanagement"];

export function getPriceNumber(category, dbPriceSettings) {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]?.price) {
    const raw = dbPriceSettings[category][0].price;
    const num = parseFloat(String(raw).replace(/[^\d.,]/g, "").replace(",", "."));
    if (!isNaN(num)) return num;
  }
  return DEFAULT_PRICES[category] || 0;
}

export function getPriceDisplay(category, dbPriceSettings, lang = "de") {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]) {
    const p = dbPriceSettings[category][0];
    const unit = lang === "ar" ? p.unit_ar : lang === "en" ? p.unit_en : p.unit_de;
    return `${p.price}${unit ? " " + unit : ""}`;
  }
  return "";
}
