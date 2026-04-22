import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";

/**
 * Modes and their default parameters for usePaginatedRecords
 */
const MODE_CONFIG = {
  landing: { title: "Data Hygiene Dashboard", showStatusFilters: true },
  active: { title: "My Active List", defaultStatus: "pending", showAgeFilters: true },
  completed: { title: "My Completed List", defaultStatus: "accepted,rejected", showStatusFilters: true, allowedFilters: ["accepted", "rejected"] },
  onhold: { title: "On Hold Records", defaultStatus: "On Hold", showAgeFilters: true },
  all: { title: "All Records", showStatusFilters: true },
};

// Map age filter button values → API age param values (module-level constant)
const AGE_TO_SERVER = { "<3": "green", "3-6": "yellow", ">6": "red" };

const RecordsListPage = ({ mode = "landing" }) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.landing;

  // Age filter (client-side) or Status filter (server-side)
  const [filter, setFilter] = useState("");

  const handleFilterChange = (value) => {
    // If value is "" (ALL), always clear the filter
    if (value === "") {
      setFilter("");
    } else {
      setFilter((prev) => (prev === value ? "" : value));
    }
  };

  // Determine which parameters to send to the API based on mode and filter
  const extraParams = useMemo(() => {
    // Age-based filter modes (active, onhold) — status always fixed; age sent when selected
    if (!config.showStatusFilters) {
      const params = { status: config.defaultStatus };
      if (filter) params.age = AGE_TO_SERVER[filter];
      return params;
    }
    // Status-based filter modes — a clicked filter always wins
    if (filter) return { status: filter };

    // Single-status default
    if (config.defaultStatus) return { status: config.defaultStatus };

    return {};
  }, [mode, filter, config.showStatusFilters, config.defaultStatus]);

  const {
    records,
    totalRecords,
    totalPages,
    page,
    loading,
    error,
    searchInput,
    setSearchInput,
    search,
    loadMore,
    retry,
    meta,
  } = usePaginatedRecords({ extraParams });

  const displayRecords = records;
  const countLabel = String(totalRecords);
  const isSearching = loading && searchInput !== search;

  if (error) {
    return <ErrorPage message={error?.message || "Something went wrong"} onRetry={retry} />;
  }

  return (
    <Box sx={{ backgroundColor: "#ebebebff", minHeight: "100vh" }}>
      <ListHeader
        title={config.title}
        search={searchInput}
        onSearchChange={setSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
        counts={meta}
        showAgeFilters={config.showAgeFilters}
        showStatusFilters={config.showStatusFilters}
        allowedFilters={config.allowedFilters}
        loading={isSearching}
        totalRecords={totalRecords}
        countLabel={countLabel}
      />

      <Box sx={{ px: 3, py: 2 }}>
        <RecordList
          records={displayRecords}
          totalRecords={totalRecords}
          countLabel={countLabel}
          totalPages={totalPages}
          page={page}
          loading={loading}
          onLoadMore={loadMore}
        />

        {/* Empty States */}
        {!loading && displayRecords.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              backgroundColor: "#ebebebff",
              border: "1px solid #e0e0e0",
              borderTop: "none",
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: 14 }}>
              {filter
                ? "No records match the selected filter."
                : "No records found in this category."}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecordsListPage;
