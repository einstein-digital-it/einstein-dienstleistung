import React from "react";
import LegalPage from "@/components/LegalPage";
import { DATENSCHUTZ_SECTIONS } from "@/content/legal";

export default function Datenschutz() {
  return <LegalPage title="Datenschutzerklärung – EinStein" sections={DATENSCHUTZ_SECTIONS} />;
}
