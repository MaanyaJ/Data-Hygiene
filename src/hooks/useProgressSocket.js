import { useEffect, useRef } from "react";
import { API_URL } from "../config";

const WS_URL = `${API_URL.replace(/^http/, "ws")}/ws`;

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

const expandFilters = (activeFilters) => {
  return activeFilters
    .flatMap((f) => f.split(","))
    .map((f) => f.trim().replace(/_/g, " ").toLowerCase());
};

const matchesActiveFilters = (record, activeFilters) => {
  if (ALWAYS_HIDDEN_STAGES.has(record.Stage)) return false;
  if (!activeFilters || activeFilters.length === 0) return true;
  const expanded = expandFilters(activeFilters);
  return expanded.some((f) => FILTER_CONDITIONS[f]?.(record));
};

export function useProgressSocket({
  patchRecords,
  removeRecords,    // used by RecordsListPage — remove records that no longer match filters
  onNewRecord,      // used by UploadPage — silent refresh when unknown record arrives
  currentRecords,
  isReady,
  activeFilters = [], // defaults to [] — no filters means show everything (UploadPage)
}) {
  const activeFiltersRef = useRef(activeFilters);
  const currentRecordsRef = useRef(currentRecords);

  // Keep refs in sync so message handler always sees latest values
  // without ever needing to re-open the WebSocket
  useEffect(() => {
    activeFiltersRef.current = activeFilters;
  }, [activeFilters]);

  useEffect(() => {
    currentRecordsRef.current = currentRecords;
  }, [currentRecords]);

  useEffect(() => {
    if (!isReady) return;

    let ws = null;
    let reconnectTimer = null;
    let retryCount = 0;
    let disposed = false;
    const MAX_RETRY_DELAY = 30_000;

    function connect() {
      if (disposed) return;

      console.log("[WS] Attempting connection to", WS_URL);
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("[WS] ✅ Connected");
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type !== "PIPELINE_UPDATE") return;

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

          const existsInList = currentRecordsRef.current?.some(
            (r) => r.ExecutionId === record.ExecutionId
          );

          const shouldBeVisible = matchesActiveFilters(
            record,
            activeFiltersRef.current
          );

          if (existsInList) {
            // Record already on screen
            if (shouldBeVisible) {
              patchRecords([record]); // update stage/status in place
            } else {
              removeRecords?.([record.ExecutionId]); // no longer matches filter
            }
          } else {
            // Record not on screen yet
            if (shouldBeVisible) {
              // UploadPage: silent refresh to fetch it with full data
              // RecordsListPage: onNewRecord is undefined, so this is a no-op
              onNewRecord?.();
            }
            // Doesn't match and not on screen — ignore completely
          }
        } catch (err) {
          console.error("[WS] ❌ Failed to parse message:", err, "Raw:", event.data);
        }
      };

      ws.onerror = (err) => console.error("[WS] ❌ Error:", err);

      ws.onclose = (event) => {
        if (disposed) {
          console.log("[WS] Closed (cleanup)");
          return;
        }
        const delay = Math.min(1000 * 2 ** retryCount, MAX_RETRY_DELAY);
        retryCount++;
        console.log(`[WS] ⚠️ Disconnected (code ${event.code}). Reconnecting in ${delay / 1000}s…`);
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [isReady, patchRecords, removeRecords, onNewRecord]);
}