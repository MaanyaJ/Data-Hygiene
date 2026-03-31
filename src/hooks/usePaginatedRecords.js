import { useState, useEffect, useCallback, useRef } from "react";

const PAGE_SIZE = 50;
const DEBOUNCE_MS = 500;
const BASE_URL = "http://192.168.0.182:8000/invalid-summary";

/**
 * usePaginatedRecords
 *
 * Shared hook for all three list pages.
 * Handles: debounced search, pagination (load-more), abort on stale requests,
 * and passes any extra query params (e.g. status) straight to the API.
 *
 * @param {Object}  options
 * @param {string}  [options.endpoint]     - API endpoint (defaults to BASE_URL)
 * @param {Object}  [options.extraParams]  - Extra query params merged into every request
 *                                          e.g. { status: "APPROVED" }
 */
export function usePaginatedRecords({ endpoint = BASE_URL, extraParams = {} } = {}) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // meta holds any extra top-level API fields (e.g. red / green / yellow)
  const [meta, setMeta] = useState({});

  // searchInput: raw value bound to <input>
  // search:      debounced value that actually triggers fetches
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Holds the AbortController for the in-flight request
  const abortRef = useRef(null);

  // Stable serialisation of extraParams so the fetch callback
  // doesn't re-create on every render due to object reference changes
  const extraParamsKey = JSON.stringify(extraParams);

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Core fetch ───────────────────────────────────────────────────────────
  const fetchRecords = useCallback(
    async (pageNum, isNew = false, currentSearch) => {
      // Cancel any previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum,
          size: PAGE_SIZE,
          search: currentSearch || "",
          ...JSON.parse(extraParamsKey), // spread the stable serialised copy
        });

        const res = await fetch(`${endpoint}?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);

        const data = await res.json();
        const incoming = Array.isArray(data?.data) ? data.data : [];
        const total = data?.total_invalid_records ?? incoming.length;

        setTotalPages(Math.ceil(total / PAGE_SIZE));
        setRecords((prev) => (isNew ? incoming : [...prev, ...incoming]));
        setTotalRecords(total);

        // Collect any extra top-level fields from the response
        // (e.g. red, green, yellow) and expose them via `meta`
        const { data: _d, total_invalid_records: _t, ...rest } = data;
        setMeta(rest);
      } catch (err) {
        if (err.name === "AbortError") return; // expected – not an error
        console.error("usePaginatedRecords fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, extraParamsKey]
  );

  // ── Reset + refetch whenever debounced search changes ────────────────────
  useEffect(() => {
    setRecords([]);
    setPage(1);
    fetchRecords(1, true, search);
  }, [search, fetchRecords]);

  // ── Load next pages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (page > 1) {
      fetchRecords(page, false, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  const retry = useCallback(
    () => fetchRecords(page, page === 1, search),
    [fetchRecords, page, search]
  );

  return {
    // Data
    records,
    totalRecords,
    totalPages,
    page,
    // Status
    loading,
    error,
    // Search (bind searchInput to <input>, search is read-only debounced value)
    searchInput,
    setSearchInput,
    search,
    // Actions
    loadMore,
    retry,
    // Any extra top-level API response fields (red/green/yellow etc.)
    meta,
  };
}