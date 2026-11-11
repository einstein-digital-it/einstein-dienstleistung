<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** The 6-digit code a new customer types in to confirm the email address. */
class VerificationCodeMail extends Mailable
{
    use Queueable;

    private const TEXTS = [
        'de' => ['subject' => 'Ihr Bestätigungscode für EinStein', 'hello' => 'Willkommen bei EinStein!', 'intro' => 'Bitte geben Sie diesen Code ein, um Ihre E-Mail-Adresse zu bestätigen:', 'valid' => 'Der Code ist 30 Minuten gültig.', 'ignore' => 'Wenn Sie kein Konto erstellt haben, können Sie diese E-Mail ignorieren.'],
        'ar' => ['subject' => 'رمز التحقق الخاص بك في آينشتاين', 'hello' => 'مرحباً بك في آينشتاين!', 'intro' => 'يرجى إدخال هذا الرمز لتأكيد بريدك الإلكتروني:', 'valid' => 'الرمز صالح لمدة 30 دقيقة.', 'ignore' => 'إذا لم تُنشئ حساباً، يمكنك تجاهل هذه الرسالة.'],
        'en' => ['subject' => 'Your EinStein verification code', 'hello' => 'Welcome to EinStein!', 'intro' => 'Please enter this code to confirm your email address:', 'valid' => 'The code is valid for 30 minutes.', 'ignore' => 'If you did not create an account, you can ignore this email.'],
        'tr' => ['subject' => 'EinStein doğrulama kodunuz', 'hello' => 'EinStein’e hoş geldiniz!', 'intro' => 'E-posta adresinizi onaylamak için bu kodu girin:', 'valid' => 'Kod 30 dakika geçerlidir.', 'ignore' => 'Hesap oluşturmadıysanız bu e-postayı dikkate almayın.'],
        'es' => ['subject' => 'Su código de verificación de EinStein', 'hello' => '¡Bienvenido a EinStein!', 'intro' => 'Introduzca este código para confirmar su correo electrónico:', 'valid' => 'El código es válido durante 30 minutos.', 'ignore' => 'Si no ha creado una cuenta, puede ignorar este correo.'],
        'uk' => ['subject' => 'Ваш код підтвердження EinStein', 'hello' => 'Ласкаво просимо до EinStein!', 'intro' => 'Введіть цей код, щоб підтвердити свою адресу e-mail:', 'valid' => 'Код дійсний 30 хвилин.', 'ignore' => 'Якщо ви не створювали акаунт, просто проігноруйте цей лист.'],
    ];

    public function __construct(public string $code, public string $lang = 'de')
    {
        if (! isset(self::TEXTS[$this->lang])) {
            $this->lang = 'de';
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: self::TEXTS[$this->lang]['subject']);
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.verification-code',
            text: 'mail.verification-code-text',
            with: [
                'code' => $this->code,
                't' => self::TEXTS[$this->lang],
                'rtl' => $this->lang === 'ar',
                'lang' => $this->lang,
            ],
        );
    }
}
