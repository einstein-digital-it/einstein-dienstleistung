import React, { useState, useEffect } from "react";
import EinsteinLogo from "@/components/EinsteinLogo";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { publicApi } from "@/api/backendClient";
import { displayPrice, priceNote } from "@/lib/priceUtils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import SearchBar from "../components/SearchBar";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  BellRing,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderCheck,
  Globe,
  Heart,
  Languages,
  Mail,
  Printer,
  Quote,
  Settings,
  Shield,
  Ship,
  Target,
  Upload,
  Users,
  Zap
} from "lucide-react";

const translations = {
  de: {
    // Hero
    hero_title: "Organisation & Verwaltung",
    hero_desc: "Organisation. Verwaltung. Umsetzung.\n\nDeutschland ist vielfältig – aber der Alltag oft bürokratisch und zeitintensiv.\nEinStein sorgt für Struktur, Klarheit und Entlastung.",
    hero_solution: "Unsere Leistungen im Überblick:\n\n✔ Behörden- & Formularhilfe\nVon Antragstellung über digitale Einreichung bis zur Nachverfolgung und Abholung.\n\n✔ Büro- & Sekretariatsservice für Praxen, Selbstständige & Unternehmen\nFlexible administrative Unterstützung – bei Bedarf auch mit kurzfristiger Ersatzlösung.\n\n✔ Organisations- & Koordinationsleistungen\nMehrsprachig, professionell und rechtssicher umgesetzt.\n\nWarum EinStein?\n\n• Fester Ansprechpartner\n• Mehrsprachige Kommunikation\n• Transparente Abläufe\n• Schnelle Umsetzung\n• Rechtssichere Struktur",
    motto: "EinStein – Weil Struktur Sicherheit schafft.",
    book_now: "Jetzt buchen",
    view_services: "Alle Dienstleistungen",
    
    // Promises
    promises_title: "Unser Versprechen",
    promise1: "Du musst dich nicht mehr um fünf verschiedene Firmen kümmern – bei uns bekommst du alles aus einer Hand",
    promise2: "Du musst kein Deutschprofi sein – wir sprechen deine Sprache",
    promise3: "Du musst nicht lange warten – wir reagieren schnell und zuverlässig",
    promise4: "Du hast das Gefühl, als hättest du eine eigene Sekretärin oder einen persönlichen Hausmanager",
    
    // About
    about_title: "Über EinStein",
    about_desc: "EinStein ist ein Dienstleistungszentrum für den Alltag. Es bündelt Behördenhilfe, Unterlagen und administrative Dienstleistungen unter einem Dach.",
    about_role: "EinStein versteht sich als persönlicher Alltagsassistent: organisierend, erklärend, ausführend – in mehreren Sprachen und zu fairen Preisen.",
    hauptunternehmer: "Hauptunternehmer – kein Vermittler",
    hauptunternehmer_desc: "EinStein ist der alleinige Vertragspartner der Kund:innen und trägt die vollständige unternehmerische Verantwortung für Planung, Organisation, Qualitätssicherung und Abrechnung aller angebotenen Dienstleistungen.",
    
    // Services
    our_services: "Unsere Dienstleistungen",
    services_subtitle: "Alles aus einer Hand – 9 Bereiche für Ihren Alltag",
    forms: "Behörden & Formularhilfe",
    forms_desc: "Unterstützung bei Behördenangelegenheiten, Ausfüllen von Formularen und Anträgen",
    forms_price: "40 €/Std.",
    admin: "Administrative Dienstleistungen",
    admin_desc: "Dokumentenmanagement, Korrespondenz, Terminkoordination und allgemeine Büroarbeiten",
    admin_price: "40 €/Std.",
    coordination: "Koordinationsleistungen",
    coordination_desc: "Projektkoordination, Terminplanung, Kommunikation mit Dienstleistern",
    coordination_price: "30 €/Std.",
    mercosur: "MERCOSUR (LATAM)",
    mercosur_desc: "Apostille, Legalisation, Dokumentenübersetzung, Visumsangelegenheiten",
    mercosur_price: "150 €/Vorgang",
    print: "Druck- und Stempeldienstleistungen",
    print_desc: "Dokumentendruck, Kopierservice, Stempelherstellung, Laminieren",
    print_price: "ab 1 €",
    office: "Büro- und Organisationsservice",
    office_desc: "E-Mail-Management, Terminplanung, Dokumentenerstellung, Rechnungsvorbereitung",
    office_price: "40 €/Std.",
    eur1: "Dokumentenservice EU–Syrien / EUR.1",
    eur1_desc: "Administrative Vorbereitung von Export-/Importunterlagen, Checklisten, EUR.1-Vorbereitung, Übersetzungen",
    eur1_price: "ab 150 €",
    dokumentabo: "EinStein Dokumenten-Abo",
    dokumentabo_desc: "Ihre Post. Unsere Aufgabe. Briefe von Behörden & Versicherungen – Sie schicken uns ein Foto, wir kümmern uns um den Rest.",
    dokumentabo_price: "49 € / Monat",
    bueromanagement: "Büro-Management für Betriebe",
    bueromanagement_desc: "Ihre gesamte Büro- und Personalorganisation zum festen Monatspreis – Mitarbeiterunterlagen, Verträge, Kammern, Fristen.",
    bueromanagement_price: "ab 200 € / Monat",
    
    // Quality
    quality_title: "EinStein-geprüft – Qualität garantiert",
    quality_desc: "Alle Fachkräfte werden vor Einsatz geprüft und zertifiziert",
    quality_steps: [
      "Identitäts- & Gewerbenachweis",
      "Qualifikations- & Erfahrungsprüfung",
      "Persönliches Gespräch",
      "Probeauftrag",
      "Aufnahme in das EinStein-System"
    ],
    
    // Why Einstein
    why_einstein: "Warum EinStein?",
    why_quality: "Geprüfte Qualität",
    why_quality_desc: "Alle Fachkräfte werden vor Einsatz geprüft und zertifiziert",
    why_multilingual: "Mehrsprachig",
    why_multilingual_desc: "Deutsch, Arabisch, Kurdisch, Englisch, Russisch, Türkisch und mehr",
    why_one_stop: "Alles aus einer Hand",
    why_one_stop_desc: "Ein Ansprechpartner für alle Ihre Alltagsbedürfnisse",
    why_fair: "Faire Preise",
    why_fair_desc: "Transparente Preisgestaltung ohne versteckte Kosten",
    why_fast: "Schnell & Zuverlässig",
    why_fast_desc: "Kurze Reaktionszeiten und pünktliche Ausführung",
    why_responsible: "Volle Verantwortung",
    why_responsible_desc: "EinStein ist Ihr direkter Vertragspartner mit Gewährleistung",
    
    // Target Groups
    target_title: "Für wen ist EinStein?",
    target_subtitle: "Für Menschen, die Klarheit brauchen. Für Unternehmen, die Struktur suchen.",
    targets: [
      "Privatpersonen & Familien",
      "Mehrsprachige Haushalte",
      "Selbstständige & kleine Unternehmen",
      "Praxen & Büros mit administrativem Bedarf"
    ],
    
    // Packages
    packages_title: "Intelligente Paketlösungen",
    packages_desc: "Kombinieren Sie mehrere Dienstleistungen und sparen Sie bis zu 25%",
    package1_title: "Verwaltungspaket",
    package1_desc: "Behördenhilfe + Dokumentenmanagement + Terminkoordination",
    package1_save: "Ersparnis: ca. 22%",
    package2_title: "Integrationspass",
    package2_desc: "Sprachförderung + Antragshilfe + Fahrtbegleitung",
    package2_save: "150 €/Monat statt 200 €",
    package3_title: "Berufsstartpaket",
    package3_desc: "Lebenslauf + Bewerbung drucken + Begleitung zur Agentur",
    package3_save: "75 € statt 120 €",
    
    // CTA
    become_provider: "Werden Sie Fachkraft",
    become_provider_desc: "Arbeiten Sie flexibel als selbstständige Fachkraft im EinStein-Netzwerk. Planbare Aufträge, faire Konditionen.",
    apply_now: "Jetzt bewerben",
    
    // Footer info
    no_hidden: "Keine versteckten Kosten",
    flexible: "Flexible Pakete möglich",
    discounts: "Rabatte für langfristige Betreuung",
    note: "Hinweis: EinStein erbringt ausschließlich genehmigungsfreie Dienstleistungen."
  },
  ar: {
    // Hero
    hero_title: "التنظيم والإدارة",
    hero_desc: "تنظيم. إدارة. تنفيذ.\n\nألمانيا متنوعة – لكن الحياة اليومية غالباً بيروقراطية وتستهلك الوقت.\nآينشتاين يوفّر لك التنظيم والوضوح والراحة.",
    hero_solution: "خدماتنا باختصار:\n\n✔ المساعدة في الدوائر الرسمية والاستمارات\nمن تقديم الطلب والإرسال الإلكتروني حتى المتابعة والاستلام.\n\n✔ خدمة المكتب والسكرتارية للعيادات والمستقلين والشركات\nدعم إداري مرن – وعند الحاجة حلول بديلة سريعة.\n\n✔ خدمات التنظيم والتنسيق\nبعدة لغات، باحترافية وبشكل آمن قانونياً.\n\nلماذا آينشتاين؟\n\n• شخص تواصل ثابت\n• تواصل بعدة لغات\n• خطوات واضحة وشفافة\n• تنفيذ سريع\n• هيكل آمن قانونياً",
    motto: "آينشتاين – لأن التنظيم يصنع الأمان.",
    book_now: "احجز الآن",
    view_services: "جميع الخدمات",
    
    // Promises
    promises_title: "وعدنا لك",
    promise1: "لا تحتاج للتعامل مع خمس شركات مختلفة - عندنا تحصل على كل شيء من مكان واحد",
    promise2: "لا تحتاج أن تكون محترفاً في الألمانية - نحن نتحدث لغتك",
    promise3: "لا تحتاج للانتظار طويلاً - نستجيب بسرعة وموثوقية",
    promise4: "ستشعر وكأن لديك سكرتيرة خاصة أو مدير منزل شخصي",
    
    // About
    about_title: "عن آينشتاين",
    about_desc: "آينشتاين هو مركز خدمات شامل للحياة اليومية. يجمع المساعدة في المعاملات والأوراق والخدمات الإدارية تحت سقف واحد.",
    about_role: "يعتبر آينشتاين نفسه مساعداً شخصياً للحياة اليومية: منظم، شارح، منفذ - بعدة لغات وبأسعار عادلة.",
    hauptunternehmer: "مقاول رئيسي - وليس وسيط",
    hauptunternehmer_desc: "آينشتاين هي الشريك التعاقدي الوحيد للعملاء وتتحمل المسؤولية الكاملة عن التخطيط والتنظيم وضمان الجودة والفوترة لجميع الخدمات المقدمة.",
    
    // Services
    our_services: "خدماتنا",
    services_subtitle: "كل شيء من مكان واحد - 9 مجالات لحياتك اليومية",
    forms: "مساعدة الدوائر والنماذج",
    forms_desc: "دعم في الشؤون الحكومية، ملء النماذج والطلبات",
    forms_price: "40 €/ساعة",
    admin: "الخدمات الإدارية",
    admin_desc: "إدارة المستندات، المراسلات، تنسيق المواعيد وأعمال مكتبية عامة",
    admin_price: "40 €/ساعة",
    coordination: "خدمات التنسيق",
    coordination_desc: "تنسيق المشاريع، تخطيط المواعيد، التواصل مع مقدمي الخدمات",
    coordination_price: "30 €/ساعة",
    mercosur: "ميركوسور (أمريكا اللاتينية)",
    mercosur_desc: "الأبوستيل، التصديق، ترجمة المستندات، شؤون التأشيرات",
    mercosur_price: "150 €/معاملة",
    print: "خدمات الطباعة والأختام",
    print_desc: "طباعة المستندات، خدمة النسخ، صنع الأختام، التغليف",
    print_price: "من 1 €",
    office: "خدمة المكتب والتنظيم",
    office_desc: "إدارة البريد الإلكتروني، جدولة المواعيد، إعداد المستندات، تحضير الفواتير",
    office_price: "40 €/ساعة",
    eur1: "خدمة وثائق التصدير/الاستيراد EUR.1",
    eur1_desc: "تجهيز ملف التصدير والاستيراد إدارياً، Checklist، ترجمة، تحضير EUR.1",
    eur1_price: "من 150 €",
    dokumentabo: "اشتراك EinStein للمستندات",
    dokumentabo_desc: "بريدك علينا. رسالة من الجهات الرسمية أو التأمين؟ صوّرها وأرسلها لنا، ونحن نتابع الباقي.",
    dokumentabo_price: "49 يورو شهرياً",
    bueromanagement: "إدارة المكتب للشركات",
    bueromanagement_desc: "كامل تنظيم المكتب وشؤون الموظفين بسعر شهري ثابت – أوراق الموظفين، العقود، الغرف المهنية، المواعيد.",
    bueromanagement_price: "من 200 € شهرياً",
    
    // Quality
    quality_title: "معتمد من آينشتاين - جودة مضمونة",
    quality_desc: "جميع المتخصصين يتم فحصهم واعتمادهم قبل العمل",
    quality_steps: [
      "إثبات الهوية والنشاط التجاري",
      "فحص المؤهلات والخبرة",
      "مقابلة شخصية",
      "مهمة تجريبية",
      "القبول في نظام آينشتاين"
    ],
    
    // Why Einstein
    why_einstein: "لماذا آينشتاين؟",
    why_quality: "جودة معتمدة",
    why_quality_desc: "جميع المتخصصين يتم فحصهم واعتمادهم قبل العمل",
    why_multilingual: "متعدد اللغات",
    why_multilingual_desc: "ألماني، عربي، كردي، إنجليزي، روسي، تركي والمزيد",
    why_one_stop: "كل شيء من مكان واحد",
    why_one_stop_desc: "جهة اتصال واحدة لجميع احتياجاتك اليومية",
    why_fair: "أسعار عادلة",
    why_fair_desc: "تسعير شفاف بدون تكاليف مخفية",
    why_fast: "سريع وموثوق",
    why_fast_desc: "أوقات استجابة قصيرة وتنفيذ دقيق",
    why_responsible: "مسؤولية كاملة",
    why_responsible_desc: "آينشتاين هو شريكك التعاقدي المباشر مع الضمان",
    
    // Target Groups
    target_title: "لمن آينشتاين؟",
    target_subtitle: "للأشخاص الذين يحتاجون الوضوح. للشركات التي تبحث عن التنظيم.",
    targets: [
      "الأفراد والعائلات",
      "الأسر متعددة اللغات",
      "المستقلون والشركات الصغيرة",
      "العيادات والمكاتب ذات الاحتياجات الإدارية"
    ],
    
    // Packages
    packages_title: "حلول الباقات الذكية",
    packages_desc: "اجمع عدة خدمات ووفر حتى 25%",
    package1_title: "باقة الإدارة",
    package1_desc: "مساعدة الدوائر + إدارة المستندات + تنسيق المواعيد",
    package1_save: "توفير: حوالي 22%",
    package2_title: "بطاقة الاندماج",
    package2_desc: "دعم لغوي + مساعدة طلبات + مرافقة",
    package2_save: "150 €/شهر بدلاً من 200 €",
    package3_title: "باقة بداية المهنة",
    package3_desc: "سيرة ذاتية + طباعة طلب + مرافقة للوكالة",
    package3_save: "75 € بدلاً من 120 €",
    
    // CTA
    become_provider: "انضم كمزود خدمة",
    become_provider_desc: "اعمل بمرونة كمتخصص مستقل في شبكة آينشتاين. مهام مخططة، شروط عادلة.",
    apply_now: "قدم الآن",
    
    // Footer info
    no_hidden: "لا تكاليف مخفية",
    flexible: "باقات مرنة متاحة",
    discounts: "خصومات للرعاية طويلة المدى",
    note: "ملاحظة: يقدم آينشتاين فقط خدمات لا تتطلب تصريحاً."
  },
  en: {
    // Hero
    hero_title: "Organisation & Administration",
    hero_desc: "Organisation. Administration. Execution.\n\nGermany is diverse – but daily life is often bureaucratic and time-consuming.\nEinStein provides structure, clarity and relief.",
    hero_solution: "Our services at a glance:\n\n✔ Government & Form Assistance\nFrom application submission to digital filing, tracking and collection.\n\n✔ Office & Secretariat Service for Practices, Freelancers & Companies\nFlexible administrative support – with short-notice replacement solutions if needed.\n\n✔ Organisation & Coordination Services\nMultilingual, professional and legally secure.\n\nWhy EinStein?\n\n• Fixed contact person\n• Multilingual communication\n• Transparent processes\n• Fast implementation\n• Legally secure structure",
    motto: "EinStein – Because structure creates security.",
    book_now: "Book Now",
    view_services: "All Services",
    
    // Promises
    promises_title: "Our Promise",
    promise1: "You don't need to deal with five different companies – with us you get everything from one source",
    promise2: "You don't need to be a German expert – we speak your language",
    promise3: "You don't need to wait long – we respond quickly and reliably",
    promise4: "You'll feel like you have your own secretary or personal house manager",
    
    // About
    about_title: "About EinStein",
    about_desc: "EinStein is a comprehensive service center for daily life. It combines help with authorities, documents and administrative services under one roof.",
    about_role: "EinStein sees itself as a personal daily assistant: organizing, explaining, executing – in multiple languages and at fair prices.",
    hauptunternehmer: "Main Contractor – Not a Broker",
    hauptunternehmer_desc: "EinStein is the sole contractual partner of customers and bears full entrepreneurial responsibility for planning, organization, quality assurance, and billing of all services offered.",
    
    // Services
    our_services: "Our Services",
    services_subtitle: "Everything from one source – 9 areas for your daily life",
    forms: "Government & Form Assistance",
    forms_desc: "Support with government matters, filling out forms and applications",
    forms_price: "€40/hr",
    admin: "Administrative Services",
    admin_desc: "Document management, correspondence, appointment coordination and general office work",
    admin_price: "€40/hr",
    coordination: "Coordination Services",
    coordination_desc: "Project coordination, schedule planning, communication with service providers",
    coordination_price: "€30/hr",
    mercosur: "MERCOSUR (LATAM)",
    mercosur_desc: "Apostille, legalization, document translation, visa matters",
    mercosur_price: "€150/case",
    print: "Printing & Stamp Services",
    print_desc: "Document printing, copy service, stamp making, laminating",
    print_price: "from €1",
    office: "Office & Organization Service",
    office_desc: "Email management, appointment scheduling, document creation, invoice preparation",
    office_price: "€40/hr",
    eur1: "EU–Syria Document Service / EUR.1",
    eur1_desc: "Administrative preparation of export/import documents, checklists, EUR.1 preparation, translation",
    eur1_price: "from €150",
    dokumentabo: "EinStein Document Subscription",
    dokumentabo_desc: "Your mail. Our job. Letters from authorities & insurers – send us a photo, we take care of the rest.",
    dokumentabo_price: "€49 / month",
    bueromanagement: "Office Management for Businesses",
    bueromanagement_desc: "Your entire office and HR administration for a fixed monthly fee – employee documents, contracts, chambers, deadlines.",
    bueromanagement_price: "from €200 / month",
    
    // Quality
    quality_title: "EinStein-Certified – Quality Guaranteed",
    quality_desc: "All professionals are tested and certified before work",
    quality_steps: [
      "Identity & business verification",
      "Qualification & experience check",
      "Personal interview",
      "Trial assignment",
      "Admission to EinStein system"
    ],
    
    // Why Einstein
    why_einstein: "Why EinStein?",
    why_quality: "Verified Quality",
    why_quality_desc: "All professionals are tested and certified before work",
    why_multilingual: "Multilingual",
    why_multilingual_desc: "German, Arabic, Kurdish, English, Russian, Turkish and more",
    why_one_stop: "One-Stop Solution",
    why_one_stop_desc: "One contact for all your daily needs",
    why_fair: "Fair Prices",
    why_fair_desc: "Transparent pricing with no hidden costs",
    why_fast: "Fast & Reliable",
    why_fast_desc: "Short response times and punctual execution",
    why_responsible: "Full Responsibility",
    why_responsible_desc: "EinStein is your direct contractual partner with warranty",
    
    // Target Groups
    target_title: "Who is EinStein for?",
    target_subtitle: "For people who need clarity. For businesses seeking structure.",
    targets: [
      "Individuals & Families",
      "Multilingual Households",
      "Self-employed & Small Businesses",
      "Practices & Offices with Administrative Needs"
    ],
    
    // Packages
    packages_title: "Smart Package Solutions",
    packages_desc: "Combine multiple services and save up to 25%",
    package1_title: "Administration Package",
    package1_desc: "Government assistance + Document management + Appointment coordination",
    package1_save: "Savings: approx. 22%",
    package2_title: "Integration Pass",
    package2_desc: "Language support + Application help + Accompaniment",
    package2_save: "€150/month instead of €200",
    package3_title: "Career Starter Package",
    package3_desc: "CV + Print application + Agency accompaniment",
    package3_save: "€75 instead of €120",
    
    // CTA
    become_provider: "Become a Provider",
    become_provider_desc: "Work flexibly as an independent professional in the EinStein network. Plannable assignments, fair conditions.",
    apply_now: "Apply Now",
    
    // Footer info
    no_hidden: "No hidden costs",
    flexible: "Flexible packages available",
    discounts: "Discounts for long-term care",
    note: "Note: EinStein only provides services that do not require a permit."
  },
  uk: {
    // Hero
    hero_title: "Організація та адміністрування",
    hero_desc: "Організація. Адміністрування. Виконання.\n\nНімеччина різноманітна – але повсякденне життя часто бюрократичне й забирає багато часу.\nEinStein дає структуру, ясність і полегшення.",
    hero_solution: "Наші послуги коротко:\n\n✔ Допомога з установами та формулярами\nВід подання заяви до цифрового архіву, контролю строків і отримання документів.\n\n✔ Офісні та секретарські послуги для практик, фрилансерів і компаній\nГнучка адміністративна підтримка – за потреби з швидкою заміною.\n\n✔ Організація та координація\nБагатьма мовами, професійно й юридично надійно.\n\nЧому EinStein?\n\n• Постійна контактна особа\n• Спілкування кількома мовами\n• Прозорі процеси\n• Швидке виконання\n• Юридично надійна структура",
    motto: "EinStein – бо структура дає впевненість.",
    book_now: "Забронювати",
    view_services: "Усі послуги",

    // Promises
    promises_title: "Наша обіцянка",
    promise1: "Вам не потрібно мати справу з п’ятьма різними фірмами – у нас усе з одних рук",
    promise2: "Вам не потрібно бути знавцем німецької – ми говоримо вашою мовою",
    promise3: "Вам не доведеться довго чекати – ми відповідаємо швидко й надійно",
    promise4: "Ви відчуєте, ніби маєте власного секретаря чи особистого помічника вдома",

    // About
    about_title: "Про EinStein",
    about_desc: "EinStein – сервісний центр для повсякденного життя. Ми поєднуємо допомогу з установами, документами та адміністративні послуги під одним дахом.",
    about_role: "EinStein – ваш особистий помічник у повсякденних справах: організовує, пояснює, виконує – кількома мовами та за чесними цінами.",
    hauptunternehmer: "Генеральний підрядник – не посередник",
    hauptunternehmer_desc: "EinStein є єдиним договірним партнером клієнтів і несе повну відповідальність за планування, організацію, контроль якості та розрахунки за всі послуги.",

    // Services
    our_services: "Наші послуги",
    services_subtitle: "Усе з одних рук – для вашого повсякденного життя",
    forms: "Допомога з установами та формулярами",
    forms_desc: "Допомога зі справами в установах, заповнення формулярів і заяв",
    forms_price: "40 €/год.",
    admin: "Адміністративні послуги",
    admin_desc: "Ведення документів, листування, узгодження зустрічей і загальна офісна робота",
    admin_price: "40 €/год.",
    coordination: "Послуги координації",
    coordination_desc: "Координація проєктів, планування строків, комунікація з виконавцями",
    coordination_price: "30 €/год.",
    mercosur: "MERCOSUR (Латинська Америка)",
    mercosur_desc: "Апостиль, легалізація, переклад документів, візові питання",
    mercosur_price: "150 €/справа",
    print: "Друк і печатки",
    print_desc: "Друк документів, копіювання, виготовлення печаток, ламінування",
    print_price: "від 1 €",
    office: "Офісні та організаційні послуги",
    office_desc: "Ведення пошти, планування зустрічей, підготовка документів і рахунків",
    office_price: "40 €/год.",
    eur1: "Документи ЄС–Сирія / EUR.1",
    eur1_desc: "Адміністративна підготовка експортних/імпортних документів, чек-листи, підготовка EUR.1, переклад",
    eur1_price: "від 150 €",
    dokumentabo: "Документна підписка EinStein",
    dokumentabo_desc: "Ваша пошта – наша робота. Листи від установ і страховиків – надішліть фото, решту зробимо ми.",
    dokumentabo_price: "49 € / міс.",
    bueromanagement: "Офіс-менеджмент для бізнесу",
    bueromanagement_desc: "Уся офісна та кадрова організація за фіксовану місячну плату – документи працівників, договори, палати, строки.",
    bueromanagement_price: "від 200 € / міс.",

    // Quality
    quality_title: "Сертифіковано EinStein – якість гарантована",
    quality_desc: "Усі фахівці проходять перевірку та сертифікацію перед роботою",
    quality_steps: [
      "Перевірка особи та діяльності",
      "Перевірка кваліфікації та досвіду",
      "Особиста співбесіда",
      "Пробне завдання",
      "Допуск до системи EinStein"
    ],

    // Why Einstein
    why_einstein: "Чому EinStein?",
    why_quality: "Перевірена якість",
    why_quality_desc: "Усі фахівці проходять перевірку та сертифікацію перед роботою",
    why_multilingual: "Багатомовність",
    why_multilingual_desc: "Німецька, арабська, курдська, англійська, російська, турецька та інші",
    why_one_stop: "Усе в одному місці",
    why_one_stop_desc: "Один контакт для всіх повсякденних справ",
    why_fair: "Чесні ціни",
    why_fair_desc: "Прозорі ціни без прихованих витрат",
    why_fast: "Швидко й надійно",
    why_fast_desc: "Короткий час відповіді та вчасне виконання",
    why_responsible: "Повна відповідальність",
    why_responsible_desc: "EinStein – ваш прямий договірний партнер з гарантією",

    // Target Groups
    target_title: "Для кого EinStein?",
    target_subtitle: "Для людей, яким потрібна ясність. Для бізнесу, якому потрібна структура.",
    targets: [
      "Приватні особи та родини",
      "Багатомовні домогосподарства",
      "Самозайняті та малий бізнес",
      "Практики й офіси з адміністративними потребами"
    ],

    // Packages
    packages_title: "Вигідні пакети",
    packages_desc: "Поєднуйте кілька послуг і заощаджуйте до 25%",
    package1_title: "Адміністративний пакет",
    package1_desc: "Допомога з установами + ведення документів + узгодження зустрічей",
    package1_save: "Економія: близько 22%",
    package2_title: "Пакет інтеграції",
    package2_desc: "Мовна підтримка + допомога із заявами + супровід",
    package2_save: "150 €/міс. замість 200 €",
    package3_title: "Пакет для старту кар’єри",
    package3_desc: "Резюме + друк заяви + супровід до агентства",
    package3_save: "75 € замість 120 €",

    // CTA
    become_provider: "Стати виконавцем",
    become_provider_desc: "Працюйте гнучко як незалежний фахівець у мережі EinStein. Передбачувані замовлення, чесні умови.",
    apply_now: "Подати заявку",

    // Footer info
    no_hidden: "Без прихованих витрат",
    flexible: "Доступні гнучкі пакети",
    discounts: "Знижки для довгострокової співпраці",
    note: "Примітка: EinStein надає лише послуги, які не потребують дозволу."
  },
  tr: {
    // Hero
    hero_title: "Organizasyon ve Yönetim",
    hero_desc: "Organizasyon. Yönetim. Uygulama.\n\nAlmanya çok çeşitli – ama günlük yaşam çoğu zaman bürokratik ve zaman alıcı.\nEinStein düzen, netlik ve rahatlık sağlar.",
    hero_solution: "Hizmetlerimize genel bakış:\n\n✔ Resmi kurum ve form yardımı\nBaşvurudan dijital teslime, takipten teslim almaya kadar.\n\n✔ Muayenehaneler, serbest çalışanlar ve şirketler için büro ve sekreterlik hizmeti\nEsnek idari destek – gerekirse kısa sürede yedek çözüm.\n\n✔ Organizasyon ve koordinasyon hizmetleri\nÇok dilli, profesyonel ve hukuken güvenli.\n\nNeden EinStein?\n\n• Sabit iletişim kişisi\n• Çok dilli iletişim\n• Şeffaf süreçler\n• Hızlı uygulama\n• Hukuken güvenli yapı",
    motto: "EinStein – Çünkü düzen güven yaratır.",
    book_now: "Simdi Rezervasyon Yap",
    view_services: "Tum Hizmetler",
    
    // Promises
    promises_title: "Sozumuz",
    promise1: "Bes farkli sirketle ugrasmana gerek yok - bizde her seyi tek kaynaktan alirsin",
    promise2: "Almanca uzmani olmana gerek yok - senin dilini konusuyoruz",
    promise3: "Uzun beklemeye gerek yok - hizli ve guvenilir yanit veriyoruz",
    promise4: "Kendi sekreterine veya kisisel ev yoneticine sahipmissin gibi hissedeceksin",
    
    // About
    about_title: "EinStein Hakkında",
    about_desc: "EinStein, gunluk yasam icin kapsamli bir hizmet merkezidir. Resmi işlerde yardımı, belgeleri ve idari hizmetleri tek çatı altında birleştirir.",
    about_role: "EinStein kendini kisisel gunluk asistan olarak gorur: organize eden, aciklayan, uygulayan - birden fazla dilde ve adil fiyatlarla.",
    hauptunternehmer: "Ana Yuklenici - Araci Degil",
    hauptunternehmer_desc: "EinStein, musterilerin tek sozlesmeli ortagi olup sunulan tum hizmetlerin planlamasi, organizasyonu, kalite guvencesi ve faturalanmasi icin tam girisimci sorumlulugu tasir.",
    
    // Services
    our_services: "Hizmetlerimiz",
    services_subtitle: "Her sey tek kaynaktan - gunluk yasamin icin 9 alan",
    forms: "Resmi Daire ve Form Yardimi",
    forms_desc: "Resmi isler, form ve basvuru doldurma destegi",
    forms_price: "40 Euro/saat",
    admin: "Idari Hizmetler",
    admin_desc: "Belge yonetimi, yazisma, randevu koordinasyonu ve genel ofis isleri",
    admin_price: "40 Euro/saat",
    coordination: "Koordinasyon Hizmetleri",
    coordination_desc: "Proje koordinasyonu, program planlama, hizmet saglayicilarla iletisim",
    coordination_price: "30 Euro/saat",
    mercosur: "MERCOSUR (LATAM)",
    mercosur_desc: "Apostil, legalizasyon, belge cevirisi, vize konulari",
    mercosur_price: "150 Euro/islem",
    print: "Baski ve Damga Hizmetleri",
    print_desc: "Belge baskisi, kopya hizmeti, damga yapimi, laminasyon",
    print_price: "1 Euro'dan",
    office: "Ofis ve Organizasyon Hizmeti",
    office_desc: "E-posta yonetimi, randevu planlama, belge olusturma, fatura hazirlama",
    office_price: "40 Euro/saat",
    eur1: "AB–Suriye Belge Hizmeti / EUR.1",
    eur1_desc: "AB–Suriye ticareti icin ihracat/ithalat belgelerinin idari hazirligi.",
    eur1_price: "150 Euro'dan",
    dokumentabo: "EinStein Belge Aboneliği",
    dokumentabo_desc: "Postanız bize emanet. Bize bir fotoğraf gönderin – gerisini biz hallederiz.",
    dokumentabo_price: "49 € / ay",
    bueromanagement: "İşletmeler için Büro Yönetimi",
    bueromanagement_desc: "Tüm büro ve personel organizasyonunuz sabit aylık ücretle – çalışan belgeleri, sözleşmeler, odalar, süreler.",
    bueromanagement_price: "200 €'dan / ay",
    
    // Quality
    quality_title: "EinStein Sertifikali - Kalite Garantili",
    quality_desc: "Tum profesyoneller calismadan once test edilir ve sertifikalandirilir",
    quality_steps: [
      "Kimlik ve isletme dogrulamasi",
      "Yeterlilik ve deneyim kontrolu",
      "Kisisel gorusme",
      "Deneme gorevi",
      "EinStein sistemine kabul"
    ],
    
    // Why Einstein
    why_einstein: "Neden EinStein?",
    why_quality: "Dogrulanmis Kalite",
    why_quality_desc: "Tum profesyoneller calismadan once test edilir ve sertifikalandirilir",
    why_multilingual: "Cok Dilli",
    why_multilingual_desc: "Almanca, Arapca, Kurtce, Ingilizce, Rusca, Turkce ve daha fazlasi",
    why_one_stop: "Tek Durak Cozum",
    why_one_stop_desc: "Tum gunluk ihtiyaclarin icin tek irtibat",
    why_fair: "Adil Fiyatlar",
    why_fair_desc: "Gizli maliyet olmadan seffaf fiyatlandirma",
    why_fast: "Hizli ve Guvenilir",
    why_fast_desc: "Kisa yanit sureleri ve dakik uygulama",
    why_responsible: "Tam Sorumluluk",
    why_responsible_desc: "EinStein garantili dogrudan sozlesmeli ortaginizdir",
    
    // Target Groups
    target_title: "EinStein kimin icin?",
    target_subtitle: "Netlik isteyen insanlar icin. Yapi arayan isletmeler icin.",
    targets: [
      "Bireyler ve Aileler",
      "Cok dilli Haneler",
      "Serbest calisanlar ve Kucuk Isletmeler",
      "Idari ihtiyaclari olan Muayenehaneler ve Ofisler"
    ],
    
    // Packages
    packages_title: "Akilli Paket Cozumleri",
    packages_desc: "Birden fazla hizmeti birlestirin ve %25'e kadar tasarruf edin",
    package1_title: "Yonetim Paketi",
    package1_desc: "Resmi daire yardimi + Belge yonetimi + Randevu koordinasyonu",
    package1_save: "Tasarruf: yaklasik %22",
    package2_title: "Entegrasyon Pasaportu",
    package2_desc: "Dil destegi + Basvuru yardimi + Eslik",
    package2_save: "200 Euro yerine 150 Euro/ay",
    package3_title: "Kariyer Baslangic Paketi",
    package3_desc: "Ozgecmis + Basvuru baskisi + Ajans esligi",
    package3_save: "120 Euro yerine 75 Euro",
    
    // CTA
    become_provider: "Saglayici Ol",
    become_provider_desc: "EinStein aginda bagimsiz profesyonel olarak esnek calis. Planlanabilir gorevler, adil kosullar.",
    apply_now: "Simdi Basvur",
    
    // Footer info
    no_hidden: "Gizli maliyet yok",
    flexible: "Esnek paketler mevcut",
    discounts: "Uzun vadeli bakim icin indirimler",
    note: "Not: EinStein yalnizca izin gerektirmeyen hizmetler sunmaktadir."
  },
  es: {
    // Hero
    hero_title: "Organización y Administración",
    hero_desc: "Organización. Administración. Ejecución.\n\nAlemania es diversa – pero el día a día suele ser burocrático y lleva mucho tiempo.\nEinStein aporta estructura, claridad y alivio.",
    hero_solution: "Nuestros servicios de un vistazo:\n\n✔ Ayuda con trámites y formularios\nDesde la solicitud y el envío digital hasta el seguimiento y la recogida.\n\n✔ Servicio de oficina y secretaría para consultas, autónomos y empresas\nApoyo administrativo flexible – con sustitución a corto plazo si hace falta.\n\n✔ Servicios de organización y coordinación\nMultilingüe, profesional y con seguridad jurídica.\n\n¿Por qué EinStein?\n\n• Persona de contacto fija\n• Comunicación multilingüe\n• Procesos transparentes\n• Ejecución rápida\n• Estructura jurídicamente segura",
    motto: "EinStein – Porque la estructura da seguridad.",
    book_now: "Reservar ahora",
    view_services: "Todos los servicios",
    
    // Promises
    promises_title: "Nuestra Promesa",
    promise1: "No necesitas lidiar con cinco empresas diferentes: con nosotros obtienes todo de una sola fuente",
    promise2: "No necesitas ser un experto en alemán: hablamos tu idioma",
    promise3: "No necesitas esperar mucho: respondemos rápida y confiablemente",
    promise4: "Te sentirás como si tuvieras tu propia secretaria o administrador de casa personal",
    
    // About
    about_title: "Sobre EinStein",
    about_desc: "EinStein es un centro de servicios integral para la vida diaria. Combina ayuda con trámites, documentos y servicios administrativos bajo un mismo techo.",
    about_role: "EinStein se ve a sí mismo como un asistente personal diario: organiza, explica, ejecuta, en varios idiomas y a precios justos.",
    hauptunternehmer: "Contratista Principal - No Intermediario",
    hauptunternehmer_desc: "EinStein es el único socio contractual de los clientes y asume la responsabilidad empresarial completa de planificación, organización, garantía de calidad y facturación de todos los servicios ofrecidos.",
    
    // Services
    our_services: "Nuestros Servicios",
    services_subtitle: "Todo de una sola fuente - 9 áreas para tu vida diaria",
    forms: "Asistencia Gubernamental y Formularios",
    forms_desc: "Apoyo con asuntos gubernamentales, llenado de formularios y solicitudes",
    forms_price: "40 €/hora",
    admin: "Servicios Administrativos",
    admin_desc: "Gestión de documentos, correspondencia, coordinación de citas y trabajo de oficina general",
    admin_price: "40 €/hora",
    coordination: "Servicios de Coordinación",
    coordination_desc: "Coordinación de proyectos, planificación de horarios, comunicación con proveedores",
    coordination_price: "30 €/hora",
    mercosur: "MERCOSUR (LATAM)",
    mercosur_desc: "Apostilla, legalización, traducción de documentos, asuntos de visa",
    mercosur_price: "150 €/caso",
    print: "Servicios de Impresión y Sellos",
    print_desc: "Impresión de documentos, servicio de copias, fabricación de sellos, laminado",
    print_price: "desde 1 €",
    office: "Servicio de Oficina y Organización",
    office_desc: "Gestión de correo, programación de citas, creación de documentos, preparación de facturas",
    office_price: "40 €/hora",
    eur1: "Servicio de Documentos UE–Siria / EUR.1",
    eur1_desc: "Preparación administrativa de documentos de exportación/importación para el comercio UE–Siria.",
    eur1_price: "desde 150 €",
    dokumentabo: "Suscripción de Documentos EinStein",
    dokumentabo_desc: "Tu correo. Nuestro trabajo. Envíanos una foto – nosotros nos encargamos del resto.",
    dokumentabo_price: "49 € / mes",
    bueromanagement: "Gestión de Oficina para Empresas",
    bueromanagement_desc: "Toda su organización administrativa y de personal por una cuota mensual fija – documentos del personal, contratos, cámaras, plazos.",
    bueromanagement_price: "desde 200 € / mes",
    
    // Quality
    quality_title: "Certificado por EinStein - Calidad Garantizada",
    quality_desc: "Todos los profesionales son probados y certificados antes del trabajo",
    quality_steps: [
      "Verificación de identidad y negocio",
      "Control de calificación y experiencia",
      "Entrevista personal",
      "Asignación de prueba",
      "Admisión al sistema EinStein"
    ],
    
    // Why Einstein
    why_einstein: "¿Por qué EinStein?",
    why_quality: "Calidad Verificada",
    why_quality_desc: "Todos los profesionales son probados y certificados antes del trabajo",
    why_multilingual: "Multilingüe",
    why_multilingual_desc: "Alemán, árabe, kurdo, inglés, ruso, turco y más",
    why_one_stop: "Solución Integral",
    why_one_stop_desc: "Un contacto para todas tus necesidades diarias",
    why_fair: "Precios Justos",
    why_fair_desc: "Precios transparentes sin costos ocultos",
    why_fast: "Rápido y Confiable",
    why_fast_desc: "Tiempos de respuesta cortos y ejecución puntual",
    why_responsible: "Responsabilidad Total",
    why_responsible_desc: "EinStein es tu socio contractual directo con garantía",
    
    // Target Groups
    target_title: "¿Para quién es EinStein?",
    target_subtitle: "Para personas que necesitan claridad. Para empresas que buscan estructura.",
    targets: [
      "Particulares y Familias",
      "Hogares Multilingües",
      "Autónomos y Pequeñas Empresas",
      "Consultorios y Oficinas con Necesidades Administrativas"
    ],
    
    // Packages
    packages_title: "Soluciones de Paquetes Inteligentes",
    packages_desc: "Combina múltiples servicios y ahorra hasta un 25%",
    package1_title: "Paquete de Administración",
    package1_desc: "Asistencia gubernamental + Gestión documental + Coordinación de citas",
    package1_save: "Ahorro: aprox. 22%",
    package2_title: "Pase de Integración",
    package2_desc: "Apoyo lingüístico + Ayuda administrativa + Acompañamiento",
    package2_save: "150 €/mes en lugar de 200 €",
    package3_title: "Paquete de Inicio Profesional",
    package3_desc: "CV + Impresión de solicitud + Acompañamiento a agencia",
    package3_save: "75 € en lugar de 120 €",
    
    // CTA
    become_provider: "Conviértete en Proveedor",
    become_provider_desc: "Trabaja de forma flexible como profesional independiente en la red EinStein. Asignaciones planificables, condiciones justas.",
    apply_now: "Aplicar Ahora",
    
    // Footer info
    no_hidden: "Sin costos ocultos",
    flexible: "Paquetes flexibles disponibles",
    discounts: "Descuentos para cuidado a largo plazo",
    note: "Nota: EinStein solo proporciona servicios que no requieren permiso."
  }
};

