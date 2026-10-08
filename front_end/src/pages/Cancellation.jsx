import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { publicApi } from "@/api/backendClient";
import { CANCELLATION_TEXT } from "@/content/legal";

/**
 * "Verträge hier kündigen" — cancellation button required by § 312k BGB.
 * Works without login; can be prefilled via ?name=&email=&reference=
 */
export default function Cancellation() {
  const params = new URLSearchParams(window.location.search);
  const lang = (() => {
    try { return localStorage.getItem("einstein_lang") || "de"; } catch { return "de"; }
  })();
  const t = CANCELLATION_TEXT[lang] || CANCELLATION_TEXT.de;
  const isRTL = lang === "ar";

  const [form, setForm] = useState({
    name: params.get("name") || "",
    email: params.get("email") || "",
    cancellation_type: "ordinary",
    termination_timing: "soonest",
    termination_date: "",
    reference_number: params.get("reference") || "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || (form.termination_timing === "specific_date" && !form.termination_date)) {
      setError(t.required);
      return;
    }
    setSending(true);
    try {
      const data = await publicApi.submitCancellation({ ...form, language: lang });
      setResult(data);
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-12 px-4 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1e3a5f] md:text-4xl">{t.title}</h1>
          <p className="mt-3 text-sm text-gray-500">{t.subtitle}</p>
        </div>

        {result ? (
          <div className="rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h2 className="mb-2 text-xl font-semibold text-[#1e3a5f]">{t.successTitle}</h2>
            <p className="mb-6 text-sm text-gray-600">{t.successText}</p>
            <div className="mb-6 space-y-1 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <p><span className="font-medium">{t.receivedAt}: </span>{result.received_date}, {result.received_time}</p>
              <p>
                <span className="font-medium">{t.termination}: </span>
                {result.termination_timing === "specific_date" ? result.termination_date : t.soonest}
              </p>
            </div>
            <Link to="/" className="text-sm font-semibold text-[#6B46C1] hover:underline">{t.backHome}</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">{t.name} *</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t.namePh} />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">{t.email} *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder={t.emailPh} />
            </div>
            <div>
              <Label className="mb-1.5 block">{t.type} *</Label>
              <Select value={form.cancellation_type} onValueChange={(v) => set("cancellation_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordinary">{t.typeOrdinary}</SelectItem>
                  <SelectItem value="extraordinary">{t.typeExtraordinary}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t.timing} *</Label>
              <Select value={form.termination_timing} onValueChange={(v) => set("termination_timing", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soonest">{t.timingSoonest}</SelectItem>
                  <SelectItem value="specific_date">{t.timingDate}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.termination_timing === "specific_date" && (
              <div>
                <Label htmlFor="termination_date" className="mb-1.5 block">{t.date} *</Label>
                <Input id="termination_date" type="date" value={form.termination_date} onChange={(e) => set("termination_date", e.target.value)} />
              </div>
            )}
            <div>
              <Label htmlFor="reference" className="mb-1.5 block">{t.reference}</Label>
              <Input id="reference" value={form.reference_number} onChange={(e) => set("reference_number", e.target.value)} placeholder={t.referencePh} />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={sending} className="w-full bg-[#6B46C1] py-6 text-base font-semibold text-white hover:bg-[#805AD5]">
              {sending ? (
                <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t.sending}</>
              ) : (
                <><Send className="me-2 h-4 w-4" />{t.submit}</>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
