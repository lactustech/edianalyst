"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface CodeRow {
  slug: string;
  label: string; // "CO-45" or "N130"
  code: string; // "45"
  system: "CARC" | "RARC";
  short: string;
  category: string; // category label
}

/**
 * Client-side search + filter over the denial-code list. The whole list ships
 * in the static page (no API), so filtering is instant and works offline — the
 * same privacy posture as the rest of the app.
 */
export function DenialCodeBrowser({ rows }: { rows: CodeRow[] }) {
  const [q, setQ] = useState("");
  const [system, setSystem] = useState<"all" | "CARC" | "RARC">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/[\s-]/g, "");
    return rows.filter((r) => {
      if (system !== "all" && r.system !== system) return false;
      if (!needle) return true;
      const hay = (r.label + r.code + r.short + r.category).toLowerCase().replace(/[\s-]/g, "");
      return hay.includes(needle);
    });
  }, [rows, q, system]);

  const tabs: { key: "all" | "CARC" | "RARC"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "CARC", label: "CARC" },
    { key: "RARC", label: "RARC" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a code or words — e.g. CO-45, deductible, N130"
          aria-label="Search denial codes"
          className="w-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent"
        />
        <div className="flex shrink-0 border border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setSystem(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                system === t.key ? "bg-accent text-accent-fg" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 label">
        {filtered.length} {filtered.length === 1 ? "code" : "codes"}
      </p>

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {filtered.map((r) => (
          <li key={r.slug}>
            <Link href={`/edi/835/denial-codes/${r.slug}`} className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-4 py-3">
              <span className="font-mono text-sm font-semibold text-accent">{r.label}</span>
              <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-sm text-muted">No codes match “{q}”. Try a number like 45, or a word like “authorization”.</li>
        )}
      </ul>
    </div>
  );
}
