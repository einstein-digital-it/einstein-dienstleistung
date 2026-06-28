export const staticAdminBookings = [
  {
    id: "static-1",
    booking_number: "ES-MPL004G6",
    customer_name: "ENG. MOHAMMED K. M. ABDELRAHMAN",
    customer_email: "ingr.mohammed.abdelrahman@gmail.com",
    customer_phone: "17646678860",
    service_name: "Koordination und Kommunikation",
    category: "coordination",
    date: "2026-05-25",
    time: "10:00",
    provider_name: "",
    status: "cancelled",
    payment_status: "unpaid",
    price: 45,
    documents_urls: ["#document-1", "#document-2", "#document-3", "#document-4"],
    description:
      "Schriftliche Berichte, Planung und administrative Vorbereitung. Dies ist ein statischer Eintrag fuer die lokale Designansicht."
  },
  {
    id: "static-2",
    booking_number: "ES-MP6ZF6GY",
    customer_name: "Ahmed Al-Saleh",
    customer_email: "asmiahmd@gmail.com",
    customer_phone: "0992086301",
    service_name: "Energie und Unterlagen",
    category: "forms",
    date: "2026-05-16",
    time: "16:00",
    provider_name: "ahmef",
    status: "cancelled",
    payment_status: "unpaid",
    price: 150,
    documents_urls: [],
    confirmed_by_provider_name: "ahmef",
    confirmed_by_provider_email: "asmiahmd@gmail.com"
  },
  {
    id: "static-3",
    booking_number: "ES-MOMXEPZA",
    customer_name: "A.A Beshr",
    customer_email: "beshraa79@gmail.com",
    customer_phone: "01638266943",
    service_name: "Buero & Sekretariat (Vor-Ort)",
    category: "office",
    date: "2026-05-12",
    time: "12:00",
    status: "cancelled",
    payment_status: "unpaid",
    price: 299,
    documents_urls: []
  },
  {
    id: "static-4",
    booking_number: "ES-MO73NFV2",
    customer_name: "faraheldelbi",
    customer_email: "faraheldelbi@gmail.com",
    customer_phone: "06927246275",
    service_name: "Druck und Stempeldienstleistungen",
    category: "print",
    date: "2026-04-23",
    time: "16:00",
    status: "cancelled",
    payment_status: "unpaid",
    price: 5,
    documents_urls: []
  },
  {
    id: "static-5",
    booking_number: "ES-MNXB7MBF",
    customer_name: "abdulmalekyahya76",
    customer_email: "abdulmalekyahya76@gmail.com",
    customer_phone: "Nfkyk",
    service_name: "Behoerden & Formularhilfe",
    category: "forms",
    date: "2026-04-14",
    time: "10:00",
    provider_name: "Brad",
    status: "cancelled",
    payment_status: "unpaid",
    price: 33.61,
    documents_urls: []
  },
  {
    id: "static-6",
    booking_number: "ES-MNXB6GW4",
    customer_name: "abdulmalekyahya76",
    customer_email: "abdulmalekyahya76@gmail.com",
    customer_phone: "Jdjdhdhf",
    service_name: "Behoerden & Formularhilfe",
    category: "forms",
    date: "2026-04-15",
    time: "10:00",
    provider_name: "Iuliia Ustinova",
    status: "completed",
    payment_status: "unpaid",
    price: 33.61,
    documents_urls: ["#document-1"]
  },
  {
    id: "static-7",
    booking_number: "ES-MN70ODJV",
    customer_name: "faraheldelbi",
    customer_email: "faraheldelbi@yahoo.com",
    customer_phone: "01638266943",
    service_name: "Druck- und Stempeldienstleistungen",
    category: "print",
    date: "2026-03-27",
    time: "13:00",
    provider_name: "Brad",
    status: "cancelled",
    payment_status: "unpaid",
    price: 0.84,
    documents_urls: ["#document-1"]
  },
  {
    id: "static-8",
    booking_number: "ES-MN7L9R27",
    customer_name: "ENG. MOHAMMED K. M. ABDELRAHMAN",
    customer_email: "ingr.mohammed.abdelrahman@gmail.com",
    customer_phone: "01764667860",
    service_name: "Koordinationsleistungen",
    category: "coordination",
    date: "",
    time: "10:00",
    provider_name: "Iuliia Ustinova",
    status: "completed",
    payment_status: "paid",
    price: 30,
    invoice_url: "#invoice",
    documents_urls: ["#document-1", "#document-2", "#document-3"]
  },
  {
    id: "static-9",
    booking_number: "ES-MN1R8KOH",
    customer_name: "faraheldelbi",
    customer_email: "faraheldelbi@gmail.com",
    customer_phone: "01638366943",
    service_name: "Koordinationsleistungen",
    category: "coordination",
    date: "",
    time: "18:00",
    provider_name: "Brad",
    status: "completed",
    payment_status: "failed",
    price: 30,
    documents_urls: ["#document-1"]
  }
];

