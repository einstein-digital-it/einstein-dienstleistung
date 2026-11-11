import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, Clock, FileX, Loader2, Mail, MapPin, MessageCircle, Phone, Search, Send } from "lucide-react";
import { customerSupportApi } from "@/api/backendClient";
import PageHero, { fadeUp } from "@/components/site/PageHero";

const PHONE = "069 27246275";
const PHONE_LINK = "tel:+496927246275";
const MOBILE = "01573 1770487";
const EMAIL = "info@einsteindienstleistung.de";

const T = {
  de: {
    kicker: "Kundenservice", title: "Wie können wir helfen?", sub: "Antworten auf häufige Fragen – oder schreiben Sie uns direkt. Wir sprechen Deutsch, Arabisch, Englisch und Türkisch.",
    search: "Frage suchen, z. B. Stornierung, Zahlung …",
    chat: "Chat", chatText: "Sofort eine Antwort vom Assistenten, rund um die Uhr.", chatCta: "Chat starten",
    phone: "Telefon", phoneText: "Mo–Fr 9–18 Uhr", phoneCta: "Jetzt anrufen",
    mail: "E-Mail", mailText: "Antwort meist am selben Werktag.", mailCta: "E-Mail schreiben",
    faqTitle: "Häufige Fragen", noFaq: "Keine passende Frage gefunden. Schreiben Sie uns einfach.",
    formTitle: "Schreiben Sie uns", formSub: "Wir melden uns so schnell wie möglich.",
    name: "Name", email: "E-Mail", tel: "Telefon (optional)", type: "Worum geht es?", message: "Ihre Nachricht",
    types: { callback: "Bitte rufen Sie mich zurück", email: "Antwort per E-Mail", general: "Allgemeine Frage" },
    send: "Nachricht senden", sent: "Danke! Ihre Anfrage Nr. {id} ist bei uns angekommen.", error: "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.", required: "Bitte E-Mail und Nachricht ausfüllen.",
    infoTitle: "Kontakt", hours: "Öffnungszeiten", hoursValue: "Mo–Fr 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "Vertrag kündigen?", cancelText: "Abos und Verträge kündigen Sie jederzeit online – ohne Anmeldung.", cancelCta: "Verträge hier kündigen",
  },
  ar: {
    kicker: "خدمة العملاء", title: "كيف يمكننا مساعدتك؟", sub: "إجابات عن الأسئلة الشائعة، أو راسلنا مباشرة. نتحدث العربية والألمانية والإنجليزية والتركية.",
    search: "ابحث عن سؤال، مثل الإلغاء أو الدفع …",
    chat: "المحادثة", chatText: "إجابة فورية من المساعد، على مدار الساعة.", chatCta: "ابدأ المحادثة",
    phone: "الهاتف", phoneText: "من الاثنين إلى الجمعة، من الساعة 9 إلى 18", phoneCta: "اتصل الآن",
    mail: "البريد الإلكتروني", mailText: "نرد غالباً في يوم العمل نفسه.", mailCta: "اكتب رسالة",
    faqTitle: "الأسئلة الشائعة", noFaq: "لم نجد سؤالاً مطابقاً. راسلنا وسنساعدك.",
    formTitle: "راسلنا", formSub: "سنتواصل معك في أقرب وقت ممكن.",
    name: "الاسم", email: "البريد الإلكتروني", tel: "الهاتف (اختياري)", type: "ما موضوع رسالتك؟", message: "رسالتك",
    types: { callback: "يرجى الاتصال بي", email: "أريد الرد بالبريد الإلكتروني", general: "سؤال عام" },
    send: "إرسال الرسالة", sent: "شكراً لك! وصلنا طلبك رقم {id}.", error: "تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.", required: "يرجى إدخال البريد الإلكتروني والرسالة.",
    infoTitle: "معلومات التواصل", hours: "ساعات العمل", hoursValue: "من الاثنين إلى الجمعة، 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "هل تريد إلغاء عقد؟", cancelText: "يمكنك إلغاء الاشتراكات والعقود عبر الإنترنت في أي وقت، دون تسجيل الدخول.", cancelCta: "إلغاء العقود من هنا",
  },
  en: {
    kicker: "Customer service", title: "How can we help?", sub: "Answers to common questions – or write to us directly. We speak German, Arabic, English and Turkish.",
    search: "Search a question, e.g. cancellation, payment …",
    chat: "Chat", chatText: "An instant answer from the assistant, around the clock.", chatCta: "Start chat",
    phone: "Phone", phoneText: "Mon–Fri 9–18", phoneCta: "Call now",
    mail: "Email", mailText: "Usually answered the same working day.", mailCta: "Write an email",
    faqTitle: "Frequently asked questions", noFaq: "No matching question found. Just write to us.",
    formTitle: "Write to us", formSub: "We will get back to you as soon as possible.",
    name: "Name", email: "Email", tel: "Phone (optional)", type: "What is it about?", message: "Your message",
    types: { callback: "Please call me back", email: "Answer by email", general: "General question" },
    send: "Send message", sent: "Thank you! We received your request no. {id}.", error: "The message could not be sent. Please try again.", required: "Please fill in email and message.",
    infoTitle: "Contact", hours: "Opening hours", hoursValue: "Mon–Fri 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "Cancel a contract?", cancelText: "Cancel subscriptions and contracts online at any time – no login needed.", cancelCta: "Cancel contracts here",
  },
  tr: {
    kicker: "Müşteri hizmetleri", title: "Size nasıl yardımcı olabiliriz?", sub: "Sık sorulan soruların yanıtları – ya da bize doğrudan yazın. Almanca, Arapça, İngilizce ve Türkçe konuşuyoruz.",
    search: "Soru arayın, örn. iptal, ödeme …",
    chat: "Sohbet", chatText: "Asistandan anında yanıt, 7/24.", chatCta: "Sohbeti başlat",
    phone: "Telefon", phoneText: "Pzt–Cum 9–18", phoneCta: "Hemen arayın",
    mail: "E-posta", mailText: "Genellikle aynı iş günü yanıtlanır.", mailCta: "E-posta yazın",
    faqTitle: "Sık sorulan sorular", noFaq: "Uygun soru bulunamadı. Bize yazmanız yeterli.",
    formTitle: "Bize yazın", formSub: "En kısa sürede size dönüş yapacağız.",
    name: "Ad", email: "E-posta", tel: "Telefon (isteğe bağlı)", type: "Konu nedir?", message: "Mesajınız",
    types: { callback: "Lütfen beni arayın", email: "E-posta ile yanıt", general: "Genel soru" },
    send: "Mesajı gönder", sent: "Teşekkürler! {id} numaralı talebiniz bize ulaştı.", error: "Mesaj gönderilemedi. Lütfen tekrar deneyin.", required: "Lütfen e-posta ve mesajı doldurun.",
    infoTitle: "İletişim", hours: "Çalışma saatleri", hoursValue: "Pzt–Cum 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "Sözleşme iptali mi?", cancelText: "Abonelikleri ve sözleşmeleri istediğiniz zaman online iptal edin – giriş gerekmez.", cancelCta: "Sözleşmeleri buradan iptal edin",
  },
  es: {
    kicker: "Atención al cliente", title: "¿Cómo podemos ayudarle?", sub: "Respuestas a preguntas frecuentes, o escríbanos directamente. Hablamos alemán, árabe, inglés y turco.",
    search: "Buscar una pregunta, p. ej. cancelación, pago …",
    chat: "Chat", chatText: "Respuesta inmediata del asistente, a cualquier hora.", chatCta: "Iniciar chat",
    phone: "Teléfono", phoneText: "Lun–vie 9–18", phoneCta: "Llamar ahora",
    mail: "Correo", mailText: "Normalmente respondemos el mismo día laborable.", mailCta: "Escribir un correo",
    faqTitle: "Preguntas frecuentes", noFaq: "No hay ninguna pregunta que coincida. Escríbanos.",
    formTitle: "Escríbanos", formSub: "Le responderemos lo antes posible.",
    name: "Nombre", email: "Correo electrónico", tel: "Teléfono (opcional)", type: "¿De qué se trata?", message: "Su mensaje",
    types: { callback: "Por favor, llámenme", email: "Respuesta por correo", general: "Pregunta general" },
    send: "Enviar mensaje", sent: "¡Gracias! Hemos recibido su solicitud n.º {id}.", error: "No se pudo enviar el mensaje. Inténtelo de nuevo.", required: "Rellene el correo y el mensaje.",
    infoTitle: "Contacto", hours: "Horario", hoursValue: "Lun–vie 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "¿Cancelar un contrato?", cancelText: "Cancele suscripciones y contratos en línea cuando quiera, sin iniciar sesión.", cancelCta: "Cancelar contratos aquí",
  },
  uk: {
    kicker: "Служба підтримки", title: "Як ми можемо допомогти?", sub: "Відповіді на часті запитання – або напишіть нам напряму. Ми говоримо німецькою, арабською, англійською та турецькою.",
    search: "Шукати запитання, напр. скасування, оплата …",
    chat: "Чат", chatText: "Миттєва відповідь асистента, цілодобово.", chatCta: "Почати чат",
    phone: "Телефон", phoneText: "Пн–пт 9–18", phoneCta: "Зателефонувати",
    mail: "E-mail", mailText: "Зазвичай відповідаємо того ж робочого дня.", mailCta: "Написати e-mail",
    faqTitle: "Часті запитання", noFaq: "Нічого не знайдено. Просто напишіть нам.",
    formTitle: "Напишіть нам", formSub: "Ми зв’яжемося з вами якнайшвидше.",
    name: "Ім’я", email: "E-mail", tel: "Телефон (необов’язково)", type: "Чого стосується?", message: "Ваше повідомлення",
    types: { callback: "Передзвоніть мені, будь ласка", email: "Відповідь на e-mail", general: "Загальне запитання" },
    send: "Надіслати", sent: "Дякуємо! Ваш запит № {id} отримано.", error: "Не вдалося надіслати повідомлення. Спробуйте ще раз.", required: "Заповніть e-mail і повідомлення.",
    infoTitle: "Контакти", hours: "Години роботи", hoursValue: "Пн–пт 9:00–18:00", address: "Robert-Dißmann-Str. 8, 65936 Frankfurt am Main",
    cancelTitle: "Скасувати договір?", cancelText: "Скасовуйте підписки й договори онлайн будь-коли – без входу в акаунт.", cancelCta: "Скасувати договори тут",
  },
};

