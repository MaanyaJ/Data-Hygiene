import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import { useRefresh } from "../context/RefreshContext";
import { useBackgroundPolling } from "../hooks/useBackgroundPolling";

const MODE_CONFIG = {
  landing:   { title: "Data Hygiene Dashboard",  showStatusFilters: true, showStageFilters: true },
  active:    { title: "My Active List",           defaultStatus: "pending",           showAgeFilters: true },
  completed: { title: "My Completed List",        defaultStatus: "accepted,rejected", showStatusFilters: true, allowedFilters: ["accepted", "rejected"] },
  onhold:    { title: "On Hold Records",          defaultStatus: "On Hold",           showAgeFilters: true },
  all:       { title: "All Records",              showStatusFilters: true },
};

const AGE_TO_SERVER = { "<3": "green", "3-6": "yellow", ">6": "red" };

const RecordsListPage = ({ mode = "landing" }) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.landing;
  const { registerRefresh } = useRefresh();

  // Multi-select filter state (array of selected values)
  const [filter, setFilter] = useState([]);

  const handleFilterChange = (value) => {
    if (value === "") {
      setFilter([]); // clear all
    } else {
      setFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  const extraParams = useMemo(() => {
    // Age-based modes (active, onhold) — status always fixed; age sent when selected
    if (!config.showStatusFilters) {
      const params = { status: config.defaultStatus };
      if (filter.length > 0) params.age = filter.map((f) => AGE_TO_SERVER[f] || f).join(",");
      return params;
    }

    if (filter.length > 0) {
      const statuses = filter.filter((v) => !v.includes("validation") && !v.includes("standardization"));
      const stages   = filter.filter((v) =>  v.includes("validation") ||  v.includes("standardization"));
      const params = {};
      if (statuses.length > 0) params.status = statuses.join(",");
      if (stages.length   > 0) params.stage  = stages.join(",");
      return params;
    }

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
    refresh,
    meta,
    patchRecords, // ← new
    removeRecords,
    isReady,      // ← new
  } = usePaginatedRecords({ extraParams });

  useEffect(() => {
    registerRefresh(refresh);
  }, [refresh, registerRefresh]);

  const { 
    newRecordsAvailable, 
    isBackgroundLoading, 
    handleManualRefresh 
  } = useBackgroundPolling({ 
    refresh, 
    mode, 
    filter, 
    loading, 
    recordsCount: records.length 
  });

  const isSearching = loading && searchInput !== search;

  if (error) {
    return <ErrorPage message={error?.message || "Something went wrong"} onRetry={retry} />;
  }

  return (
    <Box sx={{ backgroundColor: "#ebebebff", minHeight: "100vh", position: "relative" }}>
      <ListHeader
        title={config.title}
        search={searchInput}
        onSearchChange={setSearchInput}
        filter={filter}
        onFilterChange={handleFilterChange}
        counts={meta}
        showAgeFilters={config.showAgeFilters}
        showStatusFilters={config.showStatusFilters}
        showStageFilters={config.showStageFilters}
        allowedFilters={config.allowedFilters}
        loading={isSearching}
        totalRecords={totalRecords}
        countLabel={String(totalRecords)}
        onRefresh={refresh}
      />

      {/* Twitter-style New Records Button */}
      {newRecordsAvailable && (
        <Box
          sx={{
            position: "fixed",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1100,
            animation: "slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
            "@keyframes slideDown": {
              "0%": { transform: "translateX(-50%) translateY(-30px)", opacity: 0 },
              "100%": { transform: "translateX(-50%) translateY(0)", opacity: 1 },
            },
          }}
        >
          <Button
            onClick={handleManualRefresh}
            variant="contained"
            startIcon={<ArrowUpwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: "#1d9bf0", // Twitter Blue
              color: "#fff",
              borderRadius: "9999px",
              px: 3,
              py: 1,
              fontSize: "14px",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(29, 155, 240, 0.4)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#1a8cd8",
                boxShadow: "0 6px 20px rgba(29, 155, 240, 0.6)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            Show new records
          </Button>
        </Box>
      )}

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
          removeRecords={removeRecords}
          isReady={isReady}
          extraParams={extraParams}
          loadingLabel={isBackgroundLoading ? "Checking for new records..." : "Loading records..."}
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