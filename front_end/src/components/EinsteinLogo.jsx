import React from "react";

/** The EinStein hexagon mark (public/brand). */
export default function EinsteinLogo({ size = 40, className = "" }) {
  return (
    <img
      src="/brand/einstein-mark.png"
      alt="EinStein"
      width={size}
      height={size}
      className={`inline-block select-none object-contain ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
