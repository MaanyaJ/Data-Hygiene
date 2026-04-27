import { useEffect, useRef, useCallback } from "react";
import { API_URL } from "../config";

const POLL_MS = 1000;
const BATCH_URL = `${API_URL}/invalid-summary/batch`;

export function useProgressPolling({ visibleIds, patchRecords, removeRecords, isReady, extraParams }) {
  const visibleIdsRef = useRef([]);
  const pollAbortRef = useRef(null);

  // Keep ref in sync so the interval always sees latest IDs
  // without needing to re-register itself on every scroll
  useEffect(() => {
    visibleIdsRef.current = visibleIds;
  }, [visibleIds]);

  const poll = useCallback(async () => {
    const ids = visibleIdsRef.current;

    if (!isReady || ids.length === 0) return;

    if (pollAbortRef.current) pollAbortRef.current.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    try {
      const payload = { 
        execution_ids: ids,
        ...extraParams
      };
      console.log("[Batch Polling] POST Payload:", payload);
      
      const res = await fetch(BATCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) return;

      const data = await res.json();

      if (controller.signal.aborted) return;

      const updates = Array.isArray(data?.data) ? data.data : [];

      if (updates.length > 0) {
        patchRecords(updates);
      } else if (data && Array.isArray(data.data) && data.data.length === 0) {
        console.warn("[Batch Polling] Server returned empty data array. Removing records:", ids);
        removeRecords(ids);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("useProgressPolling:", err);
      }
    }
  }, [isReady, patchRecords, removeRecords, extraParams]);

  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(poll, POLL_MS);
    return () => {
      clearInterval(id);
      if (pollAbortRef.current) pollAbortRef.current.abort();
    };
  }, [poll, isReady]);
}