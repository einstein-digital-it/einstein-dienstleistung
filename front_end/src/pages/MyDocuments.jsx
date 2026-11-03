import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase, Building2, ChevronLeft, ChevronRight, Download, FileText, Folder, GraduationCap,
  HeartPulse, Home as HomeIcon, Landmark, Loader2, Lock, PiggyBank, Shield, Trash2, Upload, Users, Globe2, Baby,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerDocumentsApi } from "@/api/backendClient";
import { getStoredAuthUser } from "@/lib/backendAuth";

const FOLDER_META = {
  jobcenter: { icon: Briefcase, color: "bg-blue-600" },
  auslaenderbehoerde: { icon: Globe2, color: "bg-emerald-600" },
  finanzamt: { icon: Landmark, color: "bg-amber-600" },
  familienkasse: { icon: Baby, color: "bg-pink-600" },
  krankenkasse: { icon: HeartPulse, color: "bg-red-600" },
  rentenversicherung: { icon: PiggyBank, color: "bg-teal-600" },
  wohnen: { icon: HomeIcon, color: "bg-orange-600" },
  arbeit: { icon: Building2, color: "bg-indigo-600" },
  schule: { icon: GraduationCap, color: "bg-sky-600" },
  bank: { icon: Landmark, color: "bg-slate-700" },
  versicherung: { icon: Shield, color: "bg-violet-600" },
  sonstiges: { icon: Folder, color: "bg-gray-500" },
};

const T = {
  de: {
    title: "Meine Unterlagen", subtitle: "Alle Ihre Dokumente, sortiert nach Behörde und Thema.",
    private: "Nur Sie und EinStein sehen diese Dateien.",
    folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Ausländerbehörde", finanzamt: "Finanzamt", familienkasse: "Familienkasse / Kindergeld", krankenkasse: "Krankenkasse", rentenversicherung: "Rentenversicherung", wohnen: "Wohnen / Vermieter", arbeit: "Arbeit / Arbeitgeber", schule: "Schule / Kita", bank: "Bank", versicherung: "Versicherungen", sonstiges: "Sonstiges" },
    files: (n) => (n === 1 ? "1 Datei" : `${n} Dateien`), back: "Alle Ordner", upload: "Datei hochladen",
    titleField: "Titel (optional)", empty: "Noch keine Dateien in diesem Ordner.", uploading: "Wird hochgeladen…",
    byEinstein: "von EinStein", deleteConfirm: "Datei wirklich löschen?", login: "Bitte melden Sie sich an, um Ihre Unterlagen zu sehen.",
    error: "Das hat nicht geklappt. Bitte erneut versuchen.", customer: "Kunde (E-Mail)", open: "Öffnen", customers: "Kunden mit Unterlagen",
    hint: "PDF, Foto, Word oder Excel – bis 20 MB.",
  },
  ar: {
    title: "ملفاتي", subtitle: "كل مستنداتك مرتبة حسب الجهة والموضوع.",
    private: "هذه الملفات لا يراها إلا أنت وفريق آينشتاين.",
    folders: { jobcenter: "الجوب سنتر", auslaenderbehoerde: "دائرة الأجانب", finanzamt: "مكتب الضرائب", familienkasse: "صندوق العائلة / الكيندرغلد", krankenkasse: "التأمين الصحي", rentenversicherung: "التأمين التقاعدي", wohnen: "السكن / المؤجر", arbeit: "العمل / صاحب العمل", schule: "المدرسة / الروضة", bank: "البنك", versicherung: "التأمينات", sonstiges: "أخرى" },
    files: (n) => (n === 1 ? "ملف واحد" : `${n} ملفات`), back: "كل المجلدات", upload: "رفع ملف",
    titleField: "اسم الملف (اختياري)", empty: "لا توجد ملفات في هذا المجلد بعد.", uploading: "جارٍ الرفع…",
    byEinstein: "من آينشتاين", deleteConfirm: "هل تريد حذف الملف؟", login: "سجّل الدخول لترى ملفاتك.",
    error: "لم تنجح العملية. حاول مرة أخرى.", customer: "الزبون (الإيميل)", open: "فتح", customers: "زبائن لديهم ملفات",
    hint: "PDF أو صورة أو Word أو Excel – حتى 20 ميغابايت.",
  },
  en: {
    title: "My documents", subtitle: "All your documents, sorted by authority and topic.",
    private: "Only you and EinStein can see these files.",
    folders: { jobcenter: "Jobcenter", auslaenderbehoerde: "Immigration office", finanzamt: "Tax office", familienkasse: "Family benefits / Kindergeld", krankenkasse: "Health insurance", rentenversicherung: "Pension insurance", wohnen: "Housing / landlord", arbeit: "Work / employer", schule: "School / daycare", bank: "Bank", versicherung: "Insurance", sonstiges: "Other" },
    files: (n) => (n === 1 ? "1 file" : `${n} files`), back: "All folders", upload: "Upload file",
    titleField: "Title (optional)", empty: "No files in this folder yet.", uploading: "Uploading…",
    byEinstein: "from EinStein", deleteConfirm: "Delete this file?", login: "Please sign in to see your documents.",
    error: "That didn't work. Please try again.", customer: "Customer (email)", open: "Open", customers: "Customers with documents",
    hint: "PDF, photo, Word or Excel – up to 20 MB.",
  },
};
T.tr = { ...T.en, title: "Belgelerim", subtitle: "Tüm belgeleriniz kurum ve konuya göre sıralı.", upload: "Dosya yükle", back: "Tüm klasörler" };
T.es = { ...T.en, title: "Mis documentos", subtitle: "Todos sus documentos, ordenados por organismo y tema.", upload: "Subir archivo", back: "Todas las carpetas" };

