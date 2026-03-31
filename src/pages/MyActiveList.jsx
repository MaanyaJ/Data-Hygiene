import React, { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import MyActiveListHeader from "../components/MyActiveListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";

const MyActiveList = () => {
  const [filter, setFilter] = useState("");

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
  } = usePaginatedRecords();
  // No extraParams needed here – the active list fetches everything
  // and relies on the age-based client-side filter below

  // ── Age-based client-side filter ─────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    if (!filter) return records;

    return records.filter((record) => {
      const updatedOn =
        record?.updatedOn ||
        record?.history?.updatedOn ||
        record?.createdOn;

      if (!updatedOn) return false;

      const diffDays =
        (Date.now() - new Date(updatedOn).getTime()) / (1000 * 60 * 60 * 24);

      if (filter === "<3") return diffDays < 3;
      if (filter === "3-6") return diffDays >= 3 && diffDays <= 6;
      if (filter === ">6") return diffDays > 6;

      return true;
    });
  }, [records, filter]);

  const handleFilterChange = (value) =>
    setFilter((prev) => (prev === value ? "" : value));

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={retry}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
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
      />

      {/* No records match the age filter, but records exist */}
      {filter && !loading && filteredRecords.length === 0 && records.length > 0 && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No records match the selected filter</Typography>
        </Box>
      )}

      {/* Completely empty result set */}
      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No records found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyActiveList;