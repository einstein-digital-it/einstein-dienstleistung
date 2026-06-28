import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { priceAdminApi, providersApi } from "@/api/backendClient";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  CheckCircle,
  GraduationCap,
  FileText,
  ClipboardList,
  Settings,
  Globe as GlobeIcon,
  BookOpen,
  Printer,
  Briefcase,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const translations = {
  de: {
    title: "Werden Sie EinStein-Fachkraft",
    subtitle: "Arbeiten Sie flexibel als selbstständige Fachkraft im EinStein-Netzwerk",
    name: "Vollständiger Name",
    email: "E-Mail-Adresse",
    phone: "Telefonnummer",
    address: "Adresse",
    profile_image: "Profilbild",
    bio: "Über mich",
    bio_placeholder: "Erzählen Sie uns etwas über sich und Ihre Arbeitsweise...",
    experience_years: "Jahre Erfahrung",
    service_area: "Servicegebiet",
    service_area_placeholder: "z.B. Frankfurt und Umgebung",
    availability: "Verfügbare Tage",
    working_hours: "Arbeitszeiten",
    categories: "Ihre Fachgebiete",
    categories_hint: "Wählen Sie alle Bereiche, in denen Sie tätig werden möchten",
    languages: "Sprachen",
    languages_hint: "Welche Sprachen sprechen Sie?",
    qualifications: "Qualifikationen & Erfahrung",
    qualifications_placeholder: "Beschreiben Sie Ihre Ausbildung, Zertifikate und relevante Erfahrung...",

    documents: "Dokumente hochladen",
    documents_hint: "Gewerbenachweis, Zertifikate, Qualifikationen",
    submit: "Bewerbung absenden",
    success_title: "Bewerbung eingereicht!",
    success_message: "Vielen Dank für Ihr Interesse. Wir werden Ihre Bewerbung prüfen und uns in Kürze bei Ihnen melden.",
    cat_forms: "Behörden & Formularhilfe",
    cat_admin: "Administrative Dienstleistungen",
    cat_coordination: "Koordinationsleistungen",
    cat_mercosur: "MERCOSUR (LATAM)",
    cat_tutoring: "Nachhilfe / Lernunterstützung",
    cat_print: "Druck- und Stempeldienstleistungen",
    cat_office: "Büro- und Organisationsservice",
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
    title: "انضم كمزود خدمة في آينشتاين",
    subtitle: "اعمل بمرونة كمتخصص مستقل في شبكة آينشتاين",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "العنوان",
    profile_image: "صورة الملف الشخصي",
    bio: "نبذة عني",
    bio_placeholder: "أخبرنا عن نفسك وأسلوب عملك...",
    experience_years: "سنوات الخبرة",
    service_area: "منطقة الخدمة",
    service_area_placeholder: "مثال: فرانكفورت والمنطقة المحيطة",
    availability: "الأيام المتاحة",
    working_hours: "ساعات العمل",
    categories: "مجالات تخصصك",
    categories_hint: "اختر جميع المجالات التي ترغب في العمل بها",
    languages: "اللغات",
    languages_hint: "ما اللغات التي تتحدثها؟",
    qualifications: "المؤهلات والخبرة",
    qualifications_placeholder: "صف تعليمك وشهاداتك وخبراتك ذات الصلة...",

    documents: "رفع المستندات",
    documents_hint: "إثبات العمل الحر، الشهادات، المؤهلات",
    submit: "إرسال الطلب",
    success_title: "تم إرسال الطلب!",
    success_message: "شكراً لاهتمامك. سنراجع طلبك ونتواصل معك قريباً.",
    cat_forms: "مساعدة الدوائر والنماذج",
    cat_admin: "الخدمات الإدارية",
    cat_coordination: "خدمات التنسيق",
    cat_mercosur: "ميركوسور (أمريكا اللاتينية)",
    cat_tutoring: "الدروس الخصوصية / دعم التعلم",
    cat_print: "خدمات الطباعة والأختام",
    cat_office: "خدمة المكتب والتنظيم",
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
    title: "Become an EinStein Professional",
    subtitle: "Work flexibly as an independent professional in the EinStein network",
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    profile_image: "Profile Picture",
    bio: "About Me",
    bio_placeholder: "Tell us about yourself and your working style...",
    experience_years: "Years of Experience",
    service_area: "Service Area",
    service_area_placeholder: "e.g. Frankfurt and surrounding area",
    availability: "Available Days",
    working_hours: "Working Hours",
    categories: "Your Expertise",
    categories_hint: "Select all areas you want to work in",
    languages: "Languages",
    languages_hint: "What languages do you speak?",
    qualifications: "Qualifications & Experience",
    qualifications_placeholder: "Describe your education, certificates and relevant experience...",

    documents: "Upload Documents",
    documents_hint: "Business registration, certificates, qualifications",
    submit: "Submit Application",
    success_title: "Application Submitted!",
    success_message: "Thank you for your interest. We will review your application and contact you shortly.",
    cat_forms: "Government & Form Assistance",
    cat_admin: "Administrative Services",
    cat_coordination: "Coordination Services",
    cat_mercosur: "MERCOSUR (LATAM)",
    cat_tutoring: "Tutoring / Learning Support",
    cat_print: "Printing & Stamp Services",
    cat_office: "Office & Organization Service",
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

const categoryOptions = [
  { key: "office", icon: Briefcase },
  { key: "forms", icon: ClipboardList },
  { key: "admin", icon: FileText },
  { key: "coordination", icon: Settings },
  { key: "mercosur", icon: GlobeIcon },
  { key: "tutoring", icon: BookOpen },
  { key: "print", icon: Printer }
];

const languageOptions = ["Deutsch", "العربية", "English", "Türkçe", "Français", "Español", "Русский", "فارسی"];

export default function ProviderApplication() {
  const [lang, setLang] = useState("de");
  
  useEffect(() => {
    const savedLang = localStorage.getItem("einstein_lang");
    if (savedLang) setLang(savedLang);
  }, []);
  
  const t = translations[lang] || translations.de;

  const { data: priceSettingsData = [] } = useQuery({
    queryKey: ["price-settings-provider-app"],
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
    if (lang === "tr") return p.label_tr || p.label_de || p.label;
    if (lang === "es") return p.label_es || p.label_de || p.label;
    return p.label_de || p.label;
  };

  const getCategoryName = (cat) => {
    if (customPrices && customPrices[cat] && customPrices[cat][0]) {
      const customName = getLabelByLang(customPrices[cat][0]);
      if (customName) return customName;
    }
    return t[`cat_${cat}`];
  }
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    profile_image: "",
    bio_de: "",
    experience_years: "",
    service_area: "",
    availability: [],
    working_hours_start: "09:00",
    working_hours_end: "17:00",
    categories: [],
    languages: [],
    qualifications: "",
    documents_urls: []
  });

  const availabilityDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const handleAvailabilityToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, profile_image: file_url }));
    setLoading(false);
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    setLoading(true);
    const urls = [];
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    
    setFormData(prev => ({
      ...prev,
      documents_urls: [...prev.documents_urls, ...urls]
    }));
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if email already exists as a service provider
      const existingProvider = (await providersApi.listProviders("all"))
        .filter((provider) => provider.email?.toLowerCase() === formData.email.toLowerCase());
      
      if (existingProvider.length > 0) {
        alert(lang === "ar" 
          ? "هذا البريد مسجل بالفعل كمزود خدمة" 
          : lang === "en" 
            ? "This email is already registered as a service provider" 
            : "Diese E-Mail ist bereits als Dienstleister registriert");
        setLoading(false);
        return;
      }

      await providersApi.createProvider({
        full_name: formData.full_name,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        address: formData.address,
        profile_image: formData.profile_image || "",
        bio_de: formData.bio_de || "",
        experience_years: parseInt(formData.experience_years) || 0,
        service_area: formData.service_area || "",
        availability: formData.availability || [],
        working_hours_start: formData.working_hours_start || "09:00",
        working_hours_end: formData.working_hours_end || "17:00",
        categories: formData.categories || [],
        languages: formData.languages || [],
        qualifications: formData.qualifications || "",
        documents_urls: formData.documents_urls || [],
        status: "pending",
        notes: lang  // store the language for welcome email
      });

      // Send email notification to admin
      try {
        const admins = [];
        for (const admin of admins) {
          await base44.integrations.Core.SendEmail({
            to: admin.email,
            subject: `Neue Fachkraft-Bewerbung / New Provider Application: ${formData.full_name}`,
            body: `
Neue Fachkraft-Bewerbung eingegangen / New Provider Application Received

Name: ${formData.full_name}
Email: ${formData.email}
Phone: ${formData.phone}
Kategorien / Categories: ${formData.categories.join(", ")}
Sprachen / Languages: ${formData.languages.join(", ")}
Servicegebiet / Service Area: ${formData.service_area || "-"}

Bitte überprüfen Sie die Bewerbung im Admin-Dashboard.
Please review the application in the admin dashboard.

EinStein Institut
            `
          });
        }
      } catch (emailError) {
        console.error("Error sending admin email:", emailError);
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert(lang === "ar" ? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى." : lang === "en" ? "An error occurred. Please try again." : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">{t.success_title}</h2>
              <p className="text-gray-600">{t.success_message}</p>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-[#6B46C1] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-[#1e3a5f]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </motion.div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
                              <div className="flex items-center gap-6 mb-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                                  {formData.profile_image ? (
                                    <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <Label className="mb-2 block">{t.profile_image}</Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageUpload}
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              {/* Personal Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" /> {t.name}
                                  </Label>
                                  <Input
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4" /> {t.email}
                                  </Label>
                                  <Input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4" /> {t.phone}
                                  </Label>
                                  <Input
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4" /> {t.address}
                                  </Label>
                                  <Input
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                  />
                                </div>
                              </div>

                              {/* Bio */}
                              <div>
                                <Label className="mb-2 block">{t.bio}</Label>
                                <Textarea
                                  rows={3}
                                  placeholder={t.bio_placeholder}
                                  value={formData.bio_de}
                                  onChange={(e) => setFormData(prev => ({ ...prev, bio_de: e.target.value }))}
                                />
                              </div>

                              {/* Experience & Service Area */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="mb-2 block">{t.experience_years}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={formData.experience_years}
                                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2 block">{t.service_area}</Label>
                                  <Input
                                    placeholder={t.service_area_placeholder}
                                    value={formData.service_area}
                                    onChange={(e) => setFormData(prev => ({ ...prev, service_area: e.target.value }))}
                                  />
                                </div>
                              </div>

                              {/* Availability */}
                              <div>
                                <Label className="mb-2 block">{t.availability}</Label>
                                <div className="flex flex-wrap gap-2">
                                  {availabilityDays.map((day) => {
                                    const isSelected = formData.availability.includes(day);
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleAvailabilityToggle(day)}
                                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                                          isSelected 
                                            ? "border-[#6B46C1] bg-[#6B46C1]/10 text-[#1e3a5f]" 
                                            : "border-gray-200 hover:border-[#6B46C1]/50"
                                        }`}
                                      >
                                        {t.days[day]}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Working Hours */}
                              <div>
                                <Label className="mb-2 block">{t.working_hours}</Label>
                                <div className="flex items-center gap-4">
                                  <Input
                                    type="time"
                                    value={formData.working_hours_start}
                                    onChange={(e) => setFormData(prev => ({ ...prev, working_hours_start: e.target.value }))}
                                    className="w-32"
                                  />
                                  <span className="text-gray-500">-</span>
                                  <Input
                                    type="time"
                                    value={formData.working_hours_end}
                                    onChange={(e) => setFormData(prev => ({ ...prev, working_hours_end: e.target.value }))}
                                    className="w-32"
                                  />
                                </div>
                              </div>

              {/* Categories */}
              <div>
                <Label className="mb-2 block">{t.categories}</Label>
                <p className="text-sm text-gray-500 mb-3">{t.categories_hint}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.categories.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => handleCategoryToggle(cat.key)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isSelected 
                            ? "border-[#6B46C1] bg-[#6B46C1]/10" 
                            : "border-gray-200 hover:border-[#6B46C1]/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-[#6B46C1]" : "text-gray-400"}`} />
                        <span className="text-sm font-medium">{getCategoryName(cat.key)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" /> {t.languages}
                </Label>
                <p className="text-sm text-gray-500 mb-3">{t.languages_hint}</p>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => {
                    const isSelected = formData.languages.includes(language);
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                          isSelected 
                            ? "border-[#6B46C1] bg-[#6B46C1]/10 text-[#1e3a5f]" 
                            : "border-gray-200 hover:border-[#6B46C1]/50"
                        }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qualifications */}
              <div>
                <Label className="mb-2 block">{t.qualifications}</Label>
                <Textarea
                  rows={4}
                  placeholder={t.qualifications_placeholder}
                  value={formData.qualifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                />
              </div>

              {/* Documents */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4" /> {t.documents}
                </Label>
                <p className="text-sm text-gray-500 mb-3">{t.documents_hint}</p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                {formData.documents_urls.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.documents_urls.length} file(s) uploaded
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button 
                type="submit"
                disabled={loading || !formData.full_name || !formData.email || !formData.phone || formData.categories.length === 0}
                className="w-full bg-[#6B46C1] hover:bg-[#805AD5] text-white font-bold py-6"
              >
                {loading ? "..." : t.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
