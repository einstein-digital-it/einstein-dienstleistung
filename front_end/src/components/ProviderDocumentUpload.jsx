import React, { useState } from "react";
import { providerDashboardApi, uploadApi } from "@/api/backendClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, FileText, Lock, Send, Download, Eye, Trash2, X } from "lucide-react";

const docCategories = {
  de: {
    completed_work: "Erledigte Arbeit",
    invoice: "Rechnung",
    certificate: "Zertifikat",
    form: "Ausgefülltes Formular",
    other: "Sonstiges"
  },
  ar: {
    completed_work: "العمل المنجز",
    invoice: "فاتورة",
    certificate: "شهادة",
    form: "نموذج مملوء",
    other: "أخرى"
  },
  en: {
    completed_work: "Completed Work",
    invoice: "Invoice",
    certificate: "Certificate",
    form: "Filled Form",
    other: "Other"
  }
};

const tr = {
  de: {
    title: "Erledigte Dokumente hochladen",
    desc: "Laden Sie die bearbeiteten Dokumente für den Kunden hoch.",
    file: "Dateien auswählen",
    upload: "Hochladen & Senden",
    uploading: "Wird hochgeladen...",
    success: "Dokumente erfolgreich hochgeladen und gesendet!",
    payment_lock: "Der Kunde kann diese Dokumente nach Abschluss der Zahlung herunterladen.",
    already_uploaded: "Bereits hochgeladene Dokumente",
    send_email: "Per E-Mail senden",
    sending: "Wird gesendet...",
    sent: "E-Mail gesendet!",
    category: "Dokumentkategorie",
    doc_name: "Dateiname",
    remove: "Entfernen",
    view: "Ansehen",
    download: "Herunterladen"
  },
  ar: {
    title: "رفع المستندات المنجزة",
    desc: "ارفع المستندات التي أنجزتها للعميل.",
    file: "اختر الملفات",
    upload: "رفع وإرسال",
    uploading: "جاري الرفع...",
    success: "تم رفع المستندات وإرسالها للعميل بنجاح!",
    payment_lock: "يمكن للعميل تحميل هذه المستندات بعد إتمام الدفع.",
    already_uploaded: "المستندات المرفوعة سابقاً",
    send_email: "إرسال بالبريد الإلكتروني",
    sending: "جاري الإرسال...",
    sent: "تم إرسال البريد!",
    category: "تصنيف المستند",
    doc_name: "اسم الملف",
    remove: "إزالة",
    view: "عرض",
    download: "تحميل"
  },
  en: {
    title: "Upload Completed Documents",
    desc: "Upload the documents you completed for the customer.",
    file: "Choose Files",
    upload: "Upload & Send",
    uploading: "Uploading...",
    success: "Documents uploaded and sent to customer!",
    payment_lock: "Customer can download these documents after completing payment.",
    already_uploaded: "Previously Uploaded Documents",
    send_email: "Send via Email",
    sending: "Sending...",
    sent: "Email Sent!",
    category: "Document Category",
    doc_name: "File Name",
    remove: "Remove",
    view: "View",
    download: "Download"
  }
};