export const staticServiceExtensions = [];

export const staticProviderApplications = [];

export const staticSEOSettings = [
  {
    id: "seo-home",
    page_name: "Home",
    meta_title_de: "EinStein Institut - Dienstleistungen in Frankfurt",
    meta_description_de: "Professionelle Buero-, Formular-, Bildungs- und Koordinationsdienstleistungen.",
    keywords_de: "EinStein Institut, Dienstleistungen, Frankfurt, Formulare, Bildung",
    priority: 1,
    change_frequency: "weekly",
    no_index: false
  },
  {
    id: "seo-services",
    page_name: "Services",
    meta_title_de: "Unsere Dienstleistungen",
    meta_description_de: "Uebersicht aller digitalen und Vor-Ort-Services des EinStein Instituts.",
    keywords_de: "Dienstleistungen, Buchung, Beratung, Unterlagen",
    priority: 0.9,
    change_frequency: "weekly",
    no_index: false
  },
  {
    id: "seo-booking",
    page_name: "Booking",
    meta_title_de: "Termin buchen",
    meta_description_de: "Buchen Sie schnell und einfach einen passenden Service.",
    keywords_de: "Termin, Buchung, Service buchen",
    priority: 0.8,
    change_frequency: "monthly",
    no_index: false
  }
];

export const staticAdminUsers = [
  {
    id: "user-admin",
    full_name: "A.A",
    email: "beshraa79@gmail.com",
    role: "admin",
    phone: "01638266943",
    created_date: "2026-05-01T09:20:00.000Z"
  },
  {
    id: "user-1",
    full_name: "ENG. MOHAMMED K. M. ABDELRAHMAN",
    email: "ingr.mohammed.abdelrahman@gmail.com",
    role: "user",
    phone: "01764667860",
    created_date: "2026-05-25T10:00:00.000Z"
  },
  {
    id: "user-2",
    full_name: "Ahmed Al-Saleh",
    email: "asmiahmd@gmail.com",
    role: "user",
    phone: "0992086301",
    created_date: "2026-05-16T16:00:00.000Z"
  },
  {
    id: "user-3",
    full_name: "faraheldelbi",
    email: "faraheldelbi@gmail.com",
    role: "user",
    phone: "06927246275",
    created_date: "2026-04-23T16:00:00.000Z"
  }
];

export const staticUserNotifications = [
  {
    id: "seen-admin",
    user_email: "beshraa79@gmail.com",
    notification_sent: false,
    sent_date: "2026-05-01T09:20:00.000Z"
  }
];

