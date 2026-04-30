import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL } from "../config";

const COUNTS_URL = `${API_URL}/pipeline-counts`;
const POLL_GAP_MS = 5000; // 5 seconds gap between polls

export function useBackgroundPolling({ refresh, mode, filter, loading, recordsCount }) {
  const [newRecordsAvailable, setNewRecordsAvailable] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  const timerRef = useRef(null);
  const lastLoadingState = useRef(loading);
  const lastAutoRefreshCount = useRef(null);
  const isFirstPollAfterLoad = useRef(true);

  const checkConditions = useCallback(async () => {
    // If a manual fetch started while we were waiting, don't do anything
    if (loading) return;

    // Skip the very first poll after a manual fetch/reload ONLY if we already have records.
    // If the screen is empty, we want to check immediately (in 5s) to populate it.
    if (isFirstPollAfterLoad.current) {
      isFirstPollAfterLoad.current = false;
      if (recordsCount > 0) {
        scheduleNextPoll();
        return;
      }
    }

    try {
      const res = await fetch(COUNTS_URL);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "success") {
        const counts = data.counts;
        const filterStr = filter.join(",").toLowerCase();

        let conditionMet = false;
        let relevantToCount = 0;

        // 1. Identify which stages to monitor based on active filters
        const isVal = filterStr.includes("validation");
        const isStan = filterStr.includes("standardization");
        const isPending = filter.includes("pending") || mode === "active";
        const isAccepted = filter.includes("accepted");
        const isRejected = filter.includes("rejected");
        const isOnHold = filter.includes("on_hold") || filter.includes("onhold");

        let activeChecks = [];

        // Special rule: if both Validation and Standardization are selected, only monitor Validation
        if (isVal) {
          activeChecks.push(counts?.VALIDATION_IN_PROGRESS);
        } else if (isStan) {
          activeChecks.push(counts?.STANDARDIZATION_IN_PROGRESS);
        }

        // Add other specific status filters to the check pool
        if (isPending) activeChecks.push(counts?.PENDING);
        if (isAccepted) activeChecks.push(counts?.ACCEPTED);
        if (isRejected) activeChecks.push(counts?.REJECTED);
        if (isOnHold) activeChecks.push(counts?.ON_HOLD);

        if (activeChecks.length > 0) {
          // Monitor the combined status of all relevant stages
          conditionMet = activeChecks.some(c => Number(c?.to || 0) > Number(c?.from || 0));
          relevantToCount = activeChecks.reduce((sum, c) => sum + Number(c?.to || 0), 0);
        } else if (mode === "landing") {
          // 2. General landing page logic (monitors requested core stages)
          const v = counts?.VALIDATION_IN_PROGRESS;
          const a = counts?.ACCEPTED;
          const r = counts?.REJECTED;
          const o = counts?.ON_HOLD;

          const vTo = Number(v?.to || 0);
          const vFrom = Number(v?.from || 0);
          const aTo = Number(a?.to || 0);
          const aFrom = Number(a?.from || 0);
          const rTo = Number(r?.to || 0);
          const rFrom = Number(r?.from || 0);
          const oTo = Number(o?.to || 0);
          const oFrom = Number(o?.from || 0);

          conditionMet = (vTo > vFrom) || (aTo > aFrom) || (rTo > rFrom) || (oTo > oFrom);
          relevantToCount = vTo + aTo + rTo + oTo;
        }

        // Secondary check: Use the DOM to see if any record cards are actually rendered or if the "No match" message is shown
        const domRecordCount = document.querySelectorAll('.record-card').length;
        const isNoMatchTextVisible = document.body.innerText.includes("No records match the selected filter");
        const isActuallyEmpty = recordsCount === 0 || domRecordCount === 0 || isNoMatchTextVisible;

        // Empty screen logic: Auto-refresh if screen is empty but server has records (relevantToCount > 0)
        // Safety: only refresh if the count has CHANGED since the last auto-refresh attempt to avoid infinite loops
        if (isActuallyEmpty && relevantToCount > 0 && relevantToCount !== lastAutoRefreshCount.current) {
          lastAutoRefreshCount.current = relevantToCount;
          setIsBackgroundLoading(true);
          refresh();
        } else if (conditionMet && !isActuallyEmpty) {
          // Populated screen: Show notification button on increase
          setNewRecordsAvailable(true);
        } else if (conditionMet && isActuallyEmpty && relevantToCount > (lastAutoRefreshCount.current || 0)) {
          // If we already tried an auto-refresh and it still resulted in 0, 
          // but now the count has increased AGAIN, try one more time.
          lastAutoRefreshCount.current = relevantToCount;
          setIsBackgroundLoading(true);
          refresh();
        } else if (!conditionMet) {
          // Hide button if no longer increasing
          setNewRecordsAvailable(false);
        }
      }
    } catch (err) {
      console.error("Background Polling Error:", err);
    } finally {
      // Schedule the next poll only AFTER this one is done
      scheduleNextPoll();
    }
  }, [mode, filter, recordsCount, refresh, loading]);

  const scheduleNextPoll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Don't schedule if manual fetch is active OR if mode is restricted (completed/onhold)
    if (loading || mode === "completed" || mode === "onhold") return;

    timerRef.current = setTimeout(() => {
      checkConditions();
    }, POLL_GAP_MS);
  }, [checkConditions, loading, mode]);

  useEffect(() => {
    // When manual loading finishes (or on mount), start the polling sequence
    if (lastLoadingState.current === true && loading === false) {
      setIsBackgroundLoading(false);
      setNewRecordsAvailable(false);
      isFirstPollAfterLoad.current = true; // Reset the skip flag
      scheduleNextPoll();
    }

    // If manual loading starts, kill any active timer immediately
    if (loading) {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    lastLoadingState.current = loading;
  }, [loading, scheduleNextPoll]);

  // Initial Mount
  useEffect(() => {
    if (!loading && mode !== "completed" && mode !== "onhold") {
      scheduleNextPoll();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    newRecordsAvailable,
    isBackgroundLoading,
    handleManualRefresh: () => {
      setNewRecordsAvailable(false);
      refresh();
    }
  };
}
