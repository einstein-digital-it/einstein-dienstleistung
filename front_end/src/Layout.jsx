import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { authApi } from "@/api/backendClient";
import { clearStoredAuth, getStoredAuthUser, redirectToLogin } from "@/lib/backendAuth";
import EinsteinLogo from "@/components/EinsteinLogo";
import {
  FileText,
  Wrench,
  Menu,
  X,
  Calendar,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Bell,
  CreditCard,
  Wrench as WrenchIcon,
  Briefcase,
  TrendingUp
} from "lucide-react";

import NotificationBell from "@/components/NotificationBell";
import SEOHead from "@/components/SEOHead";
import ChatBot from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const translations = {
  de: {
    home: "Startseite",
    services: "Dienstleistungen",
    booking: "Buchen",
    myBookings: "Meine Buchungen",
    dashboard: "Dashboard",
    payments: "Zahlungen",
    adminServices: "Dienste verwalten",
    providers: "Fachkräfte",
    ourExperts: "Unsere Experten",
    providerDashboard: "Fachkraft-Dashboard",
    login: "Anmelden",
    logout: "Abmelden",
    education: "Bildung",
    bureaucracy: "Administrative Unterstützung",
    legal: "Rechts- & Versicherungsservice",
    cleaning: "Reinigung",
    transport: "Transport & Umzug",
    garden: "Haus & Garten",
    design: "Design & Druck"
  },
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    booking: "حجز",
    myBookings: "حجوزاتي",
    dashboard: "لوحة التحكم",
    payments: "المدفوعات",
    adminServices: "إدارة الخدمات",
    providers: "مزودي الخدمات",
    ourExperts: "خبراؤنا",
    providerDashboard: "لوحة مزود الخدمة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    education: "التعليم",
    bureaucracy: "الدعم الإداري",
    legal: "الخدمات القانونية والتأمين",
    cleaning: "التنظيف",
    transport: "النقل والانتقال",
    garden: "المنزل والحديقة",
    design: "التصميم والطباعة"
  },
  en: {
    home: "Home",
    services: "Services",
    booking: "Book Now",
    myBookings: "My Bookings",
    dashboard: "Dashboard",
    payments: "Payments",
    adminServices: "Manage Services",
    providers: "Service Providers",
    ourExperts: "Our Experts",
    providerDashboard: "Provider Dashboard",
    login: "Login",
    logout: "Logout",
    education: "Education",
    bureaucracy: "Administrative Support",
    legal: "Legal & Insurance Service",
    cleaning: "Cleaning",
    transport: "Transport & Moving",
    garden: "House & Garden",
    design: "Design & Print"
  },
  tr: {
    home: "Ana Sayfa",
    services: "Hizmetler",
    booking: "Rezervasyon",
    myBookings: "Rezervasyonlarim",
    dashboard: "Kontrol Paneli",
    payments: "Odemeler",
    adminServices: "Hizmetleri Yonet",
    providers: "Hizmet Saglayicilar",
    providerDashboard: "Saglayici Paneli",
    login: "Giris Yap",
    logout: "Cikis Yap",
    education: "Egitim",
    bureaucracy: "İdari Destek",
    legal: "Hukuki ve Sigorta Hizmeti",
    cleaning: "Temizlik",
    transport: "Tasima ve Tasinma",
    garden: "Ev ve Bahce",
    design: "Tasarim ve Baski"
  },
  es: {
    home: "Inicio",
    services: "Servicios",
    booking: "Reservar",
    myBookings: "Mis Reservas",
    dashboard: "Panel",
    payments: "Pagos",
    adminServices: "Gestionar Servicios",
    providers: "Proveedores",
    providerDashboard: "Panel Proveedor",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    education: "Educación",
    bureaucracy: "Apoyo Administrativo",
    legal: "Servicio Legal y Seguros",
    cleaning: "Limpieza",
    transport: "Transporte y Mudanza",
    garden: "Casa y Jardín",
    design: "Diseño e Impresión"
  },
  uk: {
    home: "Головна",
    services: "Послуги",
    booking: "Забронювати",
    myBookings: "Мої бронювання",
    dashboard: "Кабінет",
    payments: "Оплати",
    adminServices: "Керування послугами",
    providers: "Виконавці",
    ourExperts: "Наші фахівці",
    providerDashboard: "Кабінет виконавця",
    login: "Увійти",
    logout: "Вийти",
    education: "Освіта",
    bureaucracy: "Адміністративна допомога",
    legal: "Юридичні та страхові послуги",
    cleaning: "Прибирання",
    transport: "Транспорт і переїзд",
    garden: "Дім і сад",
    design: "Дизайн і друк"
  }
};

