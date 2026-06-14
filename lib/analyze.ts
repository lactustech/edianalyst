import { parseX12 } from "./x12";
import type { Interchange, RawSegment } from "./x12/types";
import { first834, transform834, type Document834 } from "./transform/member834";
import { first835, transform835, type Remittance835 } from "./transform/remittance835";
import { first837, transform837, type Claims837 } from "./transform/claim837";
import { first999, transform999, type Acknowledgment999 } from "./transform/ack999";
import { first820, transform820, type Premium820 } from "./transform/premium820";
import { first270, first271, transformEligibility, type Eligibility } from "./transform/eligibility";
import { first276, first277, is277CA, transformClaimStatus, type ClaimStatus } from "./transform/claimStatus";
import { validate834, validate835, validate837, validate999, validate820, validateEligibility, validateClaimStatus, type ValidationReport } from "./validate/engine";
import type { Finding } from "./validate/types";

/** Everything the UI needs from one EDI file, computed in a single pass. */
export interface AnalysisResult {
  interchange: Interchange;
  segments: RawSegment[];
  /** Which supported transaction the readable view is showing. */
  kind: "834" | "835" | "837" | "999" | "820" | "270" | "271" | "276" | "277" | "277CA" | "other";
  /** The readable 834 model, when the file is an enrollment file. */
  enrollment?: Document834;
  /** The readable 835 model, when the file is a remittance. */
  remittance?: Remittance835;
  /** The readable 837 model, when the file is a claim batch. */
  claims?: Claims837;
  /** The readable 999 model, when the file is an acknowledgment. */
  acknowledgment?: Acknowledgment999;
  /** The readable 820 model, when the file is a premium payment. */
  premium?: Premium820;
  /** The readable 270/271 model, when the file is an eligibility inquiry/response. */
  eligibility?: Eligibility;
  /** The readable 276/277/277CA model, when the file is a claim-status transaction. */
  claimStatus?: ClaimStatus;
  report: ValidationReport;
  /** Transaction set code(s) present, for the "unsupported type" message. */
  transactionCodes: string[];
}

export type AnalysisPhase = "tokenizing" | "structuring" | "transforming" | "validating" | "done";

/** Parse → route by transaction type → transform → validate. Pure and DOM-free
 *  so it runs anywhere (worker, tests, node). */
export function analyze(text: string): AnalysisResult {
  return analyzeWithProgress(text, () => {});
}

export function analyzeWithProgress(
  text: string,
  onProgress: (phase: AnalysisPhase, percent: number) => void,
): AnalysisResult {
  onProgress("tokenizing", 15);
  const { interchange, segments, findings } = parseX12(text);

  onProgress("structuring", 45);
  const transactionCodes = Array.from(
    new Set(interchange.groups.flatMap((g) => g.transactions.map((t) => t.code))),
  );

  const base = { interchange, segments, transactionCodes };

  // Route to the first supported transaction set present.
  const txn834 = first834(interchange);
  const txn835 = first835(interchange);
  const txn837 = first837(interchange);
  const txn999 = first999(interchange);
  const txn820 = first820(interchange);
  const txn270 = first270(interchange);
  const txn271 = first271(interchange);
  const txn276 = first276(interchange);
  const txn277 = first277(interchange);

  if (txn834) {
    onProgress("transforming", 70);
    const enrollment = transform834(txn834);
    onProgress("validating", 90);
    const report = validate834(txn834, enrollment, findings);
    onProgress("done", 100);
    return { ...base, kind: "834", enrollment, report };
  }

  if (txn835) {
    onProgress("transforming", 70);
    const remittance = transform835(txn835);
    onProgress("validating", 90);
    const report = validate835(remittance, findings);
    onProgress("done", 100);
    return { ...base, kind: "835", remittance, report };
  }

  if (txn837) {
    onProgress("transforming", 70);
    const claims = transform837(txn837);
    onProgress("validating", 90);
    const report = validate837(claims, findings);
    onProgress("done", 100);
    return { ...base, kind: "837", claims, report };
  }

  if (txn999) {
    onProgress("transforming", 70);
    const acknowledgment = transform999(txn999);
    onProgress("validating", 90);
    const report = validate999(acknowledgment, findings);
    onProgress("done", 100);
    return { ...base, kind: "999", acknowledgment, report };
  }

  if (txn820) {
    onProgress("transforming", 70);
    const premium = transform820(txn820);
    onProgress("validating", 90);
    const report = validate820(premium, findings);
    onProgress("done", 100);
    return { ...base, kind: "820", premium, report };
  }

  if (txn270 || txn271) {
    const variant = txn271 ? "response" : "inquiry";
    onProgress("transforming", 70);
    const eligibility = transformEligibility((txn271 ?? txn270)!, variant);
    onProgress("validating", 90);
    const report = validateEligibility(eligibility, findings);
    onProgress("done", 100);
    return { ...base, kind: txn271 ? "271" : "270", eligibility, report };
  }

  if (txn276 || txn277) {
    const ca = txn277 ? is277CA(txn277) : false;
    const variant = txn276 ? "request" : ca ? "acknowledgment" : "response";
    onProgress("transforming", 70);
    const claimStatus = transformClaimStatus((txn277 ?? txn276)!, variant);
    onProgress("validating", 90);
    const report = validateClaimStatus(claimStatus, findings);
    onProgress("done", 100);
    const kind = txn276 ? "276" : ca ? "277CA" : "277";
    return { ...base, kind, claimStatus, report };
  }

  onProgress("done", 100);
  return { ...base, kind: "other", report: { findings, counts: countSeverities(findings) } };
}

function countSeverities(findings: Finding[]) {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}