const services = [
  { key: "office", icon: Briefcase, color: "bg-purple-500" },
  { key: "forms", icon: ClipboardList, color: "bg-teal-500" },
  { key: "admin", icon: FileText, color: "bg-green-500" },
  { key: "coordination", icon: Settings, color: "bg-indigo-500" },
  { key: "mercosur", icon: Globe, color: "bg-amber-500" },
  { key: "print", icon: Printer, color: "bg-pink-500" },
  { key: "eur1", icon: Ship, color: "bg-rose-600" },
  { key: "dokumentabo", icon: Mail, color: "bg-purple-600" },
  { key: "bueromanagement", icon: Briefcase, color: "bg-sky-700" }
];

// Texts of the redesigned home page (the older keys above still feed services, why and quality)
const X = {
  de: {
    badge: "Ihr Partner für den Alltag in Deutschland",
    heroTitle: "Behördenpost, Termine, Büro – wir kümmern uns.",
    heroSub: "EinStein erledigt Formulare, Briefe und Organisation für Sie – mehrsprachig, persönlich und zu fairen Preisen.",
    ctaBook: "Jetzt buchen", ctaFile: "Brief hochladen",
    trust: ["Arabisch, Deutsch, Englisch, Türkisch …", "Feste Ansprechperson", "Transparente Preise"],
    demoFrom: "Jobcenter Frankfurt", demoTitle: "Weiterbewilligungsantrag", demoSorted: "Sortiert: Jobcenter", demoSummary: "Ihr Bürgergeld endet am 30.11. Stellen Sie bis dahin den Weiterbewilligungsantrag.", demoReminder: "Erinnerung in 5 Tagen",
    authorities: "Wir helfen bei Post von",
    servicesKicker: "Leistungen", servicesMore: "Alle Leistungen ansehen", book: "Buchen",
    fileKicker: "Meine Unterlagen", fileTitle: "Jeder Brief sortiert, übersetzt und mit Frist im Blick.", fileSub: "Fotografieren Sie Ihre Post. Unsere KI ordnet sie dem richtigen Ordner zu, übersetzt sie in Ihre Sprache und erinnert Sie an Fristen.",
    fileSteps: [["Hochladen", "Foto oder PDF, auch mehrere auf einmal"], ["Sortiert & übersetzt", "Im richtigen Ordner, in Ihrer Sprache"], ["Erinnert", "Bevor eine Frist abläuft"]],
    fileCta: "Meine Unterlagen öffnen", fileNote: "Monatsabo, jederzeit kündbar",
    howKicker: "So einfach geht’s", howTitle: "In drei Schritten erledigt",
    how: [["Leistung wählen", "Online oder per Telefon – in Ihrer Sprache."], ["Termin bekommen", "Wir bestätigen und nennen den Preis vorab."], ["Erledigt", "Wir kümmern uns – Sie behalten den Überblick."]],
    whyKicker: "Warum EinStein",
    forKicker: "Für wen",
    ctaTitle: "Bereit, den Papierkram abzugeben?", ctaSub: "Buchen Sie in wenigen Minuten – wir melden uns schnell zurück.",
  },
  ar: {
    badge: "شريكك في الحياة اليومية في ألمانيا",
    heroTitle: "رسائل الدوائر الرسمية والمواعيد والأعمال المكتبية – نتولاها عنك.",
    heroSub: "يتولى آينشتاين عنك الاستمارات والرسائل والتنظيم – بلغتك، وبتواصل شخصي، وبأسعار عادلة.",
    ctaBook: "احجز الآن", ctaFile: "ارفع رسالة",
    trust: ["العربية، الألمانية، الإنجليزية، التركية …", "جهة تواصل ثابتة", "أسعار واضحة"],
    demoFrom: "Jobcenter Frankfurt", demoTitle: "طلب استمرار إعانة المواطن (Bürgergeld)", demoSorted: "حُفظت في مجلد: مركز العمل", demoSummary: "تنتهي إعانة المواطن الخاصة بك في 30.11. قدّم طلب الاستمرار قبل هذا التاريخ.", demoReminder: "تذكير بعد 5 أيام",
    authorities: "نساعدك في الرسائل الواردة من",
    servicesKicker: "خدماتنا", servicesMore: "جميع الخدمات", book: "احجز",
    fileKicker: "ملفاتي", fileTitle: "كل رسالة مرتّبة ومترجمة، وموعدها أمامك.", fileSub: "صوّر رسائلك، فيحفظها الذكاء الاصطناعي في المجلد الصحيح، ويترجمها إلى لغتك، ويذكّرك قبل المواعيد.",
    fileSteps: [["ارفع", "صورة أو ملف PDF، ويمكنك رفع عدة ملفات دفعة واحدة"], ["مرتّبة ومترجمة", "في المجلد الصحيح وبلغتك"], ["تذكير", "قبل انتهاء الموعد"]],
    fileCta: "افتح ملفاتي", fileNote: "اشتراك شهري، يمكنك إلغاؤه في أي وقت",
    howKicker: "بكل سهولة", howTitle: "ثلاث خطوات فقط",
    how: [["اختر الخدمة", "عبر الإنترنت أو بالهاتف – وبلغتك."], ["احجز موعداً", "نؤكد لك الموعد ونخبرك بالسعر مسبقاً."], ["انتهى الأمر", "نتولى كل شيء – ونبقيك على اطلاع دائم."]],
    whyKicker: "لماذا آينشتاين",
    forKicker: "لمن خدماتنا",
    ctaTitle: "هل أنت مستعد لتسليمنا أوراقك؟", ctaSub: "احجز خلال دقائق – وسنتواصل معك سريعاً.",
  },
  en: {
    badge: "Your partner for daily life in Germany",
    heroTitle: "Official letters, appointments, office work – handled.",
    heroSub: "EinStein takes care of forms, letters and organisation for you – multilingual, personal and at fair prices.",
    ctaBook: "Book now", ctaFile: "Upload a letter",
    trust: ["Arabic, German, English, Turkish …", "One fixed contact person", "Transparent prices"],
    demoFrom: "Jobcenter Frankfurt", demoTitle: "Continuation application", demoSorted: "Sorted: Jobcenter", demoSummary: "Your Bürgergeld ends on 30.11. Submit the continuation application before then.", demoReminder: "Reminder in 5 days",
    authorities: "We help with letters from",
    servicesKicker: "Services", servicesMore: "See all services", book: "Book",
    fileKicker: "My documents", fileTitle: "Every letter sorted, translated, deadline in sight.", fileSub: "Photograph your mail. Our AI files it in the right folder, translates it into your language and reminds you of deadlines.",
    fileSteps: [["Upload", "Photo or PDF, several at once"], ["Sorted & translated", "In the right folder, in your language"], ["Reminded", "Before a deadline passes"]],
    fileCta: "Open my documents", fileNote: "Monthly subscription, cancel any time",
    howKicker: "How it works", howTitle: "Done in three steps",
    how: [["Choose a service", "Online or by phone – in your language."], ["Get an appointment", "We confirm and tell you the price up front."], ["Done", "We take care of it – you stay informed."]],
    whyKicker: "Why EinStein",
    forKicker: "Who it’s for",
    ctaTitle: "Ready to hand over the paperwork?", ctaSub: "Book in minutes – we get back to you quickly.",
  },
  uk: {
    badge: "Ваш партнер у повсякденному житті в Німеччині",
    heroTitle: "Листи з установ, зустрічі, офіс – ми все владнаємо.",
    heroSub: "EinStein бере на себе формуляри, листи й організацію – кількома мовами, особисто й за чесними цінами.",
    ctaBook: "Забронювати", ctaFile: "Завантажити лист",
    trust: ["Арабська, німецька, англійська, турецька …", "Постійна контактна особа", "Прозорі ціни"],
    demoFrom: "Jobcenter Frankfurt", demoTitle: "Заява на продовження", demoSorted: "Папка: Jobcenter", demoSummary: "Ваш Bürgergeld закінчується 30.11. Подайте заяву на продовження до цієї дати.", demoReminder: "Нагадування через 5 днів",
    authorities: "Допомагаємо з листами від",
    servicesKicker: "Послуги", servicesMore: "Усі послуги", book: "Забронювати",
    fileKicker: "Мої документи", fileTitle: "Кожен лист упорядкований, перекладений, строк перед очима.", fileSub: "Сфотографуйте пошту. Наш ШІ розкладе її по папках, перекладе вашою мовою й нагадає про строки.",
    fileSteps: [["Завантажте", "Фото або PDF, кілька одразу"], ["Упорядковано й перекладено", "У потрібній папці, вашою мовою"], ["Нагадування", "До того, як мине строк"]],
    fileCta: "Відкрити мої документи", fileNote: "Місячна підписка, скасування будь-коли",
    howKicker: "Як це працює", howTitle: "Готово за три кроки",
    how: [["Оберіть послугу", "Онлайн або телефоном – вашою мовою."], ["Отримайте зустріч", "Ми підтверджуємо й називаємо ціну заздалегідь."], ["Готово", "Ми все владнаємо – ви в курсі."]],
    whyKicker: "Чому EinStein",
    forKicker: "Для кого",
    ctaTitle: "Готові передати нам папери?", ctaSub: "Бронюйте за кілька хвилин – ми швидко відповімо.",
  },
};
X.tr = { ...X.en, badge: "Almanya’da günlük yaşam ortağınız", heroTitle: "Resmi yazılar, randevular, büro – biz hallediyoruz.", heroSub: "EinStein formları, yazıları ve organizasyonu sizin için halleder – çok dilli, kişisel ve uygun fiyatlarla.", ctaBook: "Şimdi rezervasyon", ctaFile: "Mektup yükle", servicesKicker: "Hizmetler", servicesMore: "Tüm hizmetler", book: "Rezervasyon", ctaTitle: "Evrak işlerini bize bırakmaya hazır mısınız?" };
X.es = { ...X.en, badge: "Su aliado para la vida diaria en Alemania", heroTitle: "Cartas oficiales, citas, oficina – nos encargamos.", heroSub: "EinStein se ocupa de formularios, cartas y organización por usted – en varios idiomas, en persona y a precios justos.", ctaBook: "Reservar ahora", ctaFile: "Subir una carta", servicesKicker: "Servicios", servicesMore: "Ver todos los servicios", book: "Reservar", ctaTitle: "¿Listo para delegar el papeleo?" };