export const staticServices = [
  {
    id: "service-office",
    name: "Buero- und Organisationsservice",
    category: "office",
    description: "Unterstuetzung bei Bueroablaeufen, Schriftverkehr, Terminplanung und Dokumentenordnung.",
    price_from: 40,
    price_unit: "Stunde",
    status: "active",
    bookings: 48
  },
  {
    id: "service-forms",
    name: "Behoerden & Formularhilfe",
    category: "forms",
    description: "Ausfuellen, Pruefen und Vorbereiten von Formularen fuer Behoerden und Institute.",
    price_from: 40,
    price_unit: "Stunde",
    status: "active",
    bookings: 73
  },
  {
    id: "service-admin",
    name: "Administrative Dienstleistungen",
    category: "admin",
    description: "Digitale Verwaltungsaufgaben, Antraege, Ablage und strukturierte Nachverfolgung.",
    price_from: 40,
    price_unit: "Stunde",
    status: "active",
    bookings: 35
  },
  {
    id: "service-coordination",
    name: "Koordinationsleistungen",
    category: "coordination",
    description: "Kommunikation, Planung und Abstimmung zwischen Kunden, Fachkraeften und externen Stellen.",
    price_from: 60,
    price_unit: "Stunde",
    status: "active",
    bookings: 29
  },
  {
    id: "service-mercosur",
    name: "MERCOSUR Service",
    category: "mercosur",
    description: "Unterstuetzung bei Dokumenten, Uebersetzungskoordination und internationalen Ablaeufen.",
    price_from: 150,
    price_unit: "Vorgang",
    status: "active",
    bookings: 12
  },
  {
    id: "service-print",
    name: "Druck- und Stempeldienstleistungen",
    category: "print",
    description: "Druck, Vorbereitung und Bearbeitung von Unterlagen fuer Kundenauftraege.",
    price_from: 1,
    price_unit: "Seite",
    status: "draft",
    bookings: 18
  }
];

export const staticPriceGroups = [
  {
    id: "price-forms",
    category: "Behoerden & Formularhilfe",
    items: [
      { label: "Standard Formularhilfe", price: "40 EUR", unit: "/ Stunde" },
      { label: "Dokumentenpruefung", price: "25 EUR", unit: "/ Vorgang" }
    ]
  },
  {
    id: "price-coordination",
    category: "Koordinationsleistungen",
    items: [
      { label: "Koordination und Kommunikation", price: "60 EUR", unit: "/ Stunde" },
      { label: "Schriftlicher Kurzbericht", price: "30 EUR", unit: "/ Vorgang" }
    ]
  },
  {
    id: "price-office",
    category: "Buero- und Organisationsservice",
    items: [
      { label: "Bueroassistenz", price: "40 EUR", unit: "/ Stunde" },
      { label: "Vor-Ort Termin", price: "299 EUR", unit: "/ Paket" }
    ]
  },
  {
    id: "price-print",
    category: "Druck- und Stempeldienstleistungen",
    items: [
      { label: "Schwarz-Weiss Druck", price: "ab 1 EUR", unit: "/ Seite" },
      { label: "Dokumentenmappe", price: "5 EUR", unit: "/ Paket" }
    ]
  }
];

export const staticServiceProviders = [
  {
    id: "provider-iuliia",
    full_name: "Iuliia Ustinova",
    email: "iuliia.ustinova@example.com",
    phone: "0176 4400 1820",
    status: "approved",
    categories: ["forms", "coordination"],
    languages: ["Deutsch", "Englisch", "Ukrainisch"],
    hourly_rate: 40,
    total_jobs: 24,
    documents: 4,
    city: "Frankfurt am Main"
  },
  {
    id: "provider-brad",
    full_name: "Brad Schneider",
    email: "brad.schneider@example.com",
    phone: "0157 3100 8841",
    status: "approved",
    categories: ["print", "office"],
    languages: ["Deutsch", "Englisch"],
    hourly_rate: 35,
    total_jobs: 18,
    documents: 2,
    city: "Offenbach"
  },
  {
    id: "provider-ahmed",
    full_name: "Ahmed Al-Saleh",
    email: "ahmed.saleh@example.com",
    phone: "0176 7788 6040",
    status: "pending",
    categories: ["admin", "mercosur"],
    languages: ["Deutsch", "Arabisch", "Spanisch"],
    hourly_rate: 45,
    total_jobs: 0,
    documents: 3,
    city: "Frankfurt am Main"
  },
  {
    id: "provider-maria",
    full_name: "Maria Gomez",
    email: "maria.gomez@example.com",
    phone: "0157 2200 4519",
    status: "suspended",
    categories: ["mercosur", "coordination"],
    languages: ["Deutsch", "Spanisch", "Portugiesisch"],
    hourly_rate: 55,
    total_jobs: 31,
    documents: 5,
    city: "Mainz"
  }
];
