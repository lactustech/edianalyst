"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface StatusRow {
  slug: string;
  label: string; // "A3" or "21"
  kind: "category" | "status";
  short: string;
  outcome: string; // outcome label
}

/**
 * Client-side search + filter over the 277 claim status codes. The whole list
 * ships in the static page (no API), so filtering is instant and offline — the
 * same privacy posture as the rest of the app.
 */
export function StatusCodeBrowser({ rows }: { rows: StatusRow[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "category" | "status">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/[\s:]/g, "");
    return rows.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (!needle) return true;
      const hay = (r.label + r.short + r.outcome).toLowerCase().replace(/[\s:]/g, "");
      return hay.includes(needle);
    });
  }, [rows, q, kind]);

  const tabs: { key: "all" | "category" | "status"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a code or words — e.g. A3, 21, denied, pending"
          aria-label="Search claim status codes"
          className="w-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent"
        />
        <div className="flex shrink-0 border border-line">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setKind(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                kind === t.key ? "bg-accent text-accent-fg" : "text-muted hover:text-ink"
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
            <Link
              href={`/edi/277/status-codes/${r.slug}`}
              className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-4 py-3"
            >
              <span className="font-mono text-sm font-semibold text-accent">{r.label}</span>
              <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-sm text-muted">No codes match “{q}”. Try a code like A3 or 21, or a word like “rejected”.</li>
        )}
      </ul>
    </div>
  );
}
