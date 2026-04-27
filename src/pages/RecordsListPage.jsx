import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import { useRefresh } from "../context/RefreshContext";

const MODE_CONFIG = {
  landing:   { title: "Data Hygiene Dashboard", showStatusFilters: true },
  active:    { title: "My Active List",          defaultStatus: "pending",           showAgeFilters: true },
  completed: { title: "My Completed List",       defaultStatus: "accepted,rejected", showStatusFilters: true, allowedFilters: ["accepted", "rejected"] },
  onhold:    { title: "On Hold Records",         defaultStatus: "On Hold",           showAgeFilters: true },
  all:       { title: "All Records",             showStatusFilters: true },
};

const AGE_TO_SERVER = { "<3": "green", "3-6": "yellow", ">6": "red" };

const RecordsListPage = ({ mode = "landing" }) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.landing;
  const { registerRefresh } = useRefresh();

  const [filter, setFilter] = useState([]);

  const handleFilterChange = (value) => {
    if (value === "") {
      setFilter([]);
    } else {
      setFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  const extraParams = useMemo(() => {
    const params = { stage: "standardization_completed" };

    if (!config.showStatusFilters) {
      // Age-filter pages (active, onhold): always have a fixed status
      params.status = config.defaultStatus;
      if (filter.length > 0) {
        params.age = filter.map((f) => AGE_TO_SERVER[f] || f).join(",");
      }
      return params;
    }

    // Status-filter pages (landing, completed, all)
    if (filter.length > 0) {
      params.status = filter.join(",");
    } else if (config.defaultStatus) {
      params.status = config.defaultStatus;
    }

    return params;
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
    refresh,
    meta,
    patchRecords,
    isReadyState,
  } = usePaginatedRecords({ extraParams });

  useEffect(() => {
    registerRefresh(refresh);
  }, [refresh, registerRefresh]);

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
        countLabel={String(totalRecords)}
        onRefresh={refresh}
      />

      <Box sx={{ px: 3, py: 2 }}>
        <RecordList
          records={records}
          totalRecords={totalRecords}
          countLabel={String(totalRecords)}
          totalPages={totalPages}
          page={page}
          loading={loading}
          onLoadMore={loadMore}
          patchRecords={patchRecords}
          isReadyState={isReadyState}
        />

        {!loading && records.length === 0 && (
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
              {filter.length > 0
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