// Built-in answers (used until the team adds its own questions in the admin area)
const FAQ = {
  de: [
    ["Wie kann ich einen Termin absagen oder verschieben?", "Bis 24 Stunden vorher ist das kostenlos. Schreiben Sie uns mit Ihrer Buchungsnummer oder rufen Sie an. Bei späterer Absage können wir bis zu eine Stunde berechnen (AGB § 7)."],
    ["Wie kann ich bezahlen?", "Online über Stripe – mit Karte und den dort angebotenen Zahlungsarten. Nach der Buchung kommen Sie direkt zur Zahlungsseite. Alle Preise für Privatkund:innen sind Endpreise inkl. MwSt."],
    ["Wie kündige ich ein Abo?", "Jederzeit zum Monatsende: über „Verträge hier kündigen“ unten auf der Seite (ohne Anmeldung), im Kundenkonto oder per E-Mail."],
    ["Was ist das Unterlagen-Abo?", "Für 6,99 € im Monat werden bis zu 50 Briefe automatisch in den richtigen Ordner sortiert, zusammengefasst und in Ihre Sprache übersetzt – mit Erinnerung vor Fristen."],
    ["Geben Sie Rechtsberatung?", "Nein. Wir helfen beim Ausfüllen, Ordnen und Verstehen von Unterlagen. Bei rechtlichen Fragen verweisen wir Sie an Anwält:innen oder Beratungsstellen."],
    ["Wie werde ich Fachkraft bei EinStein?", "Über das Bewerbungsformular für Fachkräfte. Wir prüfen Ihre Angaben und melden uns bei Ihnen."],
  ],
  ar: [
    ["كيف يمكنني إلغاء موعد أو تأجيله؟", "يمكنك ذلك مجاناً حتى 24 ساعة قبل الموعد. راسلنا مع رقم الحجز أو اتصل بنا. عند الإلغاء بعد ذلك قد نحتسب ما يصل إلى ساعة واحدة (الشروط العامة، المادة 7)."],
    ["كيف يمكنني الدفع؟", "عبر الإنترنت من خلال Stripe، بالبطاقة وبطرق الدفع المتاحة هناك. بعد الحجز تنتقل مباشرة إلى صفحة الدفع. جميع أسعار الأفراد نهائية وشاملة للضريبة."],
    ["كيف ألغي اشتراكاً؟", "في أي وقت حتى نهاية الشهر: عبر رابط «إلغاء العقود من هنا» أسفل الصفحة (دون تسجيل الدخول)، أو من حسابك، أو بالبريد الإلكتروني."],
    ["ما هو اشتراك ترتيب الأوراق؟", "مقابل 6.99 يورو شهرياً، تُرتَّب حتى 50 رسالة تلقائياً في المجلد الصحيح، وتُلخَّص وتُترجَم إلى لغتك، مع تذكير قبل المواعيد النهائية."],
    ["هل تقدّمون استشارات قانونية؟", "لا. نساعدك في تعبئة الأوراق وترتيبها وفهمها. أما المسائل القانونية فنوجّهك فيها إلى محامٍ أو جهة استشارية."],
    ["كيف أعمل مقدّمَ خدمة لدى آينشتاين؟", "من خلال نموذج التقديم الخاص بمقدّمي الخدمات. سنراجع بياناتك ونتواصل معك."],
  ],
  en: [
    ["How can I cancel or move an appointment?", "Free of charge up to 24 hours before. Write to us with your booking number or call us. For later cancellations we may charge up to one hour (terms § 7)."],
    ["How can I pay?", "Online via Stripe – by card and the other methods offered there. After booking you go straight to the payment page. All consumer prices include VAT."],
    ["How do I cancel a subscription?", "At any time to the end of the month: via “Cancel contracts here” at the bottom of the page (no login), in your account or by email."],
    ["What is the document subscription?", "For €6.99 a month up to 50 letters are sorted into the right folder, summarised and translated into your language – with reminders before deadlines."],
    ["Do you give legal advice?", "No. We help you fill in, organise and understand documents. For legal questions we refer you to lawyers or advice centres."],
    ["How do I become a provider at EinStein?", "Through the application form for providers. We check your details and get back to you."],
  ],
  tr: [
    ["Randevumu nasıl iptal eder veya ertelerim?", "24 saat öncesine kadar ücretsizdir. Rezervasyon numaranızla bize yazın veya arayın. Daha geç iptallerde bir saate kadar ücret alabiliriz (Şartlar § 7)."],
    ["Nasıl ödeme yapabilirim?", "Stripe üzerinden online – kartla ve orada sunulan yöntemlerle. Rezervasyondan sonra doğrudan ödeme sayfasına gidersiniz. Bireysel fiyatlara KDV dahildir."],
    ["Aboneliği nasıl iptal ederim?", "Her zaman ay sonuna kadar: sayfanın altındaki “Sözleşmeleri buradan iptal edin” bağlantısıyla (giriş gerekmez), hesabınızdan veya e-posta ile."],
    ["Belge aboneliği nedir?", "Ayda 6,99 € karşılığında 50 mektuba kadar otomatik olarak doğru klasöre yerleştirilir, özetlenir ve dilinize çevrilir – son tarihlerden önce hatırlatma ile."],
    ["Hukuki danışmanlık veriyor musunuz?", "Hayır. Belgeleri doldurmanıza, düzenlemenize ve anlamanıza yardımcı oluruz. Hukuki sorularda sizi avukatlara veya danışma merkezlerine yönlendiririz."],
    ["EinStein'da nasıl hizmet sağlayıcı olurum?", "Hizmet sağlayıcı başvuru formu ile. Bilgilerinizi inceleyip size dönüş yaparız."],
  ],
  es: [
    ["¿Cómo cancelo o cambio una cita?", "Gratis hasta 24 horas antes. Escríbanos con su número de reserva o llámenos. Si cancela más tarde, podemos cobrar hasta una hora (condiciones § 7)."],
    ["¿Cómo puedo pagar?", "En línea con Stripe: con tarjeta y los demás métodos que ofrece. Tras reservar irá directamente a la página de pago. Los precios para particulares incluyen IVA."],
    ["¿Cómo cancelo una suscripción?", "En cualquier momento a final de mes: con «Cancelar contratos aquí» al pie de la página (sin iniciar sesión), en su cuenta o por correo."],
    ["¿Qué es la suscripción de documentos?", "Por 6,99 € al mes, hasta 50 cartas se ordenan en la carpeta correcta, se resumen y se traducen a su idioma, con recordatorios antes de los plazos."],
    ["¿Dan asesoramiento jurídico?", "No. Le ayudamos a rellenar, ordenar y entender documentos. Para cuestiones jurídicas le remitimos a abogados o centros de asesoramiento."],
    ["¿Cómo puedo trabajar como profesional en EinStein?", "Con el formulario de solicitud para profesionales. Revisamos sus datos y nos pondremos en contacto."],
  ],
  uk: [
    ["Як скасувати або перенести зустріч?", "Безкоштовно – до 24 годин до початку. Напишіть нам із номером бронювання або зателефонуйте. За пізніше скасування можемо стягнути до однієї години (умови, § 7)."],
    ["Як оплатити?", "Онлайн через Stripe – карткою та іншими доступними способами. Після бронювання ви одразу переходите на сторінку оплати. Ціни для приватних клієнтів уже містять ПДВ."],
    ["Як скасувати підписку?", "Будь-коли до кінця місяця: через «Скасувати договори тут» унизу сторінки (без входу), в акаунті або e-mail."],
    ["Що таке підписка на документи?", "За 6,99 € на місяць до 50 листів автоматично розкладаються в потрібні папки, коротко пояснюються й перекладаються вашою мовою – з нагадуваннями про строки."],
    ["Чи надаєте ви юридичні консультації?", "Ні. Ми допомагаємо заповнювати, впорядковувати й розуміти документи. З юридичних питань скеровуємо до адвокатів або консультаційних центрів."],
    ["Як стати виконавцем в EinStein?", "Через форму заявки для виконавців. Ми перевіримо ваші дані й зв’яжемося з вами."],
  ],
};

