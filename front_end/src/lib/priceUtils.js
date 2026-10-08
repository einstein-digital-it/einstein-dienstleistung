// Fallback prices for services that may not have an entry in the price settings yet
const DEFAULT_PRICES = { eur1: 150, dokumentabo: 49 };

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
