import React, { useState, useMemo } from "react";
import { Box } from "@mui/material";
import LandingPageHeader from "../components/LandingPageHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";

export const FILTERS = [
  { label: "All",      value: "" },
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const LandingPage = () => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (value) =>
    setFilter((prev) => (prev === value ? "" : value));

  // useMemo ensures a new object is only created when `filter` actually changes,
  // so the hook doesn't see a new reference on every render and loop infinitely.
  const extraParams = useMemo(
    () => (filter ? { status: filter } : {}),
    [filter]
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
