import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { publicApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import StarRating from "@/components/StarRating";
import { displayPrice, allPricesNote, isNetPriced, plusVatNote } from "@/lib/priceUtils";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Globe,
  Info,
  Mail,
  Phone,
  Printer,
  Settings,
  Ship,
} from "lucide-react";
import SecretariatPackages from "@/components/SecretariatPackages";
import PageHero, { fadeUp } from "@/components/site/PageHero";

const translations = {
  de: {
    title: "Unsere Dienstleistungen",
    subtitle: "Behördengänge, Unterlagen und Büro – an einem Ort, in Ihrer Sprache",
    book_now: "Jetzt buchen",
    from: "ab",
    per_hour: "/ Std.",
    per_project: "/ Projekt",
    services: {
      forms: {
        name: "Behörden & Formularhilfe",
        desc: "Unterstützung bei Behördenangelegenheiten, Ausfüllen von Formularen und Anträgen.",
        features: [
          "Ausfüllen von Anträgen und Formularen",
          "Unterstützung bei Behördengängen",
          "Erklärung von Bescheiden",
          "Vorbereitung von Unterlagen",
          "Übersetzungshilfe bei Dokumenten"
        ],
        prices: [
          { label: "Behörden & Formularhilfe", price: "40 €", unit: "/ Stunde" }
        ]
      },
      admin: {
        name: "Administrative Dienstleistungen",
        desc: "Umfassende administrative Unterstützung für alle Ihre Verwaltungsaufgaben.",
        features: [
          "Dokumentenmanagement",
          "Korrespondenz und Schriftverkehr",
          "Terminkoordination",
          "Datenpflege und -organisation",
          "Allgemeine Büroarbeiten"
        ],
        prices: [
          { label: "Administrative Dienstleistungen", price: "40 €", unit: "/ Stunde" }
        ]
      },
      coordination: {
        name: "Koordinationsleistungen",
        desc: "Professionelle Koordination und Projektbetreuung für Ihre Vorhaben.",
        features: [
          "Projektkoordination",
          "Terminplanung und -überwachung",
          "Kommunikation mit Dienstleistern",
          "Qualitätskontrolle",
          "Berichterstattung"
        ],
        prices: [
          { label: "Koordinationsleistungen", price: "30 €", unit: "/ Stunde" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Spezialisierte Dienstleistungen für lateinamerikanische Dokumente und Angelegenheiten.",
        features: [
          "Apostille und Legalisation",
          "Dokumentenübersetzung",
          "Beratung zu MERCOSUR-Abkommen",
          "Unterstützung bei Visumsangelegenheiten",
          "Anerkennung von Abschlüssen"
        ],
        prices: [
          { label: "MERCOSUR Service", price: "150 €", unit: "/ Vorgang" }
        ]
      },
      print: {
        name: "Druck- und Stempeldienstleistungen",
        desc: "Professionelle Druck- und Stempelservices für alle Ihre Bedürfnisse.",
        features: [
          "Dokumentendruck",
          "Kopierservice",
          "Stempelherstellung",
          "Laminieren und Binden",
          "Scan-Service"
        ],
        prices: [
          { label: "Druck- und Stempeldienstleistungen", price: "ab 1 €", unit: "" }
        ]
      },
      office: {
        name: "Projektbezogener Büro- und Organisationsservice",
        desc: "Projektbezogene Büro- und Organisationsdienstleistungen für Selbstständige, kleine Unternehmen sowie Privatpersonen.",
        features: [
          "E-Mail-Management",
          "Terminplanung und Kalenderkoordination",
          "Dokumentenerstellung und -formatierung",
          "Rechnungs- und Angebotsvorbereitung",
          "Digitale Dokumentenorganisation"
        ],
        prices: [
          { label: "Büro- und Organisationsservice", price: "40 €", unit: "/ Stunde" }
        ]
      },
      secretariat: {
        name: "Büro & Sekretariat (Vor-Ort)",
        desc: "Professionelle Sekretariatsleistungen direkt bei Ihnen vor Ort – stundenweise oder als günstiges Monatspaket.",
        features: [
          "Stundenweise Buchung möglich",
          "Vor-Ort-Einsätze beim Kunden",
          "E-Mail- und Korrespondenzmanagement",
          "Termin- und Kalenderverwaltung",
          "Mehrsprachige Kommunikation",
          "Optional: günstige Monatspakete"
        ],
        prices: [
          { label: "Stundensatz (Vor-Ort)", price: "45 €", unit: "/ Stunde" }
        ]
      },
      eur1: {name:"Dokumentenservice für EU–Syrien Warenverkehr / EUR.1",desc:"Administrative Vorbereitung von Export-/Importunterlagen für den Warenverkehr EU–Syrien.",features:["Administrative Vorbereitung von Export-/Importunterlagen","Checklisten","EUR.1-Vorbereitung","Übersetzungen"],note:"Hinweis: EinStein übernimmt keine Zollvertretung, keine Rechtsberatung und keine Steuerberatung. Die Leistung beschränkt sich auf administrative Unterstützung, Dokumentenorganisation, Übersetzung und Kommunikationsbegleitung. Die endgültige Prüfung der Zoll- und Ursprungsfragen erfolgt durch die zuständigen Zollbehörden oder zugelassene Fachstellen.",prices:[{label:"Dokumentenservice EU–Syrien / EUR.1",price:"ab 150 €",unit:""}]},
      dokumentabo: {name:"EinStein Dokumenten-Abo – Ihre Post. Unsere Aufgabe.",desc:"Briefe vom Jobcenter, der Ausländerbehörde, dem Finanzamt, der Krankenkasse oder dem Vermieter? Sie schicken uns ein Foto – wir kümmern uns um den Rest.",features:["Lesen, Übersetzen und Erklären Ihrer Post (bis zu 8 Schreiben pro Monat)","Fristen- und Terminerinnerung","Ausfüllen von Formularen und Anträgen","Einfache Antworten: Unterlagen nachreichen, Termine bestätigen, Adressänderungen","Digitale Ablage","Fester Ansprechpartner"],prices:[{label:"Monatsabo (bis zu 8 Schreiben)",price:"49 €",unit:"/ Monat"},{label:"Weitere Schreiben",price:"20 €",unit:"/ Stunde"}],note:"Nicht enthalten: Rechtsberatung, Widersprüche, Klagen und Streitfälle (Vermittlung an Anwälte/Beratungsstellen) | Versicherungs- oder Steuerberatung. Administrative Unterstützungsleistung, keine Rechtsdienstleistungen im Sinne des RDG. Mindestlaufzeit 1 Monat, danach monatlich kündbar."},
      bueromanagement: {name: "Büro-Management für kleine Betriebe", desc: "Weniger Papier im Kopf, mehr Zeit für Ihre Kunden. Wir übernehmen Ihre gesamte Büro- und Personalorganisation – von den Unterlagen neuer Mitarbeitender bis zur Abstimmung mit Steuerberatung, Kammern und Behörden. Fester Monatsbetrag nach Betriebsgröße.", features: ["Personalstammdaten erfassen, pflegen und auf Vollständigkeit prüfen (z. B. Steuer-ID, IBAN)", "Personalfragebögen, Minijob-Befreiungsanträge und weitere Formulare", "Schreibservice: Arbeitsverträge, Vertragsänderungen und Mitarbeiterschreiben nach Ihren Vorgaben", "Unterlagen bei Betriebsübernahme, Eröffnung oder Umzug", "Formulare für Handwerkskammer, Berufsgenossenschaft und Meldebehörden", "Formulare zur Beschäftigungserlaubnis und Überwachung von Aufenthaltsdokumenten", "Korrespondenz mit Steuerberatung, Kammern, Behörden und Vermietern", "Überwachung von Abgabe- und Meldefristen", "Digitalisierung und geordnete Ablage je Mitarbeitendem", "Erklärung von Unterlagen auf Arabisch, Deutsch, Englisch und Türkisch"], prices: [{label: "Paket Klein (1–4 Mitarbeitende)", price: "200 €", unit: "/ Monat"}, {label: "Paket Mittel (5–6 Mitarbeitende)", price: "300 €", unit: "/ Monat"}, {label: "Paket Groß (ab 7 Mitarbeitenden)", price: "400 €", unit: "/ Monat"}], note: "Alle Pakete enthalten dieselben Leistungen; Minijobber zählen mit. Ändert sich die Zahl der Mitarbeitenden, gilt ab dem Folgemonat das passende Paket. Keine Rechtsdienstleistungen (RDG) und keine Hilfeleistung in Steuersachen (StBerG): Lohnabrechnung, Sozialversicherungsmeldungen und Steuererklärungen übernimmt Ihre Steuerberatung, wir bereiten die Unterlagen vor. Wir vertreten Sie nicht gegenüber Gerichten, Behörden oder Dritten. Nicht enthalten: Behördengänge vor Ort, beglaubigte Übersetzungen sowie Gebühren von Kammern, Behörden und Dritten. Monatlich kündbar."},
    }
  },
  ar: {
    title: "خدماتنا",
    subtitle: "المعاملات والأوراق والأعمال المكتبية – في مكان واحد وبلغتك",
    book_now: "احجز الآن",
    from: "من",
    per_hour: "/ ساعة",
    per_project: "/ مشروع",
    services: {
      forms: {
        name: "مساعدة الدوائر والنماذج",
        desc: "دعم في الشؤون الحكومية، ملء النماذج والطلبات.",
        features: [
          "ملء الطلبات والنماذج",
          "المساعدة في المعاملات الحكومية",
          "شرح القرارات",
          "تحضير الوثائق",
          "المساعدة في ترجمة المستندات"
        ],
        prices: [
          { label: "مساعدة الدوائر والنماذج", price: "40 €", unit: "/ ساعة" }
        ]
      },
      admin: {
        name: "الخدمات الإدارية",
        desc: "دعم إداري شامل لجميع مهامك الإدارية.",
        features: [
          "إدارة المستندات",
          "المراسلات والخطابات",
          "تنسيق المواعيد",
          "صيانة البيانات وتنظيمها",
          "أعمال مكتبية عامة"
        ],
        prices: [
          { label: "الخدمات الإدارية", price: "40 €", unit: "/ ساعة" }
        ]
      },
      coordination: {
        name: "خدمات التنسيق",
        desc: "تنسيق ومتابعة مهنية لمشاريعك.",
        features: [
          "تنسيق المشاريع",
          "تخطيط ومتابعة المواعيد",
          "التواصل مع مقدمي الخدمات",
          "مراقبة الجودة",
          "إعداد التقارير"
        ],
        prices: [
          { label: "خدمات التنسيق", price: "30 €", unit: "/ ساعة" }
        ]
      },
      mercosur: {
        name: "ميركوسور (أمريكا اللاتينية)",
        desc: "خدمات متخصصة للوثائق والشؤون اللاتينية الأمريكية.",
        features: [
          "الأبوستيل والتصديق",
          "ترجمة المستندات",
          "استشارات اتفاقية ميركوسور",
          "دعم شؤون التأشيرات",
          "الاعتراف بالشهادات"
        ],
        prices: [
          { label: "خدمة ميركوسور", price: "150 €", unit: "/ معاملة" }
        ]
      },
      print: {
        name: "خدمات الطباعة والأختام",
        desc: "خدمات طباعة وأختام احترافية لجميع احتياجاتك.",
        features: [
          "طباعة المستندات",
          "خدمة النسخ",
          "صنع الأختام",
          "التغليف والتجليد",
          "خدمة المسح الضوئي"
        ],
        prices: [
          { label: "خدمات الطباعة والأختام", price: "من 1 €", unit: "" }
        ]
      },
      office: {
        name: "خدمة المكتب والتنظيم المشروعية",
        desc: "خدمات مكتبية وتنظيمية على أساس المشاريع للعاملين لحسابهم الخاص والشركات الصغيرة والأفراد.",
        features: [
          "إدارة البريد الإلكتروني",
          "جدولة المواعيد وتنسيق التقويم",
          "إعداد وتنسيق المستندات",
          "إعداد الفواتير والعروض",
          "التنظيم الرقمي للمستندات"
        ],
        prices: [
          { label: "خدمة المكتب والتنظيم", price: "40 €", unit: "/ ساعة" }
        ]
      },
      secretariat: {
        name: "المكتب والسكرتارية (حضوري)",
        desc: "خدمات سكرتارية احترافية مباشرة لديك – بالساعة أو كباقة شهرية مخفضة.",
        features: [
          "حجز بالساعة متاح",
          "زيارات ميدانية عند العميل",
          "إدارة البريد الإلكتروني والمراسلات",
          "إدارة المواعيد والتقويم",
          "تواصل متعدد اللغات",
          "اختياري: باقات شهرية مخفضة"
        ],
        prices: [
          { label: "السعر بالساعة (حضوري)", price: "45 €", unit: "/ ساعة" }
        ]
      },
      eur1: {name:"خدمة وثائق التصدير/الاستيراد بين سوريا والاتحاد الأوروبي / EUR.1",desc:"تحضير إداري لوثائق التصدير/الاستيراد في التبادل التجاري بين الاتحاد الأوروبي وسوريا.",features:["تحضير إداري لوثائق التصدير/الاستيراد","قوائم المراجعة (Checklisten)","تجهيز EUR.1","الترجمات"],note:"ملاحظة: EinStein لا يقدم تمثيلاً جمركياً ولا استشارات قانونية أو ضريبية. تقتصر الخدمة على الدعم الإداري وتنظيم الوثائق والترجمة ومرافقة التواصل. الفحص النهائي لمسائل الجمارك والمنشأ يتم من قبل السلطات الجمركية المختصة أو الجهات المعتمدة.",prices:[{label:"خدمة EUR.1 / EU-سوريا",price:"من 150 €",unit:""}]},
      dokumentabo: {name:"اشتراك EinStein للمستندات – بريدك علينا",desc:"رسالة من الجوب سنتر، أو مكتب الأجانب، أو الضرائب، أو التأمين الصحي، أو المؤجّر؟ صوّرها وأرسلها لنا، ونحن نتابع الباقي.",features:["قراءة الرسائل وترجمتها وشرحها (حتى 8 رسائل شهرياً)","تذكير بالمواعيد والمهل","تعبئة الاستمارات والطلبات","ردود بسيطة: إرسال وثائق ناقصة، تأكيد موعد، تغيير عنوان","أرشفة رقمية","شخص ثابت يتابع ملفك"],prices:[{label:"الاشتراك الشهري (حتى 8 رسائل)",price:"49 €",unit:"/ شهرياً"},{label:"رسائل إضافية",price:"20 €",unit:"/ ساعة"}],note:"لا يشمل: الاستشارات القانونية والاعتراضات والدعاوى والنزاعات (نوجّهك لمحامٍ أو جهة استشارة) | نصائح التأمين أو الضرائب. خدمة إدارية، لا تشمل خدمات قانونية حسب قانون RDG. أقل مدة شهر واحد، بعدها إلغاء شهري."},
      bueromanagement: {name: "إدارة المكتب للشركات الصغيرة", desc: "ورق أقل في رأسك، ووقت أكثر لزبائنك. نتولى كامل تنظيم المكتب وشؤون الموظفين – من أوراق الموظفين الجدد حتى التنسيق مع المستشار الضريبي والغرف المهنية والدوائر الرسمية. مبلغ شهري ثابت حسب حجم المنشأة.", features: ["تسجيل بيانات الموظفين وتحديثها والتحقق من اكتمالها (مثل الرقم الضريبي وIBAN)", "تعبئة استمارات الموظفين وطلبات الإعفاء من التأمين التقاعدي (Minijob) واستمارات أخرى", "خدمة كتابة: عقود العمل وتعديلاتها ورسائل الموظفين حسب تعليماتك", "تنظيم الأوراق عند استلام منشأة أو افتتاحها أو نقلها", "استمارات غرفة الحرف (Handwerkskammer) وBerufsgenossenschaft ودوائر التسجيل", "استمارات إذن العمل ومتابعة صلاحية وثائق الإقامة", "المراسلات مع المستشار الضريبي والغرف والدوائر الرسمية والمؤجرين", "متابعة مواعيد التسليم والإبلاغ والتذكير بها", "رقمنة الوثائق وأرشفتها بشكل منظم لكل موظف", "شرح الوثائق بالعربية والألمانية والإنجليزية والتركية"], prices: [{label: "باقة صغيرة (1–4 موظفين)", price: "200 €", unit: "/ شهرياً"}, {label: "باقة متوسطة (5–6 موظفين)", price: "300 €", unit: "/ شهرياً"}, {label: "باقة كبيرة (7 موظفين فأكثر)", price: "400 €", unit: "/ شهرياً"}], note: "جميع الباقات تشمل نفس الخدمات، ويُحتسب موظفو Minijob ضمن العدد. إذا تغيّر عدد الموظفين تُطبَّق الباقة المناسبة من الشهر التالي. لا نقدم استشارات قانونية (RDG) ولا مساعدة في الشؤون الضريبية (StBerG): رواتب الموظفين وإبلاغات التأمينات الاجتماعية والإقرارات الضريبية يتولاها مستشارك الضريبي، ونحن نجهّز له الأوراق. لا نمثّلك أمام المحاكم أو الدوائر الرسمية أو أطراف أخرى. غير مشمول: المراجعات الشخصية للدوائر، الترجمات المصدّقة، ورسوم الغرف والدوائر والأطراف الأخرى. قابل للإلغاء شهرياً."},
    }
  },
  en: {
    title: "Our Services",
    subtitle: "Paperwork, documents and office help – in one place, in your language",
    book_now: "Book Now",
    from: "from",
    per_hour: "/ hour",
    per_project: "/ project",
    services: {
      forms: {
        name: "Government & Form Assistance",
        desc: "Support with government matters, filling out forms and applications.",
        features: [
          "Filling out applications and forms",
          "Support with government visits",
          "Explanation of official notices",
          "Document preparation",
          "Translation assistance for documents"
        ],
        prices: [
          { label: "Government & Form Assistance", price: "€40", unit: "/ hour" }
        ]
      },
      admin: {
        name: "Administrative Services",
        desc: "Comprehensive administrative support for all your management tasks.",
        features: [
          "Document management",
          "Correspondence and written communication",
          "Appointment coordination",
          "Data maintenance and organization",
          "General office work"
        ],
        prices: [
          { label: "Administrative Services", price: "€40", unit: "/ hour" }
        ]
      },
      coordination: {
        name: "Coordination Services",
        desc: "Professional coordination and project supervision for your projects.",
        features: [
          "Project coordination",
          "Schedule planning and monitoring",
          "Communication with service providers",
          "Quality control",
          "Reporting"
        ],
        prices: [
          { label: "Coordination Services", price: "€30", unit: "/ hour" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Specialized services for Latin American documents and matters.",
        features: [
          "Apostille and legalization",
          "Document translation",
          "MERCOSUR agreement consultation",
          "Visa matter support",
          "Recognition of qualifications"
        ],
        prices: [
          { label: "MERCOSUR Service", price: "€150", unit: "/ case" }
        ]
      },
      print: {
        name: "Printing & Stamp Services",
        desc: "Professional printing and stamp services for all your needs.",
        features: [
          "Document printing",
          "Copy service",
          "Stamp making",
          "Laminating and binding",
          "Scan service"
        ],
        prices: [
          { label: "Printing & Stamp Services", price: "from €1", unit: "" }
        ]
      },
      office: {
        name: "Project-Based Office & Organization Service",
        desc: "Project-based office and organizational services for freelancers, small businesses and individuals.",
        features: [
          "Email management",
          "Appointment scheduling and calendar coordination",
          "Document creation and formatting",
          "Invoice and quote preparation",
          "Digital document organization"
        ],
        prices: [
          { label: "Office & Organization Service", price: "€40", unit: "/ hour" }
        ]
      },
      secretariat: {
        name: "Office & Secretariat (On-Site)",
        desc: "Professional on-site secretarial services – hourly or as a discounted monthly package.",
        features: [
          "Hourly booking available",
          "On-site visits at the customer",
          "Email and correspondence management",
          "Appointment and calendar management",
          "Multilingual communication",
          "Optional: discounted monthly packages"
        ],
        prices: [
          { label: "Hourly rate (on-site)", price: "€45", unit: "/ hour" }
        ]
      },
      eur1: {name:"EU–Syria Trade Document Service / EUR.1",desc:"Administrative preparation of export/import documents for EU–Syria trade.",features:["Administrative preparation of export/import documents","Checklists","EUR.1 preparation","Translations"],note:"Note: EinStein does not provide customs representation, legal advice or tax advice. The service is limited to administrative support, document organization, translation and communication. The final examination of customs and origin matters is carried out by the competent customs authorities or authorized specialist bodies.",prices:[{label:"EU–Syria / EUR.1 Service",price:"from €150",unit:""}]},
      dokumentabo: {name:"EinStein Document Subscription – Your mail. Our job.",desc:"Letters from the Jobcenter, the immigration office, the tax office, your health insurer or your landlord? Send us a photo – we take care of the rest.",features:["Reading, translating and explaining your mail (up to 8 letters per month)","Deadline and appointment reminders","Filling in forms and applications","Simple replies: submitting documents, confirming appointments, address changes","Digital filing","Fixed contact person"],prices:[{label:"Monthly subscription (up to 8 letters)",price:"€49",unit:"/ month"},{label:"Additional letters",price:"€20",unit:"/ hour"}],note:"Not included: legal advice, objections, lawsuits and disputes (we refer you to lawyers or advice centres) | insurance or tax advice. Administrative support service, no legal services under the German RDG. Minimum term 1 month, then cancellable monthly."},
      bueromanagement: {name: "Office Management for Small Businesses", desc: "Less paperwork on your mind, more time for your customers. We take over your entire office and HR administration – from new employees' documents to coordinating with your tax advisor, chambers and authorities. Fixed monthly fee based on company size.", features: ["Recording, maintaining and checking employee master data (e.g. tax ID, IBAN)", "Personnel questionnaires, Minijob pension exemption requests and other forms", "Writing service: employment contracts, amendments and employee letters based on your instructions", "Paperwork for business takeovers, openings or relocations", "Forms for the Chamber of Crafts, Berufsgenossenschaft and registration offices", "Work permit forms and monitoring of residence document validity", "Correspondence with tax advisors, chambers, authorities and landlords", "Monitoring filing and reporting deadlines", "Digitising and filing documents per employee", "Explaining documents in Arabic, German, English and Turkish"], prices: [{label: "Small package (1–4 employees)", price: "200 €", unit: "/ month"}, {label: "Medium package (5–6 employees)", price: "300 €", unit: "/ month"}, {label: "Large package (7+ employees)", price: "400 €", unit: "/ month"}], note: "All packages include the same services; Minijob employees count. If the number of employees changes, the matching package applies from the following month. No legal services (RDG) and no tax assistance (StBerG): payroll, social security reports and tax returns are handled by your tax advisor – we prepare the documents. We do not represent you before courts, authorities or third parties. Not included: in-person visits to authorities, certified translations and fees of chambers, authorities and third parties. Cancellable monthly."},
    }
  },
  uk: {
    title: "Наші послуги",
    subtitle: "Справи з установами, документи та офіс – в одному місці, вашою мовою",
    book_now: "Забронювати",
    from: "від",
    per_hour: "/ год.",
    per_project: "/ проєкт",
    services: {
      forms: {
        name: "Допомога з установами та формулярами",
        desc: "Допомога зі справами в установах, заповнення формулярів і заяв.",
        features: [
          "Заповнення заяв і формулярів",
          "Супровід на прийомах в установах",
          "Пояснення офіційних листів",
          "Підготовка документів",
          "Допомога з перекладом документів"
        ],
        prices: [
          { label: "Допомога з установами та формулярами", price: "40 €", unit: "/ год." }
        ]
      },
      admin: {
        name: "Адміністративні послуги",
        desc: "Повна адміністративна підтримка для всіх ваших справ.",
        features: [
          "Ведення документів",
          "Листування та письмова комунікація",
          "Узгодження зустрічей",
          "Ведення та впорядкування даних",
          "Загальна офісна робота"
        ],
        prices: [
          { label: "Адміністративні послуги", price: "40 €", unit: "/ год." }
        ]
      },
      coordination: {
        name: "Послуги координації",
        desc: "Професійна координація та супровід ваших проєктів.",
        features: [
          "Координація проєктів",
          "Планування строків і контроль",
          "Комунікація з виконавцями",
          "Контроль якості",
          "Звітність"
        ],
        prices: [
          { label: "Послуги координації", price: "30 €", unit: "/ год." }
        ]
      },
      mercosur: {
        name: "MERCOSUR (Латинська Америка)",
        desc: "Спеціалізовані послуги для документів і справ, пов’язаних з Латинською Америкою.",
        features: [
          "Апостиль і легалізація",
          "Переклад документів",
          "Консультація щодо угоди MERCOSUR",
          "Допомога з візовими питаннями",
          "Визнання кваліфікацій"
        ],
        prices: [
          { label: "Послуга MERCOSUR", price: "150 €", unit: "/ справа" }
        ]
      },
      print: {
        name: "Друк і печатки",
        desc: "Професійний друк і виготовлення печаток для всіх ваших потреб.",
        features: [
          "Друк документів",
          "Копіювання",
          "Виготовлення печаток",
          "Ламінування та палітурка",
          "Сканування"
        ],
        prices: [
          { label: "Друк і печатки", price: "від 1 €", unit: "" }
        ]
      },
      office: {
        name: "Проєктні офісні та організаційні послуги",
        desc: "Офісні та організаційні послуги для фрилансерів, малого бізнесу та приватних осіб.",
        features: [
          "Ведення пошти",
          "Планування зустрічей і календаря",
          "Створення та оформлення документів",
          "Підготовка рахунків і пропозицій",
          "Цифрове впорядкування документів"
        ],
        prices: [
          { label: "Офісні та організаційні послуги", price: "40 €", unit: "/ год." }
        ]
      },
      secretariat: {
        name: "Офіс і секретаріат (на місці)",
        desc: "Професійні секретарські послуги на місці – погодинно або як вигідний місячний пакет.",
        features: [
          "Погодинне бронювання",
          "Виїзд до клієнта",
          "Ведення пошти та листування",
          "Керування зустрічами та календарем",
          "Спілкування кількома мовами",
          "За бажанням: вигідні місячні пакети"
        ],
        prices: [
          { label: "Погодинна ставка (на місці)", price: "45 €", unit: "/ год." }
        ]
      },
      eur1: {name:"Документи для торгівлі ЄС–Сирія / EUR.1",desc:"Адміністративна підготовка експортних/імпортних документів для торгівлі ЄС–Сирія.",features:["Адміністративна підготовка експортних/імпортних документів","Чек-листи","Підготовка EUR.1","Переклади"],note:"Примітка: EinStein не здійснює митного представництва, юридичних чи податкових консультацій. Послуга обмежується адміністративною підтримкою, впорядкуванням документів, перекладом і комунікацією. Остаточну перевірку митних питань і походження товарів здійснюють компетентні митні органи або уповноважені фахові установи.",prices:[{label:"Послуга ЄС–Сирія / EUR.1",price:"від 150 €",unit:""}]},
      dokumentabo: {name:"Документна підписка EinStein – ваша пошта, наша робота.",desc:"Листи від Jobcenter, відомства у справах іноземців, податкової, медичної каси чи орендодавця? Надішліть фото – решту зробимо ми.",features:["Читаємо, перекладаємо й пояснюємо вашу пошту (до 8 листів на місяць)","Нагадування про строки та зустрічі","Заповнення формулярів і заяв","Прості відповіді: подання документів, підтвердження зустрічей, зміна адреси","Цифровий архів","Постійна контактна особа"],prices:[{label:"Місячна підписка (до 8 листів)",price:"49 €",unit:"/ міс."},{label:"Додаткові листи",price:"20 €",unit:"/ год."}],note:"Не входить: юридичні консультації, заперечення, позови та спори (ми направляємо до адвокатів або консультаційних центрів) | страхові чи податкові консультації. Адміністративна послуга, не юридична послуга за німецьким законом RDG. Мінімальний строк 1 місяць, далі скасування щомісяця."},
      bueromanagement: {name: "Офіс-менеджмент для малого бізнесу", desc: "Менше паперів – більше часу для клієнтів. Ми беремо на себе всю офісну та кадрову організацію – від документів нових працівників до листування з податковим консультантом, палатами та установами. Фіксована місячна плата залежно від розміру компанії.", features: ["Внесення, ведення та перевірка даних працівників (напр. податковий номер, IBAN)", "Кадрові анкети, заяви щодо звільнення Minijob від пенсійних внесків та інші форми", "Підготовка текстів: трудові договори, зміни та листи працівникам за вашими вказівками", "Документи при передачі, відкритті чи переїзді бізнесу", "Форми для ремісничої палати, Berufsgenossenschaft і реєстраційних установ", "Форми дозволу на роботу та контроль дійсності документів на проживання", "Листування з податковими консультантами, палатами, установами та орендодавцями", "Контроль строків подання та звітності", "Оцифрування та архівування документів за працівниками", "Пояснення документів арабською, німецькою, англійською та турецькою"], prices: [{label: "Малий пакет (1–4 працівники)", price: "200 €", unit: "/ міс."}, {label: "Середній пакет (5–6 працівників)", price: "300 €", unit: "/ міс."}, {label: "Великий пакет (7+ працівників)", price: "400 €", unit: "/ міс."}], note: "Усі пакети містять однакові послуги; працівники Minijob враховуються. Якщо кількість працівників змінюється, відповідний пакет діє з наступного місяця. Без юридичних послуг (RDG) і податкової допомоги (StBerG): зарплату, звіти до соцстраху та податкові декларації веде ваш податковий консультант – ми готуємо документи. Ми не представляємо вас у судах, установах чи перед третіми особами. Не входить: особисті візити до установ, завірені переклади та збори палат, установ і третіх осіб. Скасування щомісяця."},
    }
  },
  tr: {
    title: "Hizmetlerimiz",
    subtitle: "Resmi işler, belgeler ve büro – tek yerde, kendi dilinizde",
    book_now: "Simdi Rezervasyon Yap",
    from: "itibaren",
    per_hour: "/ saat",
    per_project: "/ proje",
    services: {
      forms: {
        name: "Resmi Daire ve Form Yardimi",
        desc: "Resmi isler, form ve basvuru doldurma destegi.",
        features: [
          "Basvuru ve form doldurma",
          "Resmi daire ziyaretlerinde destek",
          "Resmi bildirilerin aciklanmasi",
          "Belge hazirlama",
          "Belge ceviri yardimi"
        ],
        prices: [
          { label: "Resmi Daire ve Form Yardimi", price: "40 Euro", unit: "/ saat" }
        ]
      },
      admin: {
        name: "Idari Hizmetler",
        desc: "Tum yonetim gorevleriniz icin kapsamli idari destek.",
        features: [
          "Belge yonetimi",
          "Yazisma ve iletisim",
          "Randevu koordinasyonu",
          "Veri bakimi ve organizasyonu",
          "Genel ofis isleri"
        ],
        prices: [
          { label: "Idari Hizmetler", price: "40 Euro", unit: "/ saat" }
        ]
      },
      coordination: {
        name: "Koordinasyon Hizmetleri",
        desc: "Projeleriniz icin profesyonel koordinasyon ve proje denetimi.",
        features: [
          "Proje koordinasyonu",
          "Program planlama ve izleme",
          "Hizmet saglayicilarla iletisim",
          "Kalite kontrolu",
          "Raporlama"
        ],
        prices: [
          { label: "Koordinasyon Hizmetleri", price: "30 Euro", unit: "/ saat" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Latin Amerika belgeleri ve konulari icin ozel hizmetler.",
        features: [
          "Apostil ve legalizasyon",
          "Belge cevirisi",
          "MERCOSUR anlasma danismanligi",
          "Vize konularinda destek",
          "Yeterliliklerin taninmasi"
        ],
        prices: [
          { label: "MERCOSUR Hizmeti", price: "150 Euro", unit: "/ islem" }
        ]
      },
      print: {
        name: "Baski ve Damga Hizmetleri",
        desc: "Tum ihtiyaclariniz icin profesyonel baski ve damga hizmetleri.",
        features: [
          "Belge baskisi",
          "Kopya hizmeti",
          "Damga yapimi",
          "Laminasyon ve ciltleme",
          "Tarama hizmeti"
        ],
        prices: [
          { label: "Baski ve Damga Hizmetleri", price: "1 Euro'dan", unit: "" }
        ]
      },
      office: {
        name: "Proje Bazli Ofis ve Organizasyon Hizmeti",
        desc: "Serbest calisanlar, kucuk isletmeler ve bireyler icin proje bazli ofis ve organizasyon hizmetleri.",
        features: [
          "E-posta yonetimi",
          "Randevu planlama ve takvim koordinasyonu",
          "Belge olusturma ve bicimlendirme",
          "Fatura ve teklif hazirlama",
          "Dijital belge organizasyonu"
        ],
        prices: [
          { label: "Ofis ve Organizasyon Hizmeti", price: "40 Euro", unit: "/ saat" }
        ]
      },
      secretariat: {
        name: "Ofis & Sekreterlik (Yerinde)",
        desc: "Yerinde profesyonel sekreterlik hizmetleri – saatlik veya indirimli aylik paket olarak.",
        features: [
          "Saatlik rezervasyon",
          "Musteride yerinde ziyaretler",
          "E-posta ve yazisma yonetimi",
          "Randevu ve takvim yonetimi",
          "Cok dilli iletisim",
          "Opsiyonel: indirimli aylik paketler"
        ],
        prices: [
          { label: "Saatlik ucret (yerinde)", price: "45 Euro", unit: "/ saat" }
        ]
      },
      eur1: {name:"AB–Suriye Ticaret Belge Hizmeti / EUR.1",desc:"AB–Suriye ticareti icin ihracat/ithalat belgelerinin idari hazirligi.",features:["Ihracat/ithalat belgelerinin idari hazirligi","Kontrol listeleri (Checklisten)","EUR.1 hazirligi","Ceviriler"],note:"Not: EinStein gumruk temsilciligi, hukuki danismanlik veya vergi danismanligi sunmaz. Hizmet idari destek ile sinirlidir.",prices:[{label:"AB–Suriye / EUR.1 Hizmeti",price:"150 Euro'dan",unit:""}]},
      dokumentabo: {name:"EinStein Belge Aboneliği – Postanız bize emanet.",desc:"Jobcenter, Yabancılar Dairesi, Vergi Dairesi, sağlık sigortası veya ev sahibinden mektup mu geldi? Bize bir fotoğraf gönderin – gerisini biz hallederiz.",features:["Postanızı okuma, çevirme ve açıklama (ayda en fazla 8 yazı)","Süre ve randevu hatırlatma","Form ve başvuru doldurma","Basit yanıtlar: belge gönderme, randevu onaylama, adres değişikliği","Dijital arşivleme","Sabit irtibat kişisi"],prices:[{label:"Aylık abonelik (en fazla 8 yazı)",price:"49 €",unit:"/ ay"},{label:"Ek yazılar",price:"20 €",unit:"/ saat"}],note:"Dahil değil: hukuki danışmanlık, itirazlar, davalar ve uyuşmazlıklar (avukatlara veya danışma merkezlerine yönlendiririz) | sigorta veya vergi danışmanlığı. İdari destek hizmetidir, Alman RDG kapsamında hukuki hizmet sunulmaz. Asgari süre 1 ay, sonrasında aylık iptal edilebilir."},
      bueromanagement: {name: "Küçük İşletmeler için Büro Yönetimi", desc: "Kafanızda daha az evrak, müşterilerinize daha fazla zaman. Yeni çalışanların belgelerinden mali müşavir, odalar ve resmi kurumlarla yazışmalara kadar tüm büro ve personel organizasyonunuzu üstleniyoruz. İşletme büyüklüğüne göre sabit aylık ücret.", features: ["Personel bilgilerinin kaydı, güncellenmesi ve eksiksizlik kontrolü (ör. vergi numarası, IBAN)", "Personel formları, Minijob emeklilik muafiyeti başvuruları ve diğer formlar", "Yazı hizmeti: talimatlarınıza göre iş sözleşmeleri, değişiklikler ve çalışan yazıları", "İşletme devri, açılışı veya taşınmasında belgelerin düzenlenmesi", "Zanaatkarlar Odası, Berufsgenossenschaft ve kayıt daireleri için formlar", "Çalışma izni formları ve oturum belgelerinin geçerlilik takibi", "Mali müşavir, odalar, resmi kurumlar ve ev sahipleriyle yazışmalar", "Teslim ve bildirim sürelerinin takibi", "Belgelerin dijitalleştirilmesi ve çalışan bazında düzenli arşivlenmesi", "Belgelerin Arapça, Almanca, İngilizce ve Türkçe açıklanması"], prices: [{label: "Küçük paket (1–4 çalışan)", price: "200 €", unit: "/ ay"}, {label: "Orta paket (5–6 çalışan)", price: "300 €", unit: "/ ay"}, {label: "Büyük paket (7+ çalışan)", price: "400 €", unit: "/ ay"}], note: "Tüm paketler aynı hizmetleri içerir; Minijob çalışanları da sayılır. Çalışan sayısı değişirse uygun paket bir sonraki aydan itibaren geçerlidir. Hukuki hizmet (RDG) ve vergi danışmanlığı (StBerG) sunmuyoruz: bordro, sosyal sigorta bildirimleri ve vergi beyannameleri mali müşavirinizin işidir – belgeleri biz hazırlarız. Sizi mahkemeler, resmi kurumlar veya üçüncü kişiler karşısında temsil etmiyoruz. Dahil değildir: resmi kurumlara şahsen gidiş, yeminli tercümeler ve oda, kurum ve üçüncü kişi ücretleri. Aylık iptal edilebilir."},
    }
  },
  es: {
    title: "Nuestros Servicios",
    subtitle: "Trámites, documentos y oficina – en un solo lugar, en su idioma",
    book_now: "Reservar Ahora",
    from: "desde",
    per_hour: "/ hora",
    per_project: "/ proyecto",
    services: {
      forms: {
        name: "Asistencia Gubernamental y Formularios",
        desc: "Apoyo con asuntos gubernamentales, llenado de formularios y solicitudes.",
        features: [
          "Llenado de solicitudes y formularios",
          "Apoyo en visitas gubernamentales",
          "Explicación de notificaciones oficiales",
          "Preparación de documentos",
          "Asistencia de traducción de documentos"
        ],
        prices: [
          { label: "Asistencia Gubernamental y Formularios", price: "40 €", unit: "/ hora" }
        ]
      },
      admin: {
        name: "Servicios Administrativos",
        desc: "Apoyo administrativo integral para todas sus tareas de gestión.",
        features: [
          "Gestión de documentos",
          "Correspondencia y comunicación escrita",
          "Coordinación de citas",
          "Mantenimiento y organización de datos",
          "Trabajo de oficina general"
        ],
        prices: [
          { label: "Servicios Administrativos", price: "40 €", unit: "/ hora" }
        ]
      },
      coordination: {
        name: "Servicios de Coordinación",
        desc: "Coordinación profesional y supervisión de proyectos.",
        features: [
          "Coordinación de proyectos",
          "Planificación y seguimiento de horarios",
          "Comunicación con proveedores de servicios",
          "Control de calidad",
          "Informes"
        ],
        prices: [
          { label: "Servicios de Coordinación", price: "30 €", unit: "/ hora" }
        ]
      },
      mercosur: {
        name: "MERCOSUR (LATAM)",
        desc: "Servicios especializados para documentos y asuntos latinoamericanos.",
        features: [
          "Apostilla y legalización",
          "Traducción de documentos",
          "Consulta sobre acuerdos MERCOSUR",
          "Apoyo en asuntos de visa",
          "Reconocimiento de calificaciones"
        ],
        prices: [
          { label: "Servicio MERCOSUR", price: "150 €", unit: "/ caso" }
        ]
      },
      print: {
        name: "Servicios de Impresión y Sellos",
        desc: "Servicios profesionales de impresión y sellos para todas sus necesidades.",
        features: [
          "Impresión de documentos",
          "Servicio de copias",
          "Fabricación de sellos",
          "Laminado y encuadernación",
          "Servicio de escaneo"
        ],
        prices: [
          { label: "Servicios de Impresión y Sellos", price: "desde 1 €", unit: "" }
        ]
      },
      office: {
        name: "Servicio de Oficina y Organización por Proyecto",
        desc: "Servicios de oficina y organización basados en proyectos para autónomos, pequeñas empresas y particulares.",
        features: [
          "Gestión de correo electrónico",
          "Programación de citas y coordinación de calendario",
          "Creación y formateo de documentos",
          "Preparación de facturas y presupuestos",
          "Organización digital de documentos"
        ],
        prices: [
          { label: "Servicio de Oficina y Organización", price: "40 €", unit: "/ hora" }
        ]
      },
      secretariat: {
        name: "Oficina & Secretariado (Presencial)",
        desc: "Servicios de secretariado profesional en sus instalaciones – por horas o como paquete mensual con descuento.",
        features: [
          "Reserva por horas disponible",
          "Visitas presenciales al cliente",
          "Gestión de correo y correspondencia",
          "Gestión de citas y calendario",
          "Comunicación multilingüe",
          "Opcional: paquetes mensuales con descuento"
        ],
        prices: [
          { label: "Tarifa por hora (presencial)", price: "45 €", unit: "/ hora" }
        ]
      },
      eur1: {name:"Servicio de Documentos Comerciales UE–Siria / EUR.1",desc:"Preparación administrativa de documentos de exportación/importación para el comercio UE–Siria.",features:["Preparación administrativa de documentos de exportación/importación","Listas de verificación (Checklisten)","Preparación EUR.1","Traducciones"],note:"Nota: EinStein no ofrece representación aduanera, asesoría legal ni asesoría fiscal. El servicio se limita al apoyo administrativo.",prices:[{label:"Servicio UE–Siria / EUR.1",price:"desde 150 €",unit:""}]},
      dokumentabo: {name:"Suscripción de Documentos EinStein – Tu correo. Nuestro trabajo.",desc:"¿Cartas del Jobcenter, la oficina de extranjería, Hacienda, tu seguro médico o tu casero? Envíanos una foto – nosotros nos encargamos del resto.",features:["Lectura, traducción y explicación de tu correo (hasta 8 cartas al mes)","Recordatorio de plazos y citas","Rellenar formularios y solicitudes","Respuestas sencillas: enviar documentos, confirmar citas, cambios de dirección","Archivo digital","Persona de contacto fija"],prices:[{label:"Suscripción mensual (hasta 8 cartas)",price:"49 €",unit:"/ mes"},{label:"Cartas adicionales",price:"20 €",unit:"/ hora"}],note:"No incluido: asesoramiento jurídico, recursos, demandas y litigios (te derivamos a abogados o centros de asesoramiento) | asesoramiento de seguros o fiscal. Servicio de apoyo administrativo, sin servicios jurídicos según la ley alemana RDG. Duración mínima 1 mes, después cancelable mensualmente."},
      bueromanagement: {name: "Gestión de Oficina para Pequeñas Empresas", desc: "Menos papeleo en la cabeza, más tiempo para sus clientes. Nos encargamos de toda la organización administrativa y de personal – desde los documentos de nuevos empleados hasta la coordinación con su asesoría fiscal, cámaras y autoridades. Cuota mensual fija según el tamaño de la empresa.", features: ["Registro, mantenimiento y verificación de datos del personal (p. ej. número fiscal, IBAN)", "Cuestionarios de personal, solicitudes de exención de pensión (Minijob) y otros formularios", "Servicio de redacción: contratos de trabajo, modificaciones y cartas al personal según sus indicaciones", "Documentación en traspasos, aperturas o traslados de negocio", "Formularios para la Cámara de Artesanía, Berufsgenossenschaft y oficinas de registro", "Formularios de permiso de trabajo y control de la validez de documentos de residencia", "Correspondencia con asesoría fiscal, cámaras, autoridades y arrendadores", "Control de plazos de presentación y notificación", "Digitalización y archivo ordenado por empleado", "Explicación de documentos en árabe, alemán, inglés y turco"], prices: [{label: "Paquete pequeño (1–4 empleados)", price: "200 €", unit: "/ mes"}, {label: "Paquete mediano (5–6 empleados)", price: "300 €", unit: "/ mes"}, {label: "Paquete grande (7+ empleados)", price: "400 €", unit: "/ mes"}], note: "Todos los paquetes incluyen los mismos servicios; los empleados Minijob cuentan. Si cambia el número de empleados, se aplica el paquete correspondiente a partir del mes siguiente. No prestamos servicios jurídicos (RDG) ni asesoramiento fiscal (StBerG): nóminas, cotizaciones sociales y declaraciones de impuestos las gestiona su asesoría fiscal – nosotros preparamos los documentos. No le representamos ante tribunales, autoridades ni terceros. No incluido: gestiones presenciales ante autoridades, traducciones juradas y tasas de cámaras, autoridades y terceros. Cancelable mensualmente."},
    }
  }
};

// Page texts of the redesigned services page (the service texts are in `translations`)
const P = {
  de: { kicker: "Leistungen", jump: "Direkt zu", prices: "Preise", included: "Das ist enthalten", showPackages: "Monatspakete anzeigen", hidePackages: "Monatspakete ausblenden", trust: ["Keine versteckten Kosten", "Flexible Pakete", "Rabatte für langfristige Betreuung"], legal: "EinStein erbringt ausschließlich genehmigungsfreie Dienstleistungen und keine rechts-, steuer- oder heilberuflichen Leistungen.", ctaTitle: "Nicht sicher, was Sie brauchen?", ctaSub: "Rufen Sie uns an oder schreiben Sie uns – wir sagen Ihnen, welche Leistung passt.", contact: "Kundenservice" },
  ar: { kicker: "الخدمات", jump: "انتقل إلى", prices: "الأسعار", included: "ما تشمله الخدمة", showPackages: "عرض الباقات الشهرية", hidePackages: "إخفاء الباقات الشهرية", trust: ["لا تكاليف خفية", "باقات مرنة", "خصومات للرعاية طويلة المدى"], legal: "يقدّم آينشتاين فقط خدمات لا تتطلب ترخيصاً، ولا يقدّم خدمات قانونية أو ضريبية أو طبية.", ctaTitle: "لست متأكداً من الخدمة التي تحتاجها؟", ctaSub: "اتصل بنا أو راسلنا، وسنخبرك بالخدمة المناسبة لك.", contact: "خدمة العملاء" },
  en: { kicker: "Services", jump: "Jump to", prices: "Prices", included: "What is included", showPackages: "Show monthly packages", hidePackages: "Hide monthly packages", trust: ["No hidden costs", "Flexible packages", "Discounts for long-term support"], legal: "EinStein only provides services that need no licence – no legal, tax or medical services.", ctaTitle: "Not sure what you need?", ctaSub: "Call us or write to us – we will tell you which service fits.", contact: "Customer service" },
  tr: { kicker: "Hizmetler", jump: "Doğrudan git", prices: "Fiyatlar", included: "Neler dahil", showPackages: "Aylık paketleri göster", hidePackages: "Aylık paketleri gizle", trust: ["Gizli maliyet yok", "Esnek paketler", "Uzun süreli destek için indirim"], legal: "EinStein yalnızca izin gerektirmeyen hizmetler sunar; hukuki, vergi veya sağlık hizmeti vermez.", ctaTitle: "Neye ihtiyacınız olduğundan emin değil misiniz?", ctaSub: "Bizi arayın ya da yazın – size uygun hizmeti söyleyelim.", contact: "Müşteri hizmetleri" },
  es: { kicker: "Servicios", jump: "Ir a", prices: "Precios", included: "Qué incluye", showPackages: "Ver paquetes mensuales", hidePackages: "Ocultar paquetes mensuales", trust: ["Sin costes ocultos", "Paquetes flexibles", "Descuentos por atención a largo plazo"], legal: "EinStein solo presta servicios que no requieren licencia: ni servicios jurídicos, fiscales ni médicos.", ctaTitle: "¿No sabe qué necesita?", ctaSub: "Llámenos o escríbanos y le diremos qué servicio le conviene.", contact: "Atención al cliente" },
  uk: { kicker: "Послуги", jump: "Перейти до", prices: "Ціни", included: "Що входить", showPackages: "Показати місячні пакети", hidePackages: "Сховати місячні пакети", trust: ["Без прихованих витрат", "Гнучкі пакети", "Знижки за тривалий супровід"], legal: "EinStein надає лише послуги, що не потребують ліцензії, – без юридичних, податкових чи медичних послуг.", ctaTitle: "Не знаєте, що саме потрібно?", ctaSub: "Зателефонуйте або напишіть нам – ми підкажемо, яка послуга підходить.", contact: "Служба підтримки" },
};

const img = (id) => `https://images.unsplash.com/photo-${id}?w=1000&auto=format&fit=crop`;
const serviceData = [
  { key: "secretariat", icon: Briefcase, image: img("1497366412874-3415097a27e7") },
  { key: "forms", icon: ClipboardList, image: img("1554224155-6726b3ff858f") },
  { key: "admin", icon: FileText, image: img("1450101499163-c8848c66ca85") },
  { key: "coordination", icon: Settings, image: img("1552664730-d307ca884978") },
  { key: "mercosur", icon: Globe, image: img("1526778548025-fa2f459cd5c1") },
  { key: "print", icon: Printer, image: img("1562564055-71e051d33c19") },
  { key: "eur1", icon: Ship, image: img("1494412519320-aa613dfb7738") },
  { key: "dokumentabo", icon: Mail, image: img("1454165804606-c3d57bc86b40") },
  { key: "bueromanagement", icon: Building2, image: img("1497366216548-37526070297c") },
];

export default function Services() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem("einstein_lang") || "ar"; } catch { return "ar"; } });
  const [packagesOpen, setPackagesOpen] = useState(false);

  // Average rating per service
  const { data: bookingsWithRatings = [] } = useQuery({
    queryKey: ["category-ratings"],
    queryFn: publicApi.getRatings,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const categoryRatings = React.useMemo(() => {
    const map = {};
    bookingsWithRatings.forEach((b) => {
      if (!b.rating || !b.category) return;
      map[b.category] = map[b.category] || { sum: 0, count: 0 };
      map[b.category].sum += b.rating;
      map[b.category].count += 1;
    });
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { avg: v.sum / v.count, count: v.count }]));
  }, [bookingsWithRatings]);

  // Prices and names managed in the admin area
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: publicApi.listPricing,
    staleTime: 0,
    refetchOnMount: true,
  });
  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach((item) => { pricesObj[item.category] = item.items || item.prices || []; });
    return pricesObj;
  }, [priceSettingsData]);

  useEffect(() => {
    const handleStorage = () => {
      const newLang = localStorage.getItem("einstein_lang");
      if (newLang) setLang(newLang);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const t = translations[lang] || translations.de;
  const p = P[lang] || P.de;
  const isRTL = lang === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const fromDb = (item, field) => {
    const byLang = { ar: `${field}_ar`, en: `${field}_en`, tr: `${field}_tr`, es: `${field}_es`, uk: `${field}_en` }[lang];
    return (byLang && item[byLang]) || item[`${field}_de`] || item[field];
  };
  const getPrices = (key) => (customPrices?.[key]
    ? customPrices[key].map((item) => ({ label: fromDb(item, "label"), price: item.price, unit: fromDb(item, "unit") }))
    : t.services[key]?.prices || []);
  const getServiceName = (key) => (customPrices?.[key]?.[0] && fromDb(customPrices[key][0], "label")) || t.services[key].name;

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero kicker={p.kicker} title={t.title} subtitle={t.subtitle}>
        <nav aria-label={p.jump} className="mt-8 flex flex-wrap gap-2">
          {serviceData.map(({ key, icon: Icon }) => (
            <a key={key} href={`#service-${key}`} className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-[#4c1d95] shadow-sm transition hover:border-[#7c3aed] hover:bg-purple-50">
              <Icon className="h-4 w-4 text-[#7c3aed]" />{getServiceName(key)}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 md:space-y-16 md:py-16">
        {serviceData.map(({ key, icon: Icon, image }, index) => {
          const info = t.services[key];
          const rating = categoryRatings[key];
          const prices = getPrices(key);
          return (
            <motion.article
              key={key}
              id={`service-${key}`}
              {...fadeUp}
              className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2"
            >
              <div className={`relative min-h-[240px] overflow-hidden bg-purple-50 sm:min-h-[300px] ${index % 2 ? "lg:order-2" : ""}`}>
                <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f0b52]/70 via-[#1f0b52]/10 to-transparent" />
                <div className="absolute bottom-5 start-5 end-5 flex items-end gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-lg"><Icon className="h-6 w-6" /></span>
                  {rating && (
                    <span className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 backdrop-blur">
                      <StarRating value={Math.round(rating.avg)} size="sm" />
                      <span className="text-xs font-semibold text-white">{rating.avg.toFixed(1)} ({rating.count})</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col p-6 md:p-10">
                <h2 className="text-2xl font-black leading-snug text-[#1f0b52] md:text-3xl">{getServiceName(key)}</h2>
                <p className="mt-3 leading-relaxed text-slate-600">{info.desc}</p>

                <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-400">{p.included}</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {info.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-[#f7f3ff] p-4">
                  <p className="text-sm font-bold text-[#4c1d95]">{p.prices}</p>
                  <ul className="mt-2 divide-y divide-purple-100">
                    {prices.map((item) => (
                      <li key={`${item.label}-${item.price}`} className="flex items-center justify-between gap-4 py-2">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <span className="shrink-0 text-base font-black text-[#1f0b52]"><bdi>{displayPrice(item.price, lang, key)} {item.unit}</bdi></span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-slate-500">{isNetPriced(key) ? plusVatNote(lang) : allPricesNote(lang)}</p>
                </div>

                {info.note && (
                  <p className="mt-4 flex gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{info.note}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:items-center">
                  <Link to={createPageUrl(`Booking?category=${key}`)} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] px-7 font-bold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110">
                    {t.book_now}<Arrow className="h-4 w-4" />
                  </Link>
                  {key === "secretariat" && (
                    <button type="button" onClick={() => setPackagesOpen((v) => !v)} aria-expanded={packagesOpen}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-purple-200 px-6 font-bold text-[#4c1d95] transition hover:border-[#7c3aed] hover:bg-purple-50">
                      {packagesOpen ? p.hidePackages : p.showPackages}
                      {packagesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

              {key === "secretariat" && packagesOpen && (
                <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-10 lg:col-span-2">
                  <SecretariatPackages lang={lang} embedded={true} />
                </div>
              )}
            </motion.article>
          );
        })}
      </div>

      {/* Trust + help */}
      <section className="px-4 pb-10">
        <motion.div {...fadeUp} className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1f0b52] via-[#3b1478] to-[#6d28d9] px-6 py-12 text-white md:px-14 md:py-16">
          <svg aria-hidden="true" className="pointer-events-none absolute -bottom-24 -end-24 h-80 w-80 text-white/10" viewBox="0 0 100 100">
            <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="currentColor" />
          </svg>
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">{p.ctaTitle}</h2>
              <p className="mt-3 text-lg text-purple-100">{p.ctaSub}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="tel:+496927246275" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-bold text-[#4c1d95] transition hover:bg-purple-50">
                  <Phone className="h-5 w-5" /><span dir="ltr">069 27246275</span>
                </a>
                <Link to={createPageUrl("CustomerService")} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 font-bold text-white transition hover:bg-white/10">
                  {p.contact}<Arrow className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <ul className="grid gap-3">
              {p.trust.map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-semibold ring-1 ring-white/15">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-300" />{item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-slate-400">{p.legal}</p>
      </section>
    </div>
  );
}
