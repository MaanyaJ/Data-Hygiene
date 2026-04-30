import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL } from "../config";

const COUNTS_URL = `${API_URL}/pipeline-counts`;
const POLL_GAP_MS = 5000; // 5 seconds gap between polls

export function useBackgroundPolling({ refresh, mode, filter, loading, recordsCount }) {
  const [newRecordsAvailable, setNewRecordsAvailable] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  
  const timerRef = useRef(null);
  const lastLoadingState = useRef(loading);

  const checkConditions = useCallback(async () => {
    // If a manual fetch started while we were waiting, don't do anything
    if (loading) return;

    try {
      const res = await fetch(COUNTS_URL);
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === "success") {
        const counts = data.counts;
        const v = counts?.VALIDATION_IN_PROGRESS;
        const s = counts?.STANDARDIZATION_IN_PROGRESS;

        const filterStr = filter.join(",");
        const isValidationActive = filterStr.includes("validation") || mode === "active" || filter.includes("pending");
        const isStandardizationOnly = (filterStr.includes("standardization") && !filterStr.includes("validation")) || 
                                      filter.includes("accepted") || 
                                      filter.includes("rejected") || 
                                      filter.includes("On Hold");

        let conditionMet = false;
        if (mode === "landing") {
          conditionMet = (v?.to > v?.from) || (s?.to > s?.from);
        } else if (isStandardizationOnly) {
          conditionMet = s?.to > 0;
        } else if (isValidationActive) {
          conditionMet = v?.to > v?.from;
        }

        if (conditionMet) {
          if (recordsCount === 0) {
            // Auto-loader type refetch: Refresh immediately if list is empty
            setIsBackgroundLoading(true);
            refresh();
          } else {
            // Twitter style: Show button if records already exist
            setNewRecordsAvailable(true);
          }
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
    
    // Don't schedule if a manual fetch is active
    if (loading) return;

    timerRef.current = setTimeout(() => {
      checkConditions();
    }, POLL_GAP_MS);
  }, [checkConditions, loading]);

  useEffect(() => {
    // When manual loading finishes (or on mount), start the polling sequence
    if (lastLoadingState.current === true && loading === false) {
      setIsBackgroundLoading(false);
      setNewRecordsAvailable(false);
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
    if (!loading) {
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
