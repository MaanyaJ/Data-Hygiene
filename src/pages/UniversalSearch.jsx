import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import UniversalCommandBar from "../components/UniversalCommandBar";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";
import { USE_MOCK } from "../config";
import { usePaginatedRecords } from "../hooks/usePaginatedRecords";
import mockList from "../mock/mockList.json";
import mockOnHold from "../mock/mockOnHold.json";

// ── Age helpers ───────────────────────────────────────────────────────────────
const getDays = (dateStr) => {
  if (!dateStr) return null;
  return (Date.now() - new Date(dateStr).getTime()) / 86400000;
};

const AGE_GREEN = { bg: "#e8f5e9", border: "#43a047" };
const AGE_YELLOW = { bg: "#fff8e1", border: "#ffa000" };
const AGE_RED = { bg: "#ffebee", border: "#e53935" };

const colorFromDays = (days) => {
  if (days === null) return null;
  if (days < 3) return AGE_GREEN;
  if (days <= 6) return AGE_YELLOW;
  return AGE_RED;
};

const activeAgeColor = (r) => colorFromDays(getDays(r?.updatedOn));
const onholdAgeColor = (r) => colorFromDays(getDays(r?.holdedOn));

const ageFilter = (days, filterId) => {
  if (days === null) return false;
  if (filterId === "<3") return days < 3;
  if (filterId === "3-6") return days >= 3 && days <= 6;
  if (filterId === ">6") return days > 6;
  return true;
};

// ── Filter chip definitions ───────────────────────────────────────────────────
const AGE_FILTERS = [
  { id: "<3", label: "< 3 Days", chipColor: "#2e7d32", chipBg: "#e8f5e9" },
  { id: "3-6", label: "3 – 6 Days", chipColor: "#f57f17", chipBg: "#fff8e1" },
  { id: ">6", label: "> 6 Days", chipColor: "#b71c1c", chipBg: "#ffebee" },
];

const HOLD_FILTERS = AGE_FILTERS.map((f) => ({
  ...f,
  label: f.label + " On Hold",
}));

const COMPLETED_FILTERS = [
  { id: "approved", label: "Accepted", chipColor: "#2e7d32", chipBg: "#e8f5e9" },
  { id: "rejected", label: "Rejected", chipColor: "#b71c1c", chipBg: "#ffebee" },
];

// Filters for the combined "All" view — filter by status
const STATUS_FILTERS = [
  { id: "pending", label: "Active / Pending", chipColor: "#1565c0", chipBg: "#e3f2fd" },
  { id: "onhold", label: "On Hold", chipColor: "#e65100", chipBg: "#fff3e0" },
  { id: "approved", label: "Accepted", chipColor: "#2e7d32", chipBg: "#e8f5e9" },
  { id: "rejected", label: "Rejected", chipColor: "#b71c1c", chipBg: "#ffebee" },
];

// ── VIEWS config ──────────────────────────────────────────────────────────────
// `filters` → shown in CommandBar dropdown
// `extraParams` → forwarded to real API
// `ageColorFn` → passed to RecordList for card background color
// `getMockData` → returns raw records for mock mode
// `applyFilter` → client-side filter fn (age or status)
const VIEWS = [
  {
    id: "active",
    label: "My Active List",
    filters: AGE_FILTERS,
    extraParams: {},
    ageColorFn: activeAgeColor,
    getMockData: () =>
      mockList.data.filter((r) => r.Status?.toUpperCase() === "PENDING"),
    applyFilter: (r, fid) => ageFilter(getDays(r?.updatedOn), fid),
  },
  {
    id: "onhold",
    label: "On Hold",
    filters: HOLD_FILTERS,
    extraParams: { status: "onhold" },
    ageColorFn: onholdAgeColor,
    getMockData: () => mockOnHold.data,
    applyFilter: (r, fid) => ageFilter(getDays(r?.holdedOn), fid),
  },
  {
    id: "completed",
    label: "My Completed",
    filters: COMPLETED_FILTERS,
    extraParams: { status: "completed" },
    ageColorFn: null,
    getMockData: () => mockList.data,
    applyFilter: (r, fid) => r.Status?.toLowerCase() === fid,
  },
  {
    id: "all",
    label: "All",
    filters: STATUS_FILTERS,
    extraParams: {},                         // no status param → API returns all
    ageColorFn: null,
    getMockData: () => [...mockList.data, ...mockOnHold.data],
    applyFilter: (r, fid) => r.Status?.toLowerCase() === fid,
  },
];

// Stripped-down objects safe to pass to CommandBar (no functions). Skip 'all' since it's the implicit default.
const CMD_VIEWS = VIEWS.filter((v) => v.id !== "all").map(({ id, label, filters }) => ({ id, label, filters }));

