import React from "react";
import { ArrowUpRight } from "lucide-react";

export function PageScaffold({
  eyebrow = "EinStein Institut",
  title,
  description,
  icon: Icon,
  actions,
  children,
  maxWidth = "max-w-7xl"
}) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8 text-[#13233a]">
      <div className={`${maxWidth} mx-auto px-4`}>
        <header className="mb-8 overflow-hidden rounded-[18px] border border-[#d9e4f2] bg-white shadow-[0_18px_50px_rgba(15,35,65,0.08)]">
          <div className="bg-[#122238] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                {Icon && (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-[#d4af25] ring-1 ring-white/10">
                    <Icon className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="mb-2 text-sm font-bold text-[#d4af25]">{eyebrow}</p>
                  <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
                  {description && (
                    <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">{description}</p>
                  )}
                </div>
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function DesignCard({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-[#d9e4f2] bg-white shadow-[0_14px_42px_rgba(15,35,65,0.07)] ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#e5edf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-extrabold text-[#13233a]">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-[#65758b]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "blue", note }) {
  const tones = {
    blue: "bg-[#e8f0fd] text-[#1e3a5f]",
    gold: "bg-[#fff7df] text-[#9a6b00]",
    green: "bg-[#e7f7ee] text-[#166534]",
    purple: "bg-[#f0e9ff] text-[#6B46C1]",
    red: "bg-[#fff0f0] text-[#b42318]"
  };

  return (
    <DesignCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#65758b]">{label}</p>
          <p className="mt-2 text-3xl font-black text-[#13233a]">{value}</p>
          {note && <p className="mt-2 text-xs font-semibold text-[#7b8ca4]">{note}</p>}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${tones[tone] || tones.blue}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </DesignCard>
  );
}

export function StatusPill({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-[#e8f0fd] text-[#1e3a5f]",
    gold: "bg-[#fff7df] text-[#9a6b00]",
    green: "bg-[#e7f7ee] text-[#166534]",
    purple: "bg-[#f0e9ff] text-[#6B46C1]",
    red: "bg-[#fff0f0] text-[#b42318]",
    slate: "bg-[#eef3f9] text-[#60718d]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone] || tones.blue}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#122238] px-5 text-sm font-extrabold text-white transition hover:bg-[#1d3350] focus:outline-none focus:ring-2 focus:ring-[#122238] focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#d9e4f2] bg-white px-5 text-sm font-extrabold text-[#1e3a5f] transition hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#b5c7e5] focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function QuickLink({ title, description, icon: Icon }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 rounded-[13px] border border-[#e2ebf6] bg-[#f8fbff] p-4 text-start transition hover:border-[#c7d8ed] hover:bg-white"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#e8f0fd] text-[#1e3a5f]">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-extrabold text-[#13233a]">{title}</span>
          {description && <span className="mt-1 block text-xs leading-5 text-[#65758b]">{description}</span>}
        </span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8ea0b7]" />
    </button>
  );
}

export function FieldPreview({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-extrabold text-[#334155]">{label}</label>
      <div className="min-h-12 rounded-[12px] border border-[#d9e4f2] bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-[#13233a]">
        {value}
      </div>
    </div>
  );
}
