import { useEffect, useRef, useCallback } from "react";
import { API_URL } from "../config";

const POLL_MS = 2000;
const BATCH_URL = `${API_URL}/invalid-summary/batch`;

export function useProgressPolling({ visibleIds, patchRecords, removeRecords, isReady, extraParams }) {
  const visibleIdsRef = useRef([]);
  const isFetchingRef = useRef(false); // ✅ new

  // Keep ref in sync so the interval always sees latest IDs
  useEffect(() => {
    visibleIdsRef.current = visibleIds;
  }, [visibleIds]);

  const poll = useCallback(async () => {
    const ids = visibleIdsRef.current;

    if (!isReady || ids.length === 0) return;

    // 🚫 Don't start a new request if one is already running
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

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
      });

      if (!res.ok) return;

      const data = await res.json();

      const updates = Array.isArray(data?.data) ? data.data : [];

      if (updates.length > 0) {
        patchRecords(updates);
      } else if (data && Array.isArray(data.data) && data.data.length === 0) {
        console.warn("[Batch Polling] Server returned empty data array. Removing records:", ids);
        removeRecords(ids);
      }
    } catch (err) {
      console.error("useProgressPolling:", err);
    } finally {
      // ✅ allow next poll
      isFetchingRef.current = false;
    }
  }, [isReady, patchRecords, removeRecords, extraParams]);

  useEffect(() => {
    if (!isReady) return;

    const id = setInterval(poll, POLL_MS);

    return () => {
      clearInterval(id);
    };
  }, [poll, isReady]);
}