import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import { useRefresh } from "../context/RefreshContext";

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
        showStageFilters={config.showStageFilters}
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
          patchRecords={patchRecords} // ← new
          removeRecords={removeRecords}
          isReady={isReady}           // ← new
          extraParams={extraParams}
        />

        {!loading && records.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2
            }}
          >
            <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: "#333" }}>
              {(() => {
                if (filter.length > 0) {
                  const fStr = filter.join(",");
                  const hasVal = fStr.includes("validation initiated") || fStr.includes("validation inprogress");
                  const hasStd = fStr.includes("standardization inprogress") || fStr.includes("validation completed");
                  
                  if (hasVal && hasStd) {
                    return "Validation and Standardization completed and no records left";
                  }
                  if (hasVal) {
                    return "Validation completed and no records left";
                  }
                  if (hasStd) {
                    return "Standardization completed and no records left";
                  }
                  return "No records match the selected filter.";
                }
                return "No records found in this category.";
              })()}
            </Typography>
            
            <Typography 
              onClick={() => window.location.href = "/"}
              sx={{ 
                fontSize: 14,
                color: "#000", 
                fontWeight: 700, 
                textDecoration: "underline",
                letterSpacing: "0.3px",
                cursor: "pointer",
                "&:hover": { color: "#555" }
              }}
            >
              Return to Data Hygiene Dashboard for all records
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecordsListPage;