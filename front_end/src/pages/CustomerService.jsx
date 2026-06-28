import React from "react";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Users,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqItems = [
  { icon: Calendar, text: "Wie kann ich eine Buchung stornieren?" },
  { icon: CreditCard, text: "Welche Zahlungsmethoden gibt es?" },
  { icon: Users, text: "Wie werde ich Dienstleister?" },
  { icon: Headphones, text: "Wie kann ich Sie erreichen?" }
];

export default function CustomerService() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            className="h-11 w-full rounded-full border border-gray-300 bg-white pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-[#6B46C1] focus:ring-2 focus:ring-purple-100"
            placeholder="Suchen oder eine Frage stellen"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <div className="flex items-center justify-between bg-[#244f80] px-5 py-5 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Jetzt mit uns chatten</h1>
                <p className="text-sm font-medium text-blue-100">24/7 verfuegbar</p>
              </div>
            </div>
            <span className="rounded-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">Online</span>
          </div>

          <div className="px-6 py-8">
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-[#6B46C1]">
                <MessageCircle className="h-9 w-9" />
              </div>
            </div>
            <p className="mb-7 text-center text-sm text-[#1e3a5f]">
              Unser KI-Assistent ist bereit, Ihre Fragen zu beantworten
            </p>
            <Button className="mb-7 h-11 w-full rounded-full bg-[#6B46C1] text-sm font-bold hover:bg-[#805AD5]">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat starten
            </Button>

            <div className="space-y-4 text-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-[#6B46C1]" />
                <span>Schnelle Hilfe</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#6B46C1]" />
                <span>In Ihrem Tempo</span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-[#6B46C1]" />
                <span>Bei Bedarf an Mitarbeiter weiterleiten</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <h2 className="mb-5 text-xl font-bold text-black">Kontaktieren Sie uns</h2>
          <div className="space-y-3">
            <button className="flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-gray-300 bg-white text-lg font-semibold text-[#1e3a5f] transition hover:bg-gray-50">
              <Phone className="h-5 w-5" />
              Jetzt Rueckruf anfordern
            </button>
            <button className="flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-gray-300 bg-white text-lg font-semibold text-[#1e3a5f] transition hover:bg-gray-50">
              <Mail className="h-5 w-5" />
              Jetzt E-Mail senden
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
          <h2 className="px-5 py-5 text-xl font-bold text-black">Haeufige Fragen</h2>
          <div className="px-5 pb-5">
            {faqItems.map(({ icon: Icon, text }, index) => (
              <button
                key={text}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-4 text-left text-lg text-[#1e3a5f] transition hover:bg-gray-50 ${
                  index === 1 ? "bg-gray-50" : ""
                }`}
              >
                <span className="flex items-center gap-5">
                  <Icon className="h-5 w-5 text-gray-400" />
                  {text}
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-[#1f416b] p-5 text-white shadow-md">
          <h2 className="mb-5 text-xl font-bold">Kontaktinformationen</h2>
          <div className="space-y-4 text-sm font-semibold">
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-pink-300" />
              Frankfurt, Deutschland
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-pink-300" />
              069 27246275
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-pink-300" />
              01573 1770487
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-pink-200" />
              info@e-in-s-tein.de
            </p>
          </div>
          <div className="mt-5 border-t border-white/20 pt-4">
            <p>Oeffnungszeiten</p>
            <p className="font-bold">Mo-Fr: 9:00 - 18:00 Uhr</p>
          </div>
        </section>
      </div>
    </div>
  );
}
