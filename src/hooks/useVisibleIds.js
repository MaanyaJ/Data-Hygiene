import { useRef, useCallback, useEffect } from "react";

const DEBOUNCE_MS = 300;

// Stages that mean the record is done — no point polling these
const TERMINAL_STAGES = new Set([
  "standardization completed",
]);

export function useVisibleIds({ records, onVisibleIdsChange }) {
  const debounceTimer = useRef(null);
  // We keep track of the current visible range so we can re-filter 
  // if the records change (e.g. stage updates) without a scroll event.
  const rangeRef = useRef({ start: 0, stop: 0 });

  const updateVisibleIds = useCallback(() => {
    const { start, stop } = rangeRef.current;
    const visibleIds = records
      .slice(start, stop + 1)
      .filter((r) => {
        if (!r) return false;
        // Normalize for consistent checking
        const s = (r.Stage || "").toLowerCase().trim().replace(/[\s_]+/g, " ");
        return !TERMINAL_STAGES.has(s);
      })
      .map((r) => r.ExecutionId);

    onVisibleIdsChange(visibleIds);
  }, [records, onVisibleIdsChange]);

  const handleRowsRendered = useCallback(
    ({ overscanStartIndex, overscanStopIndex }) => {
      rangeRef.current = { start: overscanStartIndex, stop: overscanStopIndex };

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(updateVisibleIds, DEBOUNCE_MS);
    },
    [updateVisibleIds]
  );

  // CRITICAL: Re-run filtering when records update so terminal stages stop polling immediately
  useEffect(() => {
    updateVisibleIds();
  }, [records, updateVisibleIds]);

  return { handleRowsRendered };
}