import React from "react";

export default function EinsteinLogo({ size = 40 }) {
  return (
    <img 
      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694d6e3a995b53f785114ddc/297b1cd85_IMG_0747.png"
      alt="EinStein Logo"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}