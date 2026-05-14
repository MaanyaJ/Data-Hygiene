import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import { ErrorPage } from "@data-hygiene/ui";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { API_URL } from "../config";
import { getSession, authFetch } from "@data-hygiene/core";
import { Menu, MenuItem, Snackbar, Alert } from "@mui/material";

const MODE_CONFIG = {
  landing: { title: "Data Hygiene Dashboard", showStatusFilters: true, showStageFilters: true },
  active: { title: "My Active List", defaultStatus: "pending", showAgeFilters: true },
  completed: { title: "My Completed List", defaultStatus: "accepted,rejected", showStatusFilters: true, allowedFilters: ["accepted", "rejected"] },
  onhold: { title: "On Hold Records", defaultStatus: "On Hold", showAgeFilters: true },
  all: { title: "All Records", showStatusFilters: true },
};

const AGE_TO_SERVER = { "<3": "green", "3-6": "yellow", ">6": "red" };
const STAGE_FILTER_VALUES = ["validation inprogress,validation initiated", "standardization inprogress"];

const RecordsListPage = ({ mode = "landing" }) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.landing;
  const { role } = getSession();
  const isAdmin = role?.toLowerCase() === "admin";

  const [filter, setFilter] = useState([]);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = useState(new Set());

  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [reassignAnchorEl, setReassignAnchorEl] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const isFetchingRef = useRef(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleFilterChange = (value) => {
    if (value === "") {
      setFilter([]);
    } else {
      setFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  const toggleReassignMode = () => {
    setIsReassignMode(!isReassignMode);
    setSelectedRecordIds(new Set());
  };

  const handleToggleSelection = (id) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmReassign = (event) => {
    console.log("handleConfirmReassign clicked");
    setReassignAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (!reassignAnchorEl || isFetchingRef.current) return;

    const fetchUsers = async () => {
      isFetchingRef.current = true;
      setIsReassigning(true);
      try {
        const url = `${API_URL}/eligible-users/`; // Back to slash, but with lock
        console.log("Fetching eligible users (locked) from:", url);
        const res = await authFetch(url);

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        console.log("Users fetched successfully:", data);
        
        // Use the correct key from backend response
        const users = data.eligible_users || (Array.isArray(data) ? data : []);
        setEligibleUsers(users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setEligibleUsers([]);
      } finally {
        setIsReassigning(false);
        isFetchingRef.current = false;
      }
    };

    fetchUsers();
  }, [reassignAnchorEl]);

  const handleUserSelect = async (user) => {
    const targetUser = typeof user === "string" ? user : user.username;
    console.log(`Reassigning records ${Array.from(selectedRecordIds)} to ${targetUser}`);
    
    // Construct the assignments array for the bulk API call
    const assignments = Array.from(selectedRecordIds).map(id => {
      const record = records.find(r => r.ExecutionId === id);
      return {
        e_id: id,
        assign_from: record?.assigned_to || "",
        assign_to: targetUser
      };
    });

    try {
      const res = await authFetch(`${API_URL}/reassign-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments })
      });

      if (!res.ok) throw new Error(`Reassignment failed: ${res.status}`);
      
      setSnackbar({ open: true, message: `Successfully reassigned ${assignments.length} records to ${targetUser}`, severity: "success" });
      setReassignAnchorEl(null);
      setIsReassignMode(false);
      setSelectedRecordIds(new Set());
      refresh();
    } catch (err) {
      console.error("Reassign submission error:", err);
      setSnackbar({ open: true, message: "Failed to reassign records. Please try again.", severity: "error" });
    }
  };

  const handleMenuClose = () => {
    setReassignAnchorEl(null);
  };

  const extraParams = React.useMemo(() => {
    const { username } = getSession();
    let params = {};

    if (!config.showStatusFilters) {
      params = { status: config.defaultStatus };
      if (filter.length > 0) params.age = filter.map((f) => AGE_TO_SERVER[f] || f).join(",");
    } else {
      if (config.defaultStage) params.stage = config.defaultStage;
      if (config.defaultStatus) params.status = config.defaultStatus;

      if (filter.length > 0) {
        const statuses = filter.filter((v) => !STAGE_FILTER_VALUES.includes(v));
        const stages = filter.filter((v) => STAGE_FILTER_VALUES.includes(v));
        if (statuses.length > 0) params.status = statuses.join(",");
        if (stages.length > 0) params.stage = stages.join(",");
      }
    }

    // Filter by assigned records for 'My Active List'
    if (mode === "active") {
      params.assigned_only = "true";
    }

    // Filter by expertise and set reassign_mode for 'Reassign' functionality
    if (isReassignMode) {
      const { expertise } = getSession();
      if (expertise && expertise.length > 0) {
        params.expertise = expertise.join(",");
      }
      params.reassign_mode = "true";
    }

    // Also keep username for 'Completed' list if that's how it's filtered
    if (mode === "completed") {
      params.username = username;
    }

    return params;
  }, [mode, filter, config.showStatusFilters, config.defaultStage, config.defaultStatus, isReassignMode]);

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
    const handleRefresh = () => refresh();
    window.addEventListener("app:refresh-data", handleRefresh);
    return () => window.removeEventListener("app:refresh-data", handleRefresh);
  }, [refresh]);

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
        isReassignMode={isReassignMode}
        onToggleReassignMode={toggleReassignMode}
        onConfirmReassign={handleConfirmReassign}
        selectedCount={selectedRecordIds.size}
        showReassignButton={isAdmin && mode === "landing"}
      />

      <Box sx={{ px: 3, py: 2 }}>
        {loading && records.length === 0 ? (
          <DashboardSkeleton />
        ) : (
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
            mode={mode}
            isReassignMode={isReassignMode}
            selectedRecordIds={selectedRecordIds}
            onToggleSelection={handleToggleSelection}
          />
        )}

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

      {/* User Selection Menu for Reassignment */}
      <Menu
        anchorEl={reassignAnchorEl}
        open={Boolean(reassignAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: "2px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid #ddd",
            minWidth: 180,
          },
        }}
      >
        {isReassigning ? (
          <MenuItem disabled sx={{ fontSize: 13 }}>Loading users...</MenuItem>
        ) : eligibleUsers.length === 0 ? (
          <MenuItem disabled sx={{ fontSize: 13 }}>No eligible users found</MenuItem>
        ) : (
          eligibleUsers.map((u) => {
            const name = typeof u === "string" ? u : u.username;
            return (
              <MenuItem
                key={name}
                onClick={() => handleUserSelect(u)}
                sx={{ fontSize: 13, fontWeight: 500, py: 1 }}
              >
                {name}
              </MenuItem>
            );
          })
        )}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecordsListPage;