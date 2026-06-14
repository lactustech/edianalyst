"use client";

import type { BadgeTone } from "../lib/codelists/maintenanceType";

const TONE_CLASS: Record<BadgeTone, string> = {
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-rose-100 text-rose-800",
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-sky-100 text-sky-800",
  grey: "bg-slate-100 text-slate-700",
};

/** The colored maintenance-type badge an analyst scans for first (spec §5). */
export function MaintenanceBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${TONE_CLASS[tone]}`}>
      {label || "—"}
    </span>
  );
}