// ── Quick-select view cards shown in empty state ──────────────────────────────
const VIEW_CARDS = [
  { id: "active", label: "Active List", color: "#1565c0", bg: "#e3f2fd" },
  { id: "onhold", label: "On Hold", color: "#e65100", bg: "#fff3e0" },
  { id: "completed", label: "Completed", color: "#2e7d32", bg: "#e8f5e9" },
  { id: "all", label: "All", color: "#4a148c", bg: "#f3e5f5" },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const UniversalSearch = () => {
  // Full VIEWS entry (has functions) — not passed to CommandBar directly
  const [selectedView, setSelectedView] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fallback to "All" view behavior when no view is explicitly selected
  const activeView = selectedView || VIEWS.find((v) => v.id === "all");

  // ── Real API: extraParams derived from view + filter ──────────────────────
  const extraParams = useMemo(() => {
    // For views where the filter maps to a backend status param:
    //   completed (approved/rejected) and all (pending/onhold/approved/rejected)
    if (
      selectedFilter &&
      (activeView.id === "completed" || activeView.id === "all")
    ) {
      return { status: selectedFilter.id };
    }
    return activeView.extraParams ?? {};
  }, [activeView, selectedFilter]);

  // Always call the hook (React rules); data only used when USE_MOCK=false
  const {
    records: apiRecords,
    totalRecords,
    totalPages,
    page,
    loading: apiLoading,
    error,
    loadMore,
    retry,
    setSearchInput,   // ← hook's debounced search → sent to real API
  } = usePaginatedRecords({ extraParams });

  // ── Mock records: filtered entirely client-side ───────────────────────────
  const mockRecords = useMemo(() => {
    if (!USE_MOCK) return [];

    let recs = activeView.getMockData();

    if (selectedFilter) {
      recs = recs.filter((r) => activeView.applyFilter(r, selectedFilter.id));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      recs = recs.filter((r) =>
        [r.ExecutionId, r.BenchmarkType, r.BenchmarkCategory].some((v) =>
          v?.toLowerCase().includes(term)
        )
      );
    }

    return recs;
  }, [activeView, selectedFilter, searchTerm]);

  // ── Real API: apply client-side age filter for active / onhold ───────────
  const apiFilteredRecords = useMemo(() => {
    if (!selectedFilter) return apiRecords;
    if (["active", "onhold"].includes(activeView.id)) {
      return apiRecords.filter((r) =>
        activeView.applyFilter(r, selectedFilter.id)
      );
    }
    return apiRecords;
  }, [apiRecords, activeView, selectedFilter]);

  const records = USE_MOCK ? mockRecords : apiFilteredRecords;
  const loading = USE_MOCK ? false : apiLoading;
  const total = USE_MOCK ? records.length : totalRecords;
  const pages = USE_MOCK ? 1 : totalPages;
  const loadMoreFn = USE_MOCK ? () => { } : loadMore;

  // ── View & filter handlers ────────────────────────────────────────────────
  const handleViewSelect = (cmdView) => {
    const full = VIEWS.find((v) => v.id === cmdView.id) ?? null;
    setSelectedView(full);
    setSelectedFilter(null);
    setSearchTerm("");
    setSearchInput("");   // reset API search too
  };

  const handleViewClear = () => {
    setSelectedView(null);
    setSelectedFilter(null);
    setSearchTerm("");
    setSearchInput("");   // reset API search too
  };

  // Called by CommandBar when the user types (after view/filter tokens)
  const handleSearchChange = (val) => {
    setSearchTerm(val);      // used for mock client-side filtering
    setSearchInput(val);     // triggers debounced API fetch
  };

  if (!USE_MOCK && error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={retry}
      />
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar />

      {/* ── Hero ── */}
      <Box sx={{ textAlign: "center", pt: 8, pb: 5, px: 2 }}>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ mb: 1.5, color: "#17233a", letterSpacing: -1 }}
        >
          Data Hygiene
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 5, fontSize: 16 }}
        >
          Search across Active, On Hold, and Completed records
        </Typography>

        {/* ── Command bar ── */}
        <UniversalCommandBar
          views={CMD_VIEWS}
          selectedView={
            selectedView
              ? {
                id: selectedView.id,
                label: selectedView.label,
                filters: selectedView.filters,
              }
              : null
          }
          selectedFilter={selectedFilter}
          defaultFilters={VIEWS.find((v) => v.id === "all").filters}
          onViewSelect={handleViewSelect}
          onFilterSelect={setSelectedFilter}
          onSearchChange={handleSearchChange}
          onViewClear={handleViewClear}
          onFilterClear={() => setSelectedFilter(null)}
        />
      </Box>

      {/* ── Results ── */}
      <Box>
        {/* Result summary */}
        <Typography
          align="center"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {loading
            ? "Loading..."
            : `${total} record${total !== 1 ? "s" : ""}`}
          {selectedFilter && ` · ${selectedFilter.label}`}
          {searchTerm && ` · "${searchTerm}"`}
        </Typography>

        <RecordList
          records={records}
          totalRecords={total}
          totalPages={pages}
          page={page}
          loading={loading}
          onLoadMore={loadMoreFn}
          showAgeColors={!!activeView.ageColorFn}
          ageColorFn={activeView.ageColorFn ?? undefined}
          showCount={false}
        />

        {!loading && records.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Typography color="text.secondary" variant="h6" fontWeight={400}>
              No records found
            </Typography>
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ mt: 1 }}
            >
              Try a different filter or search term
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UniversalSearch;
