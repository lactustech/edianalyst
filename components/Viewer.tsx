"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AckTransaction } from "../lib/transform/ack999";
import type { ClaimRow837 } from "../lib/transform/claim837";
import type { ClaimStatusRow } from "../lib/transform/claimStatus";
import type { EligibilityMember } from "../lib/transform/eligibility";
import type { PremiumLine } from "../lib/transform/premium820";
import type { ClaimRow } from "../lib/transform/remittance835";
import type { MemberRow } from "../lib/transform/member834";
import { Ack999Drawer } from "./Ack999Drawer";
import { Ack999Summary } from "./Ack999Summary";
import { Ack999Table } from "./Ack999Table";
import { ClaimStatusDrawer } from "./ClaimStatusDrawer";
import { ClaimStatusSummary } from "./ClaimStatusSummary";
import { ClaimStatusTable } from "./ClaimStatusTable";
import { EligibilityDrawer } from "./EligibilityDrawer";
import { EligibilitySummary } from "./EligibilitySummary";
import { EligibilityTable } from "./EligibilityTable";
import { ExportMenu } from "./ExportMenu";
import { exportResultCsv, exportResultXlsx } from "../lib/export";
import { Premium820Drawer } from "./Premium820Drawer";
import { Premium820Summary } from "./Premium820Summary";
import { Premium820Table } from "./Premium820Table";
import { AppHeader } from "./AppHeader";
import { Claim837Drawer } from "./Claim837Drawer";
import { Claim837Summary } from "./Claim837Summary";
import { Claim837Table } from "./Claim837Table";
import { ClaimDrawer } from "./ClaimDrawer";
import { ClaimsTable } from "./ClaimsTable";
import { DeveloperView } from "./DeveloperView";
import { DiffPanel } from "./DiffPanel";
import { FindingsList } from "./FindingsList";
import { Landing } from "./Landing";
import { MemberDrawer } from "./MemberDrawer";
import { MemberTable } from "./MemberTable";
import { PrivacyBadge } from "./PrivacyBadge";
import { RemittanceSummary } from "./RemittanceSummary";
import { SummaryBar } from "./SummaryBar";
import { useAnalyzer } from "./useAnalyzer";

type Tab = "data" | "findings" | "developer" | "compare";

export function Viewer() {
  const { state, analyzeFile, reset } = useAnalyzer();
  const [tab, setTab] = useState<Tab>("data");
  const [member, setMember] = useState<MemberRow | null>(null);
  const [claim, setClaim] = useState<ClaimRow | null>(null);
  const [claim837, setClaim837] = useState<ClaimRow837 | null>(null);
  const [ack, setAck] = useState<AckTransaction | null>(null);
  const [premiumLine, setPremiumLine] = useState<PremiumLine | null>(null);
  const [eligMember, setEligMember] = useState<EligibilityMember | null>(null);
  const [statusClaim, setStatusClaim] = useState<ClaimStatusRow | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number | undefined>();
  const [compareVisited, setCompareVisited] = useState(false);

  const openCompare = useCallback(() => {
    setCompareVisited(true);
    setTab("compare");
  }, []);

  // A sample can request the tab it should land on (e.g. the 835 demo opens to
  // Findings to lead with the denial decoder). Applied once analysis completes.
  const pendingTab = useRef<Tab | undefined>(undefined);

  const loadSample = useCallback(
    async (path: string, name: string, initialTab?: string) => {
      pendingTab.current = initialTab as Tab | undefined;
      const res = await fetch(path);
      await analyzeFile(new File([await res.text()], name, { type: "text/plain" }));
    },
    [analyzeFile],
  );

  const jumpToSegment = useCallback((segmentIndex: number) => {
    setHighlightIndex(segmentIndex);
    setTab("developer");
  }, []);

  const result = state.result;

  // When an analysis completes, land on the right tab: a sample's requested tab
  // if any, otherwise the data view (or Findings for an unsupported file).
  useEffect(() => {
    if (state.status !== "done" || !result) return;
    const hasData =
      result.enrollment || result.remittance || result.claims || result.acknowledgment ||
      result.premium || result.eligibility || result.claimStatus;
    setTab(pendingTab.current ?? (hasData ? "data" : "findings"));
    pendingTab.current = undefined;
  }, [state.status, result]);

  const refsWithFindings = new Set(
    (result?.report.findings ?? []).map((f) => f.memberRef).filter((r): r is string => Boolean(r)),
  );
  const busy = state.status === "reading" || state.status === "working";
  const dataLabel =
    result?.kind === "834"
      ? "Members"
      : result?.kind === "999"
        ? "Transactions"
        : result?.kind === "820"
          ? "Premiums"
          : result?.kind === "270" || result?.kind === "271"
            ? "Members"
            : result?.kind === "276" || result?.kind === "277" || result?.kind === "277CA"
              ? "Claims"
              : "Claims";

  return (
    <div className="min-h-screen">
      <AppHeader onReset={reset} showReset={state.status === "done"} />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        {state.status === "idle" && <Landing onFile={analyzeFile} onSample={loadSample} />}

        {busy && (
          <section className="mt-20 max-w-xl animate-fade-in">
            <div className="label">{state.phase}</div>
            <p className="mt-2 text-sm text-muted">
              Reading <span className="font-medium text-ink">{state.fileName}</span> — entirely on your device.
            </p>
            <div className="mt-4 h-1.5 w-full bg-fill">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${state.progress}%` }} />
            </div>
            <div className="mt-1.5 label tabular-nums">{state.progress}%</div>
          </section>
        )}

        {state.status === "error" && (
          <section className="mt-20 max-w-xl animate-slide-up border-l-2 border-rose-500 bg-fill p-6">
            <div className="label text-rose-600">Could not read file</div>
            <p className="mt-2 text-sm text-ink">{state.error}</p>
            <button
              onClick={reset}
              className="mt-5 bg-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide text-canvas transition-colors hover:bg-accent hover:text-accent-fg"
            >
              Try another file
            </button>
          </section>
        )}

        {state.status === "done" && result && (
          <section className="mt-8 space-y-6">
            {result.kind === "834" && result.enrollment ? (
              <SummaryBar doc={result.enrollment} report={result.report} fileName={state.fileName} />
            ) : result.kind === "835" && result.remittance ? (
              <RemittanceSummary doc={result.remittance} report={result.report} fileName={state.fileName} />
            ) : result.kind === "837" && result.claims ? (
              <Claim837Summary doc={result.claims} report={result.report} fileName={state.fileName} />
            ) : result.kind === "999" && result.acknowledgment ? (
              <Ack999Summary doc={result.acknowledgment} report={result.report} fileName={state.fileName} />
            ) : result.kind === "820" && result.premium ? (
              <Premium820Summary doc={result.premium} report={result.report} fileName={state.fileName} />
            ) : (result.kind === "270" || result.kind === "271") && result.eligibility ? (
              <EligibilitySummary doc={result.eligibility} report={result.report} fileName={state.fileName} />
            ) : result.claimStatus ? (
              <ClaimStatusSummary doc={result.claimStatus} report={result.report} fileName={state.fileName} />
            ) : (
              <div className="animate-slide-up border-l-2 border-amber-500 bg-fill p-6 text-sm text-ink">
                This file parsed, but it isn&apos;t a supported transaction yet (found{" "}
                {result.transactionCodes.join(", ") || "no recognized transaction set"}). You can still
                inspect everything in the developer view.
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-ink">
              {(result.enrollment || result.remittance || result.claims || result.acknowledgment || result.premium || result.eligibility || result.claimStatus) && (
                <TabButton label={dataLabel} active={tab === "data"} onClick={() => setTab("data")} />
              )}
              <TabButton
                label={`Findings${result.report.findings.length ? ` (${result.report.findings.length})` : ""}`}
                active={tab === "findings"}
                onClick={() => setTab("findings")}
              />
              <TabButton label="Developer" active={tab === "developer"} onClick={() => setTab("developer")} />
              {result.enrollment && (
                <TabButton label="Compare" active={tab === "compare"} onClick={openCompare} pro />
              )}
              <div className="ml-auto flex items-center gap-4 self-center pb-2">
                <ExportMenu
                  items={[
                    { label: "Download CSV (this table)", onClick: () => exportResultCsv(result) },
                    { label: "Download Excel (all sheets)", onClick: () => exportResultXlsx(result) },
                  ]}
                />
                <span className="hidden sm:block">
                  <PrivacyBadge />
                </span>
              </div>
            </div>

            <div className="animate-fade-in">
              {tab === "data" && result.enrollment && (
                <MemberTable
                  members={result.enrollment.members}
                  memberRefsWithFindings={refsWithFindings}
                  onSelect={setMember}
                />
              )}
              {tab === "data" && result.remittance && (
                <ClaimsTable
                  claims={result.remittance.claims}
                  claimsWithFindings={refsWithFindings}
                  onSelect={setClaim}
                />
              )}
              {tab === "data" && result.claims && (
                <Claim837Table
                  claims={result.claims.claims}
                  claimsWithFindings={refsWithFindings}
                  onSelect={setClaim837}
                />
              )}
              {tab === "data" && result.acknowledgment && (
                <Ack999Table
                  transactions={result.acknowledgment.transactions}
                  acksWithFindings={refsWithFindings}
                  onSelect={setAck}
                />
              )}
              {tab === "data" && result.premium && (
                <Premium820Table lines={result.premium.lines} onSelect={setPremiumLine} />
              )}
              {tab === "data" && result.eligibility && (
                <EligibilityTable
                  doc={result.eligibility}
                  membersWithFindings={refsWithFindings}
                  onSelect={setEligMember}
                />
              )}
              {tab === "data" && result.claimStatus && (
                <ClaimStatusTable
                  doc={result.claimStatus}
                  claimsWithFindings={refsWithFindings}
                  onSelect={setStatusClaim}
                />
              )}
              {tab === "findings" && <FindingsList report={result.report} onJump={jumpToSegment} />}
              {tab === "developer" && (
                <DeveloperView interchange={result.interchange} segments={result.segments} highlightIndex={highlightIndex} />
              )}
            </div>

            {result.enrollment && compareVisited && (
              <div className={tab === "compare" ? "animate-fade-in" : "hidden"}>
                <DiffPanel baseMembers={result.enrollment.members} baseName={state.fileName} />
              </div>
            )}
          </section>
        )}
      </main>

      {member && result && (
        <MemberDrawer row={member} segments={result.segments} onClose={() => setMember(null)} />
      )}
      {claim && result && (
        <ClaimDrawer claim={claim} segments={result.segments} onClose={() => setClaim(null)} />
      )}
      {claim837 && result && (
        <Claim837Drawer claim={claim837} segments={result.segments} onClose={() => setClaim837(null)} />
      )}
      {ack && result && (
        <Ack999Drawer txn={ack} segments={result.segments} onClose={() => setAck(null)} />
      )}
      {premiumLine && result && (
        <Premium820Drawer line={premiumLine} segments={result.segments} onClose={() => setPremiumLine(null)} />
      )}
      {eligMember && result && (
        <EligibilityDrawer
          member={eligMember}
          isResponse={result.kind === "271"}
          segments={result.segments}
          onClose={() => setEligMember(null)}
        />
      )}
      {statusClaim && result && (
        <ClaimStatusDrawer
          claim={statusClaim}
          isRequest={result.kind === "276"}
          segments={result.segments}
          onClose={() => setStatusClaim(null)}
        />
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  pro,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  pro?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-2.5 pt-1 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
        active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
      {pro && (
        <span className="border border-accent px-1 py-0.5 text-[9px] font-bold leading-none tracking-wide text-accent">
          Pro
        </span>
      )}
    </button>
  );
}