function readLang() {
  try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; }
}

export default function CustomerService() {
  const [lang, setLang] = useState(readLang);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(() => ({
    name: "",
    email: (() => { try { return localStorage.getItem("einstein_customer_email") || ""; } catch { return ""; } })(),
    phone: "",
    request_type: "general",
    message: "",
  }));
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const onStorage = () => setLang(readLang());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const t = T[lang] || T.de;
  const isRTL = lang === "ar";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const { data: supportContent } = useQuery({
    queryKey: ["customer-support"],
    queryFn: customerSupportApi.getSupportContent,
  });

  const supportMutation = useMutation({ mutationFn: customerSupportApi.createRequest });

  // Questions the team added in the admin area have numeric ids; otherwise the built-in ones are shown
  const faqs = useMemo(() => {
    const own = (supportContent?.faqs || []).filter((faq) => typeof faq.id === "number");
    const source = own.length
      ? own.map((faq) => {
          const pick = (field) => (lang === "ar" && faq[`${field}_ar`]) || (lang === "de" && faq[`${field}_de`]) || faq[`${field}_en`] || faq[`${field}_de`] || faq[`${field}_ar`] || "";
          return [pick("question"), pick("answer")];
        })
      : FAQ[lang] || FAQ.de;
    const q = search.trim().toLowerCase();
    return q ? source.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(q)) : source;
  }, [supportContent, lang, search]);

  const submit = (event) => {
    event.preventDefault();
    setFormError("");
    if (!form.email.trim() || !form.message.trim()) return setFormError(t.required);
    supportMutation.mutate({
      ...form,
      name: form.name.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: t.types[form.request_type],
      metadata: { language: lang },
    });
  };

  const openChat = () => window.dispatchEvent(new Event("einstein:open-chat"));
  const input = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/15";
  const label = "mb-1.5 block text-sm font-semibold text-slate-700";

  const channels = [
    { icon: MessageCircle, title: t.chat, text: t.chatText, action: <button type="button" onClick={openChat} className="inline-flex items-center gap-1.5 font-bold text-[#6d28d9] hover:underline">{t.chatCta}<Arrow className="h-4 w-4" /></button> },
    { icon: Phone, title: t.phone, text: t.phoneText, action: <a href={PHONE_LINK} className="inline-flex items-center gap-1.5 font-bold text-[#6d28d9] hover:underline"><span dir="ltr">{PHONE}</span></a> },
    { icon: Mail, title: t.mail, text: t.mailText, action: <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-1.5 break-all font-bold text-[#6d28d9] hover:underline" dir="ltr">{EMAIL}</a> },
  ];

  return (
    <div className="overflow-x-hidden bg-white">
      <PageHero kicker={t.kicker} title={t.title} subtitle={t.sub}>
        <div className="relative mt-8 max-w-2xl">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="h-14 w-full rounded-2xl border border-purple-200 bg-white pe-4 ps-12 text-base shadow-sm outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
          />
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 pb-16">
        {/* Ways to reach us */}
        <div className="grid gap-4 md:grid-cols-3">
          {channels.map(({ icon: Icon, title, text, action }, i) => (
            <motion.div key={title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.06 }} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#6d28d9]"><Icon className="h-6 w-6" /></span>
              <h2 className="mt-4 text-lg font-bold text-[#1f0b52]">{title}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{text}</p>
              <div className="mt-4">{action}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-black text-[#1f0b52] md:text-3xl">{t.faqTitle}</h2>
            <div className="mt-6 space-y-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-2xl border border-slate-200 bg-white open:border-purple-200 open:bg-[#faf7ff]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-[#1f0b52] [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#7c3aed] transition group-open:rotate-180" />
                  </summary>
                  {answer && <p className="px-5 pb-5 leading-relaxed text-slate-600">{answer}</p>}
                </details>
              ))}
              {faqs.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">{t.noFaq}</p>}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-slate-50 p-6 sm:flex-row sm:items-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#6d28d9] shadow-sm"><FileX className="h-6 w-6" /></span>
              <div className="flex-1">
                <p className="font-bold text-[#1f0b52]">{t.cancelTitle}</p>
                <p className="text-sm text-slate-600">{t.cancelText}</p>
              </div>
              <Link to="/Cancellation" className="inline-flex items-center gap-1.5 font-bold text-[#6d28d9] hover:underline">{t.cancelCta}<Arrow className="h-4 w-4" /></Link>
            </div>
          </section>

          {/* Contact form + details */}
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black text-[#1f0b52]">{t.formTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{t.formSub}</p>

              {supportMutation.isSuccess ? (
                <p className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 font-semibold text-emerald-800" role="status">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />{t.sent.replace("{id}", supportMutation.data?.id ?? "")}
                </p>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cs-name" className={label}>{t.name}</label>
                      <input id="cs-name" className={input} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="cs-email" className={label}>{t.email} *</label>
                      <input id="cs-email" type="email" dir="ltr" className={input} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cs-phone" className={label}>{t.tel}</label>
                      <input id="cs-phone" type="tel" dir="ltr" className={input} autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label htmlFor="cs-type" className={label}>{t.type}</label>
                      <select id="cs-type" className={input} value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })}>
                        {Object.entries(t.types).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cs-message" className={label}>{t.message} *</label>
                    <textarea id="cs-message" rows={5} className={`${input} h-auto py-3`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  {(formError || supportMutation.isError) && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{formError || t.error}</p>}
                  <button type="submit" disabled={supportMutation.isPending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] font-bold text-white shadow-lg shadow-purple-500/25 transition hover:brightness-110 disabled:opacity-60">
                    {supportMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}{t.send}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-[2rem] bg-[#1f0b52] p-6 text-white md:p-8">
              <h2 className="text-xl font-black">{t.infoTitle}</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" /><span dir="ltr">{t.address}</span></li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-purple-300" /><a href={PHONE_LINK} dir="ltr" className="hover:underline">{PHONE}</a></li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-purple-300" /><a href="tel:+4915731770487" dir="ltr" className="hover:underline">{MOBILE}</a></li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-purple-300" /><a href={`mailto:${EMAIL}`} dir="ltr" className="break-all hover:underline">{EMAIL}</a></li>
                <li className="flex items-start gap-3 border-t border-white/15 pt-4"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" /><span><span className="block text-purple-200">{t.hours}</span><span className="font-bold">{t.hoursValue}</span></span></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