function formatSize(bytes) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MyDocuments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = (() => { try { return localStorage.getItem("einstein_lang") || "ar"; } catch { return "ar"; } })();
  const t = T[lang] || T.de;
  const isRTL = lang === "ar";
  const user = getStoredAuthUser();
  const isAdmin = user?.role === "admin";
  const adminEmail = isAdmin ? (searchParams.get("email") || "") : "";

  const [data, setData] = useState({ folders: Object.keys(FOLDER_META), documents: [] });
  const [customers, setCustomers] = useState([]);
  const [folder, setFolder] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState(adminEmail);
  const fileInput = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin && !adminEmail) {
        const res = await customerDocumentsApi.adminCustomers();
        setCustomers(res.customers || []);
      } else {
        const res = isAdmin ? await customerDocumentsApi.adminList(adminEmail) : await customerDocumentsApi.list();
        setData({ folders: res.folders || Object.keys(FOLDER_META), documents: res.documents || [] });
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmail]);

  const byFolder = useMemo(() => {
    const map = {};
    data.documents.forEach((d) => { (map[d.folder] = map[d.folder] || []).push(d); });
    return map;
  }, [data.documents]);

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !folder) return;
    setUploading(true);
    setError("");
    try {
      if (isAdmin) await customerDocumentsApi.adminUpload({ email: adminEmail, file, folder, title });
      else await customerDocumentsApi.upload({ file, folder, title });
      setTitle("");
      await load();
    } catch (e) {
      setError(e?.message || t.error);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (doc) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await customerDocumentsApi.remove(doc.id);
      await load();
    } catch {
      setError(t.error);
    }
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  if (!user) {
    return <div className="min-h-[60vh] flex items-center justify-center p-6 text-center text-gray-600">{t.login}</div>;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-[#1e3a5f]">{t.title}</h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500"><Lock className="w-3.5 h-3.5" />{t.private}</p>
        </div>

        {isAdmin && (
          <form
            className="mb-6 flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => { e.preventDefault(); setFolder(null); setSearchParams(emailInput.trim() ? { email: emailInput.trim() } : {}); }}
          >
            <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={t.customer} type="email" className="sm:max-w-sm bg-white" />
            <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#2d5a8a]"><Users className="w-4 h-4 me-2" />{t.open}</Button>
          </form>
        )}

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#6B46C1]" /></div>
        ) : isAdmin && !adminEmail ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-[#1e3a5f] mb-3">{t.customers}</h2>
            {customers.length === 0 ? <p className="text-sm text-gray-500">—</p> : (
              <ul className="divide-y">
                {customers.map((c) => (
                  <li key={c.user_email}>
                    <button className="w-full flex justify-between py-3 text-start hover:text-[#6B46C1]" onClick={() => { setEmailInput(c.user_email); setSearchParams({ email: c.user_email }); }}>
                      <span>{c.user_email}</span><span className="text-sm text-gray-500">{t.files(Number(c.documents))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : !folder ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.folders.map((key) => {
              const meta = FOLDER_META[key] || FOLDER_META.sonstiges;
              const Icon = meta.icon;
              const count = byFolder[key]?.length || 0;
              return (
                <button key={key} onClick={() => setFolder(key)} className="group bg-white rounded-2xl border border-gray-100 p-5 text-start shadow-sm hover:shadow-md hover:border-[#6B46C1]/40 transition">
                  <div className={`w-11 h-11 ${meta.color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5 text-white" /></div>
                  <p className="font-semibold text-[#1e3a5f] leading-tight">{t.folders[key] || key}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.files(count)}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
            <button onClick={() => setFolder(null)} className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline"><BackIcon className="w-4 h-4" />{t.back}</button>
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">{t.folders[folder] || folder}</h2>

            <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titleField} className="sm:max-w-xs" />
              <input ref={fileInput} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.doc,.docx,.xls,.xlsx,.txt" onChange={onUpload} />
              <Button onClick={() => fileInput.current?.click()} disabled={uploading} className="bg-[#6B46C1] hover:bg-[#805AD5]">
                {uploading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Upload className="w-4 h-4 me-2" />}
                {uploading ? t.uploading : t.upload}
              </Button>
              <span className="text-xs text-gray-400">{t.hint}</span>
            </div>

            {(byFolder[folder] || []).length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t.empty}</p>
            ) : (
              <ul className="divide-y">
                {byFolder[folder].map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 py-3">
                    <FileText className="w-5 h-5 text-[#6B46C1] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1e3a5f] truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString(lang === "ar" ? "ar" : lang)} · {formatSize(doc.size)}
                        {doc.uploaded_by === "einstein" && <span className="ms-2 rounded bg-purple-50 px-1.5 py-0.5 text-[#6B46C1]">{t.byEinstein}</span>}
                      </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => customerDocumentsApi.download(doc).catch(() => setError(t.error))} aria-label="Download"><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(doc)} aria-label="Delete" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
