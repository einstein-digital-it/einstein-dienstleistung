// On-screen texts of the app intro video, one set per website language.
// Each scene: [headline, subline]. Turkish and Spanish use the English app screens.
export const TEXTS = {
  de: {
    intro: ["Die EinStein-App", "Behördenpost einfach erledigt – in Ihrer Sprache."],
    upload: ["Brief fotografieren", "Foto oder PDF – in Sekunden hochgeladen."],
    sorted: ["Automatisch einsortiert", "Jeder Brief landet im richtigen Ordner."],
    summary: ["Kurz erklärt", "Sofort eine Zusammenfassung – die volle Übersetzung mit einem Tippen."],
    reminder: ["Keine Frist verpassen", "Wir erinnern Sie rechtzeitig an Termine und Fristen."],
    ask: ["Fragen Sie die KI", "„Was muss ich tun? Bis wann?“ – die Antwort in Ihrer Sprache."],
    reply: ["Antworten & unterschreiben", "Die KI schreibt die Antwort, füllt Formulare aus – Sie unterschreiben und senden."],
    outro: ["Jetzt starten", "app.einsteindienstleistung.de"],
  },
  ar: {
    intro: ["تطبيق آينشتاين", "رسائل الدوائر الرسمية بكل سهولة – وبلغتك."],
    upload: ["صوّر الرسالة", "صورة أو ملف PDF – ترفعها خلال ثوانٍ."],
    sorted: ["ترتيب تلقائي", "كل رسالة تُحفظ في المجلد الصحيح."],
    summary: ["شرح مختصر", "ملخص فوري، والترجمة الكاملة بضغطة زر."],
    reminder: ["لا تفوّت أي موعد", "نذكّرك في الوقت المناسب بالمواعيد والمهل."],
    ask: ["اسأل الذكاء الاصطناعي", "«ما الذي يجب عليّ فعله؟ وما هو الموعد النهائي؟» – والإجابة بلغتك."],
    reply: ["رُدّ ووقّع", "يكتب الذكاء الاصطناعي الرد ويملأ الاستمارات – وأنت توقّع وترسل."],
    outro: ["ابدأ الآن", "app.einsteindienstleistung.de"],
  },
  en: {
    intro: ["The EinStein app", "Official letters made easy – in your language."],
    upload: ["Snap your letter", "Photo or PDF – uploaded in seconds."],
    sorted: ["Sorted automatically", "Every letter lands in the right folder."],
    summary: ["Explained in short", "An instant summary – the full translation with one tap."],
    reminder: ["Never miss a deadline", "We remind you of appointments and deadlines in time."],
    ask: ["Ask the AI", "“What do I have to do? By when?” – answered in your language."],
    reply: ["Reply & sign", "The AI writes the reply and fills in forms – you sign and send."],
    outro: ["Get started", "app.einsteindienstleistung.de"],
  },
  tr: {
    intro: ["EinStein uygulaması", "Resmi yazılar artık kolay – kendi dilinizde."],
    upload: ["Mektubu fotoğraflayın", "Fotoğraf veya PDF – saniyeler içinde yüklenir."],
    sorted: ["Otomatik sıralama", "Her mektup doğru klasöre yerleşir."],
    summary: ["Kısaca açıklanır", "Anında özet – tam çeviri tek dokunuşla."],
    reminder: ["Hiçbir süreyi kaçırmayın", "Randevu ve son tarihleri zamanında hatırlatırız."],
    ask: ["Yapay zekâya sorun", "“Ne yapmalıyım? Ne zamana kadar?” – cevap kendi dilinizde."],
    reply: ["Cevapla ve imzala", "Yapay zekâ cevabı yazar, formları doldurur – siz imzalayıp gönderirsiniz."],
    outro: ["Hemen başlayın", "app.einsteindienstleistung.de"],
  },
  es: {
    intro: ["La app de EinStein", "Las cartas oficiales, fáciles – en su idioma."],
    upload: ["Fotografíe la carta", "Foto o PDF – subida en segundos."],
    sorted: ["Ordenada automáticamente", "Cada carta va a la carpeta correcta."],
    summary: ["Explicada en breve", "Un resumen al instante – la traducción completa con un toque."],
    reminder: ["No pierda ningún plazo", "Le recordamos citas y plazos a tiempo."],
    ask: ["Pregunte a la IA", "«¿Qué tengo que hacer? ¿Hasta cuándo?», respondido en su idioma."],
    reply: ["Responder y firmar", "La IA redacta la respuesta y rellena formularios: usted firma y envía."],
    outro: ["Empiece ahora", "app.einsteindienstleistung.de"],
  },
  uk: {
    intro: ["Застосунок EinStein", "Офіційні листи – просто й вашою мовою."],
    upload: ["Сфотографуйте лист", "Фото або PDF – завантаження за секунди."],
    sorted: ["Автоматичне сортування", "Кожен лист потрапляє в потрібну папку."],
    summary: ["Коротко пояснено", "Миттєвий підсумок – повний переклад одним натисканням."],
    reminder: ["Не пропустіть строк", "Ми вчасно нагадаємо про зустрічі та строки."],
    ask: ["Запитайте ШІ", "«Що мені робити? До коли?» – відповідь вашою мовою."],
    reply: ["Відповісти й підписати", "ШІ пише відповідь і заповнює форми – ви підписуєте й надсилаєте."],
    outro: ["Почніть зараз", "app.einsteindienstleistung.de"],
  },
};

/** App screenshots to use for each website language (the app has de, ar, en, uk). */
export const SCREEN_LOCALE = { de: "de", ar: "ar", en: "en", tr: "en", es: "en", uk: "uk" };
