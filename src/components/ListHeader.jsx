import React from "react";
import { Box, Typography, TextField, Stack, CircularProgress, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "./Navbar";

/**
 * Common styling for the status/age patches
 */
const patchSx = (isActive, activeBg, bg, activeColor, color, dot) => ({
  display: "flex",
  alignItems: "center",
  gap: 1,
  px: 2,
  py: 1.2,
  borderRadius: "10px",
  cursor: "pointer",
  userSelect: "none",
  background: isActive ? activeBg : bg,
  border: `2px solid ${isActive ? activeColor : color}`,
  color: isActive ? "#fff" : color,
  fontWeight: isActive ? 700 : 500,
  fontSize: "0.85rem",
  transition: "all 0.2s ease",
  boxShadow: isActive
    ? `0 4px 14px 0 ${activeBg}aa`
    : "0 1px 4px rgba(0,0,0,0.08)",
  transform: isActive ? "translateY(-2px)" : "none",
  "&:hover": {
    background: isActive ? activeColor : `${color}18`,
    transform: "translateY(-2px)",
    boxShadow: `0 4px 14px 0 ${dot}99`,
  },
});

const dotSx = (isActive, dot) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: isActive ? "#fff" : dot,
  flexShrink: 0,
  transition: "background 0.2s ease",
});

const ListHeader = ({
  title,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  counts = {},
  showAgeFilters = false,
  showStatusFilters = false,
  allowedFilters,   // optional array of status values to restrict which buttons show
  loading = false,
}) => {
  const AGE_FILTERS = [
    {
      label: `< 3 Days`,
      value: "<3",
      countKey: "green",
      color: "#2e7d32",
      activeColor: "#1b5e20",
      bg: "#e8f5e9",
      activeBg: "#43a047",
      dot: "#66bb6a",
    },
    {
      label: `3 - 6 Days`,
      value: "3-6",
      countKey: "yellow",
      color: "#f57f17",
      activeColor: "#e65100",
      bg: "#fff8e1",
      activeBg: "#ffa000",
      dot: "#ffd54f",
    },
    {
      label: `> 6 Days`,
      value: ">6",
      countKey: "red",
      color: "#b71c1c",
      activeColor: "#7f0000",
      bg: "#ffebee",
      activeBg: "#e53935",
      dot: "#ef9a9a",
    },
  ];

  const STATUS_FILTERS = [
    { label: "Pending",  value: "pending", color: "#e65100", activeColor: "#ef6c00", bg: "#fff8e1", activeBg: "#ffa000", dot: "#ffd54f" },
    { label: "Accepted", value: "accepted", color: "#2e7d32", activeColor: "#1b5e20", bg: "#e8f5e9", activeBg: "#43a047", dot: "#66bb6a" },
    { label: "Rejected", value: "rejected", color: "#b71c1c", activeColor: "#c62828", bg: "#ffebee", activeBg: "#e53935", dot: "#ef9a9a" },
    { label: "On Hold",  value: "On Hold",  color: "#9e860dff", activeColor: "#6d28d9", bg: "#f1f0e9ff", activeBg: "#ffd600", dot: "#ffde33" },
  ];

  return (
    <Box>
      <Navbar />
      <Typography variant="h3" align="center" sx={{ my: 3, mt: -4, fontWeight: 700, color: "#1e293b" }}>
        {title}
      </Typography>

      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        sx={{ px: 2, mb: 3, flexWrap: "wrap" }}
      >
        <TextField
          placeholder="Search Execution ID, Type, or Category..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="outlined"
          sx={{ 
            width: { xs: "90%", md: 500 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              "&:hover": { boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} thickness={5} />
                </InputAdornment>
              ) : null
            }
          }}
        />

        <Stack direction="row" gap={1.5} sx={{ flexWrap: "wrap", justifyContent: "center" }}>
          {showAgeFilters && AGE_FILTERS.map((f) => {
            const isActive = filter === f.value;
            const count = counts[f.countKey];
            return (
              <Box 
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                sx={patchSx(isActive, f.activeBg, f.bg, f.activeColor, f.color, f.dot)}
              >
                <Box sx={dotSx(isActive, f.dot)} />
                {f.label}

              </Box>
            );
          })}


          {showStatusFilters && STATUS_FILTERS
            .filter((f) => !allowedFilters || allowedFilters.includes(f.value))
            .map((f) => {
              const isActive = filter === f.value;
              return (
                <Box 
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  sx={patchSx(isActive, f.activeBg, f.bg, f.activeColor, f.color, f.dot)}
                >
                  <Box sx={dotSx(isActive, f.dot)} />
                  {f.label}
                </Box>
              );
            })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ListHeader;
