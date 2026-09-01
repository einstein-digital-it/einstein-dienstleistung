import React from "react";

export default function EinsteinLogo({ size = 40 }) {
  return (
    <div
      aria-label="EinStein Logo"
      className="inline-flex items-center justify-center rounded-full bg-white font-black text-[#1e3a5f] shadow-sm ring-1 ring-[#d4af25]/40"
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.35)) }}
    >
      ES
    </div>
  );
}
