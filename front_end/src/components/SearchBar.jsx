import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  BookOpen,
  FileText,
  Briefcase,
  ClipboardList,
  Settings,
  Globe,
  Printer,
  ArrowRight,
  Clock,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const translations = {
  de: {
    placeholder: "Suchen Sie nach Dienstleistungen...",
    search: "Suchen",
    recent: "Letzte Suchen",
    popular: "Beliebte Suchen",
    services: "Dienstleistungen",
    noResults: "Keine Ergebnisse gefunden",
    allResults: "Alle Ergebnisse anzeigen"
  },
  ar: {
    placeholder: "ابحث عن الخدمات...",
    search: "بحث",
    recent: "عمليات البحث الأخيرة",
    popular: "عمليات البحث الشائعة",
    services: "الخدمات",
    noResults: "لم يتم العثور على نتائج",
    allResults: "عرض جميع النتائج"
  },
  en: {
    placeholder: "Search for services...",
    search: "Search",
    recent: "Recent Searches",
    popular: "Popular Searches",
    services: "Services",
    noResults: "No results found",
    allResults: "View all results"
  },
  tr: {
    placeholder: "Hizmetleri arayın...",
    search: "Ara",
    recent: "Son Aramalar",
    popular: "Popüler Aramalar",
    services: "Hizmetler",
    noResults: "Sonuç bulunamadı",
    allResults: "Tüm sonuçları görüntüle"
  },
  es: {
    placeholder: "Buscar servicios...",
    search: "Buscar",
    recent: "Búsquedas recientes",
    popular: "Búsquedas populares",
    services: "Servicios",
    noResults: "No se encontraron resultados",
    allResults: "Ver todos los resultados"
  }
};

const serviceData = {
  de: [
    { key: "office", name: "Büro- & Organisationsservice", desc: "E-Mail, Termine, Dokumente, Rechnungen", icon: Briefcase, color: "bg-purple-500" },
    { key: "forms", name: "Behörden & Formularhilfe", desc: "Anträge, Formulare, Behördengänge", icon: ClipboardList, color: "bg-teal-500" },
    { key: "admin", name: "Administrative Dienstleistungen", desc: "Dokumentenmanagement, Korrespondenz", icon: FileText, color: "bg-green-500" },
    { key: "coordination", name: "Koordinationsleistungen", desc: "Projektkoordination, Terminplanung", icon: Settings, color: "bg-indigo-500" },
    { key: "mercosur", name: "MERCOSUR (LATAM)", desc: "Apostille, Legalisation, Visum", icon: Globe, color: "bg-amber-500" },
    { key: "tutoring", name: "Nachhilfe / Lernunterstützung", desc: "Einzelunterricht, Prüfungsvorbereitung", icon: BookOpen, color: "bg-blue-500" },
    { key: "print", name: "Druck- & Stempeldienstleistungen", desc: "Dokumentendruck, Kopien, Stempel", icon: Printer, color: "bg-pink-500" }
  ],
  ar: [
    { key: "office", name: "خدمة المكتب والتنظيم", desc: "بريد إلكتروني، مواعيد، وثائق، فواتير", icon: Briefcase, color: "bg-purple-500" },
    { key: "forms", name: "مساعدة الدوائر والنماذج", desc: "طلبات، نماذج، زيارات الدوائر", icon: ClipboardList, color: "bg-teal-500" },
    { key: "admin", name: "الخدمات الإدارية", desc: "إدارة المستندات، المراسلات", icon: FileText, color: "bg-green-500" },
    { key: "coordination", name: "خدمات التنسيق", desc: "تنسيق المشاريع، جدولة المواعيد", icon: Settings, color: "bg-indigo-500" },
    { key: "mercosur", name: "ميركوسور (أمريكا اللاتينية)", desc: "أبوستيل، تصديق، تأشيرة", icon: Globe, color: "bg-amber-500" },
    { key: "tutoring", name: "الدروس الخصوصية / دعم التعلم", desc: "دروس فردية، التحضير للامتحانات", icon: BookOpen, color: "bg-blue-500" },
    { key: "print", name: "خدمات الطباعة والأختام", desc: "طباعة مستندات، نسخ، أختام", icon: Printer, color: "bg-pink-500" }
  ],
  en: [
    { key: "office", name: "Office & Organization Service", desc: "Email, appointments, documents, invoices", icon: Briefcase, color: "bg-purple-500" },
    { key: "forms", name: "Government & Form Assistance", desc: "Applications, forms, government visits", icon: ClipboardList, color: "bg-teal-500" },
    { key: "admin", name: "Administrative Services", desc: "Document management, correspondence", icon: FileText, color: "bg-green-500" },
    { key: "coordination", name: "Coordination Services", desc: "Project coordination, scheduling", icon: Settings, color: "bg-indigo-500" },
    { key: "mercosur", name: "MERCOSUR (LATAM)", desc: "Apostille, legalization, visa", icon: Globe, color: "bg-amber-500" },
    { key: "tutoring", name: "Tutoring / Learning Support", desc: "Individual lessons, exam preparation", icon: BookOpen, color: "bg-blue-500" },
    { key: "print", name: "Printing & Stamp Services", desc: "Document printing, copies, stamps", icon: Printer, color: "bg-pink-500" }
  ],
  tr: [
    { key: "office", name: "Ofis ve Organizasyon Hizmeti", desc: "E-posta, randevular, belgeler, faturalar", icon: Briefcase, color: "bg-purple-500" },
    { key: "forms", name: "Resmi Daire ve Form Yardımı", desc: "Başvurular, formlar, daire ziyaretleri", icon: ClipboardList, color: "bg-teal-500" },
    { key: "admin", name: "İdari Hizmetler", desc: "Belge yönetimi, yazışma", icon: FileText, color: "bg-green-500" },
    { key: "coordination", name: "Koordinasyon Hizmetleri", desc: "Proje koordinasyonu, zamanlama", icon: Settings, color: "bg-indigo-500" },
    { key: "mercosur", name: "MERCOSUR (LATAM)", desc: "Apostil, legalizasyon, vize", icon: Globe, color: "bg-amber-500" },
    { key: "tutoring", name: "Özel Ders / Öğrenme Desteği", desc: "Bireysel dersler, sınav hazırlığı", icon: BookOpen, color: "bg-blue-500" },
    { key: "print", name: "Baskı ve Damga Hizmetleri", desc: "Belge baskısı, kopyalar, damgalar", icon: Printer, color: "bg-pink-500" }
  ],
  es: [
    { key: "office", name: "Servicio de Oficina y Organización", desc: "Correo, citas, documentos, facturas", icon: Briefcase, color: "bg-purple-500" },
    { key: "forms", name: "Asistencia Gubernamental y Formularios", desc: "Solicitudes, formularios, visitas", icon: ClipboardList, color: "bg-teal-500" },
    { key: "admin", name: "Servicios Administrativos", desc: "Gestión de documentos, correspondencia", icon: FileText, color: "bg-green-500" },
    { key: "coordination", name: "Servicios de Coordinación", desc: "Coordinación de proyectos, programación", icon: Settings, color: "bg-indigo-500" },
    { key: "mercosur", name: "MERCOSUR (LATAM)", desc: "Apostilla, legalización, visa", icon: Globe, color: "bg-amber-500" },
    { key: "tutoring", name: "Tutoría / Apoyo al Aprendizaje", desc: "Clases individuales, preparación de exámenes", icon: BookOpen, color: "bg-blue-500" },
    { key: "print", name: "Servicios de Impresión y Sellos", desc: "Impresión de documentos, copias, sellos", icon: Printer, color: "bg-pink-500" }
  ]
};

