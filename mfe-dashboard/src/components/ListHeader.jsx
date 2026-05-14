import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
  Checkbox,
  Popover,
  Divider,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { Button } from "@mui/material";

const ListHeader = ({
  title,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts = {},
  showAgeFilters = false,
  showStatusFilters = false,
  showStageFilters = false,
  allowedFilters,
  loading,
  totalRecords,
  countLabel,
  isReassignMode,
  onToggleReassignMode,
  onConfirmReassign,
  selectedCount = 0,
  showReassignButton = false,
  // User assignment dropdown props
  eligibleUsers = [],
  isLoadingUsers = false,
  onUserSelect,
  isAssignDropdownOpen = false,
  onAssignDropdownClose,
}) => {
  const assignDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Close Assign dropdown when clicking outside
  useEffect(() => {
    if (!isAssignDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(e.target)) {
        onAssignDropdownClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAssignDropdownOpen, onAssignDropdownClose]);

  // Close Filter dropdown when clicking outside
  useEffect(() => {
    if (!isFilterDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterDropdownOpen]);

  const AGE_FILTERS = [
    { label: "< 3 DAYS", value: "<3" },
    { label: "3 - 6 DAYS", value: "3-6" },
    { label: "> 6 DAYS", value: ">6" },
  ];

  const STATUS_FILTERS = [
    { label: "ACTION REQUIRED", value: "pending" },
    { label: "ACCEPTED", value: "accepted" },
    { label: "L0 DATA", value: "rejected" },
    { label: "ON HOLD", value: "On Hold" },
  ];

  const STAGE_FILTERS = [
    { label: "VALIDATION IN PROGRESS", value: "validation inprogress,validation initiated" },
    { label: "STANDARDIZATION IN PROGRESS", value: "standardization inprogress" },
  ];

  const baseFilters = showAgeFilters
    ? AGE_FILTERS
    : showStatusFilters
      ? STATUS_FILTERS
      : [];

  const visibleFilters = baseFilters.filter(
    (f) => !f.value || !allowedFilters || allowedFilters.includes(f.value)
  );

  const handleFilterClick = (value) => {
    onFilterChange(value);
  };

  // Map filter value → summary key from API / WS response
  const STATUS_KEY_MAP = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    "On Hold": "ON HOLD",
    "validation inprogress,validation initiated": "VALIDATION_IN_PROGRESS",
    "standardization inprogress": "STANDARDIZATION_IN_PROGRESS",
  };
  const AGE_KEY_MAP = { "<3": "green", "3-6": "yellow", ">6": "red" };

  const getCount = (filterValue) => {
    if (!counts) return null;

    if (filterValue === "validation inprogress,validation initiated") {
      const init = counts.VALIDATION_INITIATED || 0;
      const prog = counts.VALIDATION_IN_PROGRESS || 0;
      // If both are 0, might mean the keys aren't in this message; 
      // but usually we want to show 0 if explicitly present.
      // We'll return the sum if either exists.
      if (counts.VALIDATION_INITIATED === undefined && counts.VALIDATION_IN_PROGRESS === undefined) return null;
      return init + prog;
    }

    const key = STATUS_KEY_MAP[filterValue] ?? AGE_KEY_MAP[filterValue];
    const val = key !== undefined ? counts[key] : undefined;
    return val !== undefined ? val : null;
  };

  return (
    <Box>

      {/* Page Header */}
      <Box sx={{ px: 3, pt: 3, pb: 1.5, backgroundColor: "#ebebebff" }}>
        <Typography
          sx={{ fontSize: 20, fontWeight: 700, color: "#000", lineHeight: 1.2 }}
        >
          {title}
          {/* A/B Option 'UP': Show count next to title
          {totalRecords !== undefined && (
            <Box component="span" sx={{ fontSize: 14, fontWeight: 500, color: "#666", ml: 2 }}>
              ({totalRecords} Records)
            </Box>
          )}
          */}
        </Typography>
      </Box>

      {/* Filter + Search Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 0.75,
          flexWrap: "wrap",
          minHeight: 48,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search for a ExecutionID/ BenchmarkType/ BenchmarkCategory"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            width: 380,
            mr: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "2px",
              fontSize: 12,
              height: 40,
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#bbb" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#000", borderWidth: "1px" },
            },
            "& input": { px: 1, py: 0.5, fontSize: 12 },
          }}
          slotProps={{
            input: {
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={12} color="inherit" />
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Unified Filter Dropdown */}
        <Box ref={filterDropdownRef} sx={{ position: "relative" }}>
          <Box
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: 1.5,
              height: 40,
              minWidth: 160,
              border: "1px solid #bbb",
              borderRadius: "2px",
              backgroundColor: "#fff",
              cursor: "pointer",
              "&:hover": { borderColor: "#555" },
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", letterSpacing: 0.5 }}>
              {showAgeFilters ? "AGE" : "STATE"}
              {filter.length > 0 && (
                <Box component="span" sx={{ color: "#777", ml: 0.5, fontWeight: 400 }}>
                  ({filter.length})
                </Box>
              )}
            </Typography>
            {isFilterDropdownOpen ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 18, color: "#777" }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#777" }} />
            )}
          </Box>

          {/* Smooth Filter Dropdown */}
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              zIndex: 1300,
              minWidth: 180,
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
              maxHeight: isFilterDropdownOpen ? "500px" : "0px",
              opacity: isFilterDropdownOpen ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.2s ease",
            }}
          >
            <Stack sx={{ p: 1 }} gap={0.5}>
              {visibleFilters.map((f) => {
                const isActive = f.value === "" ? filter.length === 0 : filter.includes(f.value);
                return (
                  <Box
                    key={f.value || "all"}
                    onClick={() => handleFilterClick(f.value)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1,
                      py: 1,
                      cursor: "pointer",
                      borderRadius: "2px",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <Checkbox
                      checked={isActive}
                      size="small"
                      sx={{ p: 0, color: "#999", "&.Mui-checked": { color: "#000" } }}
                    />
                    <Typography sx={{ fontSize: 12, fontWeight: 550, color: "#111", display: "flex", alignItems: "center", gap: 0.5 }}>
                      {f.label}
                      <Box component="span" sx={{ fontSize: 11, fontWeight: 400, color: "#888" }}>
                        ({loading ? "0" : getCount(f.value)?.toLocaleString() || "0"})
                      </Box>
                    </Typography>
                  </Box>
                );
              })}

              {/* Stage filters — only on pages that opt in (landing/dashboard) */}
              {showStageFilters && (
                <>
                  <Divider sx={{ my: 0.5 }} />
                  {STAGE_FILTERS.map((f) => {
                    const isActive = filter.includes(f.value);
                    return (
                      <Box
                        key={f.value}
                        onClick={() => handleFilterClick(f.value)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1,
                          py: 1,
                          cursor: "pointer",
                          borderRadius: "2px",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <Checkbox
                          checked={isActive}
                          size="small"
                          sx={{ p: 0, color: "#999", "&.Mui-checked": { color: "#000" } }}
                        />
                        <Typography sx={{ fontSize: 12, fontWeight: 550, color: "#111", display: "flex", alignItems: "center", gap: 0.5 }}>
                          {f.label}
                          <Box component="span" sx={{ fontSize: 11, fontWeight: 400, color: "#888" }}>
                            ({loading ? "0" : getCount(f.value)?.toLocaleString() || "0"})
                          </Box>
                        </Typography>
                      </Box>
                    );
                  })}
                </>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto" }}>
          {isReassignMode ? (
            <>
              <Button
                size="small"
                onClick={onToggleReassignMode}
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#555",
                  "&:hover": { backgroundColor: "transparent", color: "#000" },
                }}
              >
                CANCEL
              </Button>
              {/* ASSIGN TO button with smooth inline dropdown */}
              <Box ref={assignDropdownRef} sx={{ position: "relative" }}>
                <Button
                  variant="contained"
                  disabled={selectedCount === 0}
                  onClick={onConfirmReassign}
                  endIcon={isAssignDropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: "#ccc",
                    color: "#666",
                    boxShadow: "none",
                    borderRadius: "2px",
                    px: 2,
                    height: 36,
                    "&.Mui-disabled": { backgroundColor: "#eee", color: "#aaa" },
                    "&:hover": { backgroundColor: "#bbb", boxShadow: "none" },
                    ...(selectedCount > 0 && {
                      backgroundColor: "#1b1b1b",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#111" },
                    }),
                  }}
                >
                  ASSIGN TO
                </Button>

                {/* Smooth slide-down dropdown */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 1300,
                    minWidth: 180,
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                    // Smooth slide + fade animation
                    maxHeight: isAssignDropdownOpen ? "320px" : "0px",
                    opacity: isAssignDropdownOpen ? 1 : 0,
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                  }}
                >
                  {/* Header row */}
                  <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.8, textTransform: "uppercase" }}>
                      Assign to
                    </Typography>
                  </Box>

                  {/* User list */}
                  <Box sx={{ overflowY: "auto", maxHeight: "240px" }}>
                    {isLoadingUsers ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 2 }}>
                        <CircularProgress size={14} sx={{ color: "#888" }} />
                        <Typography sx={{ fontSize: 12, color: "#888" }}>Loading users…</Typography>
                      </Box>
                    ) : eligibleUsers.length === 0 ? (
                      <Box sx={{ px: 2, py: 2 }}>
                        <Typography sx={{ fontSize: 12, color: "#aaa" }}>No eligible users found</Typography>
                      </Box>
                    ) : (
                      eligibleUsers.map((u) => {
                        const name = typeof u === "string" ? u : u.username;
                        return (
                          <Box
                            key={name}
                            onClick={() => onUserSelect?.(u)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              px: 2,
                              py: 1.25,
                              cursor: "pointer",
                              transition: "background-color 0.15s ease",
                              "&:hover": { backgroundColor: "#f5f5f5" },
                              "&:active": { backgroundColor: "#efefef" },
                            }}
                          >
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                backgroundColor: "#1b1b1b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 15, color: "#fff" }} />
                            </Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#111", lineHeight: 1.3 }}>
                              {name}
                            </Typography>
                          </Box>
                        );
                      })
                    )}
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <>
              {showReassignButton && (
                <Button
                  variant="outlined"
                  onClick={onToggleReassignMode}
                  startIcon={<AddIcon />}
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#1b1b1b",
                    borderColor: "#bbb",
                    borderRadius: "2px",
                    height: 40,
                    px: 2,
                    "&:hover": { borderColor: "#000", backgroundColor: "#f5f5f5" },
                  }}
                >
                  REASSIGN
                </Button>
              )}
            </>
          )}

          {/* Record Count - Moved beside buttons */}
          {totalRecords !== undefined && (
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#000", pr: 1 }}>
              No.of Records: {totalRecords}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ListHeader;