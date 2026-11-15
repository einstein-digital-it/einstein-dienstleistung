// On-screen texts of the app intro video, one set per website language.
// Each scene: [headline, subline]. Turkish and Spanish use the English app screens.
export const TEXTS = {
  de: {
    intro: ["Die EinStein-App", "Behördenpost einfach erledigt – in Ihrer Sprache."],
    upload: ["Brief fotografieren", "Foto oder PDF – in Sekunden hochgeladen."],
    sorted: ["Automatisch einsortiert", "Jeder Brief landet im richtigen Ordner."],
    summary: ["Kurz erklärt", "Sofort eine Zusammenfassung – die volle Übersetzung mit einem Tippen."],
    reminder: ["Keine Frist verpassen", "Wir erinnern Sie rechtzeitig an Termine und Fristen."],
    booking: ["Hilfe buchen", "Persönliche Unterstützung direkt in der App buchen."],
    outro: ["Jetzt starten", "app.einsteindienstleistung.com"],
  },
  ar: {
    intro: ["تطبيق آينشتاين", "رسائل الدوائر الرسمية بكل سهولة – وبلغتك."],
    upload: ["صوّر الرسالة", "صورة أو ملف PDF – ترفعها خلال ثوانٍ."],
    sorted: ["ترتيب تلقائي", "كل رسالة تُحفظ في المجلد الصحيح."],
    summary: ["شرح مختصر", "ملخص فوري، والترجمة الكاملة بضغطة زر."],
    reminder: ["لا تفوّت أي موعد", "نذكّرك في الوقت المناسب بالمواعيد والمهل."],
    booking: ["احجز المساعدة", "احجز دعماً شخصياً مباشرة من التطبيق."],
    outro: ["ابدأ الآن", "app.einsteindienstleistung.com"],
  },
  en: {
    intro: ["The EinStein app", "Official letters made easy – in your language."],
    upload: ["Snap your letter", "Photo or PDF – uploaded in seconds."],
    sorted: ["Sorted automatically", "Every letter lands in the right folder."],
    summary: ["Explained in short", "An instant summary – the full translation with one tap."],
    reminder: ["Never miss a deadline", "We remind you of appointments and deadlines in time."],
    booking: ["Book help", "Book personal support right in the app."],
    outro: ["Get started", "app.einsteindienstleistung.com"],
  },
  tr: {
    intro: ["EinStein uygulaması", "Resmi yazılar artık kolay – kendi dilinizde."],
    upload: ["Mektubu fotoğraflayın", "Fotoğraf veya PDF – saniyeler içinde yüklenir."],
    sorted: ["Otomatik sıralama", "Her mektup doğru klasöre yerleşir."],
    summary: ["Kısaca açıklanır", "Anında özet – tam çeviri tek dokunuşla."],
    reminder: ["Hiçbir süreyi kaçırmayın", "Randevu ve son tarihleri zamanında hatırlatırız."],
    booking: ["Yardım alın", "Kişisel desteği doğrudan uygulamadan ayırtın."],
    outro: ["Hemen başlayın", "app.einsteindienstleistung.com"],
  },
  es: {
    intro: ["La app de EinStein", "Las cartas oficiales, fáciles – en su idioma."],
    upload: ["Fotografíe la carta", "Foto o PDF – subida en segundos."],
    sorted: ["Ordenada automáticamente", "Cada carta va a la carpeta correcta."],
    summary: ["Explicada en breve", "Un resumen al instante – la traducción completa con un toque."],
    reminder: ["No pierda ningún plazo", "Le recordamos citas y plazos a tiempo."],
    booking: ["Reserve ayuda", "Reserve apoyo personal directamente en la app."],
    outro: ["Empiece ahora", "app.einsteindienstleistung.com"],
  },
  uk: {
    intro: ["Застосунок EinStein", "Офіційні листи – просто й вашою мовою."],
    upload: ["Сфотографуйте лист", "Фото або PDF – завантаження за секунди."],
    sorted: ["Автоматичне сортування", "Кожен лист потрапляє в потрібну папку."],
    summary: ["Коротко пояснено", "Миттєвий підсумок – повний переклад одним натисканням."],
    reminder: ["Не пропустіть строк", "Ми вчасно нагадаємо про зустрічі та строки."],
    booking: ["Замовте допомогу", "Бронюйте особисту підтримку прямо в застосунку."],
    outro: ["Почніть зараз", "app.einsteindienstleistung.com"],
  },
};

/** App screenshots to use for each website language (the app has de, ar, en, uk). */
export const SCREEN_LOCALE = { de: "de", ar: "ar", en: "en", tr: "en", es: "en", uk: "uk" };
