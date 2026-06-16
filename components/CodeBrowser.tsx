"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface BrowserRow {
  slug: string;
  label: string; // display token, e.g. "021", "IK403:7", "R"
  kind: string; // used by the tab filter
  short: string;
}

export interface BrowserTab {
  key: string; // "all" or a kind value
  label: string;
}

/**
 * Generic client-side search + kind-filter over a code list. The whole list
 * ships in the static page (no API), so filtering is instant and offline.
 * Reused by the 834 and 999 references; the denial/status/service-type pages
 * predate it and keep their own browsers.
 */
export function CodeBrowser({
  rows,
  basePath,
  tabs,
  placeholder,
  labelWidth = "5.5rem",
}: {
  rows: BrowserRow[];
  basePath: string; // e.g. "/edi/999/error-codes"
  tabs: BrowserTab[]; // first should be { key: "all", ... }
  placeholder: string;
  labelWidth?: string;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/[\s:_-]/g, "");
    return rows.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (!needle) return true;
      const hay = (r.label + r.short + r.kind).toLowerCase().replace(/[\s:_-]/g, "");
      return hay.includes(needle);
    });
  }, [rows, q, kind]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label="Search codes"
          className="w-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent"
        />
        {tabs.length > 1 && (
          <div className="flex shrink-0 border border-line">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setKind(t.key)}
                className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                  kind === t.key ? "bg-accent text-accent-fg" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 label">
        {filtered.length} {filtered.length === 1 ? "code" : "codes"}
      </p>

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {filtered.map((r) => (
          <li key={r.slug}>
            <Link
              href={`${basePath}/${r.slug}`}
              className="group grid items-baseline gap-4 py-3"
              style={{ gridTemplateColumns: `${labelWidth} 1fr` }}
            >
              <span className="font-mono text-sm font-semibold text-accent">{r.label}</span>
              <span className="text-sm text-muted group-hover:text-ink">{r.short}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-sm text-muted">No codes match “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
