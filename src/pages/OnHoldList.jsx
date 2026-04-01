import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import OnHoldListHeader from "../components/OnHoldListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { USE_MOCK } from "../config";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import mockOnHold from "../mock/mockOnHold.json";

// ── Age helper (uses holdedOn instead of updatedOn) ───────────────────────────
const getHoldDays = (record) => {
  const date = record?.holdedOn;
  if (!date) return null;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
};

// ── Derive age-bucket color (same palette as MyActiveList) ────────────────────
const AGE_COLORS = {
  green:  { bg: "#e8f5e9", border: "#43a047" },
  yellow: { bg: "#fff8e1", border: "#ffa000" },
  red:    { bg: "#ffebee", border: "#e53935" },
};

const getAgeColor = (record) => {
  const days = getHoldDays(record);
  if (days === null) return null;
  if (days < 3)           return AGE_COLORS.green;
  if (days >= 3 && days <= 6) return AGE_COLORS.yellow;
  return AGE_COLORS.red;
};

const DEBOUNCE_MS = 300;

// ── Mock version ──────────────────────────────────────────────────────────────
const OnHoldListMock = () => {
  const [filter,      setFilter]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (value) =>
    setFilter((prev) => (prev === value ? "" : value));

  // Derive counts from mock data
  const { green, yellow, red } = useMemo(() => {
    let g = 0, y = 0, r = 0;
    mockOnHold.data.forEach((rec) => {
      const d = getHoldDays(rec);
      if (d === null) return;
      if (d < 3) g++;
      else if (d <= 6) y++;
      else r++;
    });
    return { green: g, yellow: y, red: r };
  }, []);

  const records = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockOnHold.data.filter((r) => {
      // Age filter
      if (filter) {
        const days = getHoldDays(r);
        if (days === null) return false;
        if (filter === "<3"  && days >= 3)          return false;
        if (filter === "3-6" && (days < 3 || days > 6)) return false;
        if (filter === ">6"  && days <= 6)          return false;
      }
      // Search filter
      if (term) {
        return [r.ExecutionId, r.BenchmarkType, r.BenchmarkCategory]
          .some((v) => v?.toLowerCase().includes(term));
      }
      return true;
    });
  }, [filter, search]);

  return (
    <Box>
      <Navbar />
      <OnHoldListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
        green={green}
        yellow={yellow}
        red={red}
      />
      <RecordList
        records={records}
        totalRecords={records.length}
        totalPages={1}
        page={1}
        loading={false}
        onLoadMore={() => {}}
        showAgeColors
        showCount={false}
        ageColorFn={getAgeColor}
      />
      {filter && records.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No records match the selected filter</Typography>
        </Box>
      )}
      {!filter && records.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No on-hold records found</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Real API version ──────────────────────────────────────────────────────────
const ONHOLD_PARAMS = { status: "onhold" };

const OnHoldListReal = () => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (value) =>
    setFilter((prev) => (prev === value ? "" : value));

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
    meta,
  } = usePaginatedRecords({ extraParams: ONHOLD_PARAMS });

  const filteredRecords = useMemo(() => {
    if (!filter) return records;
    return records.filter((record) => {
      const days = getHoldDays(record);
      if (days === null) return false;
      if (filter === "<3")  return days < 3;
      if (filter === "3-6") return days >= 3 && days <= 6;
      if (filter === ">6")  return days > 6;
      return true;
    });
  }, [records, filter]);

  if (error) {
    return <ErrorPage message={error?.message || "Something went wrong"} onRetry={retry} />;
  }

  return (
    <Box>
      <Navbar />
      <OnHoldListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
        green={meta.green ?? 0}
        yellow={meta.yellow ?? 0}
        red={meta.red ?? 0}
      />
      <RecordList
        records={filteredRecords}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={loadMore}
        showAgeColors
        showCount={false}
        ageColorFn={getAgeColor}
      />
      {filter && !loading && filteredRecords.length === 0 && records.length > 0 && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No records match the selected filter</Typography>
        </Box>
      )}
      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No on-hold records found</Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Export: controlled by USE_MOCK in src/config.js ───────────────────────────
const OnHoldList = USE_MOCK ? OnHoldListMock : OnHoldListReal;

export default OnHoldList;
