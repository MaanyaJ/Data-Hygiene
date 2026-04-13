import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MyCompletedListHeader from "../components/MyCompletedListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { USE_MOCK, API_URL } from "../config";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import mockList from "../mock/mockList.json";

const DEBOUNCE_MS = 300;

// ── Mock version ──────────────────────────────────────────────────────────────
const MyCompletedListMock = () => {
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const records = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockList.data.filter((r) => {
      const statusMatch = statusFilter
        ? r.Status?.toLowerCase() === statusFilter.toLowerCase()
        : r.Status?.toLowerCase() === "accepted" || r.Status?.toLowerCase() === "rejected";
      const searchMatch = !term || [r.ExecutionId, r.BenchmarkType, r.BenchmarkCategory]
        .some((v) => v?.toLowerCase().includes(term));
      return statusMatch && searchMatch;
    });
  }, [statusFilter, search]);

  return (
    <Box>
      <Navbar />
      <Box sx={{mt: 15}}>
      <MyCompletedListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <RecordList
        records={records}
        totalRecords={records.length}
        totalPages={1}
        page={1}
        loading={false}
        onLoadMore={() => {}}
        showCount
      />
      
      {records.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No completed records found</Typography>
        </Box>
      )}
      </Box>
    </Box>
  );
};

// ── Real API version ──────────────────────────────────────────────────────────
const COMPLETED_PARAMS_DEFAULT = { status: "accepted" };

const MyCompletedListReal = () => {
  const [statusFilter, setStatusFilter] = useState(null);

  // ── Single-status view: use paginated hook ──────────────────────────────────
  const extraParams = useMemo(
    () => (statusFilter ? { status: statusFilter } : { status: "accepted" }),
    [statusFilter]
  );

  const {
    records: hookRecords,
    totalRecords: hookTotal,
    totalPages,
    page,
    loading: hookLoading,
    error,
    searchInput,
    setSearchInput,
    search,
    loadMore,
    retry,
  } = usePaginatedRecords({ extraParams });

  // ── "All completed" view: parallel fetch for accepted + rejected ─────────────
  const [allRecords, setAllRecords]   = useState([]);
  const [allLoading, setAllLoading]   = useState(false);

  useEffect(() => {
    if (statusFilter !== null) return; // handled by hook
    setAllLoading(true);
    setAllRecords([]); // Clear records so RecordList shows the loader
    const base = `${API_URL}/invalid-summary`;
    Promise.all([
      fetch(`${base}?page=1&size=100&search=${encodeURIComponent(search)}&status=accepted`).then((r) => r.json()),
      fetch(`${base}?page=1&size=100&search=${encodeURIComponent(search)}&status=rejected`).then((r)  => r.json()),
    ])
      .then(([acc, rej]) => {
        const merged = [
          ...(Array.isArray(acc?.data) ? acc.data : []),
          ...(Array.isArray(rej?.data) ? rej.data : []),
        ];
        setAllRecords(merged);
      })
      .catch(console.error)
      .finally(() => setAllLoading(false));
  }, [statusFilter, search]);

  // Pick which data set to display
  const displayRecords = statusFilter ? hookRecords : allRecords;
  const displayLoading = statusFilter ? hookLoading : allLoading;
  const displayTotal   = statusFilter ? hookTotal   : allRecords.length;

  const isSearching = displayLoading || searchInput !== search;

  if (error) {
    return <ErrorPage message={error?.message || "Something went wrong"} onRetry={retry} />;
  }

  return (
    <Box>
      <Navbar />
       <Box sx={{mt: 15}}>
      <MyCompletedListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={isSearching}
      />
      <RecordList
        records={displayRecords}
        totalRecords={displayTotal}
        totalPages={totalPages}
        page={page}
        loading={displayLoading}
        onLoadMore={loadMore}
        showCount
      />
      {!displayLoading && displayRecords.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No completed records found</Typography>
        </Box>
      )}
    </Box>
    </Box>
  );
};

// ── Export: switches based on USE_MOCK flag in src/config.js ──────────────────
const MyCompletedList = USE_MOCK ? MyCompletedListMock : MyCompletedListReal;

export default MyCompletedList;
