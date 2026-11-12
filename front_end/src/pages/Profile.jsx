import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profileApi, uploadApi } from "@/api/backendClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Camera, FileX, FolderOpen, User } from "lucide-react";
import { createPageUrl } from "@/utils";
import { LANGS, LANGUAGE_NAMES, getLang } from "@/lib/lang";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  QuickLink,
  SecondaryButton
} from "@/components/design/PageScaffold";

const T = {
  de: { title: "Mein Profil", eyebrow: "Kundenkonto", desc: "Ihre Kontaktdaten und Ihre Sprache.", loginPre: "Bitte ", login: "melden Sie sich an", loginPost: ", um Ihr Profil zu sehen.", personal: "Persönliche Daten", personalHint: "Diese Angaben nutzen wir für Buchungen und Rückfragen.", name: "Vollständiger Name", email: "E-Mail", emailHint: "Die E-Mail-Adresse kann nicht geändert werden.", phone: "Telefon", address: "Adresse", language: "Sprache", languageHint: "Gilt für die Website, E-Mails und die Übersetzung Ihrer Briefe.", save: "Speichern", saving: "Wird gespeichert…", reset: "Zurücksetzen", saved: "Ihr Profil wurde gespeichert.", saveError: "Das Profil konnte nicht gespeichert werden.", photo: "Profilbild ändern", photoError: "Das Bild konnte nicht hochgeladen werden.", more: "Mehr", q1: "Benachrichtigungen", q1d: "E-Mail und Hinweise auf der Website einstellen.", q2: "Meine Unterlagen", q2d: "Briefe hochladen, sortieren und übersetzen.", q3: "Verträge kündigen", q3d: "Abos jederzeit online kündigen." },
  ar: { title: "ملفي الشخصي", eyebrow: "حساب العميل", desc: "بيانات التواصل الخاصة بك ولغتك.", loginPre: "يرجى ", login: "تسجيل الدخول", loginPost: " لعرض ملفك الشخصي.", personal: "البيانات الشخصية", personalHint: "نستخدم هذه البيانات للحجوزات وللتواصل معك.", name: "الاسم الكامل", email: "البريد الإلكتروني", emailHint: "لا يمكن تغيير البريد الإلكتروني.", phone: "رقم الهاتف", address: "العنوان", language: "اللغة", languageHint: "تُطبَّق على الموقع والبريد الإلكتروني وترجمة رسائلك.", save: "حفظ", saving: "جارٍ الحفظ…", reset: "إعادة تعيين", saved: "تم حفظ ملفك الشخصي.", saveError: "تعذّر حفظ الملف الشخصي.", photo: "تغيير الصورة الشخصية", photoError: "تعذّر رفع الصورة.", more: "المزيد", q1: "الإشعارات", q1d: "إعدادات البريد الإلكتروني والتنبيهات على الموقع.", q2: "ملفاتي", q2d: "ارفع رسائلك لترتيبها وترجمتها.", q3: "إلغاء العقود", q3d: "ألغِ اشتراكاتك عبر الإنترنت في أي وقت." },
  en: { title: "My profile", eyebrow: "Customer account", desc: "Your contact details and your language.", loginPre: "Please ", login: "sign in", loginPost: " to see your profile.", personal: "Personal details", personalHint: "We use these details for bookings and questions.", name: "Full name", email: "Email", emailHint: "The email address cannot be changed.", phone: "Phone", address: "Address", language: "Language", languageHint: "Used for the website, emails and the translation of your letters.", save: "Save", saving: "Saving…", reset: "Reset", saved: "Your profile was saved.", saveError: "The profile could not be saved.", photo: "Change profile photo", photoError: "The image could not be uploaded.", more: "More", q1: "Notifications", q1d: "Set up email and notices on the website.", q2: "My documents", q2d: "Upload letters to have them sorted and translated.", q3: "Cancel contracts", q3d: "Cancel subscriptions online at any time." },
  tr: { title: "Profilim", eyebrow: "Müşteri hesabı", desc: "İletişim bilgileriniz ve diliniz.", loginPre: "Profilinizi görmek için lütfen ", login: "giriş yapın", loginPost: ".", personal: "Kişisel bilgiler", personalHint: "Bu bilgileri rezervasyonlar ve sorular için kullanırız.", name: "Ad soyad", email: "E-posta", emailHint: "E-posta adresi değiştirilemez.", phone: "Telefon", address: "Adres", language: "Dil", languageHint: "Web sitesi, e-postalar ve mektuplarınızın çevirisi için geçerlidir.", save: "Kaydet", saving: "Kaydediliyor…", reset: "Sıfırla", saved: "Profiliniz kaydedildi.", saveError: "Profil kaydedilemedi.", photo: "Profil fotoğrafını değiştir", photoError: "Görsel yüklenemedi.", more: "Daha fazla", q1: "Bildirimler", q1d: "E-posta ve sitedeki bildirimleri ayarlayın.", q2: "Belgelerim", q2d: "Mektuplarınızı yükleyin; sıralansın ve çevrilsin.", q3: "Sözleşme iptali", q3d: "Abonelikleri istediğiniz zaman online iptal edin." },
  es: { title: "Mi perfil", eyebrow: "Cuenta de cliente", desc: "Sus datos de contacto y su idioma.", loginPre: "Por favor, ", login: "inicie sesión", loginPost: " para ver su perfil.", personal: "Datos personales", personalHint: "Usamos estos datos para reservas y consultas.", name: "Nombre completo", email: "Correo electrónico", emailHint: "El correo electrónico no se puede cambiar.", phone: "Teléfono", address: "Dirección", language: "Idioma", languageHint: "Se aplica a la web, los correos y la traducción de sus cartas.", save: "Guardar", saving: "Guardando…", reset: "Restablecer", saved: "Su perfil se ha guardado.", saveError: "No se pudo guardar el perfil.", photo: "Cambiar foto de perfil", photoError: "No se pudo subir la imagen.", more: "Más", q1: "Notificaciones", q1d: "Configure el correo y los avisos en la web.", q2: "Mis documentos", q2d: "Suba sus cartas para ordenarlas y traducirlas.", q3: "Cancelar contratos", q3d: "Cancele sus suscripciones en línea cuando quiera." },
  uk: { title: "Мій профіль", eyebrow: "Акаунт клієнта", desc: "Ваші контактні дані та мова.", loginPre: "Будь ласка, ", login: "увійдіть", loginPost: ", щоб побачити свій профіль.", personal: "Особисті дані", personalHint: "Ці дані ми використовуємо для бронювань і запитань.", name: "Повне ім’я", email: "E-mail", emailHint: "Адресу e-mail змінити не можна.", phone: "Телефон", address: "Адреса", language: "Мова", languageHint: "Діє для сайту, листів e-mail і перекладу ваших листів.", save: "Зберегти", saving: "Збереження…", reset: "Скинути", saved: "Ваш профіль збережено.", saveError: "Не вдалося зберегти профіль.", photo: "Змінити фото профілю", photoError: "Не вдалося завантажити зображення.", more: "Більше", q1: "Сповіщення", q1d: "Налаштуйте e-mail і сповіщення на сайті.", q2: "Мої документи", q2d: "Завантажуйте листи для впорядкування й перекладу.", q3: "Скасувати договори", q3d: "Скасовуйте підписки онлайн будь-коли." },
};

