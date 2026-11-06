<?php

namespace App\Support;

/**
 * Applications (Anträge) the customer can prepare in the app.
 * Each one is a formal German letter filled with the customer's saved data;
 * the app shows what is missing, creates a PDF and opens the customer's own
 * mail app to send it. Labels are given in de/ar/en (tr/es fall back to en).
 *
 * Placeholders: {{field_key}}. Common personal fields come from the account
 * (full_name, email) and from the saved form data.
 */
class FormTemplates
{
    /** Personal fields shared by all applications. */
    public const PERSONAL = [
        ['key' => 'full_name', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Vor- und Nachname', 'ar' => 'الاسم الكامل', 'en' => 'Full name']],
        ['key' => 'birth_date', 'type' => 'date', 'required' => true, 'label' => ['de' => 'Geburtsdatum', 'ar' => 'تاريخ الميلاد', 'en' => 'Date of birth']],
        ['key' => 'address_street', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Straße und Hausnummer', 'ar' => 'الشارع ورقم البيت', 'en' => 'Street and number']],
        ['key' => 'address_zip_city', 'type' => 'text', 'required' => true, 'label' => ['de' => 'PLZ und Ort', 'ar' => 'الرمز البريدي والمدينة', 'en' => 'Postcode and city']],
        ['key' => 'phone', 'type' => 'text', 'required' => false, 'label' => ['de' => 'Telefon', 'ar' => 'الهاتف', 'en' => 'Phone']],
    ];

    public static function all(): array
    {
        return [
            [
                'key' => 'jobcenter_wba',
                'folder' => 'jobcenter',
                'authority' => 'Jobcenter',
                'recipient_field' => 'jobcenter_email',
                'title' => ['de' => 'Weiterbewilligungsantrag (Bürgergeld)', 'ar' => 'طلب استمرار البورغرغيلد (WBA)', 'en' => 'Continuation application (Bürgergeld)'],
                'description' => [
                    'de' => 'Bevor Ihr Bewilligungszeitraum endet, beantragen Sie die Weiterzahlung. Ein formloser Antrag genügt; das Jobcenter schickt Ihnen bei Bedarf weitere Formulare.',
                    'ar' => 'قبل ما تخلص فترة الموافقة لازم تطلب استمرار الدفع. الطلب البسيط بيكفي، والجوب سنتر بيبعتلك أوراق إضافية إذا لزم.',
                    'en' => 'Before your approval period ends, apply for continued payments. An informal application is enough; the Jobcenter sends further forms if needed.',
                ],
                'fields' => [
                    ['key' => 'jobcenter_email', 'type' => 'email', 'required' => true, 'label' => ['de' => 'E-Mail des Jobcenters', 'ar' => 'إيميل الجوب سنتر', 'en' => 'Jobcenter e-mail']],
                    ['key' => 'bg_number', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Nummer der Bedarfsgemeinschaft (BG-Nr.)', 'ar' => 'رقم البيدارفس غماينشافت (BG-Nr.)', 'en' => 'Benefit community number (BG-Nr.)']],
                    ['key' => 'period_end', 'type' => 'date', 'required' => true, 'label' => ['de' => 'Bewilligt bis', 'ar' => 'الموافقة سارية حتى', 'en' => 'Approved until']],
                    ['key' => 'changes', 'type' => 'textarea', 'required' => false, 'label' => ['de' => 'Änderungen (leer lassen, wenn keine)', 'ar' => 'تغييرات (اتركه فارغاً إذا ما في)', 'en' => 'Changes (leave empty if none)']],
                ],
                'subject' => 'Weiterbewilligungsantrag – BG-Nr. {{bg_number}}',
                'body' => "Sehr geehrte Damen und Herren,\n\nhiermit beantrage ich die Weiterbewilligung der Leistungen nach dem SGB II (Bürgergeld) für meine Bedarfsgemeinschaft (BG-Nr. {{bg_number}}) über den {{period_end}} hinaus.\n\n{{changes_sentence}}\n\nSollten Sie weitere Unterlagen benötigen, bitte ich um eine kurze Nachricht.\n\nMit freundlichen Grüßen\n{{full_name}}",
                'conditional' => ['changes_sentence' => ['field' => 'changes', 'if_empty' => 'In meinen persönlichen und wirtschaftlichen Verhältnissen haben sich keine Änderungen ergeben.', 'if_filled' => "Folgende Änderungen haben sich ergeben:\n{{changes}}"]],
            ],
            [
                'key' => 'jobcenter_vaem',
                'folder' => 'jobcenter',
                'authority' => 'Jobcenter',
                'recipient_field' => 'jobcenter_email',
                'title' => ['de' => 'Veränderungsmitteilung an das Jobcenter', 'ar' => 'إبلاغ الجوب سنتر بتغيير', 'en' => 'Notice of change to the Jobcenter'],
                'description' => [
                    'de' => 'Änderungen (Umzug, neue Arbeit, Einkommen, Geburt, Auszug …) müssen Sie dem Jobcenter sofort mitteilen.',
                    'ar' => 'أي تغيير (انتقال، شغل جديد، دخل، ولادة، حدا طلع من البيت…) لازم تبلّغ فيه الجوب سنتر فوراً.',
                    'en' => 'Changes (move, new job, income, birth, someone moving out …) must be reported to the Jobcenter right away.',
                ],
                'fields' => [
                    ['key' => 'jobcenter_email', 'type' => 'email', 'required' => true, 'label' => ['de' => 'E-Mail des Jobcenters', 'ar' => 'إيميل الجوب سنتر', 'en' => 'Jobcenter e-mail']],
                    ['key' => 'bg_number', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Nummer der Bedarfsgemeinschaft (BG-Nr.)', 'ar' => 'رقم البيدارفس غماينشافت (BG-Nr.)', 'en' => 'Benefit community number (BG-Nr.)']],
                    ['key' => 'change_date', 'type' => 'date', 'required' => true, 'label' => ['de' => 'Datum der Änderung', 'ar' => 'تاريخ التغيير', 'en' => 'Date of the change']],
                    ['key' => 'change_description', 'type' => 'textarea', 'required' => true, 'label' => ['de' => 'Was hat sich geändert? (auf Deutsch)', 'ar' => 'شو اللي تغيّر؟ (بالألماني إذا بتقدر)', 'en' => 'What changed? (in German if possible)']],
                ],
                'subject' => 'Veränderungsmitteilung – BG-Nr. {{bg_number}}',
                'body' => "Sehr geehrte Damen und Herren,\n\nhiermit teile ich Ihnen folgende Änderung zum {{change_date}} mit (BG-Nr. {{bg_number}}):\n\n{{change_description}}\n\nNachweise reiche ich bei Bedarf nach. Bitte berücksichtigen Sie die Änderung bei meiner Leistungsberechnung.\n\nMit freundlichen Grüßen\n{{full_name}}",
            ],
            [
                'key' => 'abh_verlaengerung',
                'folder' => 'auslaenderbehoerde',
                'authority' => 'Ausländerbehörde',
                'recipient_field' => 'abh_email',
                'title' => ['de' => 'Verlängerung der Aufenthaltserlaubnis', 'ar' => 'تمديد الإقامة', 'en' => 'Extension of residence permit'],
                'description' => [
                    'de' => 'Stellen Sie den Antrag unbedingt VOR Ablauf Ihres Aufenthaltstitels. Bewahren Sie die gesendete E-Mail als Nachweis auf.',
                    'ar' => 'لازم تبعت الطلب أكيد قبل ما تخلص إقامتك، واحتفظ بالإيميل المرسل كإثبات.',
                    'en' => 'Send the application BEFORE your residence permit expires and keep the sent e-mail as proof.',
                ],
                'fields' => [
                    ['key' => 'abh_email', 'type' => 'email', 'required' => true, 'label' => ['de' => 'E-Mail der Ausländerbehörde', 'ar' => 'إيميل دائرة الأجانب', 'en' => 'Immigration office e-mail']],
                    ['key' => 'nationality', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Staatsangehörigkeit', 'ar' => 'الجنسية', 'en' => 'Nationality']],
                    ['key' => 'permit_type', 'type' => 'text', 'required' => false, 'label' => ['de' => 'Art des Aufenthaltstitels (z. B. § 25 AufenthG)', 'ar' => 'نوع الإقامة (مثلاً § 25 AufenthG)', 'en' => 'Type of permit (e.g. § 25 AufenthG)']],
                    ['key' => 'permit_expiry', 'type' => 'date', 'required' => true, 'label' => ['de' => 'Aufenthaltstitel gültig bis', 'ar' => 'الإقامة صالحة حتى', 'en' => 'Permit valid until']],
                    ['key' => 'passport_number', 'type' => 'text', 'required' => false, 'label' => ['de' => 'Passnummer', 'ar' => 'رقم الجواز', 'en' => 'Passport number']],
                ],
                'subject' => 'Antrag auf Verlängerung der Aufenthaltserlaubnis – {{full_name}}, geb. {{birth_date}}',
                'body' => "Sehr geehrte Damen und Herren,\n\nhiermit beantrage ich die Verlängerung meiner Aufenthaltserlaubnis{{permit_type_sentence}}, die am {{permit_expiry}} abläuft.\n\nName: {{full_name}}\nGeburtsdatum: {{birth_date}}\nStaatsangehörigkeit: {{nationality}}\n{{passport_line}}Anschrift: {{address_street}}, {{address_zip_city}}\n\nBitte teilen Sie mir mit, welche Unterlagen Sie benötigen, und geben Sie mir einen Termin. Ich bitte um eine kurze Eingangsbestätigung.\n\nMit freundlichen Grüßen\n{{full_name}}",
                'conditional' => [
                    'permit_type_sentence' => ['field' => 'permit_type', 'if_empty' => '', 'if_filled' => ' ({{permit_type}})'],
                    'passport_line' => ['field' => 'passport_number', 'if_empty' => '', 'if_filled' => "Passnummer: {{passport_number}}\n"],
                ],
            ],
            [
                'key' => 'kindergeld',
                'folder' => 'familienkasse',
                'authority' => 'Familienkasse',
                'recipient_field' => 'familienkasse_email',
                'title' => ['de' => 'Kindergeld beantragen', 'ar' => 'طلب الكيندرغلد', 'en' => 'Apply for Kindergeld'],
                'description' => [
                    'de' => 'Für Kindergeld braucht die Familienkasse die unterschriebenen amtlichen Formulare (KG 1 und Anlage Kind) oder den Online-Antrag. Mit diesem Schreiben kündigen Sie den Antrag an und bitten um die Formulare. Kindergeld wird höchstens 6 Monate rückwirkend gezahlt – warten Sie nicht.',
                    'ar' => 'الفاميلين كاسه بدها الاستمارات الرسمية موقّعة (KG 1 و Anlage Kind) أو الطلب أونلاين. بهالرسالة بتعلن عن طلبك وبتطلب الاستمارات. الكيندرغلد بينصرف بأثر رجعي 6 أشهر بس، فلا تتأخر.',
                    'en' => 'The Familienkasse needs the signed official forms (KG 1 and Anlage Kind) or the online application. With this letter you announce the application and ask for the forms. Kindergeld is paid back at most 6 months, so do not wait.',
                ],
                'fields' => [
                    ['key' => 'familienkasse_email', 'type' => 'email', 'required' => true, 'label' => ['de' => 'E-Mail der Familienkasse', 'ar' => 'إيميل الفاميلين كاسه', 'en' => 'Familienkasse e-mail']],
                    ['key' => 'tax_id', 'type' => 'text', 'required' => true, 'label' => ['de' => 'Ihre Steuer-ID (11 Ziffern)', 'ar' => 'رقمك الضريبي Steuer-ID (11 رقم)', 'en' => 'Your tax ID (11 digits)']],
                    ['key' => 'children', 'type' => 'textarea', 'required' => true, 'label' => ['de' => 'Kinder: Name, Geburtsdatum, Steuer-ID (je Zeile ein Kind)', 'ar' => 'الأولاد: الاسم، تاريخ الميلاد، Steuer-ID (كل ولد بسطر)', 'en' => 'Children: name, date of birth, tax ID (one per line)']],
                    ['key' => 'kindergeld_number', 'type' => 'text', 'required' => false, 'label' => ['de' => 'Kindergeldnummer (falls vorhanden)', 'ar' => 'رقم الكيندرغلد (إذا موجود)', 'en' => 'Kindergeld number (if any)']],
                ],
                'subject' => 'Antrag auf Kindergeld – {{full_name}}',
                'body' => "Sehr geehrte Damen und Herren,\n\nhiermit beantrage ich Kindergeld für folgende Kinder:\n\n{{children}}\n\nAntragsteller/in: {{full_name}}, geb. {{birth_date}}\nSteuer-ID: {{tax_id}}\n{{kg_number_line}}Anschrift: {{address_street}}, {{address_zip_city}}\n\nBitte senden Sie mir die erforderlichen Formulare (KG 1, Anlage Kind) zu, falls dieser Antrag nicht ausreicht. Ich bitte um eine Eingangsbestätigung.\n\nMit freundlichen Grüßen\n{{full_name}}",
                'conditional' => ['kg_number_line' => ['field' => 'kindergeld_number', 'if_empty' => '', 'if_filled' => "Kindergeldnummer: {{kindergeld_number}}\n"]],
            ],
            [
                'key' => 'anmeldung',
                'folder' => 'wohnen',
                'authority' => 'Bürgeramt',
                'recipient_field' => 'buergeramt_email',
                'title' => ['de' => 'Wohnsitz anmelden (Bürgeramt)', 'ar' => 'تسجيل السكن (Anmeldung)', 'en' => 'Register your address (Anmeldung)'],
                'description' => [
                    'de' => 'Nach einem Umzug müssen Sie sich innerhalb von 2 Wochen anmelden. Meist geht das nur persönlich mit Termin. Dieses Schreiben bittet um einen Termin; bringen Sie Ausweis/Pass und die Wohnungsgeberbestätigung mit.',
                    'ar' => 'بعد الانتقال لازم تسجّل خلال أسبوعين. غالباً بيكون الحضور شخصي بموعد. هالرسالة بتطلب موعد، وخود معك الهوية/الجواز وورقة المؤجر (Wohnungsgeberbestätigung).',
                    'en' => 'After moving you must register within 2 weeks, usually in person with an appointment. This letter asks for an appointment; bring your ID/passport and the landlord confirmation (Wohnungsgeberbestätigung).',
                ],
                'fields' => [
                    ['key' => 'buergeramt_email', 'type' => 'email', 'required' => true, 'label' => ['de' => 'E-Mail des Bürgeramts', 'ar' => 'إيميل البورغر أمت', 'en' => 'Bürgeramt e-mail']],
                    ['key' => 'move_in_date', 'type' => 'date', 'required' => true, 'label' => ['de' => 'Einzugsdatum', 'ar' => 'تاريخ السكن الجديد', 'en' => 'Move-in date']],
                    ['key' => 'previous_address', 'type' => 'text', 'required' => false, 'label' => ['de' => 'Bisherige Anschrift', 'ar' => 'العنوان السابق', 'en' => 'Previous address']],
                    ['key' => 'household_members', 'type' => 'textarea', 'required' => false, 'label' => ['de' => 'Weitere Personen, die mit umziehen (Name, Geburtsdatum)', 'ar' => 'أشخاص تانيين انتقلوا معك (الاسم، تاريخ الميلاد)', 'en' => 'Other people moving with you (name, date of birth)']],
                ],
                'subject' => 'Terminanfrage Wohnsitzanmeldung – {{full_name}}',
                'body' => "Sehr geehrte Damen und Herren,\n\nich bin am {{move_in_date}} in die Wohnung {{address_street}}, {{address_zip_city}} eingezogen und möchte meinen Wohnsitz anmelden.\n\nName: {{full_name}}\nGeburtsdatum: {{birth_date}}\n{{previous_line}}{{household_sentence}}\nBitte teilen Sie mir einen Termin mit oder wie ich die Anmeldung vornehmen kann. Die Wohnungsgeberbestätigung liegt mir vor.\n\nMit freundlichen Grüßen\n{{full_name}}",
                'conditional' => [
                    'previous_line' => ['field' => 'previous_address', 'if_empty' => '', 'if_filled' => "Bisherige Anschrift: {{previous_address}}\n"],
                    'household_sentence' => ['field' => 'household_members', 'if_empty' => '', 'if_filled' => "\nMit mir ziehen ein:\n{{household_members}}\n"],
                ],
            ],
        ];
    }
}
