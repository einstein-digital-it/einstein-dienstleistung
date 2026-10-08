import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { LEGAL_NOTICE } from "@/content/legal";

function useLang() {
  const [lang, setLang] = useState("de");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("einstein_lang");
      if (saved) setLang(saved);
    } catch {
      /* ignore */
    }
  }, []);
  return lang;
}

/** "Only the German version is legally binding" — shown for non-German languages. */
export function LegalNotice() {
  const lang = useLang();
  if (lang === "de" || !LEGAL_NOTICE[lang]) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
      <p className="text-sm font-medium text-amber-800">{LEGAL_NOTICE[lang]}</p>
    </div>
  );
}

/** Renders a legal document made of { heading, blocks[] } sections. Blocks starting with "###" are sub-headings. */
export default function LegalPage({ title, sections }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1e3a5f] md:text-4xl">{title}</h1>
          <p className="mt-2 text-gray-500">Stand: Oktober 2026</p>
        </div>
        <LegalNotice />
        <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-lg font-semibold text-[#6B46C1]">{section.heading}</h2>
              <div className="space-y-3">
                {section.blocks.map((block, i) =>
                  block.startsWith("###") ? (
                    <h3 key={i} className="pt-2 font-semibold text-[#1e3a5f]">{block.replace("###", "")}</h3>
                  ) : (
                    <p key={i} className="text-sm leading-relaxed text-gray-700">{block}</p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
