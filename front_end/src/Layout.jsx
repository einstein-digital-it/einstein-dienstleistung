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
    education: "Bildung & Nachhilfe",
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
    education: "التعليم والدروس",
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
    education: "Education & Tutoring",
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
    education: "Egitim ve Ozel Ders",
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
    education: "Educación y Clases",
    bureaucracy: "Apoyo Administrativo",
    legal: "Servicio Legal y Seguros",
    cleaning: "Limpieza",
    transport: "Transporte y Mudanza",
    garden: "Casa y Jardín",
    design: "Diseño e Impresión"
  }
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("einstein_lang") || "ar"; } catch { return "ar"; }
  });
  const [isProvider, setIsProvider] = useState(() => {
    try { return localStorage.getItem("einstein_is_provider") === "true"; } catch { return false; }
  });
  const t = translations[lang] || translations.ar;

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
      <meta name="application-name" content="EinStein Institut" />
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
      <header className="bg-white text-[#1e3a5f] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <EinsteinLogo size={36} />
              <div className="hidden sm:block">
                <span className="font-bold text-xl">EinStein</span>
                <span className="text-purple-200 text-xs block -mt-1">Institut</span>
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
                  {lang === "ar" ? "طلبات العملاء" : lang === "en" ? "Customer Requests" : "Kundenanfragen"}
                </Link>
              )}
              {user && !isAdmin && (
                <>
                  <Link to={createPageUrl("CustomerDashboard")} className="hover:text-[#6B46C1] transition-colors font-medium">
                    {lang === "ar" ? "لوحتي" : lang === "en" ? "My Dashboard" : "Mein Dashboard"}
                  </Link>
                  {isProvider && (
                    <Link to={createPageUrl("ProviderDashboard")} className="hover:text-[#6B46C1] transition-colors">
                      {lang === "ar" ? "لوحة المزود" : lang === "en" ? "Provider Dashboard" : "Anbieter-Dashboard"}
                    </Link>
                  )}
                </>
              )}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#1e3a5f] hover:text-[#6B46C1] hover:bg-purple-50 font-medium px-2">
                      {lang === "ar" ? "الإدارة" : lang === "en" ? "Admin" : "Admin"}
                      <ChevronDown className="w-3 h-3 ms-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("AdminBookings")} className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "الحجوزات" : lang === "en" ? "Bookings" : "Buchungen"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("BookingReports")} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "التقارير" : lang === "en" ? "Reports" : "Berichte"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ProviderApprovals")} className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "طلبات المزودين" : lang === "en" ? "Providers" : "Fachkraft-Anträge"}
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
                      <Link to={createPageUrl("AdminUsers")} className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "المستخدمون" : lang === "en" ? "Users" : "Benutzer"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("PriceAdmin")} className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "الأسعار" : lang === "en" ? "Prices" : "Preise"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ClientWorkspace")} className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {lang === "ar" ? "مساحة عمل العملاء" : lang === "en" ? "Client Workspace" : "Kundenbereich"}
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
                                                                                                                          {lang === "ar" ? "خدمة العملاء" : lang === "en" ? "Customer Service" : "Kundenservice"}
                                                                                                                          </Link>
                                                                                                                          </nav>

            {/* Right Side */}
                          <div className="flex items-center gap-1 sm:gap-3">
                            {/* Notifications */}
                            {user && <NotificationBell user={user} lang={lang} />}

                            {/* Language Selector */}
                            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#1e3a5f] hover:bg-gray-100 px-2 sm:px-3">
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
                  </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              {user !== null ? (
                                    <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-[#1e3a5f] hover:bg-gray-100 px-2 sm:px-3">
                      <User className="w-4 h-4 sm:me-2" />
                      <span className="hidden sm:inline">{user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User"}</span>
                      <ChevronDown className="w-4 h-4 ms-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("Profile")}>
                                                  <User className="w-4 h-4 me-2" />
                                                  {lang === "ar" ? "ملفي الشخصي" : lang === "en" ? "My Profile" : "Mein Profil"}
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("NotificationSettings")}>
                                                  <Bell className="w-4 h-4 me-2" />
                                                  {lang === "ar" ? "إعدادات الإشعارات" : lang === "en" ? "Notifications" : "Benachrichtigungen"}
                                                </Link>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("CustomerDashboard")}>
                                                  <Calendar className="w-4 h-4 me-2" />
                                                  {lang === "ar" ? "لوحتي" : lang === "en" ? "My Dashboard" : "Mein Dashboard"}
                                                </Link>
                                              </DropdownMenuItem>
                                              {isProvider && (
                                              <DropdownMenuItem asChild>
                                                <Link to={createPageUrl("ProviderDashboard")}>
                                                  <Briefcase className="w-4 h-4 me-2" />
                                                  {lang === "ar" ? "لوحة المزود" : lang === "en" ? "Provider Dashboard" : "Anbieter-Dashboard"}
                                                </Link>
                                              </DropdownMenuItem>
                                              )}
                      {isAdmin && (
                                                  <>
                                                    <DropdownMenuItem asChild>
                                                      <Link to={createPageUrl("ProviderApprovals")}>
                                                        <User className="w-4 h-4 me-2" />
                                                        {lang === "ar" ? "طلبات المزودين" : lang === "en" ? "Provider Applications" : "Fachkraft-Anträge"}
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
                                    className="md:hidden text-[#1e3a5f]"
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
                                          className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                          onClick={() => setIsMenuOpen(false)}
                                        >
                                          {t.home}
                                        </Link>
                                        <Link 
                                           to={createPageUrl("Services")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {t.services}
                                         </Link>
                                         <Link 
                                           to={createPageUrl("Booking")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {t.booking}
                                         </Link>
                                         {(isProvider || isAdmin) && (
                                           <Link 
                                             to={createPageUrl("CustomerRequests")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                             onClick={() => setIsMenuOpen(false)}
                                           >
                                             {lang === "ar" ? "طلبات العملاء" : lang === "en" ? "Customer Requests" : "Kundenanfragen"}
                                           </Link>
                                         )}
                                         <Link 
                                           to={createPageUrl("CustomerService")} 
                                           className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                           onClick={() => setIsMenuOpen(false)}
                                         >
                                           {lang === "ar" ? "خدمة العملاء" : lang === "en" ? "Support" : "Hilfe"}
                                         </Link>
                                        {user && !isAdmin && (
                                          <Link 
                                            to={createPageUrl("CustomerDashboard")} 
                                            className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                            onClick={() => setIsMenuOpen(false)}
                                          >
                                            {lang === "ar" ? "لوحتي" : lang === "en" ? "My Dashboard" : "Mein Dashboard"}
                                          </Link>
                                        )}
                                        {isAdmin && (
                                          <>
                                            <Link 
                                              to={createPageUrl("AdminBookings")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.myBookings}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("Payments")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.payments}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("AdminServices")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.adminServices}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("Providers")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              {t.providers}
                                            </Link>
                                            <Link 
                                              to={createPageUrl("SEOAdmin")} 
                                              className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                              onClick={() => setIsMenuOpen(false)}
                                            >
                                              SEO
                                            </Link>
                                            <Link 
                                             to={createPageUrl("PriceAdmin")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                             onClick={() => setIsMenuOpen(false)}
                                            >
                                             {lang === "ar" ? "الأسعار" : lang === "en" ? "Prices" : "Preise"}
                                            </Link>
                                            <Link 
                                             to={createPageUrl("AdminUsers")} 
                                             className="px-4 py-2 hover:bg-gray-100 rounded-lg text-[#1e3a5f]"
                                             onClick={() => setIsMenuOpen(false)}
                                            >
                                             {lang === "ar" ? "المستخدمون" : lang === "en" ? "Users" : "Benutzer"}
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
      <footer className="bg-[#6B46C1] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                      <p className="text-gray-300 text-sm mb-4">
                {lang === "de" && "Ganzheitliches Dienstleistungszentrum für den Alltag"}
                {lang === "ar" && "مركز خدمات شامل للحياة اليومية والتعليم والحرف"}
                {lang === "en" && "Comprehensive Service Center for Daily Life, Education & Crafts"}
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
                {lang === "de" ? "Kontakt" : lang === "ar" ? "اتصل بنا" : "Contact"}
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Frankfurt, Deutschland</p>
                <p>069 27246275</p>
                <p>01573 1770487</p>
                <p>www.einsteindienstleistung.com</p>
                <p>info@einsteindienstleistung.de</p>
              </div>
            </div>
            </div>

          <div className="border-t border-[#805AD5] mt-8 pt-8 text-center text-sm text-gray-300">
            <div className="mb-4">
              <Link to="/Cancellation" className="inline-block rounded-lg border border-white/40 px-4 py-2 font-semibold text-white hover:bg-white/10 transition-colors">
                {lang === "ar" ? "إلغاء العقود هنا" : lang === "en" ? "Cancel contracts here" : lang === "tr" ? "Sözleşmeleri burada iptal edin" : lang === "es" ? "Cancelar contratos aquí" : "Verträge hier kündigen"}
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