const popularSearches = {
  de: ["Nachhilfe", "Formulare", "Büroservice", "Dokumente", "Koordination"],
  ar: ["دروس خصوصية", "نماذج", "خدمة مكتب", "وثائق", "تنسيق"],
  en: ["Tutoring", "Forms", "Office Service", "Documents", "Coordination"],
  tr: ["Özel ders", "Formlar", "Ofis Hizmeti", "Belgeler", "Koordinasyon"],
  es: ["Clases", "Formularios", "Servicio de Oficina", "Documentos", "Coordinación"]
};

export default function SearchBar({ lang = "de", variant = "hero" }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const t = translations[lang] || translations.de;
  const services = serviceData[lang] || serviceData.de;
  const popular = popularSearches[lang] || popularSearches.de;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("einstein_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = services.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.desc.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, services]);

  const saveSearch = (term) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("einstein_recent_searches", JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm || query;
    if (term.trim()) {
      saveSearch(term);
      navigate(createPageUrl(`Services?search=${encodeURIComponent(term)}`));
      setIsFocused(false);
      setQuery("");
    }
  };

  const handleServiceClick = (service) => {
    saveSearch(service.name);
    navigate(createPageUrl(`Booking?category=${service.key}`));
    setIsFocused(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div
        className={`relative flex items-center transition-all duration-300 ${
          isHero
            ? `bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl ${
                isFocused ? "shadow-purple-500/30 ring-2 ring-[#6B46C1]" : "shadow-black/20"
              }`
            : `bg-white rounded-xl shadow-lg ${
                isFocused ? "shadow-purple-500/20 ring-2 ring-[#6B46C1]" : ""
              }`
        }`}
      >
        <div className="flex items-center justify-center w-14 h-14">
          <Search className={`w-5 h-5 ${isFocused ? "text-[#6B46C1]" : "text-gray-400"}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={t.placeholder}
          className={`flex-1 bg-transparent border-0 outline-none text-gray-800 placeholder-gray-400 ${
            isHero ? "text-lg py-4" : "text-base py-3"
          }`}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="p-2 hover:bg-gray-100 rounded-full mx-1 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}

        <Button
          onClick={() => handleSearch()}
          className={`m-2 bg-gradient-to-r from-[#6B46C1] to-[#805AD5] hover:from-[#805AD5] hover:to-[#6B46C1] text-white flex-shrink-0 ${
            isHero ? "px-4 sm:px-6 py-5 rounded-xl" : "px-4 py-2 rounded-lg"
          }`}
        >
          <Search className="w-4 h-4 sm:me-2" />
          <span className="hidden sm:inline">{t.search}</span>
        </Button>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.services}
                </h3>
                <div className="space-y-1">
                  {results.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.key}
                        onClick={() => handleServiceClick(service)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group text-start"
                      >
                        <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 group-hover:text-[#6B46C1] transition-colors">
                            {service.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{service.desc}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6B46C1] group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t.noResults}</p>
              </div>
            )}

            {/* Default State - Recent & Popular */}
            {!query && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t.recent}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 bg-gray-100 hover:bg-[#6B46C1] hover:text-white rounded-full text-sm font-medium text-gray-700 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t.popular}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(term)}
                        className="px-4 py-2 bg-purple-50 hover:bg-[#6B46C1] hover:text-white rounded-full text-sm font-medium text-[#6B46C1] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Services */}
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {t.services}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {services.slice(0, 6).map((service) => {
                      const Icon = service.icon;
                      return (
                        <button
                          key={service.key}
                          onClick={() => handleServiceClick(service)}
                          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                        >
                          <div className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs text-gray-600 text-center line-clamp-1">
                            {service.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}