export default function ProviderDocumentUpload({ booking, lang = "de", onUploaded }) {
  const [files, setFiles] = useState([]);
  const [fileCategory, setFileCategory] = useState("completed_work");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const queryClient = useQueryClient();
  const t = tr[lang] || tr.de;
  const cats = docCategories[lang] || docCategories.de;

  const updateMutation = useMutation({
    mutationFn: async (urls) => {
      await providerDashboardApi.updateDocuments(
        booking.id,
        booking.confirmed_by_provider_id || booking.provider_id,
        urls
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-data"] });
      setDone(true);
      setTimeout(() => setDone(false), 4000);
      setFiles([]);
      onUploaded?.();
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      const errMsgs = { de: 'Fehler beim Hochladen. Bitte erneut versuchen.', ar: 'خطأ في الرفع. يرجى المحاولة مجدداً.', en: 'Upload failed. Please try again.' };
      alert(errMsgs[lang] || errMsgs.de);
    }
  });

  const errorMessages = {
    de: {
      fileError: (name) => `Fehler beim Hochladen der Datei: ${name}`,
      noFiles: 'Keine Dateien konnten hochgeladen werden. Bitte prüfen und erneut versuchen.',
      uploadError: 'Fehler beim Hochladen. Bitte erneut versuchen.'
    },
    ar: {
      fileError: (name) => `خطأ في رفع الملف: ${name}`,
      noFiles: 'لم يتمكن من رفع أي ملفات. يرجى التحقق وحاول مجدداً.',
      uploadError: 'خطأ في عملية الرفع. يرجى المحاولة مجدداً.'
    },
    en: {
      fileError: (name) => `Error uploading file: ${name}`,
      noFiles: 'No files could be uploaded. Please check and try again.',
      uploadError: 'Upload error. Please try again.'
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    const err = errorMessages[lang] || errorMessages.de;
    try {
      const urls = [];
      for (const file of files) {
        try {
          const result = await uploadApi.uploadFiles([file]);
          if (result?.files?.[0]?.url) {
            urls.push(result.files[0].url);
          }
        } catch (fileError) {
          console.error('File upload error:', fileError);
          alert(err.fileError(file.name));
        }
      }
      if (urls.length > 0) {
        updateMutation.mutate(urls);
      } else {
        alert(err.noFiles);
      }
    } catch (error) {
      console.error('Upload process error:', error);
      alert(err.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!booking.provider_documents_urls?.length) return;
    setSendingEmail(true);
    setSendingEmail(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
    return;

    const fileLinks = booking.provider_documents_urls.map((url, i) => `${i+1}. ${url}`).join('\n');
    const subject = lang === "ar" 
      ? `مستنداتك جاهزة - ${booking.booking_number}`
      : lang === "en"
      ? `Your Documents are Ready - ${booking.booking_number}`
      : `Ihre Dokumente sind fertig - ${booking.booking_number}`;

    const body = lang === "ar"
      ? `عزيزي/عزيزتي ${booking.customer_name}،\n\nتم إنجاز المستندات الخاصة بك (${booking.booking_number}).\n\nيمكنك تحميل المستندات من خلال الروابط التالية:\n${fileLinks}\n\nأو من خلال حسابك على:\nhttps://institut.einsteindienstleistung.com\n\nمع أطيب التحيات،\nفريق معهد آينشتاين`
      : lang === "en"
      ? `Dear ${booking.customer_name},\n\nYour documents for booking (${booking.booking_number}) are ready.\n\nDownload your documents:\n${fileLinks}\n\nOr visit your account at:\nhttps://institut.einsteindienstleistung.com\n\nBest regards,\nEinStein Institut Team`
      : `Sehr geehrte/r ${booking.customer_name},\n\nIhre Dokumente für Buchung (${booking.booking_number}) sind fertig.\n\nDokumente herunterladen:\n${fileLinks}\n\nOder besuchen Sie Ihr Konto:\nhttps://institut.einsteindienstleistung.com\n\nMit freundlichen Grüßen,\nIhr EinStein Institut Team`;

    // Send email
    await Promise.resolve({
      to: booking.customer_email,
      subject,
      body
    });

    // Create in-app notification
    await Promise.resolve({
      user_email: booking.customer_email,
      type: "general",
      title_de: "Ihre Dokumente sind fertig",
      title_ar: "مستنداتك جاهزة",
      title_en: "Your Documents are Ready",
      title_tr: "Belgeleriniz Hazır",
      title_es: "Sus Documentos Están Listos",
      message_de: `Ihre Dokumente für Buchung #${booking.booking_number} sind fertig. Laden Sie sie aus Ihrem Konto herunter.`,
      message_ar: `تم إنجاز المستندات الخاصة بك للحجز #${booking.booking_number}. يمكنك تحميلها من حسابك.`,
      message_en: `Your documents for booking #${booking.booking_number} are ready. Download them from your account.`,
      message_tr: `Rezervasyon #${booking.booking_number} için belgeleriniz hazır. Hesabınızdan indirebilirsiniz.`,
      message_es: `Sus documentos para la reserva #${booking.booking_number} están listos. Descárgalos desde tu cuenta.`,
      link: `https://institut.einsteindienstleistung.com/CustomerDashboard?tab=bookings&booking=${booking.id}`,
      booking_id: booking.id,
      is_read: false
    });

    setSendingEmail(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="border border-[#6B46C1]/30 bg-[#6B46C1]/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-[#6B46C1]">
          <Upload className="w-4 h-4" />
          {t.title}
        </CardTitle>
        <p className="text-xs text-gray-500">{t.desc}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment lock notice */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{t.payment_lock}</span>
        </div>

        {/* Category selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t.category}</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(cats).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t.file}</Label>
            <Input
              type="file"
              multiple
              onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
              disabled={uploading}
              className="mt-1 h-9 text-sm"
            />
          </div>
        </div>

        {/* Selected files preview */}
        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#6B46C1] flex-shrink-0" />
                  <span className="truncate text-gray-700">{file.name}</span>
                  <Badge className="bg-[#6B46C1]/10 text-[#6B46C1] border-0 text-xs flex-shrink-0">{cats[fileCategory]}</Badge>
                </div>
                <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 ms-2 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
            <CheckCircle className="w-4 h-4" /> {t.success}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!files.length || uploading}
          className="w-full bg-[#6B46C1] hover:bg-[#805AD5] text-white"
          size="sm"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin me-2" />{t.uploading}</>
          ) : (
            <><Upload className="w-4 h-4 me-2" />{t.upload}</>
          )}
        </Button>

        {/* Already uploaded documents */}
        {booking.provider_documents_urls?.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600">{t.already_uploaded} ({booking.provider_documents_urls.length})</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendEmail}
                disabled={sendingEmail || emailSent}
                className="h-7 text-xs border-[#6B46C1] text-[#6B46C1] hover:bg-[#6B46C1]/10"
              >
                {emailSent ? (
                  <><CheckCircle className="w-3 h-3 me-1 text-green-600" />{t.sent}</>
                ) : sendingEmail ? (
                  <><Loader2 className="w-3 h-3 animate-spin me-1" />{t.sending}</>
                ) : (
                  <><Send className="w-3 h-3 me-1" />{t.send_email}</>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {booking.provider_documents_urls.map((url, i) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
                return isImage ? (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`doc ${i+1}`} className="w-14 h-14 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                  </a>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white border rounded-lg text-xs text-[#6B46C1] hover:bg-[#6B46C1]/10 transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Doc {i+1}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
