"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface ServiceRow {
  slug: string;
  label: string; // "30", "AL", "MH"
  name: string;
  group: string; // group label
}

/**
 * Client-side search over the 270/271 service type codes. The whole list ships
 * in the static page (no API), so filtering is instant and offline — the same
 * privacy posture as the rest of the app. Search matches the code, the service
 * name, and the group, so "vision", "AL", or "eye" all work.
 */
export function ServiceTypeBrowser({ rows }: { rows: ServiceRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => (r.label + " " + r.name + " " + r.group).toLowerCase().includes(needle));
  }, [rows, q]);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a code or service — e.g. 30, office visit, pharmacy, AL"
        aria-label="Search service type codes"
        className="w-full border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent"
      />

      <p className="mt-3 label">
        {filtered.length} {filtered.length === 1 ? "code" : "codes"}
      </p>

      <ul className="mt-3 divide-y divide-line border-y border-line">
        {filtered.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/edi/270/service-type-codes/${r.slug}`}
              className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-4 py-3"
            >
              <span className="font-mono text-sm font-semibold text-accent">{r.label}</span>
              <span className="text-sm text-muted group-hover:text-ink">{r.name}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-sm text-muted">No codes match “{q}”. Try a code like 30, or a word like “dental”.</li>
        )}
      </ul>
    </div>
  );
}