const AUTHORITIES = ["Jobcenter", "Ausländerbehörde", "Finanzamt", "Familienkasse", "Krankenkasse", "Rentenversicherung", "Vermieter"];

// Photos for the service cards (Unsplash, free to use)
const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop`;
const SERVICE_IMAGES = {
  office: img("1499750310107-5fef28a66643"),
  forms: img("1554224155-1696413565d3"),
  admin: img("1544396821-4dd40b938ad3"),
  coordination: img("1517048676732-d65bc937f952"),
  mercosur: img("1581553673739-c4906b5d0de8"),
  print: img("1612815154858-60aa4c59eaa6"),
  eur1: img("1605732562742-3023a888e56e"),
  dokumentabo: img("1559057287-ce0f595679a8"),
  bueromanagement: img("1752650732081-8f61e81813ed"),
};

const prefersReducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

/** Slides that move on their own (paused while hovered), with arrows and dots. */
function AutoCarousel({ children, isRTL, slideClass, interval = 4500, dark = false }) {
  const [viewportRef, api] = useEmblaCarousel({ loop: true, align: "start", direction: isRTL ? "rtl" : "ltr" });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return undefined;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onReInit = () => { setSnaps(api.scrollSnapList()); onSelect(); };
    onReInit();
    api.on("select", onSelect);
    api.on("reInit", onReInit);
    return () => { api.off("select", onSelect); api.off("reInit", onReInit); };
  }, [api]);

  useEffect(() => {
    if (!api || paused || prefersReducedMotion()) return undefined;
    const timer = setInterval(() => api.scrollNext(), interval);
    return () => clearInterval(timer);
  }, [api, paused, interval]);

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;
  const btn = dark
    ? "border-white/25 text-white hover:bg-white/10"
    : "border-slate-200 bg-white text-[#4c1d95] hover:border-[#7c3aed]";

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div className="overflow-hidden" ref={viewportRef} dir={isRTL ? "rtl" : "ltr"}>
        <div className="-ms-5 flex">
          {React.Children.map(children, (child) => <div className={`min-w-0 shrink-0 grow-0 ps-5 ${slideClass}`}>{child}</div>)}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={() => api?.scrollPrev()} aria-label="Previous" className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${btn}`}><Prev className="h-5 w-5" /></button>
        <div className="flex gap-2">
          {snaps.map((_, i) => (
            <button key={i} type="button" onClick={() => api?.scrollTo(i)} aria-label={`${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === selected ? `w-8 ${dark ? "bg-white" : "bg-[#6d28d9]"}` : `w-2 ${dark ? "bg-white/30" : "bg-slate-300"}`}`} />
          ))}
        </div>
        <button type="button" onClick={() => api?.scrollNext()} aria-label="Next" className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${btn}`}><Next className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

/** Endless moving strip of names. */
function Marquee({ items }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]" dir="ltr">
      <style>{"@keyframes es-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} .es-marquee{animation:es-marquee 30s linear infinite} .es-marquee:hover{animation-play-state:paused} @media (prefers-reduced-motion: reduce){.es-marquee{animation:none}}"}</style>
      <div className="es-marquee flex w-max gap-12">
        {row.map((name, i) => <span key={i} className="whitespace-nowrap text-sm font-bold text-slate-500">{name}</span>)}
      </div>
    </div>
  );
}

const whyFeatures = [
  { key: "quality", icon: BadgeCheck },
  { key: "multilingual", icon: Languages },
  { key: "one_stop", icon: Target },
  { key: "fair", icon: Heart },
  { key: "fast", icon: Zap },
  { key: "responsible", icon: Shield }
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function Kicker({ children, light = false }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${light ? "bg-white/10 text-purple-100 ring-1 ring-white/20" : "bg-purple-100 text-[#5b21b6]"}`}>
      {children}
    </span>
  );
}

