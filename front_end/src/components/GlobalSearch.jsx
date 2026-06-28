import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  GraduationCap, 
  FileText, 
  Briefcase,
  Sparkles,
  Truck,
  Wrench,
  Palette,
  Trees,
  Scale,
  ArrowRight,
  Clock,
  TrendingUp,
  MapPin,
  Phone,
  Calendar,
  User,
  HelpCircle,
  Home
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const translations = {
  de: {
    placeholder: "Suchen Sie nach Dienstleistungen, Informationen...",
    trending: "Beliebte Suchen",
    services: "Dienstleistungen",
    pages: "Seiten",
    info: "Informationen",
    no_results: "Keine Ergebnisse gefunden",
    press_enter: "Enter drücken zum Suchen"
  },
  ar: {
    placeholder: "ابحث عن الخدمات، المعلومات...",
    trending: "عمليات البحث الشائعة",
    services: "الخدمات",
    pages: "الصفحات",
    info: "المعلومات",
    no_results: "لم يتم العثور على نتائج",
    press_enter: "اضغط Enter للبحث"
  },
  en: {
    placeholder: "Search for services, information...",
    trending: "Trending Searches",
    services: "Services",
    pages: "Pages",
    info: "Information",
    no_results: "No results found",
    press_enter: "Press Enter to search"
  },
  tr: {
    placeholder: "Hizmetler, bilgiler ara...",
    trending: "Popüler Aramalar",
    services: "Hizmetler",
    pages: "Sayfalar",
    info: "Bilgiler",
    no_results: "Sonuç bulunamadı",
    press_enter: "Aramak için Enter'a basın"
  },
  es: {
    placeholder: "Buscar servicios, información...",
    trending: "Búsquedas populares",
    services: "Servicios",
    pages: "Páginas",
    info: "Información",
    no_results: "No se encontraron resultados",
    press_enter: "Presiona Enter para buscar"
  }
};

