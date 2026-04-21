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
    if (value === "") {
      onFilterChange("");
    } else {
      onFilterChange(value);
    }
  };

  return (
    <Box>
      <Navbar />

      {/* Page Header */}
      <Box sx={{ px: 3, pt: 10, pb: 1.5, backgroundColor: "#f5f5f5" }}>
        <Typography sx={{ fontSize: 11, color: "#777", mb: 0.5 }}>
          AMD / {title}
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
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            width: 160,
            mr: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "2px",
              fontSize: 12,
              height: 28,
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
                  px: 1,
                  py: 0.25,
                  border: "1px solid #bbb",
                  cursor: "pointer",
                  backgroundColor: isActive ? "#e8e8e8" : "#fff",
                  userSelect: "none",
                  "&:hover": { backgroundColor: "#f0f0f0", borderColor: "#666" },
                  transition: "background-color 0.1s ease",
                }}
              >
                <Checkbox
                  checked={isActive}
                  readOnly
                  size="small"
                  sx={{
                    p: 0,
                    color: "#777",
                    "&.Mui-checked": { color: "#000" },
                    "& .MuiSvgIcon-root": { fontSize: 14 },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#111",
                    letterSpacing: 0.3,
                    lineHeight: 1,
                  }}
                >
                  {f.label}
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
