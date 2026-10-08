import React from "react";
import { Building2, Phone, Mail, FileText, AlertTriangle, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";

function Heading({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5 text-[#6B46C1]" />}
      <h2 className="text-lg font-semibold text-[#1e3a5f]">{children}</h2>
    </div>
  );
}

export default function Impressum() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">Impressum</h1>
          <p className="text-gray-500 mt-2">Angaben gemäß § 5 DDG</p>
        </div>

        <Card className="p-6 md:p-8 space-y-8">
          <section>
            <Heading icon={Building2}>Anbieter</Heading>
            <p className="text-gray-700 leading-relaxed">
              EinStein<br />
              Inhaber: Beshr Alhoury Alhomsi<br />
              Julius-Leber-Weg 8<br />
              65936 Frankfurt am Main<br />
              Deutschland
            </p>
          </section>

          <section>
            <Heading icon={Phone}>Kontakt</Heading>
            <div className="text-gray-700 space-y-1">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Telefon: 069 27246275</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> E-Mail: info@einsteindienstleistung.de</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1e3a5f] mb-2">Unternehmensform</h2>
            <p className="text-gray-700">Einzelunternehmen</p>
          </section>

          <section>
            <Heading icon={FileText}>Tätigkeit</Heading>
            <p className="text-gray-700 leading-relaxed">
              Online-Dienstleistungen, Dokumentenhilfe und administrative Unterstützung.
            </p>
          </section>

          <section className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <Heading icon={AlertTriangle}>Hinweis zur Geschäftsadresse und Tätigkeit</Heading>
            <div className="text-gray-700 leading-relaxed space-y-3 text-sm">
              <p>
                EinStein unterhält derzeit kein öffentlich zugängliches Ladenlokal und kein festes Kundenbüro. Die
                Dienstleistungen werden überwiegend online, telefonisch, per E-Mail sowie nach vorheriger
                Terminvereinbarung erbracht.
              </p>
              <p>
                Die im Impressum angegebene Anschrift dient als ladungsfähige Anschrift im Sinne von § 5 DDG und zur
                postalischen Erreichbarkeit des Unternehmens.
              </p>
              <p>Besuche und persönliche Termine sind nur nach vorheriger Vereinbarung möglich.</p>
            </div>
          </section>

          <section>
            <Heading icon={Receipt}>Steuerliche Angaben</Heading>
            <div className="text-gray-700 leading-relaxed space-y-3 text-sm">
              <p>Kleinunternehmer gemäß § 19 UStG.<br />Es wird keine Umsatzsteuer ausgewiesen.</p>
              <p>
                <span className="font-medium text-[#1e3a5f]">Wirtschafts-Identifikationsnummer (W-IdNr.)</span><br />
                DE454555907-00001
              </p>
              <p>
                <span className="font-medium text-[#1e3a5f]">Steuernummer</span><br />
                Die Steuernummer wird im Impressum nicht veröffentlicht.<br />
                Sie liegt dem zuständigen Finanzamt vor.
              </p>
            </div>
          </section>

          <section>
            <Heading>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</Heading>
            <p className="text-gray-700 leading-relaxed">
              Beshr Alhoury Alhomsi<br />
              Julius-Leber-Weg 8<br />
              65936 Frankfurt am Main
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
