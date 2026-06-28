// Single source of truth for default prices
// These are ONLY used as fallback if database has no data yet
export const defaultPrices = {
  office:      { price: 40, display: "40 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
  forms:       { price: 40, display: "40 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
  admin:       { price: 40, display: "40 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
  coordination:{ price: 60, display: "60 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
  mercosur:    { price: 150, display: "150 €", unit_de: "/ Vorgang", unit_ar: "/ معاملة", unit_en: "/ case" },
  tutoring:    { price: 45, display: "45 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
  print:       { price: 1, display: "ab 1 €", unit_de: "", unit_ar: "", unit_en: "" },
  secretariat: { price: 45, display: "45 €", unit_de: "/ Stunde", unit_ar: "/ ساعة", unit_en: "/ hour" },
};

// Get price number from DB price string or fallback
export function getPriceNumber(category, dbPriceSettings) {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]?.price) {
    const raw = dbPriceSettings[category][0].price;
    const num = parseFloat(String(raw).replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(num)) return num;
  }
  return defaultPrices[category]?.price ?? 0;
}

// Get display price string from DB or fallback
export function getPriceDisplay(category, dbPriceSettings, lang = "de") {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]) {
    const p = dbPriceSettings[category][0];
    const unit = lang === "ar" ? p.unit_ar : lang === "en" ? p.unit_en : p.unit_de;
    return `${p.price}${unit ? " " + unit : ""}`;
  }
  const d = defaultPrices[category];
  if (!d) return "";
  const unit = lang === "ar" ? d.unit_ar : lang === "en" ? d.unit_en : d.unit_de;
  return `${d.display}${unit ? " " + unit : ""}`;
}