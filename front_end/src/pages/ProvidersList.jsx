import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { priceAdminApi, providersApi } from "@/api/backendClient";
import { requireStoredUser } from "@/lib/backendAuth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  GraduationCap,
  FileText,
  Sparkles,
  Truck,
  Wrench,
  Palette,
  Users,
  Loader2,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProviderCard from "@/components/ProviderCard";

const translations = {
  de: {
    title: "Unsere Fachkräfte",
    subtitle: "Finden Sie den passenden Experten für Ihre Bedürfnisse",
    search: "Name oder Qualifikation suchen...",
    search_area: "Servicegebiet eingeben...",
    all: "Alle",
    no_providers: "Keine Fachkräfte gefunden",
    view_profile: "Profil ansehen",
    book_now: "Buchen",
    categories: {
      office: "Büro- und Organisationsservice",
      forms: "Behörden & Formularhilfe",
      admin: "Administrative Dienstleistungen",
      coordination: "Koordinationsleistungen",
      mercosur: "MERCOSUR (LATAM)",
      tutoring: "Nachhilfe / Lernunterstützung",
      print: "Druck- und Stempeldienstleistungen"
    }
  },
  ar: {
    title: "خبراؤنا",
    subtitle: "ابحث عن الخبير المناسب لاحتياجاتك",
    search: "البحث بالاسم أو المؤهلات...",
    search_area: "أدخل منطقة الخدمة...",
    all: "الكل",
    no_providers: "لم يتم العثور على مزودي خدمات",
    view_profile: "عرض الملف",
    book_now: "احجز",
    categories: {
      office: "خدمة المكتب والتنظيم",
      forms: "مساعدة الدوائر والنماذج",
      admin: "الخدمات الإدارية",
      coordination: "خدمات التنسيق",
      mercosur: "ميركوسور (أمريكا اللاتينية)",
      tutoring: "الدروس الخصوصية / دعم التعلم",
      print: "خدمات الطباعة والأختام"
    }
  },
  en: {
    title: "Our Professionals",
    subtitle: "Find the right expert for your needs",
    search: "Search by name or qualifications...",
    search_area: "Enter service area...",
    all: "All",
    no_providers: "No providers found",
    view_profile: "View Profile",
    book_now: "Book",
    categories: {
      office: "Office & Organization Service",
      forms: "Government & Form Assistance",
      admin: "Administrative Services",
      coordination: "Coordination Services",
      mercosur: "MERCOSUR (LATAM)",
      tutoring: "Tutoring / Learning Support",
      print: "Printing & Stamp Services"
    }
  }
};

import { Briefcase, ClipboardList, Settings, Globe as GlobeIcon, BookOpen, Printer } from "lucide-react";

const categoryFilters = [
  { key: "all", icon: Users },
  { key: "office", icon: Briefcase },
  { key: "forms", icon: ClipboardList },
  { key: "admin", icon: FileText },
  { key: "coordination", icon: Settings },
  { key: "mercosur", icon: GlobeIcon },
  { key: "tutoring", icon: BookOpen },
  { key: "print", icon: Printer }
];

export default function ProvidersList() {
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState("de");
  const [search, setSearch] = useState("");
  const [serviceAreaSearch, setServiceAreaSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const userData = requireStoredUser({ role: "admin" });
      if (!userData) return;
      setUser(userData);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  const t = translations[lang] || translations.de;

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["approved-providers"],
    queryFn: () => providersApi.listProviders("approved"),
    enabled: authChecked
  });

  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings-providers-list"],
    queryFn: priceAdminApi.listPriceGroups,
  });

  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.items || item.prices || [];
    });
    return pricesObj;
  }, [priceSettingsData]);

  const getLabelByLang = (p) => {
    if (!p) return "";
    if (lang === "ar") return p.label_ar || p.label_de || p.label;
    if (lang === "en") return p.label_en || p.label_de || p.label;
    return p.label_de || p.label;
  };

  const getCategoryName = (cat) => {
    if (customPrices && customPrices[cat] && customPrices[cat][0]) {
      const customName = getLabelByLang(customPrices[cat][0]);
      if (customName) return customName;
    }
    return t.categories[cat] || cat;
  }

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      !search ||
      provider.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      provider.qualifications?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      provider.categories?.includes(selectedCategory);

    const matchesServiceArea =
      !serviceAreaSearch ||
      provider.service_area?.toLowerCase().includes(serviceAreaSearch.toLowerCase());

    return matchesSearch && matchesCategory && matchesServiceArea;
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-10"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t.search_area}
                value={serviceAreaSearch}
                onChange={(e) => setServiceAreaSearch(e.target.value)}
                className="ps-10"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categoryFilters.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <Button
                  key={cat.key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={isActive ? "bg-[#1e3a5f]" : ""}
                >
                  <Icon className="w-4 h-4 me-1" />
                  {cat.key === "all" ? t.all : getCategoryName(cat.key)}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t.no_providers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProviderCard
                  provider={provider}
                  translations={t}
                  lang={lang}
                  getCategoryName={getCategoryName}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
