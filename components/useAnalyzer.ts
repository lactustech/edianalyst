"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "../lib/analyze";
import type { WorkerResponse } from "../workers/parse.worker";

export type AnalyzerStatus = "idle" | "reading" | "working" | "done" | "error";

export interface AnalyzerState {
  status: AnalyzerStatus;
  progress: number;
  phase: string;
  fileName?: string;
  result?: AnalysisResult;
  error?: string;
}

const INITIAL: AnalyzerState = { status: "idle", progress: 0, phase: "" };

/**
 * Drives the parse worker. Reads the dropped file's text in the browser and
 * hands it to the worker — no bytes ever leave the device.
 */
export function useAnalyzer() {
  const [state, setState] = useState<AnalyzerState>(INITIAL);
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/parse.worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      // Ignore stale messages from a superseded file.
      if (msg.id !== reqId.current) return;

      if (msg.type === "progress") {
        setState((s) => ({ ...s, status: "working", progress: msg.percent, phase: msg.phase }));
      } else if (msg.type === "result") {
        setState((s) => ({ ...s, status: "done", progress: 100, result: msg.result }));
      } else {
        setState((s) => ({ ...s, status: "error", error: msg.message }));
      }
    };

    return () => worker.terminate();
  }, []);

  const analyzeFile = useCallback(async (file: File) => {
    const id = ++reqId.current;
    setState({ status: "reading", progress: 5, phase: "reading", fileName: file.name });
    try {
      const text = await file.text();
      workerRef.current?.postMessage({ id, text });
    } catch {
      setState((s) => ({ ...s, status: "error", error: "This file couldn't be read from disk." }));
    }
  }, []);

  const reset = useCallback(() => {
    reqId.current++;
    setState(INITIAL);
  }, []);

  return { state, analyzeFile, reset };
}