// Menu texts that are not part of `translations`, in all six languages
const MENU = {
  customerRequests: { de: "Kundenanfragen", ar: "طلبات العملاء", en: "Customer requests", tr: "Müşteri talepleri", es: "Solicitudes de clientes", uk: "Запити клієнтів" },
  myDashboard: { de: "Mein Dashboard", ar: "لوحتي", en: "My dashboard", tr: "Hesabım", es: "Mi área", uk: "Мій кабінет" },
  customerDocs: { de: "Kundenunterlagen", ar: "ملفات الزبائن", en: "Customer documents", tr: "Müşteri belgeleri", es: "Documentos de clientes", uk: "Документи клієнтів" },
  myDocs: { de: "Meine Unterlagen", ar: "ملفاتي", en: "My documents", tr: "Belgelerim", es: "Mis documentos", uk: "Мої документи" },
  providerDashboard: { de: "Anbieter-Dashboard", ar: "لوحة المزود", en: "Provider dashboard", tr: "Sağlayıcı paneli", es: "Panel del profesional", uk: "Кабінет виконавця" },
  admin: { de: "Admin", ar: "الإدارة", en: "Admin", tr: "Yönetim", es: "Administración", uk: "Адмін" },
  bookings: { de: "Buchungen", ar: "الحجوزات", en: "Bookings", tr: "Rezervasyonlar", es: "Reservas", uk: "Бронювання" },
  reports: { de: "Berichte", ar: "التقارير", en: "Reports", tr: "Raporlar", es: "Informes", uk: "Звіти" },
  providerApplications: { de: "Fachkraft-Anträge", ar: "طلبات المزودين", en: "Provider applications", tr: "Sağlayıcı başvuruları", es: "Solicitudes de profesionales", uk: "Заявки виконавців" },
  users: { de: "Benutzer", ar: "المستخدمون", en: "Users", tr: "Kullanıcılar", es: "Usuarios", uk: "Користувачі" },
  prices: { de: "Preise", ar: "الأسعار", en: "Prices", tr: "Fiyatlar", es: "Precios", uk: "Ціни" },
  clientWorkspace: { de: "Kundenbereich", ar: "مساحة عمل العملاء", en: "Client workspace", tr: "Müşteri alanı", es: "Área de clientes", uk: "Простір клієнтів" },
  customerService: { de: "Kundenservice", ar: "خدمة العملاء", en: "Customer service", tr: "Müşteri hizmetleri", es: "Atención al cliente", uk: "Служба підтримки" },
  myProfile: { de: "Mein Profil", ar: "ملفي الشخصي", en: "My profile", tr: "Profilim", es: "Mi perfil", uk: "Мій профіль" },
  notifications: { de: "Benachrichtigungen", ar: "إعدادات الإشعارات", en: "Notifications", tr: "Bildirimler", es: "Notificaciones", uk: "Сповіщення" },
  help: { de: "Hilfe", ar: "خدمة العملاء", en: "Support", tr: "Yardım", es: "Ayuda", uk: "Підтримка" },
  contact: { de: "Kontakt", ar: "اتصل بنا", en: "Contact", tr: "İletişim", es: "Contacto", uk: "Контакти" },
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; }
  });
  const [isProvider, setIsProvider] = useState(() => {
    try { return localStorage.getItem("einstein_is_provider") === "true"; } catch { return false; }
  });
  const t = translations[lang] || translations.de;
  const m = (key) => MENU[key][lang] || MENU[key].de;

  useEffect(() => {
    const init = () => {
      const userData = getStoredAuthUser();
      setUser(userData);
      const isProviderVal = userData?.role === "provider";
      setIsProvider(isProviderVal);
      try { localStorage.setItem("einstein_is_provider", isProviderVal ? "true" : "false"); } catch {}
    };
    init();
  }, []);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(() => console.log('SW registered'))
          .catch(() => console.log('SW registration failed'));
      });
    }
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem("einstein_lang", newLang);
    } catch (e) {
      console.log("Error saving language");
    }
    window.location.reload();
  };

  const isRTL = lang === "ar";
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with local logout if the server session is already expired.
    }
    clearStoredAuth();
    setUser(null);
    setIsProvider(false);
    window.location.href = "/Login";
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead pageName={currentPageName} lang={lang} />
      
      {/* PWA Meta Tags */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="EinStein" />
      <meta name="application-name" content="EinStein" />
      <meta name="theme-color" content="#6B46C1" />
      <meta name="msapplication-TileColor" content="#6B46C1" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

      <style>{`
        :root {
          --primary: #6B46C1;
          --primary-light: #805AD5;
          --primary-dark: #553C9A;
          --secondary: #E9D5FF;
          --secondary-light: #F3E8FF;
        }
        .bg-primary { background-color: var(--primary); }
        .bg-primary-light { background-color: var(--primary-light); }
        .text-primary { color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .text-secondary { color: var(--secondary); }
        .border-secondary { border-color: var(--secondary); }
        .hover\\:bg-secondary:hover { background-color: var(--secondary); }
        .rtl { direction: rtl; text-align: right; }
        .ltr { direction: ltr; text-align: left; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-100/80 bg-white/90 text-[#2e1065] backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <EinsteinLogo size={40} />
              <div className="hidden sm:block leading-tight">
                <span className="block text-lg font-black tracking-wide text-[#3b1478]">EinStein</span>
                <span className="block text-[11px] font-medium text-[#7c3aed]" dir="ltr">Vielfalt bildet – EinStein verbindet</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to={createPageUrl("Home")} className="hover:text-[#6B46C1] transition-colors">
                {t.home}
              </Link>
              <Link to={createPageUrl("Services")} className="hover:text-[#6B46C1] transition-colors">
                {t.services}
              </Link>
              <Link to={createPageUrl("Booking")} className="hover:text-[#6B46C1] transition-colors">
                {t.booking}
              </Link>
              {(isProvider || isAdmin) && (
                <Link to={createPageUrl("CustomerRequests")} className="hover:text-[#6B46C1] transition-colors">
                  {m("customerRequests")}
                </Link>
              )}
              {user && !isAdmin && (
                <>
                  <Link to={createPageUrl("CustomerDashboard")} className="hover:text-[#6B46C1] transition-colors font-medium">
                    {m("myDashboard")}
                  </Link>
                  <Link to={createPageUrl("MyDocuments")} className="hover:text-[#6B46C1] transition-colors font-medium">
                    {isProvider
                      ? (m("customerDocs"))
                      : (m("myDocs"))}
                  </Link>
                  {isProvider && (
                    <Link to={createPageUrl("ProviderDashboard")} className="hover:text-[#6B46C1] transition-colors">
                      {m("providerDashboard")}
                    </Link>
                  )}
                </>
              )}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#2e1065] hover:text-[#6B46C1] hover:bg-purple-50 font-medium px-2">
                      {m("admin")}
                      <ChevronDown className="w-3 h-3 ms-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("AdminBookings")} className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {m("bookings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("BookingReports")} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {m("reports")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ProviderApprovals")} className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {m("providerApplications")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Providers")} className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {t.providers}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Payments")} className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {t.payments}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("AdminServices")} className="flex items-center gap-2">
                        <WrenchIcon className="w-4 h-4 text-gray-400" />
                        {t.adminServices}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("MyDocuments")} className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {m("customerDocs")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("AdminUsers")} className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {m("users")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("PriceAdmin")} className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {m("prices")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ClientWorkspace")} className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {m("clientWorkspace")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/RevenueReports" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        {{ de: "Umsatzbericht", ar: "تقارير الأرباح", en: "Revenue Reports", tr: "Gelir Raporu", es: "Informe de Ingresos" }[lang] || "Umsatzbericht"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("SEOAdmin")} className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        SEO
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
                                                                                                                          <Link to={createPageUrl("CustomerService")} className="hover:text-[#6B46C1] transition-colors">
                                                                                                                          {m("customerService")}
                                                                                                                          </Link>
                                                                                                                          </nav>

            {/* Right Side */}
                          <div className="flex items-center gap-1 sm:gap-3">
                            {/* Notifications */}
                            {user && <NotificationBell user={user} lang={lang} />}

                            {/* Language Selector */}
                            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#2e1065] hover:bg-gray-100 px-2 sm:px-3">
                    <Globe className="w-4 h-4 sm:me-1" />
                    <span className="hidden sm:inline">{lang.toUpperCase()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeLang("de")}>
                    🇩🇪 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLang("ar")}>
                    🇸🇦 العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLang("en")}>
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLang("tr")}>
                    🇹🇷 Turkce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLang("es")}>
                    🇪🇸 Español
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLang("uk")}>
                    🇺🇦 Українська
                  </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              {user !== null ? (
                                    <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-[#2e1065] hover:bg-gray-100 px-2 sm:px-3">
                      <User className="w-4 h-4 sm:me-2" />
                      <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User"}</span>
                      <ChevronDown className="w-4 h-4 ms-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("Profile")}>
                                                  <User className="w-4 h-4 me-2" />
                                                  {m("myProfile")}
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("NotificationSettings")}>
                                                  <Bell className="w-4 h-4 me-2" />
                                                  {m("notifications")}
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("CustomerDashboard")}>
                                                  <Calendar className="w-4 h-4 me-2" />
                                                  {m("myDashboard")}
                                                </Link>
                                              </DropdownMenuItem>
                                              {isProvider && (
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("ProviderDashboard")}>
                                                  <Briefcase className="w-4 h-4 me-2" />
                                                  {m("providerDashboard")}
                                                </Link>
                                              </DropdownMenuItem>
                                              )}
                      {isAdmin && (
                                                  <>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("ProviderApprovals")}>
                                                        <User className="w-4 h-4 me-2" />
                                                        {m("providerApplications")}
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("AdminBookings")}>
                                                        <Calendar className="w-4 h-4 me-2" />
                                                        {t.myBookings}
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("Payments")}>
                                                        <CreditCard className="w-4 h-4 me-2" />
                                                        {t.payments}
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("AdminServices")}>
                                                        <Wrench className="w-4 h-4 me-2" />
                                                        {t.adminServices}
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("Providers")}>
                                                        <User className="w-4 h-4 me-2" />
                                                        {t.providers}
                                                      </Link>
                                                    </DropdownMenuItem>
                                                  </>
                                                )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 me-2" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                                        onClick={redirectToLogin}
                                        className="bg-[#6B46C1] hover:bg-[#805AD5] text-white font-semibold px-3 sm:px-4 text-sm"
                                      >
                  <span className="hidden sm:inline">{t.login}</span>
                  <User className="w-4 h-4 sm:hidden" />
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="md:hidden text-[#2e1065]"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                  >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
                      {isMenuOpen && (
                                    <nav className="md:hidden py-4 border-t border-gray-200 bg-white">
                                      <div className="flex flex-col gap-3">
                                        <Link 
                                          to={createPageUrl("Home")} 
                                          className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                          onClick={() => setIsMenuOpen(false)}
                                        >
                                          {t.home}
                                        </Link>
                                        <Link 
                                           to={createPageUrl("Services")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {t.services}
                                         </Link>
                                         <Link 
                                           to={createPageUrl("Booking")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {t.booking}
                                         </Link>
                                         {(isProvider || isAdmin) && (
                                           <Link 
                                             to={createPageUrl("CustomerRequests")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                             onClick={() => setIsMenuOpen(false)}
                                           >
                                             {m("customerRequests")}
                                           </Link>
                                         )}
                                         <Link 
                                           to={createPageUrl("CustomerService")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {m("help")}
                                         </Link>
                                        {user && !isAdmin && (
                                          <Link 
                                            to={createPageUrl("CustomerDashboard")} 
                                            className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                            onClick={() => setIsMenuOpen(false)}
                                          >
                                            {m("myDashboard")}
                                          </Link>
                                        )}
                                        {user && (
                                          <Link
                                            to={createPageUrl("MyDocuments")}
                                            className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                            onClick={() => setIsMenuOpen(false)}
                                          >
                                            {isAdmin || isProvider
                                              ? (m("customerDocs"))
                                              : (m("myDocs"))}
                                          </Link>
                                        )}
                                        {isAdmin && (
                                          <>
                                            <Link 
                                              to={createPageUrl("AdminBookings")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.myBookings}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("Payments")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.payments}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("AdminServices")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.adminServices}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("Providers")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.providers}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("SEOAdmin")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              SEO
                                            </Link>
                                            <Link 
                                             to={createPageUrl("PriceAdmin")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                             onClick={() => setIsMenuOpen(false)}
                                            >
                                             {m("prices")}
                                            </Link>
                                            <Link 
                                             to={createPageUrl("AdminUsers")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#2e1065]"
                                             onClick={() => setIsMenuOpen(false)}
                                            >
                                             {m("users")}
                                            </Link>
                                             </>
                                             )}
                                              </div>
                                              </nav>
                                              )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* ChatBot */}
      <ChatBot lang={lang} />

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-br from-[#1f0b52] via-[#3b1478] to-[#6d28d9] py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
                          <EinsteinLogo size={36} />
                        </span>
                        <span className="leading-tight">
                          <span className="block text-xl font-black tracking-wide">EinStein</span>
                          <span className="block text-xs text-purple-200" dir="ltr">Vielfalt bildet – EinStein verbindet</span>
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">
                {{
                  de: "Behördengänge, Unterlagen und Büro – an einem Ort, in Ihrer Sprache.",
                  ar: "المعاملات والأوراق والأعمال المكتبية – في مكان واحد وبلغتك.",
                  en: "Paperwork, documents and office help – in one place, in your language.",
                  tr: "Resmi işler, belgeler ve büro – tek yerde, kendi dilinizde.",
                  es: "Trámites, documentos y oficina – en un solo lugar, en su idioma.",
                  uk: "Справи з установами, документи та офіс – в одному місці, вашою мовою.",
                }[lang]}
              </p>
              <p className="text-purple-200 font-semibold text-sm">
                „EinStein – Weil jeder Mensch Unterstützung verdient."
              </p>

              {/* Social Media */}
              <div className="flex gap-4 mt-4">
                <a href="https://www.facebook.com/profile.php?id=61577718746849" target="_blank" rel="noopener noreferrer" className="hover:text-purple-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/einstein_bildung/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@dienstleist" target="_blank" rel="noopener noreferrer" className="hover:text-purple-200 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-purple-200">
                {m("contact")}
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Frankfurt, Deutschland</p>
                <p><a href="tel:+496927246275" dir="ltr" className="hover:text-white">069 27246275</a></p>
                <p><a href="tel:+4915731770487" dir="ltr" className="hover:text-white">01573 1770487</a></p>
                <p dir="ltr" className="rtl:text-right">www.einsteindienstleistung.com</p>
                <p><a href="mailto:info@einsteindienstleistung.de" dir="ltr" className="hover:text-white">info@einsteindienstleistung.de</a></p>
              </div>
            </div>
            </div>

          <div className="border-t border-[#805AD5] mt-8 pt-8 text-center text-sm text-gray-300">
            <div className="mb-4">
              <Link to="/Cancellation" className="inline-block rounded-lg border border-white/40 px-4 py-2 font-semibold text-white hover:bg-white/10 transition-colors">
                {lang === "ar" ? "إلغاء العقود هنا" : lang === "en" ? "Cancel contracts here" : lang === "uk" ? "Скасувати договори тут" : lang === "tr" ? "Sözleşmeleri burada iptal edin" : lang === "es" ? "Cancelar contratos aquí" : "Verträge hier kündigen"}
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-3">
              <Link to="/Impressum" className="hover:text-white transition-colors">Impressum</Link>
              <Link to="/Datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
              <Link to="/AGB" className="hover:text-white transition-colors">AGB</Link>
            </div>
            <p>© 2026 EinStein – Inhaber Beshr Alhoury Alhomsi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
