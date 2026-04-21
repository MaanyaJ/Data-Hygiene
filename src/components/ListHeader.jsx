import React from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
  Checkbox,
} from "@mui/material";
import Navbar from "./Navbar";

const ListHeader = ({
  title,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts = {},
  showAgeFilters = false,
  showStatusFilters = false,
  allowedFilters,
  loading = false,
  totalRecords,
  countLabel,
}) => {
  const AGE_FILTERS = [
    { label: "< 3 DAYS", value: "<3" },
    { label: "3 - 6 DAYS", value: "3-6" },
    { label: "> 6 DAYS", value: ">6" },
  ];

  const STATUS_FILTERS = [
    { label: "PENDING", value: "pending" },
    { label: "ACCEPTED", value: "accepted" },
    { label: "L0 DATA", value: "rejected" },
    { label: "ON HOLD", value: "On Hold" },
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

  // Map filter value → summary key from API response
  const STATUS_KEY_MAP = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    "On Hold": "ON HOLD",
  };
  const AGE_KEY_MAP = { "<3": "green", "3-6": "yellow", ">6": "red" };

  const getCount = (filterValue) => {
    const summary = counts?.summary;
    if (!summary) return null;
    const key = STATUS_KEY_MAP[filterValue] ?? AGE_KEY_MAP[filterValue];
    const val = key !== undefined ? summary[key] : undefined;
    return val !== undefined ? val : null;
  };

  return (
    <Box>
      <Navbar />

      {/* Page Header */}
      <Box sx={{ px: 3, pt: 10, pb: 1.5, backgroundColor: "#ebebebff"}}>
        <Typography sx={{ fontSize: 12, color: "#777", mb: 0.5 }}>
          AMD_DH / {title}
        </Typography>
        <Typography
          sx={{ fontSize: 20, fontWeight: 700, color: "#000", lineHeight: 1.2 }}
        >
          {title}
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
            "& input": { px: 1, py: 0.5, fontSize: 12},
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

        {/* Filter checkbox buttons */}
        <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
          {visibleFilters.map((f) => {
            const isActive = f.value === "" ? filter === "" : filter === f.value;
            return (
              <Box
                key={f.value || "all"}
                onClick={() => handleFilterClick(f.value)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 0.8,
                  py: 0.8,
                 
                  border: isActive ? "1px solid #0e0808ff" : "none",
                  cursor: "pointer",
                  borderRadius:"3px",
                 
                }}
              >
                <Checkbox
                  checked={isActive}
                  readOnly
                  size="large"
                  sx={{
                    p: 0,

                    color: "#605d5dff",
                    "&.Mui-checked": { color: "#030202ff" },
                    "& .MuiSvgIcon-root": { fontSize: 22 },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 550,
                    color: isActive ? "#111" : "#5e5d5dff",
                    letterSpacing: 0.3,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  
                  {f.label}
                  {getCount(f.value) !== null && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: isActive ? "#444" : "#888",
                      }}
                    >
                      ({!loading ? "(0)" : getCount(f.value).toLocaleString()})
                      {console.log(f.value)}
                    </Box>
                  )}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Record Count */}
        {totalRecords !== undefined && (
          <Typography sx={{ fontSize: 12, color: "#555", whiteSpace: "nowrap", fontStyle: "italic" }}>
            No.of Records: {totalRecords}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ListHeader;
