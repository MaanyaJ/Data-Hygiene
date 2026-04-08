import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import MyActiveListHeader from "../components/MyActiveListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";

// ── Age helper ────────────────────────────────────────────────────────────────
const getDiffDays = (record) => {
  const date =
    record?.updatedOn || record?.history?.updatedOn || record?.createdOn;
  if (!date) return null;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
};

const AGE_COLORS = {
  green:  { bg: "#e8f5e9", border: "#43a047" },
  yellow: { bg: "#fff8e1", border: "#ffa000" },
  red:    { bg: "#ffebee", border: "#e53935" },
};

const getAgeColor = (record) => {
  const days = getDiffDays(record);
  if (days === null) return null;
  if (days < 3)                return AGE_COLORS.green;
  if (days >= 3 && days <= 6)  return AGE_COLORS.yellow;
  return AGE_COLORS.red;
};

// ─────────────────────────────────────────────────────────────────────────────

// Stable outside component to avoid infinite re-fetch loop
const ACTIVE_PARAMS = { status: "pending" };

const MyActiveList = () => {
  // Client-side age filter — not sent to API
  const [filter, setFilter] = useState("");

  const handleFilterChange = (value) =>
    setFilter((prev) => (prev === value ? "" : value));

  // extraParams — fetch only "pending" records from the API
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
    meta, // contains red / green / yellow from the API response
  } = usePaginatedRecords({ extraParams: ACTIVE_PARAMS });

  // Apply client-side age filter on top of the fetched records
  const filteredRecords = useMemo(() => {
    if (!filter) return records;
    return records.filter((record) => {
      const days = getDiffDays(record);
      if (days === null) return false;
      if (filter === "<3")  return days < 3;
      if (filter === "3-6") return days >= 3 && days <= 6;
      if (filter === ">6")  return days > 6;
      return true;
    });
  }, [records, filter]);

  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={retry}
      />
    );
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ mt: 15 }}>
        <MyActiveListHeader
          search={searchInput}
          onSearchChange={setSearchInput}
          filter={filter}
          onFilterChange={handleFilterChange}
          red={meta.red ?? 0}
          green={meta.green ?? 0}
          yellow={meta.yellow ?? 0}
          countsLoading={loading}
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

        {/* Records exist but none match the age filter */}
        {filter && !loading && filteredRecords.length === 0 && records.length > 0 && (
          <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
            <Typography>No records match the selected filter</Typography>
          </Box>
        )}

        {/* API returned no records at all */}
        {!loading && records.length === 0 && !error && (
          <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
            <Typography>No records found</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyActiveList;
