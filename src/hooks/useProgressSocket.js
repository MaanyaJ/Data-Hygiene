import { useEffect, useRef } from "react";
import { API_URL } from "../config";

const WS_URL = "ws://192.168.0.133:8000/ws"

const ALWAYS_HIDDEN_STAGES = new Set([
  "validation failed",
  "standardization failed",
]);

const FILTER_CONDITIONS = {
  "validation inprogress":      (r) => r.Stage === "validation inprogress",
  "validation completed":       (r) => r.Stage === "validation completed",
  "standardization inprogress": (r) => r.Stage === "standardization inprogress",
  "pending":  (r) => r.Stage === "standardization completed" && r.Status === "PENDING",
  "accepted": (r) => r.Stage === "standardization completed" && r.Status === "ACCEPTED",
  "on hold":  (r) => r.Stage === "standardization completed" && r.Status === "ON HOLD",
  "l0 data":  (r) => r.Stage === "standardization completed" && r.Status === "L0 DATA",
};

// Expand comma-separated filter strings into individual normalized keys
// "validation_inprogress,validation_completed" → ["validation inprogress", "validation completed"]
const expandFilters = (activeFilters) => {
  return activeFilters
    .flatMap((f) => f.split(","))
    .map((f) => f.trim().replace(/_/g, " ").toLowerCase());
};

const matchesActiveFilters = (record, activeFilters) => {
  // Failed records never shown regardless of filters
  if (ALWAYS_HIDDEN_STAGES.has(record.Stage)) return false;
  // No filters → show everything non-failed
  if (!activeFilters || activeFilters.length === 0) return true;
  // Expand and apply OR logic
  const expanded = expandFilters(activeFilters);
  return expanded.some((f) => FILTER_CONDITIONS[f]?.(record));
};

export function useProgressSocket({
  patchRecords,
  removeRecords,
  isReady,      // plain boolean — true after first fetch, never resets
  activeFilters,
}) {
  const activeFiltersRef = useRef(activeFilters);

  // Keep ref in sync so message handler always sees latest filters
  // without needing to re-open the socket on every filter change
  useEffect(() => {
    activeFiltersRef.current = activeFilters;
  }, [activeFilters]);

  useEffect(() => {
    if (!isReady) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => console.log("[WS] Connected");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type !== "PIPELINE_UPDATE") return;

        // Map backend fields to match RecordCard's expected shape
        const record = {
          ExecutionId:       message.execution_id,
          Stage:             message.stage,
          Status:            message.status,
          InvalidFields:     message.invalidFields    ?? [],
          suggestionsCount:  message.suggestionsCount ?? false,
          updatedOn:         message.updatedOn,
          BenchmarkType:     message.benchmarkType,
          BenchmarkCategory: message.benchmarkCategory,
        };

        if (matchesActiveFilters(record, activeFiltersRef.current)) {
          patchRecords([record]);
        } else {
          removeRecords([record.ExecutionId]);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onerror = (err) => console.error("[WS] Error:", err);
    ws.onclose = () => console.log("[WS] Disconnected");

    return () => ws.close();
  }, [isReady, patchRecords, removeRecords]);
  // isReady only ever goes false→true once, so this effect
  // opens the socket once and keeps it open for the page lifetime
}