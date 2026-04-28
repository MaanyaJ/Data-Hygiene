import { useEffect, useRef } from "react";
import { API_URL } from "../config";

const WS_URL = `${API_URL.replace(/^http/, "ws")}/ws`;

export function useProgressSocket({
  patchRecords,
  removeRecords,  // UploadPage: evict records that have left the pipeline
  onNewRecord,    // UploadPage only — silent refresh when a new record arrives
  currentRecords,
  isReady,
}) {
  const currentRecordsRef = useRef(currentRecords);

  // Keep ref in sync so the message handler always sees the latest list
  // without ever needing to re-open the WebSocket
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
            ExecutionId: message.execution_id,
            Stage: message.stage,
            Status: message.status,
            InvalidFields: message.invalidFields ?? [],
            suggestionsCount: message.suggestionsCount ?? false,
            updatedOn: message.updatedOn,
            BenchmarkType: message.benchmarkType,
            BenchmarkCategory: message.benchmarkCategory,
          };

          const existsInList = currentRecordsRef.current?.some(
            (r) => r.ExecutionId === record.ExecutionId
          );

          if (existsInList) {
            if (record.Stage === "standardization completed") {
              // Record has exited the pipeline — remove it from the UploadPage list
              removeRecords?.([record.ExecutionId]);
            } else {
              // Still in pipeline — update stage/status in place
              patchRecords([record]);
            }
          } else {
            // Record not on screen yet
            // UploadPage: silent refresh to fetch it with full data
            // All other pages: onNewRecord is undefined, so this is a no-op
            onNewRecord?.();
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