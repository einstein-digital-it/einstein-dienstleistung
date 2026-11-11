import React from "react";
import { motion } from "framer-motion";

/** Shared look of the public pages (same style as the home page). */

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export function Kicker({ children, light = false }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${light ? "bg-white/10 text-purple-100 ring-1 ring-white/20" : "bg-purple-100 text-[#5b21b6]"}`}>
      {children}
    </span>
  );
}

/** Light purple page header with the hexagon lines of the logo. */
export default function PageHero({ kicker, title, subtitle, children, narrow = false }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f3ff] via-white to-white">
      <svg aria-hidden="true" className="pointer-events-none absolute -top-40 end-[-10rem] h-[32rem] w-[32rem] text-purple-200/60" viewBox="0 0 100 100">
        <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <polygon points="50,26 72,38 72,62 50,74 28,62 28,38" fill="none" stroke="currentColor" strokeWidth="0.6" />
      </svg>
      <div className={`relative mx-auto px-4 pb-12 pt-12 md:pb-16 md:pt-16 ${narrow ? "max-w-4xl" : "max-w-7xl"}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
          {kicker && <Kicker>{kicker}</Kicker>}
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#1f0b52] md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-lg leading-relaxed text-slate-600">{subtitle}</p>}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
