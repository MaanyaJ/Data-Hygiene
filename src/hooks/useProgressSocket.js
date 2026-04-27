import { useEffect } from "react";

const WS_URL = "ws://192.168.0.158:8000/ws";

export function useProgressSocket({ patchRecords, isReady }) {
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
        console.log("[WS] ✅ Connected successfully");
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[WS] 📩 Message received:", message.type, message);

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

          console.log("[WS] 🔄 Patching record:", record.ExecutionId, "→ Stage:", record.Stage, "Status:", record.Status);
          patchRecords([record]);
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
        console.log(
          `[WS] ⚠️ Disconnected (code ${event.code}, reason: "${event.reason || "none"}"). Reconnecting in ${delay / 1000}s…`
        );
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [isReady, patchRecords]);
}