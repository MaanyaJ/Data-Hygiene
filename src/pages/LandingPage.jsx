import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import LandingPageHeader from "../components/LandingPageHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";

export const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const pageSize = 50;
const DEBOUNCE_MS = 500;

const LandingPage = () => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState(""); // raw input value (no debounce)
  const [search, setSearch] = useState("");            // debounced value that triggers fetch
  const [filter, setFilter] = useState("");

  // Holds the AbortController for the current in-flight request
  const abortRef = useRef(null);

  const handleFilterChange = (value) => {
    setFilter((prev) => (prev === value ? "" : value));
  };

  // Debounce: only update `search` after user stops typing for DEBOUNCE_MS
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchRecords = useCallback(async (pageNum, isNew = false, currentSearch, currentFilter) => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        status: currentFilter,
        page: pageNum,
        size: pageSize,
        search: currentSearch || "",
      });

      const res = await fetch(


        `http://192.168.0.182:8000/invalid-summary?${queryParams}`,
        { signal: controller.signal }

      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      console.log(data);

      const incoming = Array.isArray(data?.data) ? data.data : [];
      const total = data?.total_invalid_records ?? incoming.length;

      setTotalPages(Math.ceil(total / pageSize));
      setRecords((prev) => (isNew ? incoming : [...prev, ...incoming]));
      setTotalRecords(total);
    } catch (err) {
      // Ignore abort errors — they're expected when we cancel stale requests
      if (err.name === "AbortError") return;
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset and refetch when debounced search or filter changes
  useEffect(() => {
    setRecords([]);
    setPage(1);
    fetchRecords(1, true, search, filter);
  }, [search, filter]);

  // Load next pages
  useEffect(() => {
    if (page !== 1) {
      fetchRecords(page, false, search, filter);
    }
  }, [page]);

  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={() => fetchRecords(page, true, search, filter)}
      />
    );
  }

  return (
    <Box>
      <Navbar />
      <LandingPageHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      <RecordList
        records={records}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={() => setPage((prev) => prev + 1)}
      />
    </Box>
  );
};

export default LandingPage;