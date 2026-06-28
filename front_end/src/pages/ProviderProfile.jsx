import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { priceAdminApi, providersApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Briefcase,
  CheckCircle,
  Award,
  MessageSquare,
  ArrowRight,
  ClipboardList,
  Settings,
  BookOpen,
  Printer,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const translations = {
  de: {
    loading: "Wird geladen...",
    not_found: "Anbieter nicht gefunden",
    about: "Über mich",
    expertise: "Fachgebiete",
    languages: "Sprachen",
    availability: "Verfügbarkeit",
    working_hours: "Arbeitszeiten",
    experience: "Erfahrung",
    years: "Jahre",
    completed_jobs: "Abgeschlossene Aufträge",
    reviews: "Bewertungen",
    hourly_rate: "Stundensatz",
    service_area: "Servicegebiet",
    book_now: "Jetzt buchen",
    qualifications: "Qualifikationen",
    verified: "Verifiziert",
    categories: {
      office: "Büro- und Organisationsservice",
      forms: "Behörden & Formularhilfe",
      admin: "Administrative Dienstleistungen",
      coordination: "Koordinationsleistungen",
      mercosur: "MERCOSUR (LATAM)",
      tutoring: "Nachhilfe / Lernunterstützung",
      print: "Druck- und Stempeldienstleistungen"
    },
    days: {
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag"
    }
  },
  ar: {
    loading: "جاري التحميل...",
    not_found: "مزود الخدمة غير موجود",
    about: "نبذة عني",
    expertise: "مجالات الخبرة",
    languages: "اللغات",
    availability: "التوفر",
    working_hours: "ساعات العمل",
    experience: "الخبرة",
    years: "سنوات",
    completed_jobs: "المهام المنجزة",
    reviews: "التقييمات",
    hourly_rate: "سعر الساعة",
    service_area: "منطقة الخدمة",
    book_now: "احجز الآن",
    qualifications: "المؤهلات",
    verified: "موثق",
    categories: {
      office: "خدمة المكتب والتنظيم",
      forms: "مساعدة الدوائر والنماذج",
      admin: "الخدمات الإدارية",
      coordination: "خدمات التنسيق",
      mercosur: "ميركوسور (أمريكا اللاتينية)",
      tutoring: "الدروس الخصوصية / دعم التعلم",
      print: "خدمات الطباعة والأختام"
    },
    days: {
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد"
    }
  },
  en: {
    loading: "Loading...",
    not_found: "Provider not found",
    about: "About Me",
    expertise: "Expertise",
    languages: "Languages",
    availability: "Availability",
    working_hours: "Working Hours",
    experience: "Experience",
    years: "years",
    completed_jobs: "Completed Jobs",
    reviews: "Reviews",
    hourly_rate: "Hourly Rate",
    service_area: "Service Area",
    book_now: "Book Now",
    qualifications: "Qualifications",
    verified: "Verified",
    categories: {
      office: "Office & Organization Service",
      forms: "Government & Form Assistance",
      admin: "Administrative Services",
      coordination: "Coordination Services",
      mercosur: "MERCOSUR (LATAM)",
      tutoring: "Tutoring / Learning Support",
      print: "Printing & Stamp Services"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    }
  }
};

const categoryIcons = {
  office: Briefcase,
  forms: ClipboardList,
  admin: FileText,
  coordination: Settings,
  mercosur: Globe,
  tutoring: BookOpen,
  print: Printer
};

const categoryColors = {
  office: "bg-purple-500",
  forms: "bg-teal-500",
  admin: "bg-green-500",
  coordination: "bg-indigo-500",
  mercosur: "bg-amber-500",
  tutoring: "bg-blue-500",
  print: "bg-pink-500"
};

export default function ProviderProfile() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("id");
  const [lang, setLang] = useState("de");

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang] || translations.de;

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => providersApi.getProvider(providerId),
    enabled: !!providerId
  });

  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings-provider-profile"],
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t.not_found}</p>
      </div>
    );
  }

  const getBio = () => {
    if (lang === "ar" && provider.bio_ar) return provider.bio_ar;
    if (lang === "en" && provider.bio_en) return provider.bio_en;
    return provider.bio_de || provider.qualifications || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] h-32" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                {/* Avatar */}
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  {provider.profile_image ? (
                    <AvatarImage src={provider.profile_image} alt={provider.full_name} />
                  ) : (
                    <AvatarFallback className="bg-[#c9a227] text-[#1e3a5f] text-3xl font-bold">
                      {provider.full_name?.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Info */}
                <div className="flex-grow pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-[#1e3a5f]">
                          {provider.full_name}
                        </h1>
                        {provider.status === "approved" && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 me-1" />
                            {t.verified}
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {provider.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{provider.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({provider.total_reviews || 0} {t.reviews})</span>
                          </div>
                        )}
                        {provider.total_jobs > 0 && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{provider.total_jobs} {t.completed_jobs}</span>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2">
                        {provider.categories?.map((cat) => {
                          const Icon = categoryIcons[cat];
                          return (
                            <Badge
                              key={cat}
                              className={`${categoryColors[cat]} text-white`}
                            >
                              {Icon && <Icon className="w-3 h-3 me-1" />}
                              {getCategoryName(cat)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Book Button */}
                    <Link to={createPageUrl(`Booking?provider=${provider.id}`)}>
                      <Button className="bg-[#c9a227] hover:bg-[#e6c14a] text-[#1e3a5f] font-bold">
                        {t.book_now}
                        <ArrowRight className="w-4 h-4 ms-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t.about}
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {getBio()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Qualifications */}
            {provider.qualifications && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {t.qualifications}
                    </h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {provider.qualifications}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  {/* Hourly Rate */}
                  {provider.hourly_rate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#c9a227]/10 rounded-lg flex items-center justify-center">
                        <span className="text-[#c9a227] font-bold">€</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.hourly_rate}</p>
                        <p className="font-bold text-[#1e3a5f]">{provider.hourly_rate}€ / h</p>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {provider.experience_years && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.experience}</p>
                        <p className="font-bold text-[#1e3a5f]">{provider.experience_years} {t.years}</p>
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {provider.languages?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.languages}</p>
                        <p className="font-medium text-[#1e3a5f]">{provider.languages.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {/* Service Area */}
                  {provider.service_area && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.service_area}</p>
                        <p className="font-medium text-[#1e3a5f]">{provider.service_area}</p>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  {(provider.working_hours_start || provider.working_hours_end) && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.working_hours}</p>
                        <p className="font-medium text-[#1e3a5f]">
                          {provider.working_hours_start} - {provider.working_hours_end}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Availability */}
            {provider.availability?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {t.availability}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.availability.map((day) => (
                        <Badge
                          key={day}
                          variant="outline"
                          className="border-[#1e3a5f] text-[#1e3a5f]"
                        >
                          {t.days[day.toLowerCase()] || day}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
