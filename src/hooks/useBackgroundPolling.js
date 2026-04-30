import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL } from "../config";

const BACKGROUND_POLL_MS = 2000;
const COUNTS_URL = `${API_URL}/pipeline-counts`;

export function useBackgroundPolling({ refresh, mode, filter, loading, recordsCount }) {
  const [newRecordsAvailable, setNewRecordsAvailable] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  
  const initialDelayRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastLoadingState = useRef(loading);

  const shouldTriggerRefresh = useCallback((counts) => {
    const v = counts?.VALIDATION_IN_PROGRESS;
    const s = counts?.STANDARDIZATION_IN_PROGRESS;

    const filterStr = filter.join(",");
    const isValidationActive = filterStr.includes("validation") || mode === "active" || filter.includes("pending");
    const isStandardizationOnly = (filterStr.includes("standardization") && !filterStr.includes("validation")) || 
                                  filter.includes("accepted") || 
                                  filter.includes("rejected") || 
                                  filter.includes("On Hold");

    if (mode === "landing") {
      return (v?.to > v?.from) || (s?.to > s?.from);
    }
    if (isStandardizationOnly) {
      return s?.to > 0;
    }
    if (isValidationActive) {
      return v?.to > v?.from;
    }
    return false;
  }, [mode, filter]);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(COUNTS_URL);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "success" && shouldTriggerRefresh(data.counts)) {
          if (recordsCount === 0) {
            console.log("[Background Polling] List empty, auto-refreshing...");
            setIsBackgroundLoading(true);
            refresh();
          } else {
            console.log("[Background Polling] New records found, showing notification.");
            setNewRecordsAvailable(true);
          }
        }
      } catch (err) {
        console.error("Background Polling Error:", err);
      }
    }, BACKGROUND_POLL_MS);
  }, [refresh, recordsCount, shouldTriggerRefresh]);

  useEffect(() => {
    if (lastLoadingState.current === true && loading === false) {
      setIsBackgroundLoading(false);
      setNewRecordsAvailable(false);
      
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      initialDelayRef.current = setTimeout(() => {
        startPolling();
      }, 5000);
    }
    lastLoadingState.current = loading;
  }, [loading, startPolling]);

  useEffect(() => {
    return () => {
      if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return { newRecordsAvailable, isBackgroundLoading, handleManualRefresh: () => {
    setNewRecordsAvailable(false);
    refresh();
  }};
}
