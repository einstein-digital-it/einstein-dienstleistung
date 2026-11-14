export function getPriceNumber(category, dbPriceSettings) {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]?.price) {
    const raw = dbPriceSettings[category][0].price;
    const num = parseFloat(String(raw).replace(/[^\d.,]/g, "").replace(",", "."));
    if (!isNaN(num)) return num;
  }
  return 0;
}

export function getPriceDisplay(category, dbPriceSettings, lang = "de") {
  if (dbPriceSettings && dbPriceSettings[category]?.[0]) {
    const p = dbPriceSettings[category][0];
    const unit = lang === "ar" ? p.unit_ar : lang === "en" ? p.unit_en : p.unit_de;
    return `${p.price}${unit ? " " + unit : ""}`;
  }
  return "";
}

// Units used by "Manage services" (price_unit), shown in the customer's language.
const SERVICE_UNITS = {
  hour: { de: "/ Stunde", en: "/ hour", tr: "/ saat", ar: "/ ساعة", es: "/ hora" },
  service: { de: "/ Leistung", en: "/ service", tr: "/ hizmet", ar: "/ خدمة", es: "/ servicio" },
  visit: { de: "/ Besuch", en: "/ visit", tr: "/ ziyaret", ar: "/ زيارة", es: "/ visita" },
  day: { de: "/ Tag", en: "/ day", tr: "/ gün", ar: "/ يوم", es: "/ día" },
};

export function getServiceUnit(unit, lang = "de") {
  if (!unit) return "";
  const known = SERVICE_UNITS[unit];
  return known ? (known[lang] || known.de) : unit;
}

export function getServiceName(service, lang = "de") {
  if (!service) return "";
  return service[`name_${lang}`] || service.name_de || service.name || "";
}

export function formatEuro(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? "");
  return `${Number.isInteger(num) ? num : num.toFixed(2).replace(".", ",")} €`;
}
