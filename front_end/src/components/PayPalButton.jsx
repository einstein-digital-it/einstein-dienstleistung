import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * PayPalButton - renders PayPal hosted buttons
 * Props:
 *   amount       - number (EUR)
 *   bookingId    - string
 *   onSuccess    - callback(orderId)
 *   onError      - callback(err)
 *   lang         - "de"|"ar"|"en"
 */
export default function PayPalButton({ amount, bookingId, onSuccess, onError, lang = "de" }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  // PayPal client-id (sandbox). Replace with live when ready.
  const CLIENT_ID = "sb"; // "sb" = sandbox test mode - replace with your PayPal client ID

  useEffect(() => {
    // Avoid double-loading
    if (document.getElementById("paypal-sdk")) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=EUR`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
      setLoading(false);
    };
    script.onerror = () => {
      onError?.("PayPal SDK failed to load");
      setLoading(false);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;

    // Clear previous buttons
    containerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "pay",
        height: 48
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: Number(amount).toFixed(2),
              currency_code: "EUR"
            },
            description: `Booking ${bookingId}`
          }]
        });
      },
      onApprove: async (data, actions) => {
        const order = await actions.order.capture();
        onSuccess?.(order.id);
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        onError?.(err);
      }
    }).render(containerRef.current);
  }, [sdkReady, amount, bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 me-2" />
        <span className="text-gray-500 text-sm">
          {lang === "ar" ? "جاري تحميل PayPal..." : lang === "en" ? "Loading PayPal..." : "PayPal wird geladen..."}
        </span>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" />;
}