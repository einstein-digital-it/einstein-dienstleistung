import React from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = "md", showValue = false }) {
  const [hovered, setHovered] = React.useState(0);
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  const s = sizes[size] || sizes.md;
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`${s} transition-colors ${
            star <= (hovered || value)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
        />
      ))}
      {showValue && value > 0 && (
        <span className="text-sm font-semibold text-gray-700 ms-1">{value.toFixed(1)}</span>
      )}
    </div>
  );
}