"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import type { ClaimRow837 } from "../lib/transform/claim837";
import { usd } from "../lib/util/format";

const ROW_HEIGHT = 48;
type SortKey = "claimId" | "patientName" | "payerName" | "totalCharge";

export function Claim837Table({
  claims,
  claimsWithFindings,
  onSelect,
}: {
  claims: ClaimRow837[];
  claimsWithFindings: Set<string>;
  onSelect: (claim: ClaimRow837) => void;
}) {
  const [search, setSearch] = useState("");
  const [payerFilter, setPayerFilter] = useState("all");
  const [onlyFindings, setOnlyFindings] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("claimId");
  const [sortAsc, setSortAsc] = useState(true);

  const payerOptions = useMemo(
    () => Array.from(new Set(claims.map((c) => c.payerName).filter(Boolean))).sort(),
    [claims],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = claims.filter((c) => {
      if (payerFilter !== "all" && c.payerName !== payerFilter) return false;
      if (onlyFindings && !claimsWithFindings.has(c.claimId)) return false;
      if (!q) return true;
      return (
        c.claimId.toLowerCase().includes(q) ||
        c.patientName.toLowerCase().includes(q) ||
        c.payerName.toLowerCase().includes(q)
      );
    });
    const dir = sortAsc ? 1 : -1;
    const val = (c: ClaimRow837): string | number => {
      switch (sortKey) {
        case "claimId": return c.claimId;
        case "patientName": return c.patientName;
        case "payerName": return c.payerName;
        case "totalCharge": return c.totalCharge;
      }
    };
    out = [...out].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return out;
  }, [claims, search, payerFilter, onlyFindings, sortKey, sortAsc, claimsWithFindings]);

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

  const cols = "grid grid-cols-[1.1fr_1.3fr_1.4fr_1.1fr_0.7fr_1fr] gap-2";

  return (
    <div className="border border-ink">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-fill/40 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search claim, patient, or payer…"
          className="w-64 border border-line bg-canvas px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-sm text-muted">
          Payer
          <select
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="max-w-[12rem] border border-line bg-canvas px-2 py-1 text-sm focus:border-accent focus:outline-none"
          >
            <option value="all">All</option>
            {payerOptions.map((o) => (
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
        <HeaderCell label="Payer" active={sortKey === "payerName"} asc={sortAsc} onClick={() => toggleSort("payerName")} />
        <span className="label">Setting</span>
        <span className="label text-right">Lines</span>
        <HeaderCell label="Charged" active={sortKey === "totalCharge"} asc={sortAsc} onClick={() => toggleSort("totalCharge")} right />
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
                <span className="truncate text-muted">{c.payerName || "—"}</span>
                <span className="truncate text-muted">{c.setting || "—"}</span>
                <span className="text-right tabular-nums text-muted">{c.serviceLines.length}</span>
                <span className="text-right font-medium tabular-nums text-ink">{usd(c.totalCharge)}</span>
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
