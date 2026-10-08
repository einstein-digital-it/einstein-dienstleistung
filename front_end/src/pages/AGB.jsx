import React from "react";
import LegalPage from "@/components/LegalPage";
import { AGB_SECTIONS } from "@/content/legal";

export default function AGB() {
  return <LegalPage title="Allgemeine Geschäftsbedingungen (AGB) – EinStein" sections={AGB_SECTIONS} />;
}