const searchData = {
  services: [
    { 
      key: "education", 
      icon: GraduationCap, 
      color: "bg-blue-500",
      keywords: ["nachhilfe", "tutoring", "دروس", "تعليم", "schule", "lernen", "prüfung", "abitur", "sprache", "deutsch", "englisch", "mathe", "education", "eğitim", "educación"],
      names: { de: "Bildung & Nachhilfe", ar: "التعليم والدروس", en: "Education & Tutoring", tr: "Eğitim ve Özel Ders", es: "Educación y Clases" }
    },
    { 
      key: "bureaucracy", 
      icon: FileText, 
      color: "bg-green-500",
      keywords: ["antrag", "behörde", "jobcenter", "wohngeld", "kindergeld", "aufenthalt", "visum", "إقامة", "طلب", "bureaucracy", "bürokrasi", "burocracia"],
      names: { de: "Administrative Unterstützung", ar: "الدعم الإداري", en: "Administrative Support", tr: "İdari Destek", es: "Apoyo Administrativo" }
    },
    { 
      key: "office", 
      icon: Briefcase, 
      color: "bg-purple-500",
      keywords: ["büro", "sekretariat", "dokument", "office", "مكتب", "سكرتارية", "ofis", "oficina"],
      names: { de: "Büro & Sekretariat", ar: "المكتب والسكرتارية", en: "Office & Secretarial", tr: "Ofis ve Sekreterlik", es: "Oficina y Secretaría" }
    },
    { 
      key: "legal", 
      icon: Scale, 
      color: "bg-amber-500",
      keywords: ["recht", "anwalt", "versicherung", "legal", "قانون", "محامي", "تأمين", "hukuk", "legal"],
      names: { de: "Rechts- & Versicherung", ar: "القانون والتأمين", en: "Legal & Insurance", tr: "Hukuk ve Sigorta", es: "Legal y Seguros" }
    },
    { 
      key: "cleaning", 
      icon: Sparkles, 
      color: "bg-cyan-500",
      keywords: ["reinigung", "putzen", "sauber", "cleaning", "تنظيف", "temizlik", "limpieza"],
      names: { de: "Reinigung", ar: "التنظيف", en: "Cleaning", tr: "Temizlik", es: "Limpieza" }
    },
    { 
      key: "transport", 
      icon: Truck, 
      color: "bg-orange-500",
      keywords: ["umzug", "transport", "fahrt", "moving", "نقل", "انتقال", "taşıma", "transporte", "mudanza"],
      names: { de: "Transport & Umzug", ar: "النقل والانتقال", en: "Transport & Moving", tr: "Taşıma ve Taşınma", es: "Transporte y Mudanza" }
    },
    { 
      key: "handwerk", 
      icon: Wrench, 
      color: "bg-red-500",
      keywords: ["handwerk", "reparatur", "sanitär", "elektro", "maler", "حرف", "إصلاح", "zanaat", "artesanía"],
      names: { de: "Handwerk & Technik", ar: "الحرف والتقنية", en: "Handcraft & Tech", tr: "El Sanatları ve Teknoloji", es: "Artesanía y Tecnología" }
    },
    { 
      key: "garden", 
      icon: Trees, 
      color: "bg-emerald-500",
      keywords: ["garten", "haus", "pflege", "garden", "حديقة", "منزل", "bahçe", "jardín"],
      names: { de: "Haus & Garten", ar: "المنزل والحديقة", en: "House & Garden", tr: "Ev ve Bahçe", es: "Casa y Jardín" }
    },
    { 
      key: "design", 
      icon: Palette, 
      color: "bg-pink-500",
      keywords: ["design", "druck", "flyer", "logo", "bewerbung", "lebenslauf", "تصميم", "طباعة", "tasarım", "diseño"],
      names: { de: "Design & Druck", ar: "التصميم والطباعة", en: "Design & Print", tr: "Tasarım ve Baskı", es: "Diseño e Impresión" }
    }
  ],
  pages: [
    { key: "Home", icon: Home, names: { de: "Startseite", ar: "الرئيسية", en: "Home", tr: "Ana Sayfa", es: "Inicio" } },
    { key: "Services", icon: Briefcase, names: { de: "Alle Dienstleistungen", ar: "جميع الخدمات", en: "All Services", tr: "Tüm Hizmetler", es: "Todos los Servicios" } },
    { key: "Booking", icon: Calendar, names: { de: "Jetzt buchen", ar: "احجز الآن", en: "Book Now", tr: "Şimdi Rezervasyon", es: "Reservar Ahora" } },
    { key: "MyBookings", icon: Calendar, names: { de: "Meine Buchungen", ar: "حجوزاتي", en: "My Bookings", tr: "Rezervasyonlarım", es: "Mis Reservas" } },
    { key: "CustomerService", icon: HelpCircle, names: { de: "Kundenservice", ar: "خدمة العملاء", en: "Customer Service", tr: "Müşteri Hizmetleri", es: "Servicio al Cliente" } },
    { key: "ProviderApplication", icon: User, names: { de: "Als Fachkraft bewerben", ar: "التقدم كمزود خدمة", en: "Apply as Provider", tr: "Sağlayıcı Olarak Başvur", es: "Aplicar como Proveedor" } }
  ],
  info: [
    { 
      key: "contact", 
      icon: Phone, 
      keywords: ["kontakt", "telefon", "anrufen", "contact", "اتصال", "هاتف", "iletişim", "contacto"],
      names: { de: "Kontakt: 069 27246275", ar: "اتصل: 069 27246275", en: "Contact: 069 27246275", tr: "İletişim: 069 27246275", es: "Contacto: 069 27246275" },
      action: "tel:06927246275"
    },
    { 
      key: "location", 
      icon: MapPin, 
      keywords: ["adresse", "standort", "frankfurt", "location", "عنوان", "موقع", "konum", "ubicación"],
      names: { de: "Standort: Frankfurt", ar: "الموقع: فرانكفورت", en: "Location: Frankfurt", tr: "Konum: Frankfurt", es: "Ubicación: Frankfurt" },
      action: null
    }
  ]
};

