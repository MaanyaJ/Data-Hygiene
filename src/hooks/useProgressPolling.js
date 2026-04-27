import { useEffect, useRef, useCallback } from "react";
import { API_URL } from "../config";

const POLL_MS = 2000;
const BATCH_URL = `${API_URL}/invalid-summary/batch`;

export function useProgressPolling({ visibleIds, patchRecords, isReady }) {
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
      const res = await fetch(BATCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execution_ids: ids }),
        signal: controller.signal,
      });

      if (!res.ok) return; // silently skip failed polls

      const data = await res.json();

      if (controller.signal.aborted) return;

      const updates = Array.isArray(data?.data) ? data.data : [];

      if (updates.length > 0) {
        patchRecords(updates);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("useProgressPolling:", err);
      }
      // Always swallow — polling errors must never disrupt the UI
    }
  }, [isReady, patchRecords]);

  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(poll, POLL_MS);
    return () => {
      clearInterval(id);
      if (pollAbortRef.current) pollAbortRef.current.abort();
    };
  }, [poll, isReady]);
}