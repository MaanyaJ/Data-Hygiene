import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL } from "../config";

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 500;

export const BASE_URL = `${API_URL}/invalid-summary`;

export function usePaginatedRecords({ extraParams = {} } = {}) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const abortRef = useRef(null);
  const fetchIdRef = useRef(0);
  const isReadyRef = useRef(false); // flips true after first successful fetch

  const extraParamsKey = JSON.stringify(extraParams);

  // ── Abort on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Debounce search input ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchRecords = useCallback(
    async (pageNum, isNew = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchId = ++fetchIdRef.current;

      if (isNew) {
        setRecords([]);
        setTotalRecords(0);
        setTotalPages(0);
        setMeta({});
        isReadyRef.current = false; // reset on new search/filter/refresh
      }

      setLoading(true);
      setError(null);

      try {
        const parsed = JSON.parse(extraParamsKey);
        const baseParams = {
          page: pageNum,
          size: PAGE_SIZE,
          search: search || "",
          ...parsed,
        };

        const qs = new URLSearchParams();
        Object.entries(baseParams).forEach(([k, v]) => qs.set(k, v));

        const res = await fetch(`${BASE_URL}?${qs}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
        const data = await res.json();

        if (fetchId !== fetchIdRef.current) return;

        const incoming = Array.isArray(data?.data) ? data.data : [];
        const total = data?.total_invalid_records ?? incoming.length;

        setTotalPages(Math.ceil(total / PAGE_SIZE));
        setTotalRecords(total);
        setRecords((prev) => (isNew ? incoming : [...prev, ...incoming]));

        const { data: _d, total_invalid_records: _t, ...rest } = data;
        setMeta(rest);

        isReadyRef.current = true; // data landed — progress polling can start
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        if (err.name !== "AbortError") {
          console.error("usePaginatedRecords:", err);
          setError(err);
        }
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    },
    [search, extraParamsKey]
  );

  const triggerDismissal = useCallback(() => {
    setTimeout(() => {
      setRecords((prev) => {
        const remaining = prev.filter(r => !r.isDismissing);
        const removedCount = prev.length - remaining.length;
        if (removedCount > 0) {
          setTotalRecords(t => Math.max(0, t - removedCount));
        }
        return remaining;
      });
    }, 1200);
  }, []);

  // ── Patch specific records in-place by ExecutionId ────────────────────────
  // Called by useProgressPolling when batch status poll returns.
  // Only updates fields that came back — order and all other records untouched.
  const patchRecords = useCallback((updates) => {
    const updateMap = Object.fromEntries(
      updates.map((u) => [u.ExecutionId, u])
    );

    // Check if we should dismiss records that no longer match active filters
    const activeStages = extraParams?.stage || "";
    const activeStagesList = activeStages ? activeStages.split(",").map(s => s.trim().toLowerCase()) : [];
    const hasStageFilters = activeStagesList.length > 0;

    const activeStatus = extraParams?.status || "";
    const activeStatusList = activeStatus ? activeStatus.split(",").map(s => s.trim().toLowerCase()) : [];
    const isPendingFilterActive = activeStatusList.includes("pending");

    let anyDismissed = false;

    setRecords((prev) => {
      return prev.map((record) => {
        const update = updateMap[record.ExecutionId];
        if (update) {
          const merged = { ...record, ...update };
          
          const normalizedStage = merged.Stage?.toLowerCase().trim().replace(/[\s_]+/g, " ");
          const currentStatus = merged.Status?.toLowerCase();

          if (hasStageFilters) {
            const matchesStage = activeStagesList.includes(normalizedStage);
            const isCompleted = normalizedStage === "standardization completed";

            if (!matchesStage || isCompleted) {
              // Exception: if 'Action Required' (pending) filter is active AND record is pending, 
              // keep it visible (don't dismiss).
              if (isPendingFilterActive && currentStatus === "pending") {
                // keep it
              } else {
                merged.isDismissing = true;
                anyDismissed = true;
              }
            }
          }

          return merged;
        }
        return record;
      });
    });

    if (anyDismissed) triggerDismissal();
  }, [extraParams?.stage, extraParams?.status, triggerDismissal]);

  const removeRecords = useCallback((idsToRemove) => {
    if (!idsToRemove || idsToRemove.length === 0) return;
    setRecords((prev) => {
      return prev.map((r) => {
        if (idsToRemove.includes(r.ExecutionId)) {
          return { ...r, isDismissing: true };
        }
        return r;
      });
    });
    triggerDismissal();
  }, [triggerDismissal]);

  // ── Reset + refetch when search or extraParams change ────────────────────
  useEffect(() => {
    setPage(1);
    fetchRecords(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, extraParamsKey]);

  // ── Load next page ────────────────────────────────────────────────────────
  useEffect(() => {
    if (page > 1) fetchRecords(page, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const retry = useCallback(
    () => fetchRecords(page, page === 1),
    [fetchRecords, page]
  );

  const refresh = useCallback(() => {
    setPage(1);
    fetchRecords(1, true);
  }, [fetchRecords]);

  return {
    records,
    totalRecords,
    totalPages,
    page,
    loading,
    error,
    searchInput,
    setSearchInput,
    search,
    loadMore,
    retry,
    refresh,
    meta,
    patchRecords,      // ← used by useProgressPolling to patch Stage in-place
    removeRecords,
    isReady: isReadyRef, // ← ref (not state) so polling can read it without re-renders
  };
}