const readAuthUser = () => {
  try { return JSON.parse(localStorage.getItem("einstein_auth_user") || "null"); } catch { return null; }
};

export default function Profile() {
  const lang = getLang();
  const t = T[lang] || T.de;
  const queryClient = useQueryClient();
  const email = readAuthUser()?.email || localStorage.getItem("einstein_customer_email") || "";
  const [notice, setNotice] = useState(null);
  const [formData, setFormData] = useState({ full_name: "", phone: "", address: "", preferred_language: lang, avatar_url: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile", email],
    queryFn: () => profileApi.getProfile(email),
    enabled: Boolean(email),
  });

  const fromProfile = (p) => ({
    full_name: p.full_name || p.name || "",
    phone: p.phone || "",
    address: p.address || "",
    // An account without a language starts with the one shown on screen
    preferred_language: LANGS.includes(p.preferred_language) ? p.preferred_language : lang,
    avatar_url: p.avatar_url || "",
  });

  useEffect(() => {
    if (profile) setFormData(fromProfile(profile));
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => profileApi.updateProfile({ email, ...data }),
    onSuccess: (updatedProfile) => {
      localStorage.setItem("einstein_customer_email", updatedProfile.email);
      localStorage.setItem("einstein_auth_user", JSON.stringify({ ...readAuthUser(), ...updatedProfile }));
      queryClient.setQueryData(["profile", email], updatedProfile);
      // The chosen language also becomes the website language
      const chosen = updatedProfile.preferred_language;
      if (LANGS.includes(chosen) && chosen !== lang) {
        localStorage.setItem("einstein_lang", chosen);
        window.location.reload();
        return;
      }
      setNotice({ ok: true, text: t.saved });
    },
    onError: () => setNotice({ ok: false, text: t.saveError }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadApi.uploadFiles([file]),
    onSuccess: (uploaded) => {
      const avatarUrl = uploaded.files?.[0]?.url;
      if (avatarUrl) setFormData((current) => ({ ...current, avatar_url: avatarUrl }));
    },
    onError: () => setNotice({ ok: false, text: t.photoError }),
  });

  const displayName = formData.full_name || profile?.full_name || profile?.name || "";
  const initials = displayName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const set = (key) => (event) => setFormData((current) => ({ ...current, [key]: event.target.value }));
  const field = "h-12 w-full rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15";
  const label = "grid gap-2 text-sm font-bold text-[#1f0b52]";

  if (!email) {
    return (
      <PageScaffold title={t.title} eyebrow={t.eyebrow} icon={User} description={t.desc}>
        <DesignCard className="p-6">
          <p className="text-sm font-semibold text-[#65758b]">
            {t.loginPre}<Link to="/Login" className="text-[#6B46C1] underline">{t.login}</Link>{t.loginPost}
          </p>
        </DesignCard>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold title={t.title} eyebrow={t.eyebrow} icon={User} description={t.desc}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <DesignCard className="p-6 text-center">
            <div className="relative mx-auto h-28 w-28">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#1f0b52] text-4xl font-black text-white">
                {formData.avatar_url ? <img src={formData.avatar_url} alt="" className="h-full w-full object-cover" /> : initials || <User className="h-12 w-12" />}
              </div>
              <label className="absolute bottom-0 end-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-lg" title={t.photo}>
                <Camera className="h-5 w-5" />
                <span className="sr-only">{t.photo}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadMutation.mutate(file);
                  }}
                />
              </label>
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#1f0b52]">{displayName || "-"}</h2>
            <p className="mt-1 break-all text-sm font-semibold text-[#65758b]" dir="ltr">{profile?.email || email}</p>
          </DesignCard>

          <DesignCard>
            <CardHeader title={t.more} />
            <div className="space-y-3 p-5">
              <Link to={createPageUrl("NotificationSettings")} className="block"><QuickLink icon={Bell} title={t.q1} description={t.q1d} /></Link>
              <Link to={createPageUrl("MyDocuments")} className="block"><QuickLink icon={FolderOpen} title={t.q2} description={t.q2d} /></Link>
              <Link to="/Cancellation" className="block"><QuickLink icon={FileX} title={t.q3} description={t.q3d} /></Link>
            </div>
          </DesignCard>
        </div>

        <DesignCard>
          <CardHeader title={t.personal} description={t.personalHint} />
          <form
            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2"
            onSubmit={(event) => { event.preventDefault(); setNotice(null); updateMutation.mutate(formData); }}
          >
            <label className={label}>
              {t.name}
              <input value={formData.full_name} onChange={set("full_name")} autoComplete="name" className={field} />
            </label>
            <label className={label}>
              {t.email}
              <input value={profile?.email || email} readOnly dir="ltr" className={`${field} bg-[#f4f7fb] text-[#65758b]`} aria-describedby="profile-email-hint" />
              <span id="profile-email-hint" className="text-xs font-medium text-[#8ea0b7]">{t.emailHint}</span>
            </label>
            <label className={label}>
              {t.phone}
              <input type="tel" dir="ltr" value={formData.phone} onChange={set("phone")} autoComplete="tel" className={field} />
            </label>
            <label className={label}>
              {t.language}
              <select value={formData.preferred_language} onChange={set("preferred_language")} className={field}>
                {LANGS.map((code) => <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>)}
              </select>
              <span className="text-xs font-medium text-[#8ea0b7]">{t.languageHint}</span>
            </label>
            <label className={`${label} md:col-span-2`}>
              {t.address}
              <input value={formData.address} onChange={set("address")} autoComplete="street-address" className={field} />
            </label>
            {notice && (
              <p className={`rounded-xl px-4 py-3 text-sm font-bold md:col-span-2 ${notice.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role={notice.ok ? "status" : "alert"}>{notice.text}</p>
            )}
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <PrimaryButton type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? t.saving : t.save}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => { if (profile) setFormData(fromProfile(profile)); setNotice(null); }}>{t.reset}</SecondaryButton>
            </div>
          </form>
        </DesignCard>
      </div>
    </PageScaffold>
  );
}
