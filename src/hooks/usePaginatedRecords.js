import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL } from "../config";

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 500;
const POLL_MS = 5000;

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
  const pageRef = useRef(1);

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

  // ── Keep pageRef in sync ──────────────────────────────────────────────────
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchRecords = useCallback(
    async (pageNum, isNew = false, silent = false) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const fetchId = ++fetchIdRef.current;

      // Only wipe existing records for user-triggered new fetches, not silent polls
      if (isNew && !silent) {
        setRecords([]);
        setTotalRecords(0);
        setTotalPages(0);
        setMeta({});
      }

      // Only show loader for user-triggered fetches
      if (!silent) setLoading(true);
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

        setRecords((prev) => {
          if (silent) return incoming;        // poll: replace page-1 quietly
          if (isNew) return incoming;         // new search/filter: replace
          return [...prev, ...incoming];      // load more: append
        });

        const { data: _d, total_invalid_records: _t, ...rest } = data;
        setMeta(rest);
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        if (err.name !== "AbortError") {
          console.error("usePaginatedRecords:", err);
          setError(err);
        }
      } finally {
        if (fetchId === fetchIdRef.current && !silent) setLoading(false);
      }
    },
    [search, extraParamsKey]
  );

  // ── Reset + refetch when search or extraParams change ────────────────────
  useEffect(() => {
    setPage(1);
    fetchRecords(1, true, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, extraParamsKey]);

  // ── Load next page ────────────────────────────────────────────────────────
  useEffect(() => {
    if (page > 1) fetchRecords(page, false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Background polling (silent, page 1 only) ─────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (pageRef.current === 1) {
        fetchRecords(1, false, true);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchRecords]);

  // ── Public helpers ────────────────────────────────────────────────────────
  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const retry = useCallback(
    () => fetchRecords(page, page === 1, false),
    [fetchRecords, page]
  );

  const refresh = useCallback(() => {
    setPage(1);
    fetchRecords(1, true, false);
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