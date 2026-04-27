import { useRef, useCallback } from "react";

const DEBOUNCE_MS = 300;

// Stages that mean the record is done — no point polling these
const TERMINAL_STAGES = new Set([
  "standardization completed",
]);

export function useVisibleIds({ records, onVisibleIdsChange }) {
  const debounceTimer = useRef(null);

  const handleRowsRendered = useCallback(
    ({ overscanStartIndex, overscanStopIndex }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        const visibleIds = records
          .slice(overscanStartIndex, overscanStopIndex + 1)
          .filter((r) => r && !TERMINAL_STAGES.has(r.Stage))
          .map((r) => r.ExecutionId);

        onVisibleIdsChange(visibleIds);
      }, DEBOUNCE_MS);
    },
    [records, onVisibleIdsChange]
  );

  return { handleRowsRendered };
}