/** A small, real-looking "My documents" card for the hero. */
function LetterDemo({ x }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#7c3aed]/25 to-[#c084fc]/10 blur-2xl" aria-hidden="true" />
      <div className="relative rounded-3xl border border-purple-100 bg-white p-5 shadow-2xl shadow-purple-900/10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50"><EinsteinLogo size={30} /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400" dir="ltr">{x.demoFrom}</p>
            <p className="truncate font-bold text-[#2e1065]">{x.demoTitle}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><FolderCheck className="h-3.5 w-3.5" />{x.demoSorted}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"><BellRing className="h-3.5 w-3.5" />{x.demoReminder}</span>
        </div>
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{x.demoSummary}</p>
        <div className="mt-4 space-y-2" aria-hidden="true">
          <div className="h-2 w-11/12 rounded-full bg-slate-100" />
          <div className="h-2 w-9/12 rounded-full bg-slate-100" />
          <div className="h-2 w-10/12 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="absolute -bottom-5 -start-5 hidden rounded-2xl bg-[#2e1065] px-4 py-3 text-white shadow-xl sm:flex sm:items-center sm:gap-2">
        <Languages className="h-5 w-5 text-purple-200" /><span className="text-sm font-bold">DE → AR · UK · TR</span>
      </div>
    </div>
  );
}

export default function Home() {
  const savedLang = (() => { try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; } })();
  const [lang, setLang] = useState(savedLang);

  // Prices and names managed in the admin area
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: publicApi.listPricing,
    staleTime: 5 * 60 * 1000,
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
  const x = X[lang] || X.de;
  const isRTL = lang === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const fromDb = (p, field) => {
    const byLang = { ar: `${field}_ar`, en: `${field}_en`, tr: `${field}_tr`, es: `${field}_es`, uk: `${field}_en` }[lang];
    return (byLang && p[byLang]) || p[`${field}_de`] || p[field];
  };
  const serviceName = (key) => (customPrices?.[key]?.[0] && fromDb(customPrices[key][0], "label")) || t[key];
  const servicePrice = (key) => {
    const p = customPrices?.[key]?.[0];
    if (p) {
      const unit = fromDb(p, "unit");
      return `${displayPrice(p.price, lang, key)}${unit ? " " + unit : ""}`;
    }
    return displayPrice(t[`${key}_price`] || "", lang, key);
  };

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f3ff] via-white to-white">
        <svg aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10rem] h-[36rem] w-[36rem] text-purple-200/60" viewBox="0 0 100 100">
          <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <polygon points="50,26 72,38 72,62 50,74 28,62 28,38" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </svg>
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-1.5 text-sm font-semibold text-[#5b21b6] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />{x.badge}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.15] text-[#1f0b52] sm:text-5xl lg:text-6xl">{x.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{x.heroSub}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={createPageUrl("Booking")} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] px-8 text-base font-bold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110">
                {x.ctaBook}<Arrow className="h-5 w-5" />
              </Link>
              <Link to={createPageUrl("MyDocuments")} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-white px-8 text-base font-bold text-[#4c1d95] transition hover:border-[#7c3aed] hover:bg-purple-50">
                <Upload className="h-5 w-5" />{x.ctaFile}
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {x.trust.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600"><CheckCircle className="h-4 w-4 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <LetterDemo x={x} />
          </motion.div>
        </div>

        {/* Authorities */}
        <div className="relative border-y border-purple-100/70 bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-6 md:flex-row md:gap-8">
            <span className="shrink-0 text-sm font-semibold text-slate-400">{x.authorities}</span>
            <div className="w-full min-w-0 flex-1"><Marquee items={AUTHORITIES} /></div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Kicker>{x.servicesKicker}</Kicker>
              <h2 className="mt-4 text-3xl font-black text-[#1f0b52] md:text-4xl">{t.our_services}</h2>
              <p className="mt-3 text-lg text-slate-600">{t.services_subtitle}</p>
            </div>
            <Link to={createPageUrl("Services")} className="inline-flex items-center gap-2 font-bold text-[#6d28d9] hover:underline">{x.servicesMore}<Arrow className="h-4 w-4" /></Link>
          </motion.div>
          <div className="mt-8"><SearchBar lang={lang} variant="inline" /></div>
          <div className="mt-10">
            <AutoCarousel isRTL={isRTL} slideClass="basis-[86%] sm:basis-1/2 lg:basis-1/3">
              {services.map(({ key, icon: Icon }) => (
                <Link key={key} to={`${createPageUrl("Booking")}?category=${key}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5">
                  <div className="relative h-44 overflow-hidden bg-purple-50">
                    <img src={SERVICE_IMAGES[key]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1f0b52]/60 to-transparent" />
                    <span className="absolute bottom-4 start-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-lg">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold text-[#1f0b52]">{serviceName(key)}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{t[`${key}_desc`]}</p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-sm font-bold text-[#4c1d95]">
                        <bdi>{servicePrice(key)}</bdi>
                        <span className="block text-[11px] font-medium text-slate-400">{priceNote(lang, key)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-[#6d28d9]">{x.book}<Arrow className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </AutoCarousel>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="bg-[#f7f3ff] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Kicker>{t.promises_title}</Kicker>
          <div className="mt-8">
            <AutoCarousel isRTL={isRTL} slideClass="basis-full" interval={5000}>
              {[t.promise1, t.promise2, t.promise3, t.promise4].map((promise) => (
                <figure key={promise} className="px-2">
                  <Quote className="mx-auto h-10 w-10 text-purple-300" />
                  <blockquote className="mt-5 text-2xl font-bold leading-relaxed text-[#1f0b52] md:text-3xl">{promise}</blockquote>
                </figure>
              ))}
            </AutoCarousel>
          </div>
        </div>
      </section>

      {/* My documents (AI) */}
      <section className="px-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1f0b52] via-[#3b1478] to-[#6d28d9] px-6 py-16 text-white md:px-14 md:py-20">
          <svg aria-hidden="true" className="pointer-events-none absolute -bottom-24 -end-24 h-96 w-96 text-white/10" viewBox="0 0 100 100">
            <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="currentColor" />
          </svg>
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div {...fadeUp}>
              <Kicker light>{x.fileKicker}</Kicker>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">{x.fileTitle}</h2>
              <p className="mt-4 text-lg leading-relaxed text-purple-100">{x.fileSub}</p>
              <Link to={createPageUrl("MyDocuments")} className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-bold text-[#4c1d95] transition hover:bg-purple-50">
                {x.fileCta}<Arrow className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-sm text-purple-200">{x.fileNote}</p>
            </motion.div>
            <ol className="grid gap-4">
              {x.fileSteps.map(([title, text], i) => (
                <motion.li key={title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#4c1d95]">
                    {[<Upload key="u" className="h-6 w-6" />, <Languages key="l" className="h-6 w-6" />, <BellRing key="b" className="h-6 w-6" />][i]}
                  </span>
                  <span>
                    <span className="block font-bold">{title}</span>
                    <span className="block text-sm text-purple-100">{text}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <Kicker>{x.howKicker}</Kicker>
            <h2 className="mt-4 text-3xl font-black text-[#1f0b52] md:text-4xl">{x.howTitle}</h2>
          </motion.div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {x.how.map(([title, text], i) => (
              <motion.div key={title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} className="relative rounded-3xl bg-slate-50 p-8">
                <span className="text-5xl font-black text-purple-200">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-xl font-bold text-[#1f0b52]">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why + quality */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <motion.div {...fadeUp}>
              <Kicker>{x.whyKicker}</Kicker>
              <h2 className="mt-4 text-3xl font-black text-[#1f0b52] md:text-4xl">{t.why_einstein}</h2>
            </motion.div>
            <div className="mt-10">
              <AutoCarousel isRTL={isRTL} slideClass="basis-[80%] sm:basis-1/2" interval={3500}>
                {whyFeatures.map(({ key, icon: Icon }) => (
                  <div key={key} className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50"><Icon className="h-6 w-6 text-[#6d28d9]" /></span>
                    <h3 className="mt-4 text-lg font-bold text-[#1f0b52]">{t[`why_${key}`]}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t[`why_${key}_desc`]}</p>
                  </div>
                ))}
              </AutoCarousel>
            </div>
          </div>
          <motion.div {...fadeUp} className="self-start rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50"><Award className="h-6 w-6 text-[#6d28d9]" /></span>
            <h3 className="mt-5 text-2xl font-black text-[#1f0b52]">{t.quality_title}</h3>
            <p className="mt-2 text-slate-600">{t.quality_desc}</p>
            <ol className="mt-6 space-y-3">
              {t.quality_steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2e1065] text-sm font-bold text-white">{i + 1}</span>
                  <span className="font-medium text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 rounded-2xl bg-purple-50 p-5">
              <p className="font-bold text-[#2e1065]">{t.hauptunternehmer}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{t.hauptunternehmer_desc}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <Kicker>{x.forKicker}</Kicker>
            <h2 className="mt-4 text-3xl font-black text-[#1f0b52] md:text-4xl">{t.target_title}</h2>
            <p className="mt-3 text-lg text-slate-600">{t.target_subtitle}</p>
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.targets.map((target, i) => (
              <motion.div key={target} {...fadeUp} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#6d28d9]">
                  {[<Users key="0" className="h-5 w-5" />, <Languages key="1" className="h-5 w-5" />, <Briefcase key="2" className="h-5 w-5" />, <FileText key="3" className="h-5 w-5" />][i % 4]}
                </span>
                <span className="font-semibold text-[#1f0b52]">{target}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + provider */}
      <section className="px-4 pb-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.6fr_1fr]">
          <motion.div {...fadeUp} className="flex flex-col justify-between gap-8 rounded-[2rem] bg-[#1f0b52] p-10 text-white md:p-12">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">{x.ctaTitle}</h2>
              <p className="mt-3 text-lg text-purple-100">{x.ctaSub}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={createPageUrl("Booking")} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-bold text-[#4c1d95] transition hover:bg-purple-50">{x.ctaBook}<Arrow className="h-5 w-5" /></Link>
              <a href="tel:+496927246275" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 font-bold text-white transition hover:bg-white/10" dir="ltr">069 27246275</a>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="flex flex-col justify-between gap-6 rounded-[2rem] bg-purple-50 p-10">
            <div>
              <h3 className="text-2xl font-black text-[#1f0b52]">{t.become_provider}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{t.become_provider_desc}</p>
            </div>
            <Link to={createPageUrl("ProviderApplication")} className="inline-flex items-center gap-2 font-bold text-[#6d28d9] hover:underline">{t.apply_now}<Arrow className="h-4 w-4" /></Link>
          </motion.div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-center text-xs text-slate-400">{t.note}</p>
      </section>
    </div>
  );
}
