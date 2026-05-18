import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Menu, MenuItem, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button } from "@mui/material";
import ListHeader from "../components/ListHeader";
import RecordList from "../components/RecordList";
import { ErrorPage } from "@data-hygiene/ui";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { API_URL } from "../config";
import { getSession, authFetch } from "@data-hygiene/core";
import { useSnackbar } from "@data-hygiene/ui";
 
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
 
  // ✅ NEW: track if all pages are selected and store their full records
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [allPageRecords, setAllPageRecords] = useState([]);
 
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [reassignAnchorEl, setReassignAnchorEl] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const isFetchingRef = useRef(false);
  const userAbortRef = useRef(null);
 
  const { showSnackbar, SnackbarComponent } = useSnackbar();
 
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAssignUser, setPendingAssignUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const handleFilterChange = (value) => {
    if (value === "") {
      setFilter([]);
    } else {
      setFilter((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };
 
  const handleUserFilterChange = (username) => {
    setSelectedUsers((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };
 
  const toggleReassignMode = () => {
    const nextMode = !isReassignMode;
    setIsReassignMode(nextMode);
    setSelectedRecordIds(new Set());
    // ✅ Reset all-pages selection when toggling reassign mode
    setAllPagesSelected(false);
    setAllPageRecords([]);
    if (!nextMode) {
      setSelectedUsers([]);
    }
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
 
    if (mode === "active") {
      params.assigned_only = "true";
    }
 
    if (isReassignMode) {
      const { expertise } = getSession();
      if (expertise && expertise.length > 0) {
        params.expertise = expertise.join(",");
      }
      params.status = "pending";
      params.reassign_mode = "true";
    }
 
    if (mode === "completed") {
      params.username = username;
    }
 
    if (selectedUsers.length > 0) {
      params.users = selectedUsers.join(",");
    }
 
    return params;
  }, [mode, filter, config.showStatusFilters, config.defaultStage, config.defaultStatus, isReassignMode, selectedUsers]);
 
  const {
    records, totalRecords, totalPages, page, loading, error,
    searchInput, setSearchInput, search,
    loadMore, retry, refresh, meta,
    patchRecords, removeRecords, updateCounts, isReadyState,
  } = usePaginatedRecords({ extraParams, activeFilters: filter });
 
  // ✅ Reset all-pages selection when filters or search changes
  useEffect(() => {
    setSelectedRecordIds(new Set());
    setAllPagesSelected(false);
    setAllPageRecords([]);
  }, [extraParams, search]);
 
  const handleToggleSelection = (id) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
 
  // ✅ UPDATED: handleSelectAll now calls /invalid-summary/all for full selection
  const handleSelectAll = async () => {
    if (records.length === 0) return;
 
    const allVisibleSelected = records.every(r => selectedRecordIds.has(r.ExecutionId));
 
    // If all pages already selected → deselect everything
    if (allPagesSelected) {
      setSelectedRecordIds(new Set());
      setAllPagesSelected(false);
      setAllPageRecords([]);
      return;
    }
 
    // If current page visible records all selected → deselect all
    if (allVisibleSelected) {
      setSelectedRecordIds(new Set());
      setAllPagesSelected(false);
      setAllPageRecords([]);
      return;
    }
 
    // Instant feedback: select current page first
    setSelectedRecordIds(new Set(records.map(r => r.ExecutionId)));
 
    // Then fetch ALL records across all pages with same active filters
    try {
      const params = new URLSearchParams();
 
      // Pass all active extraParams (same filters as the main API call)
      Object.entries(extraParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          params.set(key, val);
        }
      });
 
      // Pass search if active
      if (search) params.set("search", search);
 
      const res = await authFetch(`${API_URL}/invalid-summary/all?${params.toString()}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
 
      if (data.status === "success") {
        setSelectedRecordIds(new Set(data.data.map(r => r.ExecutionId)));
        setAllPageRecords(data.data); // store full records for reassign
        setAllPagesSelected(true);
      }
    } catch (err) {
      console.error("Failed to fetch all records for select all:", err);
      // Fallback — keep current page selection, don't crash
    }
  };
 
  // ✅ UPDATED: reflects all-pages selection state too
  const isAllSelected = allPagesSelected || (records.length > 0 && records.every(r => selectedRecordIds.has(r.ExecutionId)));
 
  const handleConfirmReassign = (event) => {
    console.log("handleConfirmReassign clicked");
    setReassignAnchorEl(event.currentTarget);
    handleFetchUsers();
  };
 
  const handleFetchUsers = async () => {
    if (userAbortRef.current) {
      userAbortRef.current.abort();
    }
    const controller = new AbortController();
    userAbortRef.current = controller;
 
    isFetchingRef.current = true;
    setEligibleUsers([]);
    setIsReassigning(true);
    try {
      const url = `${API_URL}/eligible-users/`;
      console.log("Fetching eligible users on demand from:", url);
      const res = await authFetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const users = data.eligible_users || (Array.isArray(data) ? data : []);
      setEligibleUsers(users);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to fetch users:", err);
      }
    } finally {
      if (userAbortRef.current === controller) {
        setIsReassigning(false);
        isFetchingRef.current = false;
      }
    }
  };
 
  const handleUserSelect = (user) => {
    setPendingAssignUser(user);
    setConfirmDialogOpen(true);
    setReassignAnchorEl(null);
  };
 
  // ✅ UPDATED: uses allPageRecords when all pages are selected
  const executeReassignment = async () => {
    if (!pendingAssignUser) return;
 
    const targetUser = typeof pendingAssignUser === "string" ? pendingAssignUser : pendingAssignUser.username;
    console.log(`Reassigning records ${Array.from(selectedRecordIds)} to ${targetUser}`);
 
    // If all pages selected use allPageRecords, otherwise use current page records
    const sourceRecords = allPagesSelected ? allPageRecords : records;
 
    const assignments = Array.from(selectedRecordIds).map(id => {
      const record = sourceRecords.find(r => r.ExecutionId === id);
      return {
        e_id: id,
        assign_from: record?.tester || record?.assigned_to || "",
        assign_to: targetUser
      };
    });
 
    setIsSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/reassign-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments })
      });
 
      if (!res.ok) throw new Error(`Reassignment failed: ${res.status}`);
 
      showSnackbar(`Successfully reassigned ${assignments.length} records to ${targetUser}`, "success");
      setConfirmDialogOpen(false);
      setPendingAssignUser(null);
      setIsReassignMode(false);
      setSelectedRecordIds(new Set());
      setSelectedUsers([]);
      // ✅ Reset all-pages selection after successful reassignment
      setAllPagesSelected(false);
      setAllPageRecords([]);
      refresh();
    } catch (err) {
      console.error("Reassign submission error:", err);
      showSnackbar("Failed to reassign records. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const handleMenuClose = () => {
    setReassignAnchorEl(null);
  };
 
  useEffect(() => {
    if (loading || !isReadyState) return;
 
    const hasVal = filter.includes("validation inprogress,validation initiated");
    const hasStd = filter.includes("standardization inprogress");
    const otherCount = filter.length - (hasVal ? 1 : 0) - (hasStd ? 1 : 0);
 
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
    return <ErrorPage message={error?.message || "Something went wrong"} />;
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
        eligibleUsers={eligibleUsers}
        selectedUsers={selectedUsers}
        onUserFilterChange={handleUserFilterChange}
        onAssignedToClick={handleFetchUsers}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
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
<Box sx={{ textAlign: "center", py: 8, backgroundColor: "#ebebebff" }}>
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
<MenuItem disabled sx={{ fontSize: 13 }}>Loading...</MenuItem>
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
 
      {SnackbarComponent}
 
      {/* Reassignment Confirmation Dialog */}
<Dialog
        open={confirmDialogOpen}
        onClose={() => !isSubmitting && setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "2px",
            padding: 1,
            minWidth: 400,
          }
        }}
>
<DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
          Confirm Reassignment
</DialogTitle>
<DialogContent>
<Typography sx={{ fontSize: 14, color: "#333" }}>
            Are you sure you want to assign{" "}
<strong>{selectedRecordIds.size}</strong> records to{" "}
<strong>
              {pendingAssignUser
                ? typeof pendingAssignUser === "string"
                  ? pendingAssignUser
                  : pendingAssignUser.username
                : ""}
</strong>?
</Typography>
</DialogContent>
<DialogActions sx={{ px: 3, pb: 2 }}>
<Button
            onClick={() => setConfirmDialogOpen(false)}
            disabled={isSubmitting}
            sx={{ fontSize: 12, fontWeight: 600, color: "#555" }}
>
            CANCEL
</Button>
<Button
            onClick={executeReassignment}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: "#1b1b1b",
              color: "#fff",
              borderRadius: "2px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#000", boxShadow: "none" },
              "&.Mui-disabled": { backgroundColor: "#eee", color: "#aaa" }
            }}
>
            {isSubmitting ? "ASSIGNING..." : "CONFIRM"}
</Button>
</DialogActions>
</Dialog>
</Box>
  );
};
 
export default RecordsListPage;