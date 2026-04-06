import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MyCompletedListHeader from "../components/MyCompletedListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { USE_MOCK } from "../config";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import mockList from "../mock/mockList.json";

const DEBOUNCE_MS = 300;

// ── Mock version ──────────────────────────────────────────────────────────────
const MyCompletedListMock = () => {
  const [statusFilter, setStatusFilter] = useState("approved");
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
        : r.Status?.toLowerCase() === "approved" || r.Status?.toLowerCase() === "rejected";
      const searchMatch = !term || [r.ExecutionId, r.BenchmarkType, r.BenchmarkCategory]
        .some((v) => v?.toLowerCase().includes(term));
      return statusMatch && searchMatch;
    });
  }, [statusFilter, search]);

  return (
    <Box>
      <Navbar />
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
  );
};

// ── Real API version ──────────────────────────────────────────────────────────
const COMPLETED_PARAMS_DEFAULT = { status: "approved" };

const MyCompletedListReal = () => {
  const [statusFilter, setStatusFilter] = useState("approved");

  const extraParams = useMemo(
    () => ({ status: statusFilter ?? "completed" }),
    [statusFilter]
  );

  const {
    records,
    totalRecords,
    totalPages,
    page,
    loading,
    error,
    searchInput,
    setSearchInput,
    loadMore,
    retry,
  } = usePaginatedRecords({ extraParams });

  if (error) {
    return <ErrorPage message={error?.message || "Something went wrong"} onRetry={retry} />;
  }

  return (
    <Box>
      <Navbar />
      <MyCompletedListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <RecordList
        records={records}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={loadMore}
        showCount
      />
      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No completed records found</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Export: switches based on USE_MOCK flag in src/config.js ──────────────────
const MyCompletedList = USE_MOCK ? MyCompletedListMock : MyCompletedListReal;

export default MyCompletedList;
