import { useRef, useCallback, useEffect } from "react";

const DEBOUNCE_MS = 300;

// Stages that mean the record is done — no point polling these
const TERMINAL_STAGES = new Set([
  "standardization completed",
]);

export function useVisibleIds({ records, onVisibleIdsChange }) {
  const debounceTimer = useRef(null);

  const rangeRef = useRef({ start: 0, stop: -1 });

  const updateVisibleIds = useCallback(() => {
    const { start, stop } = rangeRef.current;
    if (stop < 0 || !records) return;

    const newVisibleIds = records
      .slice(start, stop + 1)
      .filter((r) => r && !TERMINAL_STAGES.has(r.Stage))
      .map((r) => r.ExecutionId);

    onVisibleIdsChange(newVisibleIds);
  }, [records, onVisibleIdsChange]);

  // When records change, re-compute visible IDs for the currently visible range
  useEffect(() => {
    updateVisibleIds();
  }, [updateVisibleIds]);

  const handleRowsRendered = useCallback(
    ({ overscanStartIndex, overscanStopIndex }) => {
      rangeRef.current = { start: overscanStartIndex, stop: overscanStopIndex };

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        updateVisibleIds();
      }, DEBOUNCE_MS);
    },
    [updateVisibleIds]
  );

  return { handleRowsRendered };
}