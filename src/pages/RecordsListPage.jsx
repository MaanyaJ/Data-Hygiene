import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import { useRefresh } from "../context/RefreshContext";

const MODE_CONFIG = {
  landing:   { title: "Data Hygiene Dashboard", showStatusFilters: true,  showStageFilters: true },
  active:    { title: "My Active List",          defaultStatus: "pending",            showAgeFilters: true },
  completed: { title: "My Completed List",       defaultStatus: "accepted,rejected",  showStatusFilters: true, allowedFilters: ["accepted", "rejected"] },
  onhold:    { title: "On Hold Records",         defaultStatus: "On Hold",            showAgeFilters: true },
  all:       { title: "All Records",             showStatusFilters: true },
};

const AGE_TO_SERVER = { "<3": "green", "3-6": "yellow", ">6": "red" };
const STAGE_FILTER_VALUES = ["validation inprogress,validation initiated", "standardization inprogress"];

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

  const extraParams = React.useMemo(() => {
    if (!config.showStatusFilters) {
      const params = { status: config.defaultStatus };
      if (filter.length > 0) params.age = filter.map((f) => AGE_TO_SERVER[f] || f).join(",");
      return params;
    }

    const params = {};
    if (config.defaultStage)  params.stage  = config.defaultStage;
    if (config.defaultStatus) params.status = config.defaultStatus;

    if (filter.length > 0) {
      const statuses = filter.filter((v) => !STAGE_FILTER_VALUES.includes(v));
      const stages   = filter.filter((v) =>  STAGE_FILTER_VALUES.includes(v));
      if (statuses.length > 0) params.status = statuses.join(",");
      if (stages.length   > 0) params.stage  = stages.join(",");
    }

    return params;
  }, [mode, filter, config.showStatusFilters, config.defaultStage, config.defaultStatus]);

  const {
    records, totalRecords, totalPages, page, loading, error,
    searchInput, setSearchInput, search,
    loadMore, retry, refresh, meta,
    patchRecords, removeRecords, updateCounts, isReadyState,
  } = usePaginatedRecords({ extraParams, activeFilters: filter });

  // Auto-refresh when only Val/Std filters are active but local list is empty
  useEffect(() => {
    if (loading || !isReadyState) return;

    const hasVal = filter.includes("validation inprogress,validation initiated");
    const hasStd = filter.includes("standardization inprogress");
    const otherCount = filter.length - (hasVal ? 1 : 0) - (hasStd ? 1 : 0);

    // Only proceed if at least one is selected and NO other filters are active
    if ((hasVal || hasStd) && otherCount === 0) {
      let serverCount = 0;
      if (hasVal) serverCount += (meta?.VALIDATION_INITIATED || 0) + (meta?.VALIDATION_IN_PROGRESS || 0);
      if (hasStd) serverCount += (meta?.STANDARDIZATION_IN_PROGRESS || 0);

      if (serverCount > 0 && records.length === 0) {
        refresh();
      }
    }
  }, [meta, records.length, filter, loading, refresh, isReadyState]);

  useEffect(() => {
    registerRefresh(refresh);
  }, [refresh, registerRefresh]);

  // --- Real-time "New Records" Notification Logic ---
  const lastTotalRef = useRef(totalRecords);
  const toastIdRef = useRef(null);
  const [canShowToast, setCanShowToast] = useState(false);

  // Delay showing toasts after every refresh/load to avoid noise
  useEffect(() => {
    if (!loading && isReadyState) {
      const timer = setTimeout(() => {
        console.log("[Toast] Notification system armed. Initial total:", totalRecords);
        lastTotalRef.current = totalRecords;
        setCanShowToast(true);
      }, 3000); 
      return () => clearTimeout(timer);
    } else {
      setCanShowToast(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [loading, isReadyState]); // Only reset on load/refresh, NOT on count updates

  useEffect(() => {
    if (!canShowToast || loading) return;

    console.debug(`[Toast Check] Server Total: ${totalRecords}, Last Seen: ${lastTotalRef.current}, UI List: ${records.length}`);

    // Only show if the server total has increased
    if (totalRecords <= lastTotalRef.current) {
      // If records were deleted/moved, just sync the ref without a toast
      if (totalRecords < lastTotalRef.current) lastTotalRef.current = totalRecords;
      return;
    }

    const diff = totalRecords - lastTotalRef.current;
    if (diff > 0) {
      const message = `✨ ${diff} new record${diff > 1 ? 's' : ''} arrived. Click to refresh.`;
      console.log("[Toast] Showing notification:", message);
      
      if (toastIdRef.current && toast.isActive(toastIdRef.current)) {
        toast.update(toastIdRef.current, { render: message });
      } else {
        toastIdRef.current = toast.info(message, {
          onClick: () => {
            refresh();
            toast.dismiss(toastIdRef.current);
          },
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          icon: "🚀"
        });
      }
    }
  }, [totalRecords, canShowToast, loading, refresh, records.length]);

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
        onRefresh={refresh}
      />

      <Box sx={{ px: 3, py: 2 }}>
        <RecordList
          records={records}
          totalRecords={totalRecords}
          totalPages={totalPages}
          page={page}
          loading={loading}
          onLoadMore={loadMore}
          patchRecords={patchRecords}
          removeRecords={removeRecords}
          updateCounts={updateCounts}
          activeFilters={filter}
          isReadyState={isReadyState}
        />

        {!loading && records.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, backgroundColor: "#ebebebff", border: "1px solid #e0e0e0", borderTop: "none" }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: 14 }}>
              {(() => {
                const hasVal = filter.includes("validation inprogress,validation initiated");
                const hasStd = filter.includes("standardization inprogress");
                const otherCount = filter.length - (hasVal ? 1 : 0) - (hasStd ? 1 : 0);
                if (hasVal && hasStd && otherCount === 0) return "No records left for validation or standardization.";
                if (hasVal && otherCount === 0) return "Validation completed. No records left to validate.";
                if (hasStd && otherCount === 0) return "Standardization completed. No records left to standardize.";
                return filter.length > 0 ? "No records match the selected filter." : "No records found in this category.";
              })()}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecordsListPage;