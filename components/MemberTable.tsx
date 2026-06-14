"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { MemberRow } from "../lib/transform/member834";
import { MaintenanceBadge } from "./MaintenanceBadge";

type SortKey = "name" | "relationship" | "maintenanceType" | "memberId" | "eligibilityBegin";
const ROW_HEIGHT = 52;

interface Props {
  members: MemberRow[];
  memberRefsWithFindings: Set<string>;
  onSelect: (row: MemberRow) => void;
}

function hasFinding(row: MemberRow, refs: Set<string>): boolean {
  return refs.has(row.subscriberId) || refs.has(row.memberId);
}

export function MemberTable({ members, memberRefsWithFindings, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [maintFilter, setMaintFilter] = useState("all");
  const [relFilter, setRelFilter] = useState("all");
  const [onlyFindings, setOnlyFindings] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [groupBySubscriber, setGroupBySubscriber] = useState(false);

  const maintOptions = useMemo(
    () => Array.from(new Set(members.map((m) => m.maintenanceType).filter(Boolean))).sort(),
    [members],
  );
  const relOptions = useMemo(
    () => Array.from(new Set(members.map((m) => m.relationship).filter(Boolean))).sort(),
    [members],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = members.filter((m) => {
      if (maintFilter !== "all" && m.maintenanceType !== maintFilter) return false;
      if (relFilter !== "all" && m.relationship !== relFilter) return false;
      if (onlyFindings && !hasFinding(m, memberRefsWithFindings)) return false;
      if (!q) return true;
      return (
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.memberId.toLowerCase().includes(q) ||
        m.subscriberId.toLowerCase().includes(q)
      );
    });

    const dir = sortAsc ? 1 : -1;
    const val = (m: MemberRow): string => {
      switch (sortKey) {
        case "name": return `${m.lastName} ${m.firstName}`;
        case "relationship": return m.relationship;
        case "maintenanceType": return m.maintenanceType;
        case "memberId": return m.memberId;
        case "eligibilityBegin": return m.eligibilityBegin ?? "";
      }
    };
    out = [...out].sort((a, b) => {
      // Subscriber grouping keeps dependents under their subscriber.
      if (groupBySubscriber && a.subscriberId !== b.subscriberId) {
        return a.subscriberId < b.subscriberId ? -1 : 1;
      }
      const av = val(a);
      const bv = val(b);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return out;
  }, [members, search, maintFilter, relFilter, onlyFindings, sortKey, sortAsc, groupBySubscriber, memberRefsWithFindings]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((s) => !s);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="surface overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line/70 bg-fill/30 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or ID…"
          className="w-56 rounded-md border border-line px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <Select label="Change type" value={maintFilter} onChange={setMaintFilter} options={maintOptions} />
        <Select label="Relationship" value={relFilter} onChange={setRelFilter} options={relOptions} />
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={onlyFindings} onChange={(e) => setOnlyFindings(e.target.checked)} />
          Only rows with findings
        </label>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={groupBySubscriber} onChange={(e) => setGroupBySubscriber(e.target.checked)} />
          Group by subscriber
        </label>
        <span className="ml-auto text-xs text-muted">
          {rows.length} of {members.length} members
        </span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1fr_2fr] gap-2 border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <HeaderCell label="Member" active={sortKey === "name"} asc={sortAsc} onClick={() => toggleSort("name")} />
        <HeaderCell label="Member ID" active={sortKey === "memberId"} asc={sortAsc} onClick={() => toggleSort("memberId")} />
        <HeaderCell label="Relationship" active={sortKey === "relationship"} asc={sortAsc} onClick={() => toggleSort("relationship")} />
        <HeaderCell label="Change" active={sortKey === "maintenanceType"} asc={sortAsc} onClick={() => toggleSort("maintenanceType")} />
        <HeaderCell label="Eligible from" active={sortKey === "eligibilityBegin"} asc={sortAsc} onClick={() => toggleSort("eligibilityBegin")} />
        <span>Coverage</span>
      </div>

      {/* Virtualized rows */}
      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const m = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(m)}
                data-testid="member-row"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1fr_2fr] items-center gap-2 border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill"
              >
                <span className="truncate font-medium text-ink">
                  {m.lastName}, {m.firstName} {m.middle ?? ""}
                  {hasFinding(m, memberRefsWithFindings) && (
                    <span className="ml-1.5 text-amber-600" title="Has a validation finding">⚠</span>
                  )}
                </span>
                <span className="truncate tabular-nums text-muted">{m.memberId}</span>
                <span className="truncate text-muted">{m.relationship}</span>
                <span><MaintenanceBadge label={m.maintenanceType} tone={m.maintenanceTone} /></span>
                <span className="tabular-nums text-muted">{m.eligibilityBegin ?? "—"}</span>
                <span className="flex flex-wrap gap-1">
                  {m.coverages.length === 0 && <span className="text-muted">—</span>}
                  {m.coverages.map((c, i) => (
                    <span key={i} className="rounded bg-fill px-1.5 py-0.5 text-xs text-muted">
                      {c.line}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line px-2 py-1 text-sm focus:border-accent focus:outline-none"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function HeaderCell({ label, active, asc, onClick }: { label: string; active: boolean; asc: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-left hover:text-ink">
      {label}
      {active && <span aria-hidden>{asc ? "▲" : "▼"}</span>}
    </button>
  );
}
