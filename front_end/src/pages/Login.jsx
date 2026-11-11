import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, Eye, EyeOff, FolderSync, Globe, Languages, Lock, Mail, MailCheck, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/api/backendClient";
import EinsteinLogo from "@/components/EinsteinLogo";

const LANGS = [
  ["ar", "العربية"], ["de", "Deutsch"], ["en", "English"], ["tr", "Türkçe"], ["es", "Español"], ["uk", "Українська"],
];

const T = {
  de: {
    welcome: "Willkommen zurück", welcomeNew: "Konto erstellen", sub: "Melden Sie sich an, um Ihre Unterlagen und Buchungen zu sehen.", subNew: "In einer Minute startklar – kostenlos.",
    login: "Anmelden", register: "Registrieren", name: "Vollständiger Name", email: "E-Mail", password: "Passwort", show: "Passwort anzeigen", hide: "Passwort verbergen",
    forgot: "Passwort vergessen?", submit: "Anmelden", submitNew: "Konto erstellen", wait: "Bitte warten…", home: "Zur Startseite",
    errEmpty: "Bitte E-Mail und Passwort eingeben.", errName: "Bitte Ihren Namen eingeben.", errGeneric: "Anmeldung fehlgeschlagen. Bitte Angaben prüfen.",
    lead: "Behördenpost, Termine und Büro – an einem Ort, in Ihrer Sprache.",
    b1: "Briefe hochladen – automatisch sortiert und übersetzt", b2: "Dienstleistungen online buchen und bezahlen", b3: "Erinnerung vor jeder Frist",
    codeTitle: "E-Mail bestätigen", codeSub: "Wir haben einen 6-stelligen Code an diese Adresse geschickt:", code: "Bestätigungscode", verify: "Bestätigen", resend: "Code erneut senden", resendIn: "Neuer Code in {s} s", resent: "Ein neuer Code ist unterwegs. Schauen Sie auch im Spam-Ordner nach.", otherEmail: "Andere E-Mail verwenden", errCode: "Bitte den 6-stelligen Code eingeben.", errWrong: "Der Code ist nicht richtig.", errExpired: "Der Code ist abgelaufen. Bitte fordern Sie einen neuen an.", errTooMany: "Zu viele falsche Versuche. Bitte fordern Sie einen neuen Code an.",
  },
  ar: {
    welcome: "أهلاً بعودتك", welcomeNew: "إنشاء حساب", sub: "سجّل الدخول لترى أوراقك وحجوزاتك.", subNew: "جاهز خلال دقيقة – مجاناً.",
    login: "تسجيل الدخول", register: "حساب جديد", name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور", show: "إظهار كلمة المرور", hide: "إخفاء كلمة المرور",
    forgot: "نسيت كلمة المرور؟", submit: "تسجيل الدخول", submitNew: "إنشاء الحساب", wait: "لحظة من فضلك…", home: "الصفحة الرئيسية",
    errEmpty: "أدخل البريد الإلكتروني وكلمة المرور.", errName: "أدخل اسمك لإنشاء الحساب.", errGeneric: "تعذر تسجيل الدخول. تحقق من بياناتك.",
    lead: "رسائل الدوائر والمواعيد والمكتب – بمكان واحد وبلغتك.",
    b1: "ارفع رسائلك – تترتب وتُترجم تلقائياً", b2: "احجز الخدمات وادفع أونلاين", b3: "تذكير قبل كل موعد نهائي",
    codeTitle: "تأكيد البريد الإلكتروني", codeSub: "أرسلنا رمزاً مكوّناً من 6 أرقام إلى هذا العنوان:", code: "رمز التحقق", verify: "تأكيد", resend: "إرسال الرمز مرة أخرى", resendIn: "رمز جديد بعد {s} ثانية", resent: "أرسلنا رمزاً جديداً. تحقق أيضاً من مجلد الرسائل غير المرغوب فيها.", otherEmail: "استخدام بريد إلكتروني آخر", errCode: "أدخل الرمز المكوّن من 6 أرقام.", errWrong: "الرمز غير صحيح.", errExpired: "انتهت صلاحية الرمز. اطلب رمزاً جديداً.", errTooMany: "محاولات خاطئة كثيرة. اطلب رمزاً جديداً.",
  },
  en: {
    welcome: "Welcome back", welcomeNew: "Create your account", sub: "Sign in to see your documents and bookings.", subNew: "Ready in a minute – free.",
    login: "Sign in", register: "Sign up", name: "Full name", email: "Email", password: "Password", show: "Show password", hide: "Hide password",
    forgot: "Forgot password?", submit: "Sign in", submitNew: "Create account", wait: "Please wait…", home: "Back to home",
    errEmpty: "Enter your email and password to continue.", errName: "Enter your name to create an account.", errGeneric: "Unable to sign in. Please check your details.",
    lead: "Official letters, appointments and office work – in one place, in your language.",
    b1: "Upload letters – sorted and translated automatically", b2: "Book and pay for services online", b3: "Reminders before every deadline",
    codeTitle: "Confirm your email", codeSub: "We sent a 6-digit code to this address:", code: "Verification code", verify: "Confirm", resend: "Send the code again", resendIn: "New code in {s} s", resent: "A new code is on its way. Please also check your spam folder.", otherEmail: "Use a different email", errCode: "Enter the 6-digit code.", errWrong: "The code is not correct.", errExpired: "The code has expired. Please ask for a new one.", errTooMany: "Too many wrong tries. Please ask for a new code.",
  },
  tr: {
    welcome: "Tekrar hoş geldiniz", welcomeNew: "Hesap oluşturun", sub: "Belgelerinizi ve rezervasyonlarınızı görmek için giriş yapın.", subNew: "Bir dakikada hazır – ücretsiz.",
    login: "Giriş", register: "Kayıt ol", name: "Ad soyad", email: "E-posta", password: "Şifre", show: "Şifreyi göster", hide: "Şifreyi gizle",
    forgot: "Şifrenizi mi unuttunuz?", submit: "Giriş yap", submitNew: "Hesap oluştur", wait: "Lütfen bekleyin…", home: "Ana sayfa",
    errEmpty: "E-posta ve şifrenizi girin.", errName: "Hesap için adınızı girin.", errGeneric: "Giriş yapılamadı. Bilgilerinizi kontrol edin.",
    lead: "Resmi yazılar, randevular ve büro işleri – tek yerde, kendi dilinizde.",
    b1: "Mektupları yükleyin – otomatik sıralanır ve çevrilir", b2: "Hizmetleri online rezerve edin ve ödeyin", b3: "Her son tarihten önce hatırlatma",
    codeTitle: "E-postanızı onaylayın", codeSub: "Bu adrese 6 haneli bir kod gönderdik:", code: "Doğrulama kodu", verify: "Onayla", resend: "Kodu tekrar gönder", resendIn: "{s} sn sonra yeni kod", resent: "Yeni kod gönderildi. Spam klasörünü de kontrol edin.", otherEmail: "Başka bir e-posta kullan", errCode: "6 haneli kodu girin.", errWrong: "Kod doğru değil.", errExpired: "Kodun süresi doldu. Yeni bir kod isteyin.", errTooMany: "Çok fazla hatalı deneme. Yeni bir kod isteyin.",
  },
  es: {
    welcome: "Bienvenido de nuevo", welcomeNew: "Cree su cuenta", sub: "Inicie sesión para ver sus documentos y reservas.", subNew: "Listo en un minuto – gratis.",
    login: "Entrar", register: "Registrarse", name: "Nombre completo", email: "Correo electrónico", password: "Contraseña", show: "Mostrar contraseña", hide: "Ocultar contraseña",
    forgot: "¿Olvidó su contraseña?", submit: "Iniciar sesión", submitNew: "Crear cuenta", wait: "Un momento…", home: "Volver al inicio",
    errEmpty: "Introduzca su correo y contraseña.", errName: "Introduzca su nombre para crear la cuenta.", errGeneric: "No se pudo iniciar sesión. Revise sus datos.",
    lead: "Cartas oficiales, citas y oficina – en un solo lugar, en su idioma.",
    b1: "Suba cartas – se ordenan y traducen automáticamente", b2: "Reserve y pague servicios online", b3: "Recordatorios antes de cada plazo",
    codeTitle: "Confirme su correo", codeSub: "Hemos enviado un código de 6 dígitos a esta dirección:", code: "Código de verificación", verify: "Confirmar", resend: "Enviar el código de nuevo", resendIn: "Nuevo código en {s} s", resent: "Le hemos enviado un nuevo código. Revise también la carpeta de spam.", otherEmail: "Usar otro correo", errCode: "Introduzca el código de 6 dígitos.", errWrong: "El código no es correcto.", errExpired: "El código ha caducado. Solicite uno nuevo.", errTooMany: "Demasiados intentos fallidos. Solicite un código nuevo.",
  },
  uk: {
    welcome: "З поверненням", welcomeNew: "Створіть акаунт", sub: "Увійдіть, щоб бачити свої документи й бронювання.", subNew: "Готово за хвилину – безкоштовно.",
    login: "Вхід", register: "Реєстрація", name: "Повне ім’я", email: "E-mail", password: "Пароль", show: "Показати пароль", hide: "Сховати пароль",
    forgot: "Забули пароль?", submit: "Увійти", submitNew: "Створити акаунт", wait: "Зачекайте…", home: "На головну",
    errEmpty: "Введіть e-mail і пароль.", errName: "Введіть ім’я, щоб створити акаунт.", errGeneric: "Не вдалося увійти. Перевірте дані.",
    lead: "Офіційні листи, зустрічі та офіс – в одному місці, вашою мовою.",
    b1: "Завантажуйте листи – вони впорядковуються й перекладаються", b2: "Бронюйте й оплачуйте послуги онлайн", b3: "Нагадування перед кожним строком",
    codeTitle: "Підтвердіть e-mail", codeSub: "Ми надіслали 6-значний код на цю адресу:", code: "Код підтвердження", verify: "Підтвердити", resend: "Надіслати код ще раз", resendIn: "Новий код через {s} с", resent: "Новий код уже надіслано. Перевірте також папку «Спам».", otherEmail: "Використати інший e-mail", errCode: "Введіть 6-значний код.", errWrong: "Код неправильний.", errExpired: "Термін дії коду минув. Запросіть новий.", errTooMany: "Забагато невдалих спроб. Запросіть новий код.",
  },
};

