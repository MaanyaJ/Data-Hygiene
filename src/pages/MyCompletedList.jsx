import React from "react";
import { Box, Typography } from "@mui/material";
import MyCompletedListHeader from "../components/MyCompletedListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";

// Defined outside the component so the object reference is always stable
// and never triggers an unnecessary re-fetch.
const COMPLETED_PARAMS = { status: "approved" };

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
  } = usePaginatedRecords({ extraParams: COMPLETED_PARAMS });

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

      <MyCompletedListHeader
        search={searchInput}
        onSearchChange={setSearchInput}
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
          <Typography>No approved records found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyCompletedList;