/// <reference lib="webworker" />
/**
 * Parse worker (spec §7). Runs tokenize → structure → transform → validate off
 * the main thread so the UI stays responsive on 50 MB / 200k-segment files.
 *
 * The file TEXT is passed in and the readable RESULT is passed out — nothing is
 * ever sent over the network. This worker has no fetch/XHR by design.
 */
import { analyzeWithProgress, type AnalysisResult } from "../lib/analyze";
import { X12FormatError } from "../lib/x12/delimiters";

export type WorkerRequest = { id: number; text: string };

export type WorkerResponse =
  | { id: number; type: "progress"; phase: string; percent: number }
  | { id: number; type: "result"; result: AnalysisResult }
  | { id: number; type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, text } = event.data;
  try {
    const result = analyzeWithProgress(text, (phase, percent) => {
      ctx.postMessage({ id, type: "progress", phase, percent } satisfies WorkerResponse);
    });
    ctx.postMessage({ id, type: "result", result } satisfies WorkerResponse);
  } catch (err) {
    const message =
      err instanceof X12FormatError
        ? err.message
        : "Something went wrong reading this file. Please double-check it's a valid X12 EDI file.";
    ctx.postMessage({ id, type: "error", message } satisfies WorkerResponse);
  }
};
