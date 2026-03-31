import React, { useState } from "react";
import { Box } from "@mui/material";
import LandingPageHeader from "../components/LandingPageHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { usePaginatedRecords } from "../hooks/UsePaginatedRecords";

export const FILTERS = [
  { label: "All",      value: "" },
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const LandingPage = () => {
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
  } = usePaginatedRecords({
    extraParams: filter ? { status: filter } : {},
    // When a status filter is active it's sent as a query param.
    // When "All" is selected (filter === "") no status param is sent.
  });

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
        onLoadMore={loadMore}
        showCount
      />
    </Box>
  );
};

export default LandingPage;