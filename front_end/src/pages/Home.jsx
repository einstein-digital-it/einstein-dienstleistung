import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { publicApi } from "@/api/backendClient";
import { getStoredAuthUser } from "@/lib/backendAuth";
import { displayPrice, priceNote } from "@/lib/priceUtils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import SearchBar from "../components/SearchBar";
import {
  ClipboardList,
  FileText,
  Settings,
  Globe,
  BookOpen,
  Printer,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Award,
  Heart,
  Zap,
  Target,
  Languages,
  BadgeCheck,
  Quote,
  Ship,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const translations = {
  de: {
    // Hero
    hero_title: "Organisation & Verwaltung",
    hero_subtitle: "Wir nehmen Ihnen Komplexität ab.",
    hero_desc: "Organisation. Verwaltung. Umsetzung.\n\nDeutschland ist vielfältig – aber der Alltag oft bürokratisch und zeitintensiv.\nEinStein sorgt für Struktur, Klarheit und Entlastung.",
    hero_solution: "Unsere Leistungen im Überblick:\n\n✔ Behörden- & Formularhilfe\nVon Antragstellung über digitale Einreichung bis zur Nachverfolgung und Abholung.\n\n✔ Büro- & Sekretariatsservice für Praxen, Selbstständige & Unternehmen\nFlexible administrative Unterstützung – bei Bedarf auch mit kurzfristiger Ersatzlösung.\n\n✔ Bildungs- & Lernbegleitung\nStrukturierte Unterstützung ohne formale Beratung.\n\n✔ Organisations- & Koordinationsleistungen\nMehrsprachig, professionell und rechtssicher umgesetzt.\n\nWarum EinStein?\n\n• Fester Ansprechpartner\n• Mehrsprachige Kommunikation\n• Transparente Abläufe\n• Schnelle Umsetzung\n• Rechtssichere Struktur",
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
    about_title: "Über EinStein Institut",
    about_desc: "EinStein ist ein ganzheitliches Organisation & Verwaltung für den Alltag. Es bündelt Bildung, Bürokratiehilfe und administrative Dienstleistungen unter einem Dach.",
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
    tutoring: "Nachhilfe / Lernunterstützung",
    tutoring_desc: "Einzelunterricht, Gruppenunterricht, Hausaufgabenbetreuung, Prüfungsvorbereitung",
    tutoring_price: "25 €/Std.",
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
    hero_title: "مركز الخدمات",
    hero_subtitle: "ننظم، نشرح وننفذ – بشكل احترافي ومتعدد اللغات",
    hero_desc: "ألمانيا متنوعة – لكن الحياة اليومية معقدة في كثير من الأحيان. آينشتاين ينظم ويشرح وينفذ ما يثقل كاهل الناس في الحياة اليومية.",
    hero_solution: "كمركز خدمات شامل، نقدم دعماً منظماً ومرافقة شخصية وتنفيذاً موثوقاً – بعدة لغات واحترافياً وبشكل آمن قانونياً.\n\nيشمل نطاق خدماتنا التعليم ومرافقة التعلم، والدعم التنظيمي في الطلبات والمستندات، بالإضافة إلى الدعم الرقمي والتصميمي والإداري.\n\nعلاوة على ذلك، ندعم في تنظيم المستندات والإجراءات الإدارية في السياق الدولي، من بين أمور أخرى في إطار الاتفاقيات القائمة مثل اتفاقية الاتحاد الأوروبي-ميركوسور (الأرجنتين، أوروغواي، باراغواي والاتحاد الأوروبي) – دون تقديم استشارات قانونية أو ضريبية أو متخصصة.",
    motto: "آينشتاين - لأن كل إنسان يستحق الدعم.",
    book_now: "احجز الآن",
    view_services: "جميع الخدمات",
    
    // Promises
    promises_title: "وعدنا لك",
    promise1: "لا تحتاج للتعامل مع خمس شركات مختلفة - عندنا تحصل على كل شيء من مكان واحد",
    promise2: "لا تحتاج أن تكون محترفاً في الألمانية - نحن نتحدث لغتك",
    promise3: "لا تحتاج للانتظار طويلاً - نستجيب بسرعة وموثوقية",
    promise4: "ستشعر وكأن لديك سكرتيرة خاصة أو مدير منزل شخصي",
    
    // About
    about_title: "عن معهد آينشتاين",
    about_desc: "آينشتاين هو مركز خدمات شامل للحياة اليومية. يجمع التعليم ومساعدة البيروقراطية والخدمات الإدارية تحت سقف واحد.",
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
    tutoring: "الدروس الخصوصية / دعم التعلم",
    tutoring_desc: "دروس فردية، دروس جماعية، متابعة الواجبات، التحضير للامتحانات",
    tutoring_price: "25 €/ساعة",
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
    hero_title: "Service Center",
    hero_subtitle: "We organize, explain and execute – professionally & multilingually",
    hero_desc: "Germany is diverse – but everyday life is often complicated. EinStein organizes, explains and executes what burdens people in everyday life.",
    hero_solution: "As a comprehensive service center, we offer structured support, personal accompaniment and reliable implementation – multilingual, professional and legally secure.\n\nOur range of services includes education and learning support, organizational support for applications and documents, as well as digital, creative and administrative support.\n\nIn addition, we support the organization of documents and administrative procedures in an international context, among others within the framework of existing agreements such as the EU-MERCOSUR Agreement (Argentina, Uruguay, Paraguay and European Union) – without providing legal, tax or professional advice.",
    motto: "EinStein - Because everyone deserves support.",
    book_now: "Book Now",
    view_services: "All Services",
    
    // Promises
    promises_title: "Our Promise",
    promise1: "You don't need to deal with five different companies – with us you get everything from one source",
    promise2: "You don't need to be a German expert – we speak your language",
    promise3: "You don't need to wait long – we respond quickly and reliably",
    promise4: "You'll feel like you have your own secretary or personal house manager",
    
    // About
    about_title: "About EinStein Institut",
    about_desc: "EinStein is a comprehensive service center for daily life. It combines education, bureaucracy assistance, and administrative services under one roof.",
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
    tutoring: "Tutoring / Learning Support",
    tutoring_desc: "Individual lessons, group lessons, homework supervision, exam preparation",
    tutoring_price: "€25/hr",
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
  tr: {
    // Hero
    hero_title: "Hizmet Merkezi",
    hero_subtitle: "Organize ediyoruz, acikliyoruz ve uyguluyoruz – profesyonel ve cok dilli",
    hero_desc: "Almanya cesitlidir – ancak gunluk yasam genellikle karmasiktir. EinStein, insanlarin gunluk hayatta yuklendigini organize eder, aciklarve uygular.",
    hero_solution: "Kapsamli bir hizmet merkezi olarak yapilandirilmis destek, kisisel eslik ve guvenilir uygulama sunuyoruz – cok dilli, profesyonel ve yasal olarak guvenli.\n\nHizmet yelpazamiz egitim ve ogrenme destegi, basvurular ve belgeler icin organizasyonel destek ile dijital, yaratici ve idari destegi icermektedir.\n\nBuna ek olarak, mevcut anlasmalar cercevesinde uluslararasi baglamda belgelerin ve idari prosedürlerin organizasyonunu destekliyoruz, bunlarin arasinda AB-MERCOSUR Anlasmasi (Arjantin, Uruguay, Paraguay ve Avrupa Birligi) gibi – hukuki, vergi veya mesleki danismanlik saglamadan.",
    motto: "EinStein - Cunku herkes destegi hak ediyor.",
    book_now: "Simdi Rezervasyon Yap",
    view_services: "Tum Hizmetler",
    
    // Promises
    promises_title: "Sozumuz",
    promise1: "Bes farkli sirketle ugrasmana gerek yok - bizde her seyi tek kaynaktan alirsin",
    promise2: "Almanca uzmani olmana gerek yok - senin dilini konusuyoruz",
    promise3: "Uzun beklemeye gerek yok - hizli ve guvenilir yanit veriyoruz",
    promise4: "Kendi sekreterine veya kisisel ev yoneticine sahipmissin gibi hissedeceksin",
    
    // About
    about_title: "EinStein Enstitusu Hakkinda",
    about_desc: "EinStein, gunluk yasam icin kapsamli bir hizmet merkezidir. Egitim, burokrasi yardimi ve idari hizmetleri tek cati altinda birlestirir.",
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
    tutoring: "Ozel Ders / Ogrenme Destegi",
    tutoring_desc: "Bireysel dersler, grup dersleri, odev denetimi, sinav hazirligi",
    tutoring_price: "25 Euro/saat",
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
    hero_title: "Centro de Servicios",
    hero_subtitle: "Organizamos, explicamos y ejecutamos – profesionalmente y multilingüe",
    hero_desc: "Alemania es diversa – pero la vida cotidiana a menudo es complicada. EinStein organiza, explica y ejecuta lo que agobia a las personas en la vida cotidiana.",
    hero_solution: "Como centro de servicios integral, ofrecemos apoyo estructurado, acompañamiento personal e implementación confiable – multilingüe, profesional y legalmente seguro.\n\nNuestra gama de servicios incluye educación y apoyo al aprendizaje, apoyo organizacional para solicitudes y documentos, así como apoyo digital, creativo y administrativo.\n\nAdemás, apoyamos la organización de documentos y procedimientos administrativos en un contexto internacional, entre otros en el marco de acuerdos existentes como el Acuerdo UE-MERCOSUR (Argentina, Uruguay, Paraguay y Unión Europea) – sin proporcionar asesoramiento legal, fiscal o profesional.",
    motto: "EinStein - Porque todos merecen apoyo.",
    book_now: "Reservar ahora",
    view_services: "Todos los servicios",
    
    // Promises
    promises_title: "Nuestra Promesa",
    promise1: "No necesitas lidiar con cinco empresas diferentes: con nosotros obtienes todo de una sola fuente",
    promise2: "No necesitas ser un experto en alemán: hablamos tu idioma",
    promise3: "No necesitas esperar mucho: respondemos rápida y confiablemente",
    promise4: "Te sentirás como si tuvieras tu propia secretaria o administrador de casa personal",
    
    // About
    about_title: "Sobre el Instituto EinStein",
    about_desc: "EinStein es un centro de servicios integral para la vida diaria. Combina educación, asistencia burocrática y servicios administrativos bajo un mismo techo.",
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
    tutoring: "Tutoría / Apoyo al Aprendizaje",
    tutoring_desc: "Clases individuales, clases grupales, supervisión de tareas, preparación de exámenes",
    tutoring_price: "25 €/hora",
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
  { key: "tutoring", icon: BookOpen, color: "bg-blue-500" },
  { key: "print", icon: Printer, color: "bg-pink-500" },
  { key: "eur1", icon: Ship, color: "bg-rose-600" },
  { key: "dokumentabo", icon: Mail, color: "bg-purple-600" },
  { key: "bueromanagement", icon: Briefcase, color: "bg-sky-700" }
];

const whyFeatures = [
  { key: "quality", icon: BadgeCheck },
  { key: "multilingual", icon: Languages },
  { key: "one_stop", icon: Target },
  { key: "fair", icon: Heart },
  { key: "fast", icon: Zap },
  { key: "responsible", icon: Shield }
];

// Why Vertical Carousel Component
function WhyCarousel({ features, t }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative h-[320px] overflow-hidden">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + features.length) % features.length;
          const isNext = index === (currentIndex + 1) % features.length;
          
          let translateY = "100%";
          let opacity = 0;
          let scale = 0.9;
          
          if (isActive) {
            translateY = "0%";
            opacity = 1;
            scale = 1;
          } else if (isPrev) {
            translateY = "-100%";
            opacity = 0.3;
            scale = 0.9;
          } else if (isNext) {
            translateY = "100%";
            opacity = 0.3;
            scale = 0.9;
          }
          
          return (
            <div
              key={feature.key}
              className="absolute inset-0 transition-all duration-500 ease-out px-4"
              style={{
                transform: `translateY(${translateY}) scale(${scale})`,
                opacity,
              }}
            >
              <Card className="bg-white/20 backdrop-blur-sm border-0 h-full">
                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {t[`why_${feature.key}`]}
                  </h3>
                  <p className="text-white/90 text-lg">
                    {t[`why_${feature.key}_desc`]}
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      
      {/* Vertical Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? "bg-white w-8" 
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Promises Carousel Component
function PromisesCarousel({ promises, isRTL }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    direction: isRTL ? "rtl" : "ltr",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on("select", onSelect);
    onSelect();
    
    // Auto-scroll every 4 seconds
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 4000);
    
    return () => {
      clearInterval(autoplay);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {promises.map((promise, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 px-2"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] mx-auto max-w-2xl">
                <CardContent className="p-8 flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#6B46C1] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white text-lg md:text-xl">{promise}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex 
                ? "bg-[#6B46C1] w-8" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Services Carousel Component
function ServicesCarousel({ services, t, isRTL, customPrices, lang }) {
  
  // Function to get label by language
  const getLabelByLang = (p) => {
    if (lang === "ar") return p.label_ar || p.label_de || p.label;
    if (lang === "en") return p.label_en || p.label_de || p.label;
    if (lang === "tr") return p.label_tr || p.label_de || p.label;
    if (lang === "es") return p.label_es || p.label_de || p.label;
    return p.label_de || p.label;
  };
  
  const getUnitByLang = (p) => {
    if (lang === "ar") return p.unit_ar || p.unit_de || p.unit;
    if (lang === "en") return p.unit_en || p.unit_de || p.unit;
    if (lang === "tr") return p.unit_tr || p.unit_de || p.unit;
    if (lang === "es") return p.unit_es || p.unit_de || p.unit;
    return p.unit_de || p.unit;
  };

  // Function to get custom name from prices
  const getServiceName = (serviceKey) => {
    if (customPrices && customPrices[serviceKey] && customPrices[serviceKey][0]) {
      const customName = getLabelByLang(customPrices[serviceKey][0]);
      if (customName) return customName;
    }
    return t[serviceKey];
  };
  
  // Function to get custom price from backend-managed settings.
  const getServicePrice = (serviceKey) => {
    if (customPrices && customPrices[serviceKey] && customPrices[serviceKey][0]) {
      const p = customPrices[serviceKey][0];
      const unit = getUnitByLang(p);
      return `${displayPrice(p.price, lang, serviceKey)}${unit ? " " + unit : ""}`;
    }
    return displayPrice(t[`${serviceKey}_price`] || "", lang, serviceKey);
  };
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    direction: isRTL ? "rtl" : "ltr",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;
    
    setScrollSnaps(emblaApi.scrollSnapList());
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on("select", onSelect);
    onSelect();
    
    // Auto-scroll every 3 seconds
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3000);
    
    return () => {
      clearInterval(autoplay);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (index) => emblaApi && emblaApi.scrollTo(index);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.key}
                className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] px-2"
              >
                <Link to={createPageUrl(`Booking?category=${service.key}`)}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden h-full bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f]">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {getServiceName(service.key)}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {t[`${service.key}_desc`]}
                      </p>
                      <Badge className="bg-[#c9a227] text-white font-semibold">
                        {getServicePrice(service.key)}
                      </Badge>
                      <span className="block text-[11px] text-gray-300 mt-1">{priceNote(lang, service.key)}</span>
                      <div className="mt-4 flex items-center text-white/80 font-medium text-sm group-hover:gap-2 transition-all">
                        {t.book_now}
                        <ArrowRight className="w-4 h-4 ms-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Dots Navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex 
                ? "bg-[#6B46C1] w-8" 
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function AuthenticatedArabicHero() {
  const serviceHighlights = [
    {
      title: "مساعدة الدوائر والنماذج",
      description: "من تقديم الطلبات إلى التتبع والاستلام."
    },
    {
      title: "خدمة المكتب والسكرتارية للعيادات والمستقلين والشركات",
      description: "دعم إداري مرن - مع حلول بديلة عند الحاجة."
    },
    {
      title: "التعليم ومرافقة التعلم",
      description: "دعم منظم بدون استشارة رسمية."
    },
    {
      title: "خدمات التنظيم والتنسيق",
      description: "متعدد اللغات، احترافي وآمن قانونياً."
    }
  ];
  const reasons = [
    "نقطة اتصال ثابتة",
    "تواصل متعدد اللغات",
    "إجراءات شفافة",
    "تنفيذ سريع",
    "هيكل آمن قانونياً"
  ];

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#122238] text-white">
      <div className="mx-auto flex w-full max-w-[920px] flex-col items-center px-4 pb-8 pt-3 text-center sm:pt-4 md:pt-4">
        <h1 className="text-[34px] font-black leading-[1.25] text-[#d4af25] sm:text-[44px] md:text-[50px]">
          آينشتاين – التنظيم والإدارة
        </h1>

        <p className="mt-8 text-[28px] font-extrabold leading-tight text-white sm:text-[34px]">
          نحن نزيل التعقيد عنك.
        </p>

        <p className="mt-8 max-w-[780px] text-[16px] font-medium leading-[1.9] text-white/80 sm:text-[18px]">
          التنظيم، الإدارة، التنفيذ. ألمانيا متنوعة - لكن الحياة اليومية بيروقراطية ومستهلكة للوقت.
          آينشتاين يوفر الهيكل والوضوح والتخفيف.
        </p>

        <div className="mt-9 w-full max-w-[756px] rounded-[16px] border border-white/10 bg-white/[0.06] px-5 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:px-10">
          <p className="mb-7 text-[18px] font-medium text-white">خدماتنا في لمحة:</p>

          <div className="space-y-7">
            {serviceHighlights.map((service) => (
              <div key={service.title}>
                <div className="flex items-center justify-center gap-3 text-[17px] font-extrabold text-white sm:text-[18px]">
                  <span className="text-[#d4af25]">✓</span>
                  <span>{service.title}</span>
                </div>
                <p className="mt-2 text-[14px] leading-7 text-white/72 sm:text-[15px]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="mb-4 text-[18px] font-extrabold text-white">لماذا آينشتاين؟</p>
            <ul className="space-y-2 text-[15px] leading-7 text-white/88">
              {reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const savedLang = (() => { try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; } })();
  const [lang, setLang] = useState(savedLang);
  const [isAdmin, setIsAdmin] = useState(() => getStoredAuthUser()?.role === "admin");
  
  // Load custom prices from database
  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings"],
    queryFn: publicApi.listPricing,
    staleTime: 5 * 60 * 1000,
  });
  
  // Convert array to object
  const customPrices = React.useMemo(() => {
    if (!priceSettingsData || priceSettingsData.length === 0) return null;
    const pricesObj = {};
    priceSettingsData.forEach(item => {
      pricesObj[item.category] = item.items || item.prices || [];
    });
    return pricesObj;
  }, [priceSettingsData]);
  
  useEffect(() => {
    const handleStorage = () => {
      const newLang = localStorage.getItem("einstein_lang");
      if (newLang) setLang(newLang);
      setIsAdmin(getStoredAuthUser()?.role === "admin");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  
  const t = translations[lang] || translations.de;
  const isRTL = lang === "ar";
  const showAuthenticatedArabicHero = isRTL && isAdmin;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {showAuthenticatedArabicHero ? (
        <AuthenticatedArabicHero />
      ) : (
      <section className="relative bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-800 text-white py-20 md:py-32 overflow-hidden">
        {/* Simplified decorative elements */}
           <div className="absolute inset-0 overflow-hidden">
             <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6B46C1]/20 rounded-full blur-[100px]" />
             <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[100px]" />
           </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-8 shadow-lg"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90 tracking-wide">
                {lang === "de" ? "Ihr Partner für den Alltag" : lang === "ar" ? "شريكك للحياة اليومية" : "Your partner for daily life"}
              </span>
            </motion.div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight px-2 w-full">
              <span className="bg-gradient-to-r from-[#c9a227] via-[#e8c547] to-[#c9a227] bg-clip-text text-transparent drop-shadow-2xl text-center block break-words">
                EinStein – {t.hero_title}
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-medium mb-6 tracking-wide px-2">
              {t.hero_subtitle}
            </p>

            <p className="text-sm sm:text-base md:text-lg text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed px-2">
              {t.hero_desc}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-10 max-w-2xl mx-auto shadow-2xl"
            >
              <p className="text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed mb-4 whitespace-pre-line">
                {t.hero_solution}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <Quote className="w-6 h-6 text-[#c9a227]" />
                <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-[#c9a227] to-[#e8c547] bg-clip-text text-transparent">
                  {t.motto}
                </p>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <SearchBar lang={lang} variant="hero" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={createPageUrl("Booking")}>
                <Button size="lg" className="group relative bg-gradient-to-r from-[#6B46C1] via-[#805AD5] to-[#6B46C1] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-lg px-10 py-7 w-full sm:w-auto shadow-xl shadow-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 rounded-2xl">
                  {t.book_now}
                  <ArrowRight className="ms-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to={createPageUrl("Services")}>
                <Button size="lg" variant="outline" className="border-2 border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 text-lg px-10 py-7 w-full sm:w-auto font-bold transition-all duration-300 hover:scale-105 rounded-2xl hover:shadow-xl">
                  {t.view_services}
                </Button>
              </Link>
            </motion.div>


          </motion.div>
        </div>
      </section>
      )}

      {/* Promises Section - Carousel */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-sm font-semibold mb-4">
              {lang === "de" ? "UNSER VERSPRECHEN" : lang === "ar" ? "وعدنا" : "OUR PROMISE"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800">
              {t.promises_title}
            </h2>
          </motion.div>

          <PromisesCarousel promises={[t.promise1, t.promise2, t.promise3, t.promise4]} isRTL={isRTL} />
        </div>
      </section>

      {/* About Section */}
       <section className="py-20 bg-white relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-sm font-semibold mb-4">
                {lang === "de" ? "ÜBER UNS" : lang === "ar" ? "من نحن" : "ABOUT US"}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6">
                {t.about_title}
              </h2>
              <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                {t.about_desc}
              </p>
              <p className="text-slate-700 text-lg font-medium mb-8 leading-relaxed">
                {t.about_role}
              </p>
              
              <Card className="border-0 bg-gradient-to-br from-[#6B46C1] to-[#553C9A] shadow-xl shadow-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{t.hauptunternehmer}</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">{t.hauptunternehmer_desc}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#c9a227] to-[#e8c547] rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">{t.quality_title}</h3>
                </div>
                <p className="text-white/70 mb-8 text-lg">{t.quality_desc}</p>
                <div className="space-y-4">
                  {t.quality_steps.map((step, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6B46C1] to-[#805AD5] rounded-xl flex items-center justify-center font-bold text-white shadow-lg">
                        {i + 1}
                      </div>
                      <span className="font-medium">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - Carousel */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-sm font-semibold mb-4">
              {lang === "de" ? "DIENSTLEISTUNGEN" : lang === "ar" ? "خدماتنا" : "SERVICES"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              {t.our_services}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t.services_subtitle}</p>
          </motion.div>

          <ServicesCarousel services={services} t={t} isRTL={isRTL} customPrices={customPrices} lang={lang} />

          <div className="text-center mt-12">
            <Link to={createPageUrl("Services")}>
              <Button size="lg" className="group border-2 border-[#6B46C1] bg-transparent text-[#6B46C1] hover:bg-[#6B46C1] hover:text-white px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                {t.view_services}
                <ArrowRight className="ms-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Groups */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-sm font-semibold mb-4">
              {lang === "de" ? "ZIELGRUPPEN" : lang === "ar" ? "الفئات المستهدفة" : "TARGET GROUPS"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
              {t.target_title}
            </h2>
            {t.target_subtitle && (
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                {t.target_subtitle}
              </p>
            )}
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {t.targets.map((target, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Badge className="bg-gradient-to-br from-slate-50 to-white shadow-lg text-slate-700 px-5 py-3 text-sm font-semibold border border-slate-200 rounded-xl hover:border-[#6B46C1]/30 hover:shadow-purple-500/10 transition-all cursor-default">
                  {target}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Provider CTA */}
      <section className="py-24 bg-gradient-to-br from-[#059669] via-[#10b981] to-[#34d399] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6ee7b7]/30 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t.become_provider}
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.become_provider_desc}
            </p>
            <Link to={createPageUrl("ProviderApplication")}>
              <Button size="lg" className="group bg-white text-[#6B46C1] hover:bg-[#c9a227] hover:text-white font-bold text-lg px-10 py-7 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {t.apply_now}
                <ArrowRight className="ms-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why EinStein Section - Vertical Carousel */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Minimal decorative elements */}
         <div className="absolute inset-0">
           <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#6B46C1]/15 rounded-full blur-[100px]" />
           <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-[#c9a227]/10 rounded-full blur-[100px]" />
         </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
              {lang === "de" ? "WARUM WIR?" : lang === "ar" ? "لماذا نحن؟" : "WHY US?"}
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              {t.why_einstein}
            </h2>
          </motion.div>

          <WhyCarousel features={whyFeatures} t={t} />
        </div>
      </section>

      {/* Bottom Info */}
      <section className="py-8 bg-gradient-to-r from-slate-100 via-purple-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-slate-500">
            {t.note}
          </p>
        </div>
      </section>
    </div>
  );
}