function readLang() {
  try { return localStorage.getItem("einstein_lang") || "ar"; } catch { return "ar"; }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(readLang);
  const [mode, setMode] = useState(/register/i.test(location.pathname) ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Email waiting for its 6-digit code (after sign-up, or a login before confirming)
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const t = T[lang] || T.de;
  const rtl = lang === "ar";
  const Back = rtl ? ArrowRight : ArrowLeft;

  const changeLang = (value) => {
    setLang(value);
    try { localStorage.setItem("einstein_lang", value); } catch { /* storage blocked */ }
  };

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const askForCode = (address) => {
    setPendingEmail(address);
    setCode("");
    setError("");
    setNotice("");
    setCooldown(60);
  };

  const finishSignIn = (result) => {
    const user = result.user || result;
    const token = result.session?.token;
    localStorage.setItem("einstein_auth_user", JSON.stringify(user));
    if (token) localStorage.setItem("einstein_auth_token", token);
    localStorage.setItem("einstein_customer_email", user.email);
    localStorage.setItem("einstein_lang", user.preferred_language || lang);
    localStorage.setItem("einstein_is_provider", user.role === "provider" ? "true" : "false");

    if (user.role === "admin") navigate("/Dashboard", { replace: true });
    else if (user.role === "provider") navigate("/ProviderDashboard", { replace: true });
    else navigate("/CustomerDashboard", { replace: true });
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError(t.errCode);
    setLoading(true);
    setError("");
    try {
      finishSignIn(await authApi.verifyEmail({ email: pendingEmail, code }));
    } catch (err) {
      if (err.code === "expired") setError(t.errExpired);
      else if (err.code === "too_many") setError(t.errTooMany);
      else if (err.code === "already_verified") { setPendingEmail(""); setMode("login"); setError(err.message); }
      else setError(err.code === "invalid_code" ? t.errWrong : err.message || t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    try {
      await authApi.resendVerification(pendingEmail);
      setNotice(t.resent);
      setCooldown(60);
    } catch (err) {
      setError(err.message || t.errGeneric);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) return setError(t.errEmpty);
    if (mode === "register" && !name.trim()) return setError(t.errName);

    setLoading(true);
    setError("");
    try {
      const result = mode === "register"
        ? await authApi.register({ name: name.trim(), email: trimmedEmail, password, preferred_language: lang })
        : await authApi.login({ email: trimmedEmail, password });

      if (result?.verification_required) askForCode(result.email || trimmedEmail);
      else finishSignIn(result);
    } catch (err) {
      if (err.code === "email_not_verified") askForCode(err.data?.email || trimmedEmail);
      else setError(err.message || t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => { if (error) setError(""); };
  const inputClass = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 ps-11 pe-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/15";
  const iconClass = "pointer-events-none absolute start-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400";

  return (
    <main dir={rtl ? "rtl" : "ltr"} className="min-h-dvh bg-white text-slate-900 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side (large screens) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1f0b52] via-[#3b1478] to-[#7c2bd0] p-12 text-white lg:flex lg:flex-col">
        {/* Soft hexagon shapes echoing the logo */}
        <svg aria-hidden="true" className="pointer-events-none absolute -end-24 -top-24 h-[420px] w-[420px] opacity-[0.12]" viewBox="0 0 100 100">
          <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="none" stroke="white" strokeWidth="1.2" />
          <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="white" strokeWidth="1.2" />
        </svg>
        <svg aria-hidden="true" className="pointer-events-none absolute -bottom-32 -start-20 h-[380px] w-[380px] opacity-[0.08]" viewBox="0 0 100 100">
          <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="white" />
        </svg>

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/20">
            <EinsteinLogo size={42} />
          </span>
          <span className="text-2xl font-black tracking-wide">EinStein</span>
        </Link>

        <div className="relative z-10 my-auto max-w-md py-12">
          <p className="mb-4 text-sm font-semibold tracking-wide text-purple-200" dir="ltr">
            Vielfalt bildet – EinStein verbindet
          </p>
          <h2 className="text-4xl font-black leading-tight">{t.lead}</h2>
          <ul className="mt-10 space-y-4">
            {[[FolderSync, t.b1], [CalendarCheck, t.b2], [Languages, t.b3]].map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon className="h-5 w-5 text-purple-100" />
                </span>
                <span className="text-[15px] font-medium text-purple-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-purple-200/80">© {new Date().getFullYear()} EinStein · Frankfurt am Main</p>
      </aside>

      {/* Form side */}
      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#5b21b6]">
            <Back className="h-4 w-4" />{t.home}
          </Link>
          <label className="relative inline-flex items-center">
            <Globe className="pointer-events-none absolute start-3 h-4 w-4 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              aria-label="Language"
              className="h-9 appearance-none rounded-full border border-slate-200 bg-white ps-9 pe-4 text-sm font-medium text-slate-700 outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
            >
              {LANGS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          {/* Logo for phones and tablets */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <EinsteinLogo size={84} />
            <img src="/brand/einstein-wordmark.png" alt="EinStein – Vielfalt bildet, EinStein verbindet" className="mt-3 w-[220px]" />
          </div>

          {pendingEmail ? (
            <div>
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#6d28d9] lg:mx-0">
                <MailCheck className="h-7 w-7" />
              </span>
              <h1 className="text-center text-3xl font-black text-slate-900 lg:text-start">{t.codeTitle}</h1>
              <p className="mt-2 text-center text-[15px] text-slate-500 lg:text-start">{t.codeSub}</p>
              <p className="mt-1 break-all text-center font-bold text-slate-800 lg:text-start" dir="ltr">{pendingEmail}</p>

              <form className="mt-8 space-y-4" onSubmit={handleVerify} noValidate>
                <div>
                  <label htmlFor="auth-code" className="mb-1.5 block text-sm font-semibold text-slate-700">{t.code}</label>
                  <input
                    id="auth-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    dir="ltr"
                    autoFocus
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError(); }}
                    className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/15"
                    aria-invalid={Boolean(error)}
                  />
                </div>

                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
                {notice && !error && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" role="status">{notice}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] text-[15px] font-bold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/30 disabled:opacity-60"
                >
                  {loading ? t.wait : t.verify}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
                <button type="button" onClick={handleResend} disabled={cooldown > 0} className="text-[#6d28d9] hover:underline disabled:cursor-default disabled:text-slate-400 disabled:no-underline">
                  {cooldown > 0 ? t.resendIn.replace("{s}", cooldown) : t.resend}
                </button>
                <button type="button" onClick={() => { setPendingEmail(""); setError(""); setNotice(""); }} className="text-slate-500 hover:text-slate-700">
                  {t.otherEmail}
                </button>
              </div>
            </div>
          ) : (<>
          <h1 className="text-center text-3xl font-black text-slate-900 lg:text-start">{mode === "register" ? t.welcomeNew : t.welcome}</h1>
          <p className="mt-2 text-center text-[15px] text-slate-500 lg:text-start">{mode === "register" ? t.subNew : t.sub}</p>

          <div role="tablist" className="mt-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {[["login", t.login], ["register", t.register]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={`h-10 rounded-lg text-sm font-bold transition ${mode === key ? "bg-white text-[#4c1d95] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold text-slate-700">{t.name}</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input id="auth-name" type="text" value={name} onChange={(e) => { setName(e.target.value); clearError(); }} className={inputClass} autoComplete="name" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-slate-700">{t.email}</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input id="auth-email" type="email" dir="ltr" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} className={`${inputClass} ${rtl ? "text-right" : ""}`} autoComplete="email" aria-invalid={Boolean(error)} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="auth-password" className="text-sm font-semibold text-slate-700">{t.password}</label>
                {mode === "login" && (
                  <a href="mailto:info@einsteindienstleistung.de?subject=Passwort%20zur%C3%BCcksetzen" className="text-sm font-semibold text-[#6d28d9] hover:underline">
                    {t.forgot}
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className={`${inputClass} pe-12`}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.hide : t.show}
                  title={showPassword ? t.hide : t.show}
                  className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] text-[15px] font-bold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/30 disabled:opacity-60"
            >
              {loading ? t.wait : mode === "register" ? t.submitNew : t.submit}
            </button>
          </form>
          </>)}
        </div>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
          <Link to="/Impressum" className="hover:text-slate-600">Impressum</Link>
          <Link to="/Datenschutz" className="hover:text-slate-600">Datenschutz</Link>
          <Link to="/AGB" className="hover:text-slate-600">AGB</Link>
        </nav>
      </section>
    </main>
  );
}
