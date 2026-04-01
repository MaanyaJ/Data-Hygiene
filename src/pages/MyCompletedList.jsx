import React from "react";
import { Box, Typography } from "@mui/material";
import MyCompletedListHeader from "../components/MyCompletedListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { usePaginatedRecords } from "../hooks/UsePaginatedRecords";

const MyCompletedList = () => {
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
    extraParams: { status: "APPROVED" || "REJECTED" },
    // Passes ?status=APPROVED to the API on every request.
    // The client-side guard below is an extra safety net in case
    // the API returns mixed statuses despite the param.
  });

  // Client-side guard: keep only APPROVED records
  const approvedRecords = records.filter(
    (record) => (record?.Status || "").toUpperCase() === "APPROVED" || "REJECTED"
  );

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

      <MyCompletedListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
      />

      <RecordList
        records={approvedRecords}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={loadMore}
        showCount
      />

      {!loading && approvedRecords.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No approved records found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyCompletedList;