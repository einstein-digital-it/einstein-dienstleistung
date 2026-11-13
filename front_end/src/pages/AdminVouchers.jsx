import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Gift, Plus, Power, Trash2, Users } from "lucide-react";
import { aboVouchersApi } from "@/api/backendClient";
import { getLang } from "@/lib/lang";
import {
  CardHeader,
  DesignCard,
  PageScaffold,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusPill
} from "@/components/design/PageScaffold";

// Admin pages: German, Arabic, English
const T = {
  de: {
    title: "Gutscheine", eyebrow: "Adminbereich", desc: "Codes, mit denen Kund:innen Sortieren & Übersetzen kostenlos nutzen – ohne Zahlung.",
    newTitle: "Neuen Gutschein erstellen", newHint: "Geben Sie den Code an die Person weiter. Sie trägt ihn unter „Meine Unterlagen“ ein.",
    code: "Code (leer lassen = automatisch)", months: "Kostenlose Monate", uses: "Für wie viele Personen", validUntil: "Einlösbar bis (optional)", note: "Notiz (für wen?)",
    create: "Gutschein erstellen", creating: "Wird erstellt…", list: "Alle Gutscheine", none: "Noch keine Gutscheine.",
    total: "Gutscheine", active: "Aktiv", redeemed: "Eingelöst", usable: "Aktiv", off: "Aus", usedUp: "Aufgebraucht", expired: "Abgelaufen",
    usedOf: (u, m) => `${u} von ${m} eingelöst`, monthsFree: (n) => (n === 1 ? "1 Monat kostenlos" : `${n} Monate kostenlos`), until: "einlösbar bis",
    copy: "Kopieren", copied: "Kopiert", turnOff: "Ausschalten", turnOn: "Einschalten", remove: "Löschen",
    removeConfirm: "Diesen Gutschein löschen? Wer ihn schon eingelöst hat, behält die kostenlosen Monate.",
    usedBy: "Eingelöst von", freeUntil: "kostenlos bis", error: "Das hat nicht geklappt. Bitte Angaben prüfen.", codeTaken: "Diesen Code gibt es schon oder er ist ungültig (nur Buchstaben, Zahlen und Bindestrich, mindestens 4 Zeichen).",
  },
  ar: {
    title: "القسائم", eyebrow: "منطقة الإدارة", desc: "رموز تتيح للعملاء استخدام الترتيب والترجمة مجاناً دون دفع.",
    newTitle: "إنشاء قسيمة جديدة", newHint: "أعطِ الرمز للشخص المعني، فيدخله في صفحة «ملفاتي».",
    code: "الرمز (اتركه فارغاً ليُنشأ تلقائياً)", months: "عدد الأشهر المجانية", uses: "لعدد كم شخص", validUntil: "صالح للإدخال حتى (اختياري)", note: "ملاحظة (لمن؟)",
    create: "إنشاء القسيمة", creating: "جارٍ الإنشاء…", list: "جميع القسائم", none: "لا توجد قسائم بعد.",
    total: "القسائم", active: "فعّالة", redeemed: "مستخدمة", usable: "فعّالة", off: "متوقفة", usedUp: "استُنفدت", expired: "منتهية",
    usedOf: (u, m) => `استُخدمت ${u} من ${m}`, monthsFree: (n) => (n === 1 ? "شهر واحد مجاناً" : `${n} أشهر مجاناً`), until: "صالحة حتى",
    copy: "نسخ", copied: "تم النسخ", turnOff: "إيقاف", turnOn: "تفعيل", remove: "حذف",
    removeConfirm: "هل تريد حذف هذه القسيمة؟ من استخدمها سابقاً يحتفظ بأشهره المجانية.",
    usedBy: "استخدمها", freeUntil: "مجاناً حتى", error: "لم تنجح العملية. يرجى مراجعة البيانات.", codeTaken: "هذا الرمز موجود مسبقاً أو غير صالح (أحرف لاتينية وأرقام وشرطة فقط، 4 خانات على الأقل).",
  },
  en: {
    title: "Voucher codes", eyebrow: "Admin area", desc: "Codes that let customers use sorting & translation for free – without paying.",
    newTitle: "Create a new voucher", newHint: "Give the code to the person. They enter it under “My documents”.",
    code: "Code (leave empty = automatic)", months: "Free months", uses: "For how many people", validUntil: "Can be entered until (optional)", note: "Note (for whom?)",
    create: "Create voucher", creating: "Creating…", list: "All vouchers", none: "No vouchers yet.",
    total: "Vouchers", active: "Active", redeemed: "Redeemed", usable: "Active", off: "Off", usedUp: "Used up", expired: "Expired",
    usedOf: (u, m) => `${u} of ${m} redeemed`, monthsFree: (n) => (n === 1 ? "1 month free" : `${n} months free`), until: "can be entered until",
    copy: "Copy", copied: "Copied", turnOff: "Turn off", turnOn: "Turn on", remove: "Delete",
    removeConfirm: "Delete this voucher? People who already used it keep their free months.",
    usedBy: "Redeemed by", freeUntil: "free until", error: "That did not work. Please check the details.", codeTaken: "This code already exists or is not valid (letters, numbers and hyphen only, at least 4 characters).",
  },
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()}`;
};

export default function AdminVouchers() {
  const lang = getLang();
  const t = T[lang] || T.de;
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ code: "", months: 3, max_uses: 1, valid_until: "", note: "" });
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["abo-vouchers"] });

  const { data: vouchers = [] } = useQuery({ queryKey: ["abo-vouchers"], queryFn: aboVouchersApi.list });

  const createMutation = useMutation({
    mutationFn: aboVouchersApi.create,
    onSuccess: () => { setForm({ code: "", months: 3, max_uses: 1, valid_until: "", note: "" }); setError(""); refresh(); },
    onError: (err) => setError(err.status === 422 && form.code ? t.codeTaken : t.error),
  });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => aboVouchersApi.update(id, data), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: aboVouchersApi.remove, onSuccess: refresh });

  const submit = (event) => {
    event.preventDefault();
    setError("");
    createMutation.mutate({
      code: form.code.trim() || null,
      months: Number(form.months) || 1,
      max_uses: Number(form.max_uses) || 1,
      valid_until: form.valid_until || null,
      note: form.note.trim() || null,
    });
  };

  const copy = async (voucher) => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopiedId(voucher.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard blocked: the code is visible and can be copied by hand */ }
  };

  const stateOf = (v) => {
    if (!v.active) return [t.off, "slate"];
    if (v.used_count >= v.max_uses) return [t.usedUp, "gold"];
    if (!v.usable) return [t.expired, "red"];
    return [t.usable, "green"];
  };

  const field = "h-12 w-full rounded-xl border border-[#d8e3f1] bg-white px-4 font-semibold outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15";
  const label = "grid gap-2 text-sm font-bold text-[#1f0b52]";
  const redeemedTotal = vouchers.reduce((sum, v) => sum + v.used_count, 0);

  return (
    <PageScaffold title={t.title} eyebrow={t.eyebrow} icon={Gift} description={t.desc} maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Gift} label={t.total} value={String(vouchers.length)} tone="blue" />
        <StatCard icon={Check} label={t.active} value={String(vouchers.filter((v) => v.usable).length)} tone="green" />
        <StatCard icon={Users} label={t.redeemed} value={String(redeemedTotal)} tone="purple" />
      </div>

      <DesignCard className="mt-6">
        <CardHeader title={t.newTitle} description={t.newHint} />
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <label className={label}>
            {t.code}
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} dir="ltr" maxLength={40} placeholder="EIN-XXXX-XXXX" className={`${field} font-mono tracking-wider`} />
          </label>
          <label className={label}>
            {t.note}
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={255} className={field} />
          </label>
          <label className={label}>
            {t.months}
            <input type="number" min="1" max="120" value={form.months} onChange={(e) => setForm({ ...form, months: e.target.value })} dir="ltr" className={field} />
          </label>
          <label className={label}>
            {t.uses}
            <input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} dir="ltr" className={field} />
          </label>
          <label className={label}>
            {t.validUntil}
            <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} dir="ltr" className={field} />
          </label>
          <div className="flex items-end">
            <PrimaryButton type="submit" disabled={createMutation.isPending} className="h-12 w-full">
              <Plus className="h-4 w-4" />{createMutation.isPending ? t.creating : t.create}
            </PrimaryButton>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 md:col-span-2" role="alert">{error}</p>}
        </form>
      </DesignCard>

      <DesignCard className="mt-6">
        <CardHeader title={t.list} />
        <div className="space-y-4 p-5">
          {vouchers.length === 0 && <p className="text-sm font-semibold text-[#65758b]">{t.none}</p>}
          {vouchers.map((voucher) => {
            const [stateText, tone] = stateOf(voucher);
            return (
              <article key={voucher.id} className="rounded-[15px] border border-[#e2ebf6] bg-[#fbfdff] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-all rounded-lg bg-[#1f0b52] px-3 py-1.5 font-mono text-lg font-bold tracking-wider text-white" dir="ltr">{voucher.code}</span>
                      <StatusPill tone={tone}>{stateText}</StatusPill>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#1f0b52]">
                      {t.monthsFree(voucher.months)} · {t.usedOf(voucher.used_count, voucher.max_uses)}
                      {voucher.valid_until && <> · {t.until} <bdi>{formatDate(voucher.valid_until)}</bdi></>}
                    </p>
                    {voucher.note && <p className="mt-1 text-sm text-[#65758b]">{voucher.note}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton className="h-10 px-3" onClick={() => copy(voucher)}>
                      {copiedId === voucher.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiedId === voucher.id ? t.copied : t.copy}
                    </SecondaryButton>
                    <SecondaryButton className="h-10 px-3" onClick={() => updateMutation.mutate({ id: voucher.id, data: { active: !voucher.active } })}>
                      <Power className="h-4 w-4" />{voucher.active ? t.turnOff : t.turnOn}
                    </SecondaryButton>
                    <SecondaryButton className="h-10 px-3 text-red-600" onClick={() => { if (window.confirm(t.removeConfirm)) deleteMutation.mutate(voucher.id); }}>
                      <Trash2 className="h-4 w-4" />{t.remove}
                    </SecondaryButton>
                  </div>
                </div>
                {voucher.redemptions.length > 0 && (
                  <div className="mt-4 border-t border-[#e2ebf6] pt-3">
                    <p className="text-xs font-bold text-[#8ea0b7]">{t.usedBy}</p>
                    <ul className="mt-2 space-y-1 text-sm text-[#1f0b52]">
                      {voucher.redemptions.map((r) => (
                        <li key={`${r.email}-${r.redeemed_at}`} className="flex flex-wrap gap-x-3">
                          <span className="font-semibold" dir="ltr">{r.email}</span>
                          {r.name && <span className="text-[#65758b]">{r.name}</span>}
                          <span className="text-[#65758b]">{t.freeUntil} <bdi>{formatDate(r.free_until)}</bdi></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </DesignCard>
    </PageScaffold>
  );
}
