"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { Eligibility, EligibilityMember } from "../lib/transform/eligibility";
import { coverageTone } from "./EligibilitySummary";

const ROW_HEIGHT = 48;

export function EligibilityTable({
  doc,
  membersWithFindings,
  onSelect,
}: {
  doc: Eligibility;
  membersWithFindings: Set<string>;
  onSelect: (m: EligibilityMember) => void;
}) {
  const isResponse = doc.variant === "response";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doc.members.filter((m) => {
      if (isResponse && statusFilter !== "all" && m.coverageStatus !== statusFilter) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q) || m.memberId.toLowerCase().includes(q);
    });
  }, [doc.members, search, statusFilter, isResponse]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const cols = "grid grid-cols-[1.6fr_1fr_1.2fr_1.4fr] gap-2";
  const ref = (m: EligibilityMember) => m.memberId || m.name;

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or member ID…"
          className="w-64 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        {isResponse && (
          <label className="flex items-center gap-1.5 text-sm text-muted">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-line bg-canvas px-2 py-1 text-sm focus:border-accent focus:outline-none"
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        )}
        <span className="ml-auto label">{rows.length} of {doc.members.length} members</span>
      </div>

      <div className={`${cols} border-b border-line px-4 py-2`}>
        <span className="label">Member</span>
        <span className="label">Member ID</span>
        <span className="label">Relationship</span>
        <span className="label">{isResponse ? "Coverage" : "Requested"}</span>
      </div>

      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const m = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(m)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`${cols} items-center border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill`}
              >
                <span className="truncate font-medium text-ink">
                  {m.name || "—"}
                  {membersWithFindings.has(ref(m)) && (
                    <span className="ml-1.5 text-amber-600" title="Has a finding">⚠</span>
                  )}
                </span>
                <span className="truncate tabular-nums text-muted">{m.memberId || "—"}</span>
                <span className="truncate text-muted">{m.relationship}</span>
                <span>
                  {isResponse ? (
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${coverageTone(m.coverageStatus)}`}>
                      {m.coverageStatus}
                    </span>
                  ) : (
                    <span className="text-muted">{m.lines.length} service{m.lines.length === 1 ? "" : "s"}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
