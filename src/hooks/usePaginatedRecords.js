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

  // Flips true after first successful fetch, never resets
  // Socket connects once and stays alive through refreshes
  const [isReadyState, setIsReadyState] = useState(false);

  const abortRef = useRef(null);
  const fetchIdRef = useRef(0);

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
        // intentionally NOT resetting isReadyState
        // socket stays connected through refreshes and uploads
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

        // Flip once — never resets
        setIsReadyState((prev) => prev || true);
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

  // ── Patch records in-place by ExecutionId ─────────────────────────────────
  // Called by WebSocket when a known record changes stage
  const patchRecords = useCallback((updates) => {
    const updateMap = Object.fromEntries(
      updates.map((u) => [u.ExecutionId, u])
    );
    setRecords((prev) =>
      prev.map((record) =>
        updateMap[record.ExecutionId]
          ? { ...record, ...updateMap[record.ExecutionId] }
          : record
      )
    );
  }, []);

  // ── Remove records that no longer match active filters ────────────────────
  // Called by WebSocket on RecordsListPage when stage change breaks filter match
  const removeRecords = useCallback((executionIds) => {
    const idSet = new Set(executionIds);
    setRecords((prev) => prev.filter((r) => !idSet.has(r.ExecutionId)));
  }, []);


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
    patchRecords,
    removeRecords,
    isReadyState,
  };
}