import React, { useEffect, useRef, useState } from "react";

const KEY = "einstein_signature";

/** The customer's drawn signature stays in this browser only (never sent to the server). */
export function loadSignature() {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

function saveSignature(dataUrl) {
  try { if (dataUrl) localStorage.setItem(KEY, dataUrl); else localStorage.removeItem(KEY); } catch { /* private mode */ }
}

const T = {
  de: { title: "Unterschrift", hint: "Mit Finger oder Maus unterschreiben.", clear: "Löschen", save: "Übernehmen", cancel: "Abbrechen" },
  ar: { title: "التوقيع", hint: "وقّع بإصبعك أو بالفأرة.", clear: "مسح", save: "اعتماد", cancel: "إلغاء" },
  en: { title: "Signature", hint: "Sign with your finger or mouse.", clear: "Clear", save: "Use", cancel: "Cancel" },
  tr: { title: "İmza", hint: "Parmağınızla veya fareyle imzalayın.", clear: "Sil", save: "Kullan", cancel: "İptal" },
  es: { title: "Firma", hint: "Firme con el dedo o el ratón.", clear: "Borrar", save: "Usar", cancel: "Cancelar" },
  uk: { title: "Підпис", hint: "Підпишіть пальцем або мишею.", clear: "Стерти", save: "Застосувати", cancel: "Скасувати" },
};

export default function SignaturePad({ lang, onDone, onCancel }) {
  const t = T[lang] || T.de;
  const canvas = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvas.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b1a33";
  }, []);

  const point = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(...point(e));
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvas.current.getContext("2d");
    ctx.lineTo(...point(e));
    ctx.stroke();
    setEmpty(false);
  };
  const up = () => { drawing.current = false; };
  const clear = () => {
    const c = canvas.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setEmpty(true);
  };
  const done = () => {
    const url = canvas.current.toDataURL("image/png");
    saveSignature(url);
    onDone(url);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <p className="font-bold text-[#2e1065]">{t.title}</p>
        <p className="text-xs text-gray-500">{t.hint}</p>
        <canvas
          ref={canvas}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="mt-3 h-44 w-full touch-none rounded-xl border-2 border-dashed border-purple-200 bg-white"
        />
        <div className="mt-3 flex justify-between gap-2">
          <button type="button" onClick={clear} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">{t.clear}</button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">{t.cancel}</button>
            <button type="button" onClick={done} disabled={empty} className="rounded-lg bg-[#6B46C1] px-4 py-2 text-sm font-bold text-white hover:bg-[#805AD5] disabled:opacity-50">{t.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
