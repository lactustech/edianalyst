"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { ClaimRow } from "../lib/transform/remittance835";
import { usd } from "../lib/util/format";

const ROW_HEIGHT = 48;

/** Color the status badge: paid = green, denied = red, reversal = amber. */
export function statusTone(code: string): string {
  if (code === "4") return "bg-rose-100 text-rose-800";
  if (code === "22") return "bg-amber-100 text-amber-900";
  if (["1", "2", "3", "19", "20", "21"].includes(code)) return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-600";
}

type SortKey = "claimId" | "patientName" | "status" | "totalPaid" | "totalCharge";

export function ClaimsTable({
  claims,
  claimsWithFindings,
  onSelect,
}: {
  claims: ClaimRow[];
  claimsWithFindings: Set<string>;
  onSelect: (claim: ClaimRow) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlyFindings, setOnlyFindings] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("claimId");
  const [sortAsc, setSortAsc] = useState(true);

  const statusOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.status).filter(Boolean))).sort(),
    [claims],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = claims.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (onlyFindings && !claimsWithFindings.has(c.claimId)) return false;
      if (!q) return true;
      return (
        c.claimId.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.payerClaimControlNumber.toLowerCase().includes(q)
      );
    });
    const dir = sortAsc ? 1 : -1;
    const val = (c: ClaimRow): string | number => {
      switch (sortKey) {
        case "claimId": return c.claimId;
        case "patientName": return c.patientName;
        case "status": return c.status;
        case "totalPaid": return c.totalPaid;
        case "totalCharge": return c.totalCharge;
      }
    };
    out = [...out].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return out;
  }, [claims, search, statusFilter, onlyFindings, sortKey, sortAsc, claimsWithFindings]);

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

  const cols = "grid grid-cols-[1.2fr_1.4fr_1.3fr_1fr_1fr_1fr] gap-2";

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search claim, patient, or control #…"
          className="w-64 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-sm text-muted">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-line bg-canvas px-2 py-1 text-sm focus:border-accent focus:outline-none"
          >
            <option value="all">All</option>
            {statusOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={onlyFindings} onChange={(e) => setOnlyFindings(e.target.checked)} />
          Only claims with findings
        </label>
        <span className="ml-auto label">{rows.length} of {claims.length} claims</span>
      </div>

      <div className={`${cols} border-b border-line px-4 py-2`}>
        <HeaderCell label="Claim" active={sortKey === "claimId"} asc={sortAsc} onClick={() => toggleSort("claimId")} />
        <HeaderCell label="Patient" active={sortKey === "patientName"} asc={sortAsc} onClick={() => toggleSort("patientName")} />
        <HeaderCell label="Status" active={sortKey === "status"} asc={sortAsc} onClick={() => toggleSort("status")} />
        <HeaderCell label="Charged" active={sortKey === "totalCharge"} asc={sortAsc} onClick={() => toggleSort("totalCharge")} right />
        <HeaderCell label="Paid" active={sortKey === "totalPaid"} asc={sortAsc} onClick={() => toggleSort("totalPaid")} right />
        <span className="label text-right">Patient resp</span>
      </div>

      <div ref={scrollRef} className="scroll-slim h-[560px] overflow-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const c = rows[vi.index]!;
            return (
              <button
                key={vi.key}
                onClick={() => onSelect(c)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: ROW_HEIGHT, transform: `translateY(${vi.start}px)` }}
                className={`${cols} items-center border-b border-line px-4 text-left text-sm transition-colors hover:bg-fill`}
              >
                <span className="truncate font-medium tabular-nums text-ink">
                  {c.claimId}
                  {claimsWithFindings.has(c.claimId) && (
                    <span className="ml-1.5 text-amber-600" title="Has a finding">⚠</span>
                  )}
                </span>
                <span className="truncate text-muted">{c.patientName || "—"}</span>
                <span>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${statusTone(c.statusCode)}`}>
                    {c.status}
                  </span>
                </span>
                <span className="text-right tabular-nums text-muted">{usd(c.totalCharge)}</span>
                <span className="text-right font-medium tabular-nums text-ink">{usd(c.totalPaid)}</span>
                <span className="text-right tabular-nums text-muted">{usd(c.patientResponsibility)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  active,
  asc,
  onClick,
  right,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
  right?: boolean;
}) {
  return (
    <button onClick={onClick} className={`label flex items-center gap-1 hover:text-ink ${right ? "justify-end" : ""}`}>
      {label}
      {active && <span aria-hidden>{asc ? "▲" : "▼"}</span>}
    </button>
  );
}
