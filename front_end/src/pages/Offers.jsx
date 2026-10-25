import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { publicApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { toGrossPrice, allPricesNote } from "@/lib/priceUtils";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  CalendarDays,
  CalendarClock,
  Sparkles,
  Users,
  GraduationCap,
  FileText,
  Wrench,
  CheckCircle,
  ArrowRight,
  Package,
  Shield,
  Heart,
  Clock,
  Euro
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const translations = {
  de: {
    title: "Angebote bei EinStein Institut",
    subtitle: "Ganzheitliche Betreuung aus einer Hand",
    intro_title: "Das EinStein Institut bietet strukturierte und umfassende Dienstleistungspakete",
    intro_desc: "Ziel ist es, eine vollständige Versorgung und Organisation zu gewährleisten – ohne die Notwendigkeit, mehrere externe Dienstleister zu beauftragen. EinStein fungiert dabei als zentrale Institution und alleiniger Ansprechpartner.",
    concept_title: "Unser Konzept: Eine Institution – alle Dienstleistungen",
    concept_desc: "EinStein steht für ein ganzheitliches Betreuungskonzept. Unsere Angebote verbinden:",
    concept_items: [
      "Haushalts- und Immobiliendienstleistungen",
      "Bildungs- und Betreuungsangebote für Kinder",
      "Bürokratische und organisatorische Unterstützung",
      "Handwerks- und technische Leistungen",
      "Digitale und administrative Koordination"
    ],
    packages: {
      fullservice: {
        title: "Ganzheitliche Haus- & Familienbetreuung",
        subtitle: "Full-Service",
        desc: "Dieses Angebot richtet sich an Hausbesitzer:innen, Familien und Personen, die eine vollständige Entlastung im Alltag wünschen.",
        features: [
          "Organisation und Koordination aller Haushaltsarbeiten",
          "Reinigung, Pflege und Instandhaltung von Innen- und Außenbereichen",
          "Koordination von Reparaturen, Technikern und Fachkräften",
          "Bürokratische Unterstützung rund um Haushalt, Immobilie und Familie",
          "Zentrale Betreuung ohne externe Dienstleister"
        ]
      },
      yearly: {
        title: "Jahresbetreuung",
        subtitle: "Ganzjahresmodell",
        desc: "Die Jahresbetreuung bietet eine kontinuierliche, langfristige Begleitung.",
        suitable: "Geeignet für: Hausbesitzer:innen, Familien mit Kindern, Berufstätige mit hohem Organisationsaufwand",
        features: [
          "Laufende Haushalts- und Immobilienorganisation",
          "Regelmäßige Koordination von Reinigung, Wartung und Reparaturen",
          "Kontinuierliche bürokratische Begleitung",
          "Organisation von Bildungs- und Förderangeboten für Kinder",
          "Feste Ansprechpartner und strukturierte Abläufe"
        ]
      },
      monthly: {
        title: "Monatsbetreuung",
        subtitle: "Flexibles Abonnement",
        desc: "Die Monatsbetreuung eignet sich für Kund:innen, die regelmäßige Unterstützung benötigen, jedoch flexibel bleiben möchten.",
        features: [
          "Monatliche Organisation von Haushalts- und Alltagsaufgaben",
          "Bürokratische Unterstützung und Terminmanagement",
          "Koordination von Handwerks- und Technikleistungen bei Bedarf",
          "Begleitung schulischer und organisatorischer Themen der Kinder"
        ]
      },
      weekly: {
        title: "Wochenbetreuung",
        subtitle: "Kurzfristige Entlastung",
        desc: "Die Wochenbetreuung ist ideal für intensive Arbeitsphasen, Krankheits- oder Belastungssituationen und zeitlich begrenzte Projekte.",
        features: [
          "Kurzfristige Organisation des Haushalts",
          "Unterstützung bei Bürokratie und Terminen",
          "Koordination notwendiger Dienstleistungen",
          "Strukturierte Entlastung für einen definierten Zeitraum"
        ]
      },
      single: {
        title: "Einzelleistungen & einmalige Services",
        desc: "Für konkrete Anliegen bietet EinStein auch einmalige Dienstleistungen an.",
        examples: [
          "Organisation eines Umzugs oder einer Renovierung",
          "Bürokratische Begleitung bei spezifischen Anträgen",
          "Einmalige Reparatur- oder Technikkoordination",
          "Haushaltsorganisation oder Grundreinigung",
          "Digitale oder administrative Unterstützung"
        ]
      }
    },
    education_title: "Bildungs- & Kinderbetreuung im Rahmen der Pakete",
    education_desc: "Ein besonderer Schwerpunkt liegt auf der Begleitung von Kindern und Jugendlichen.",
    education_features: [
      "Lernbegleitung und Nachhilfe",
      "Strukturierte Bildungsförderung nach modernem Konzept",
      "Unterstützung bei schulischen und administrativen Angelegenheiten",
      "Entlastung der Eltern durch zentrale Organisation"
    ],
    bureaucracy_title: "Bürokratie & Organisation – zentral gesteuert",
    bureaucracy_desc: "Alle Angebote beinhalten auf Wunsch eine kontinuierliche bürokratische und organisatorische Begleitung:",
    bureaucracy_features: [
      "Unterstützung bei Formularen und Anträgen",
      "Erklärung behördlicher Schreiben",
      "Terminorganisation und Nachverfolgung",
      "Digitale Ordnung und Dokumentenmanagement"
    ],
    flexible_title: "Flexibel kombinierbar",
    flexible_items: [
      "Kombination verschiedener Leistungsbereiche",
      "Anpassung an individuelle Bedürfnisse",
      "Wechsel zwischen Betreuungsmodellen möglich"
    ],
    promise_title: "Unser Versprechen",
    promise_items: [
      "Eine Institution statt vieler Anbieter",
      "Klare Verantwortung und feste Ansprechpartner",
      "Strukturierte, rechtssichere Abläufe",
      "Ganzheitliche Betreuung von Haushalt, Familie und Alltag"
    ],
    cta: "Jetzt beraten lassen",
    contact_us: "Kontaktieren Sie uns",
    prices_title: "Preise"
  },
  ar: {
    title: "عروض معهد آينشتاين",
    subtitle: "رعاية شاملة من مصدر واحد",
    intro_title: "يقدم معهد آينشتاين باقات خدمات منظمة وشاملة",
    intro_desc: "الهدف هو ضمان الرعاية والتنظيم الكامل – دون الحاجة إلى التعاقد مع عدة مزودي خدمات خارجيين. يعمل آينشتاين كمؤسسة مركزية ونقطة اتصال وحيدة.",
    concept_title: "مفهومنا: مؤسسة واحدة – جميع الخدمات",
    concept_desc: "آينشتاين يمثل مفهوم رعاية شاملة. تجمع عروضنا بين:",
    concept_items: [
      "خدمات الأعمال المنزلية والعقارات",
      "عروض التعليم والرعاية للأطفال",
      "الدعم البيروقراطي والتنظيمي",
      "الخدمات الحرفية والتقنية",
      "التنسيق الرقمي والإداري"
    ],
    packages: {
      fullservice: {
        title: "رعاية شاملة للمنزل والأسرة",
        subtitle: "خدمة كاملة",
        desc: "هذا العرض موجه لأصحاب المنازل والعائلات والأشخاص الذين يرغبون في راحة كاملة في الحياة اليومية.",
        features: [
          "تنظيم وتنسيق جميع الأعمال المنزلية",
          "التنظيف والعناية والصيانة للمساحات الداخلية والخارجية",
          "تنسيق الإصلاحات والفنيين والمتخصصين",
          "الدعم البيروقراطي للمنزل والعقارات والأسرة",
          "رعاية مركزية بدون مزودي خدمات خارجيين"
        ]
      },
      yearly: {
        title: "الرعاية السنوية",
        subtitle: "نموذج العام الكامل",
        desc: "توفر الرعاية السنوية مرافقة مستمرة طويلة الأمد.",
        suitable: "مناسب لـ: أصحاب المنازل، العائلات مع الأطفال، العاملين مع متطلبات تنظيمية عالية",
        features: [
          "تنظيم مستمر للمنزل والعقارات",
          "تنسيق منتظم للتنظيف والصيانة والإصلاحات",
          "مرافقة بيروقراطية مستمرة",
          "تنظيم عروض التعليم والدعم للأطفال",
          "جهات اتصال ثابتة وعمليات منظمة"
        ]
      },
      monthly: {
        title: "الرعاية الشهرية",
        subtitle: "اشتراك مرن",
        desc: "الرعاية الشهرية مناسبة للعملاء الذين يحتاجون إلى دعم منتظم ولكن يرغبون في البقاء مرنين.",
        features: [
          "تنظيم شهري لمهام المنزل والحياة اليومية",
          "الدعم البيروقراطي وإدارة المواعيد",
          "تنسيق الخدمات الحرفية والتقنية عند الحاجة",
          "مرافقة المواضيع المدرسية والتنظيمية للأطفال"
        ]
      },
      weekly: {
        title: "الرعاية الأسبوعية",
        subtitle: "راحة قصيرة الأجل",
        desc: "الرعاية الأسبوعية مثالية لمراحل العمل المكثفة، حالات المرض أو الإجهاد والمشاريع محددة الوقت.",
        features: [
          "تنظيم قصير الأجل للمنزل",
          "دعم في البيروقراطية والمواعيد",
          "تنسيق الخدمات الضرورية",
          "راحة منظمة لفترة محددة"
        ]
      },
      single: {
        title: "خدمات فردية وخدمات لمرة واحدة",
        desc: "للاحتياجات المحددة، يقدم آينشتاين أيضاً خدمات لمرة واحدة.",
        examples: [
          "تنظيم انتقال أو تجديد",
          "مرافقة بيروقراطية لطلبات محددة",
          "تنسيق إصلاح أو تقني لمرة واحدة",
          "تنظيم منزلي أو تنظيف أساسي",
          "دعم رقمي أو إداري"
        ]
      }
    },
    education_title: "رعاية التعليم والأطفال ضمن الباقات",
    education_desc: "يكمن التركيز الخاص على مرافقة الأطفال والمراهقين.",
    education_features: [
      "مرافقة التعلم والدروس الخصوصية",
      "دعم تعليمي منظم وفق مفهوم حديث",
      "دعم في المسائل المدرسية والإدارية",
      "راحة الوالدين من خلال التنظيم المركزي"
    ],
    bureaucracy_title: "البيروقراطية والتنظيم – إدارة مركزية",
    bureaucracy_desc: "تتضمن جميع العروض، حسب الرغبة، مرافقة بيروقراطية وتنظيمية مستمرة:",
    bureaucracy_features: [
      "الدعم في النماذج والطلبات",
      "شرح الرسائل الرسمية",
      "تنظيم ومتابعة المواعيد",
      "النظام الرقمي وإدارة المستندات"
    ],
    flexible_title: "قابل للدمج بمرونة",
    flexible_items: [
      "دمج مجالات خدمات مختلفة",
      "التكيف مع الاحتياجات الفردية",
      "إمكانية التبديل بين نماذج الرعاية"
    ],
    promise_title: "وعدنا",
    promise_items: [
      "مؤسسة واحدة بدلاً من العديد من المزودين",
      "مسؤولية واضحة وجهات اتصال ثابتة",
      "عمليات منظمة وآمنة قانونياً",
      "رعاية شاملة للمنزل والأسرة والحياة اليومية"
    ],
    cta: "احصل على استشارة الآن",
    contact_us: "اتصل بنا",
    prices_title: "الأسعار"
  },
  en: {
    title: "Offers at EinStein Institut",
    subtitle: "Comprehensive care from a single source",
    intro_title: "EinStein Institut offers structured and comprehensive service packages",
    intro_desc: "The goal is to ensure complete care and organization – without the need to hire multiple external service providers. EinStein acts as a central institution and sole point of contact.",
    concept_title: "Our Concept: One Institution – All Services",
    concept_desc: "EinStein stands for a holistic care concept. Our offers combine:",
    concept_items: [
      "Household and property services",
      "Educational and childcare services",
      "Bureaucratic and organizational support",
      "Craft and technical services",
      "Digital and administrative coordination"
    ],
    packages: {
      fullservice: {
        title: "Comprehensive Home & Family Care",
        subtitle: "Full-Service",
        desc: "This offer is aimed at homeowners, families and individuals who want complete relief in everyday life.",
        features: [
          "Organization and coordination of all household tasks",
          "Cleaning, care and maintenance of indoor and outdoor areas",
          "Coordination of repairs, technicians and specialists",
          "Bureaucratic support for household, property and family",
          "Central care without external service providers"
        ]
      },
      yearly: {
        title: "Annual Care",
        subtitle: "Full Year Model",
        desc: "Annual care offers continuous, long-term support.",
        suitable: "Suitable for: Homeowners, families with children, professionals with high organizational demands",
        features: [
          "Ongoing household and property organization",
          "Regular coordination of cleaning, maintenance and repairs",
          "Continuous bureaucratic support",
          "Organization of educational and support services for children",
          "Fixed contact persons and structured processes"
        ]
      },
      monthly: {
        title: "Monthly Care",
        subtitle: "Flexible Subscription",
        desc: "Monthly care is suitable for clients who need regular support but want to remain flexible.",
        features: [
          "Monthly organization of household and daily tasks",
          "Bureaucratic support and appointment management",
          "Coordination of craft and technical services as needed",
          "Support with school and organizational matters for children"
        ]
      },
      weekly: {
        title: "Weekly Care",
        subtitle: "Short-term Relief",
        desc: "Weekly care is ideal for intensive work phases, illness or stress situations, and time-limited projects.",
        features: [
          "Short-term household organization",
          "Support with bureaucracy and appointments",
          "Coordination of necessary services",
          "Structured relief for a defined period"
        ]
      },
      single: {
        title: "Individual Services & One-time Services",
        desc: "For specific needs, EinStein also offers one-time services.",
        examples: [
          "Organization of a move or renovation",
          "Bureaucratic support for specific applications",
          "One-time repair or technical coordination",
          "Household organization or deep cleaning",
          "Digital or administrative support"
        ]
      }
    },
    education_title: "Education & Childcare within Packages",
    education_desc: "A special focus is on supporting children and adolescents.",
    education_features: [
      "Learning support and tutoring",
      "Structured educational support according to modern concepts",
      "Support with school and administrative matters",
      "Relief for parents through central organization"
    ],
    bureaucracy_title: "Bureaucracy & Organization – Centrally Managed",
    bureaucracy_desc: "All offers include, if desired, continuous bureaucratic and organizational support:",
    bureaucracy_features: [
      "Support with forms and applications",
      "Explanation of official letters",
      "Appointment organization and follow-up",
      "Digital order and document management"
    ],
    flexible_title: "Flexibly Combinable",
    flexible_items: [
      "Combination of different service areas",
      "Adaptation to individual needs",
      "Switching between care models possible"
    ],
    promise_title: "Our Promise",
    promise_items: [
      "One institution instead of many providers",
      "Clear responsibility and fixed contact persons",
      "Structured, legally secure processes",
      "Comprehensive care for household, family and everyday life"
    ],
    cta: "Get advice now",
    contact_us: "Contact us",
    prices_title: "Prices"
  }
};

const offerIconMap = {
  home: Home,
  calendar: Calendar,
  "calendar-days": CalendarDays,
  "calendar-clock": CalendarClock,
  sparkles: Sparkles
};

export default function Offers() {
  const [lang, setLang] = useState("de");

  const { data: backendOffers = [] } = useQuery({
    queryKey: ["public-offers"],
    queryFn: publicApi.getOffers,
  });

  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["offers-pricing"],
    queryFn: publicApi.listPricing,
  });

  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.items || item.prices || [];
    });
    return pricesObj;
  }, [priceSettingsData]);

  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);

    const handleStorage = () => {
      const newLang = localStorage.getItem("einstein_lang");
      if (newLang) setLang(newLang);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const t = translations[lang] || translations.de;

  const packages = backendOffers.map((offer) => ({
        key: offer.key,
        icon: offerIconMap[offer.icon] || Package,
        color: offer.color || "bg-purple-500",
        lightColor: offer.lightColor || "bg-purple-50",
        offer
      }));

  const getOfferText = (offer, field) => {
    if (!offer) return "";
    return offer[`${field}_${lang}`] || offer[`${field}_de`] || offer[`${field}_en`] || offer[field] || "";
  };

  const getOfferList = (offer, field) => {
    const value = offer?.[field];
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value[lang] || value.de || value.en || value.ar || [];
  };

  const getPrices = (packageKey) => {
    const offer = packages.find((item) => item.key === packageKey)?.offer;
    if (offer?.prices?.length) {
      return offer.prices;
    }

    if (customPrices && customPrices[packageKey]) {
      return customPrices[packageKey].map(p => ({
        label: lang === "ar" ? p.label_ar : lang === "en" ? p.label_en : p.label_de,
        price: p.price,
        unit: lang === "ar" ? p.unit_ar : lang === "en" ? p.unit_en : p.unit_de
      }));
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#6B46C1] mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 font-semibold mb-6">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                {t.intro_title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t.intro_desc}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Concept Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#6B46C1]/10 to-[#c9a227]/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                {t.concept_title}
              </h2>
              <p className="text-gray-600 mb-6">
                {t.concept_desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.concept_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#6B46C1] flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Packages */}
        <div className="space-y-8 mb-16">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            const pkgInfo = {
              title: getOfferText(pkg.offer, "title"),
              subtitle: getOfferText(pkg.offer, "subtitle"),
              desc: getOfferText(pkg.offer, "desc"),
              suitable: getOfferText(pkg.offer, "suitable"),
              features: getOfferList(pkg.offer, "features"),
              examples: getOfferList(pkg.offer, "examples")
            };
            const prices = getPrices(pkg.key);

            return (
              <motion.div
                key={pkg.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className={`${pkg.lightColor} p-6 md:p-8`}>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 ${pkg.color} rounded-2xl flex items-center justify-center`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-[#1e3a5f]">
                            {pkgInfo.title}
                          </h2>
                          {pkgInfo.subtitle && (
                            <Badge className="bg-[#c9a227] text-white">
                              {pkgInfo.subtitle}
                            </Badge>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">
                          {pkgInfo.desc}
                        </p>

                        {pkgInfo.suitable && (
                          <p className="text-sm text-gray-500 italic mb-4">
                            {pkgInfo.suitable}
                          </p>
                        )}

                        <div className="space-y-2 mb-6">
                          {(pkgInfo.features || pkgInfo.examples || []).map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Prices Section */}
                        {prices.length > 0 && (
                          <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
                              <Euro className="w-5 h-5 text-[#6B46C1]" />
                              {t.prices_title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {prices.map((priceItem, i) => (
                                <div key={i} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2">
                                  <span className="text-sm text-gray-700">{priceItem.label}</span>
                                  <Badge className="bg-[#c9a227] text-white font-semibold">
                                    {toGrossPrice(priceItem.price, lang)} {priceItem.unit}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{allPricesNote(lang)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-blue-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">
                  {t.education_title}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                {t.education_desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.education_features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bureaucracy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-green-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">
                  {t.bureaucracy_title}
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                {t.bureaucracy_desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.bureaucracy_features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flexible Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-orange-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">
                  {t.flexible_title}
                </h2>
              </div>
              <div className="space-y-2">
                {t.flexible_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1e3a5f]/10 to-[#6B46C1]/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#6B46C1] rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">
                  {t.promise_title}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t.promise_items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/60 rounded-lg p-4">
                    <Shield className="w-6 h-6 text-[#6B46C1] flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Card className="border-0 shadow-lg bg-[#1e3a5f] text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                EinStein – eine Lösung für alles
              </h3>
              <p className="text-purple-200 mb-6">
                {t.contact_us}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Booking")}>
                  <Button className="bg-[#c9a227] hover:bg-[#b89220] text-white font-semibold px-8 py-6 text-lg">
                    {t.cta}
                    <ArrowRight className="ms-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to={createPageUrl("CustomerService")}>
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                    {t.contact_us}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