const trendingSearches = {
  de: ["Nachhilfe", "Umzug", "Reinigung", "Antragshilfe", "Deutschkurs"],
  ar: ["دروس خصوصية", "انتقال", "تنظيف", "مساعدة الطلبات", "دورة ألمانية"],
  en: ["Tutoring", "Moving", "Cleaning", "Application Help", "German Course"],
  tr: ["Özel Ders", "Taşınma", "Temizlik", "Başvuru Yardımı", "Almanca Kursu"],
  es: ["Clases", "Mudanza", "Limpieza", "Ayuda Solicitudes", "Curso Alemán"]
};

export default function GlobalSearch({ lang = "de", variant = "hero" }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ services: [], pages: [], info: [] });
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const t = translations[lang] || translations.de;
  const trending = trendingSearches[lang] || trendingSearches.de;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ services: [], pages: [], info: [] });
      return;
    }

    const q = query.toLowerCase();
    
    const filteredServices = searchData.services.filter(s => 
      s.names[lang]?.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q))
    );

    const filteredPages = searchData.pages.filter(p =>
      p.names[lang]?.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q)
    );

    const filteredInfo = searchData.info.filter(i =>
      i.names[lang]?.toLowerCase().includes(q) ||
      i.keywords.some(k => k.includes(q))
    );

    setResults({
      services: filteredServices,
      pages: filteredPages,
      info: filteredInfo
    });
  }, [query, lang]);

  const handleSelect = (type, item) => {
    setIsOpen(false);
    setQuery("");
    
    if (type === "service") {
      navigate(createPageUrl(`Booking?category=${item.key}`));
    } else if (type === "page") {
      navigate(createPageUrl(item.key));
    } else if (type === "info" && item.action) {
      window.location.href = item.action;
    }
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const hasResults = results.services.length > 0 || results.pages.length > 0 || results.info.length > 0;
  const showDropdown = isOpen && (query.trim() || !query.trim());

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className={`
        relative flex items-center
        ${variant === "hero" 
          ? "bg-white/95 backdrop-blur-md shadow-2xl shadow-black/20 rounded-full border-2 border-white/50" 
          : "bg-white shadow-lg rounded-2xl border border-gray-200"
        }
        transition-all duration-300
        ${isOpen ? "ring-4 ring-[#6B46C1]/20" : ""}
      `}>
        <div className="absolute start-5 text-gray-400">
          <Search className="w-6 h-6" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={t.placeholder}
          className={`
            w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0
            ${variant === "hero" ? "h-16 ps-14 pe-14 text-lg" : "h-14 ps-14 pe-14 text-base"}
            placeholder:text-gray-400
          `}
        />
        
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute end-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-3 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Trending Searches (when no query) */}
              {!query.trim() && (
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <TrendingUp className="w-4 h-4" />
                    {t.trending}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleTrendingClick(term)}
                        className="px-4 py-2 bg-gray-100 hover:bg-[#6B46C1]/10 hover:text-[#6B46C1] rounded-full text-sm font-medium transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query.trim() && (
                <>
                  {hasResults ? (
                    <div className="py-3">
                      {/* Services */}
                      {results.services.length > 0 && (
                        <div className="px-5 py-3">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {t.services}
                          </div>
                          {results.services.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                onClick={() => handleSelect("service", item)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                              >
                                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 text-start">
                                  <div className="font-semibold text-gray-800">{item.names[lang]}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6B46C1] group-hover:translate-x-1 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Pages */}
                      {results.pages.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {t.pages}
                          </div>
                          {results.pages.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                onClick={() => handleSelect("page", item)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1 text-start">
                                  <div className="font-semibold text-gray-800">{item.names[lang]}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6B46C1] group-hover:translate-x-1 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Info */}
                      {results.info.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {t.info}
                          </div>
                          {results.info.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.key}
                                onClick={() => handleSelect("info", item)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                              >
                                <div className="w-12 h-12 bg-[#6B46C1]/10 rounded-xl flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-[#6B46C1]" />
                                </div>
                                <div className="flex-1 text-start">
                                  <div className="font-semibold text-gray-800">{item.names[lang]}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6B46C1] group-hover:translate-x-1 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{t.no_results}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}