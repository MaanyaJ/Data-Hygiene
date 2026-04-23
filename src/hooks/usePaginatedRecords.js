import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL } from "../config";

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 500;
const POLL_MS = 30000;

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
  const pollAbortRef = useRef(null);
  const fetchIdRef = useRef(0);
  const pageRef = useRef(1);
  const isReadyToPoll = useRef(false);   // ← gates polling until first success
  const hasErrorRef = useRef(false);     // ← blocks polling during error state

  const extraParamsKey = JSON.stringify(extraParams);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (pollAbortRef.current) pollAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // ── Fetch a single page (pure, no state side-effects) ────────────────────
  const fetchPage = useCallback(
    async (pageNum, signal) => {
      const parsed = JSON.parse(extraParamsKey);
      const qs = new URLSearchParams({
        page: pageNum,
        size: PAGE_SIZE,
        search: search || "",
        ...parsed,
      });

      const res = await fetch(`${BASE_URL}?${qs}`, { signal });
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
      return res.json();
    },
    [search, extraParamsKey]
  );

  // ── Core fetch (user-triggered) ───────────────────────────────────────────
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
        isReadyToPoll.current = false;   // reset on new search/filter
      }

      setLoading(true);
      setError(null);
      hasErrorRef.current = false;

      try {
        const data = await fetchPage(pageNum, controller.signal);

        if (fetchId !== fetchIdRef.current) return;

        const incoming = Array.isArray(data?.data) ? data.data : [];
        const total = data?.total_invalid_records ?? incoming.length;

        setTotalPages(Math.ceil(total / PAGE_SIZE));
        setTotalRecords(total);
        setRecords((prev) => (isNew ? incoming : [...prev, ...incoming]));

        const { data: _d, total_invalid_records: _t, ...rest } = data;
        setMeta(rest);

        isReadyToPoll.current = true;    // ✅ first success — polling can start
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        if (err.name !== "AbortError") {
          console.error("usePaginatedRecords:", err);
          setError(err);
          hasErrorRef.current = true;    // 🚫 block polling on error
        }
      } finally {
        if (fetchId === fetchIdRef.current) setLoading(false);
      }
    },
    [fetchPage]
  );

  // ── Silent poll — fetch all loaded pages simultaneously ───────────────────
  const pollAllPages = useCallback(async () => {
    // Don't poll until first fetch succeeded, or if there's an active error
    if (!isReadyToPoll.current || hasErrorRef.current) return;

    if (pollAbortRef.current) pollAbortRef.current.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;

    const currentPage = pageRef.current;
    const pageNums = Array.from({ length: currentPage }, (_, i) => i + 1);

    try {
      const results = await Promise.all(
        pageNums.map((p) => fetchPage(p, controller.signal))
      );

      if (controller.signal.aborted) return;

      const stitched = results.flatMap((data) =>
        Array.isArray(data?.data) ? data.data : []
      );

      const lastData = results[results.length - 1];
      const total = lastData?.total_invalid_records ?? stitched.length;
      const { data: _d, total_invalid_records: _t, ...rest } = lastData;

      setTotalPages(Math.ceil(total / PAGE_SIZE));
      setTotalRecords(total);
      setRecords(stitched);
      setMeta(rest);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("usePaginatedRecords [poll]:", err);
        // Silently swallow — don't show error UI for background poll failures
      }
    }
  }, [fetchPage]);

  // ── Reset + refetch when search or extraParams change ─────────────────────
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

  // ── Background polling ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(pollAllPages, POLL_MS);
    return () => clearInterval(id);
  }, [pollAllPages]);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const retry = useCallback(() => {
    hasErrorRef.current = false;         // allow polling again after retry
    fetchRecords(page, page === 1);
  }, [fetchRecords, page]);

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
  };
}