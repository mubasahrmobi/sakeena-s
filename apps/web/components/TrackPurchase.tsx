"use client";
import { useEffect } from "react";

/** Tells Google Analytics / Meta Pixel that an order was just placed (only runs if those are set up). */
export function TrackPurchase({ value, orderNo }: { value: number; orderNo: string }) {
  useEffect(() => {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
    w.gtag?.("event", "purchase", { transaction_id: orderNo, value, currency: "PKR" });
    w.fbq?.("track", "Purchase", { value, currency: "PKR" });
  }, [value, orderNo]);
  return null;
}
