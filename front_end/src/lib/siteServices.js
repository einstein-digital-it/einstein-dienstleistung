// Services on the website come from "Dienste verwalten" (table services, GET /public/services).
// Each page keeps its own icons, pictures and texts per category; they are only used when the
// database has no text for that language, or when the server cannot be reached.
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api/backendClient";

/** Text of a service in the visitor's language, else German, else the plain field. */
export function serviceText(service, field, lang) {
  if (!service) return "";
  return service[`${field}_${lang}`] || service[`${field}_de`] || service[field] || "";
}

/** Bullet points ("Das ist enthalten") in the visitor's language, else German. */
export function serviceFeatures(service, lang) {
  const features = service?.features;
  if (!features || typeof features !== "object") return [];
  const list = features[lang]?.length ? features[lang] : features.de;
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

/**
 * The active services in the admin's order.
 * fallbackKeys: the page's built-in list, used only if the server cannot be reached.
 * Returns [{ key, db }] — db is the database row (null for the built-in fallback).
 */
export function useSiteServices(fallbackKeys) {
  const query = useQuery({
    queryKey: ["public-services"],
    queryFn: publicApi.listServices,
    staleTime: 60 * 1000,
    retry: 1,
  });

  if (query.isError) return fallbackKeys.map((key) => ({ key, db: null }));

  const rows = Array.isArray(query.data) ? query.data : [];
  return rows
    .filter((row) => row?.category)
    .map((row) => ({ key: row.category, db: row }));
}

const UNIT_LABELS = {
  hour: { de: "Stunde", ar: "ساعة", en: "hour", tr: "saat", es: "hora", uk: "година" },
  service: { de: "Vorgang", ar: "خدمة", en: "service", tr: "işlem", es: "servicio", uk: "послуга" },
  visit: { de: "Besuch", ar: "زيارة", en: "visit", tr: "ziyaret", es: "visita", uk: "візит" },
  day: { de: "Tag", ar: "يوم", en: "day", tr: "gün", es: "día", uk: "день" },
  month: { de: "Monat", ar: "شهر", en: "month", tr: "ay", es: "mes", uk: "місяць" },
};

/** "/ Stunde" for the unit keys of the admin form; other text is shown as it is. */
export function unitLabel(unit, lang) {
  if (!unit) return "";
  const label = UNIT_LABELS[unit]?.[lang] || UNIT_LABELS[unit]?.de || unit;
  return `/ ${label}`;
}
