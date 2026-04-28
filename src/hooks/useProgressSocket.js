import { useEffect } from "react";
import { API_URL } from "../config";

const WS_URL = `${API_URL.replace(/^http/, "ws")}/ws`;

export function useProgressSocket({
  patchRecords,
  removeRecords,
  isReady,
}) {
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
          console.log(message)

          // Normalize stage — handles spaces, underscores, mixed case
          // "standardization completed" → "standardization_completed"
          // "standardization_completed" → "standardization_completed"
          const normalizedStage = message.stage
            ?.toLowerCase()
            .trim()
            .replace(/[\s_]+/g, "_");

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

          if (normalizedStage === "standardization_completed") {
            // Record has finished the pipeline — remove it from the list
            removeRecords?.([record.ExecutionId]);
          } else {
            // Still in pipeline — patch stage in place
            // patchRecords is a no-op if ExecutionId doesn't exist in the list
            patchRecords([record]);
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
  }, [isReady, patchRecords, removeRecords]);
}