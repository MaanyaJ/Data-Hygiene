import React from "react";
import { Box, Typography, TextField, Stack } from "@mui/material";
 
const OnHoldListHeader = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  green,
  yellow,
  red,
}) => {
  const PATCH_FILTERS = [
    {
      label: `< 3 Days Old : ${green}`,
      value: "<3",
      color: "#2e7d32",
      activeColor: "#1b5e20",
      bg: "#e8f5e9",
      activeBg: "#43a047",
      dot: "#66bb6a",
    },
    {
      label: `3 - 6 Days Old : ${yellow}`,
      value: "3-6",
      color: "#f57f17",
      activeColor: "#e65100",
      bg: "#fff8e1",
      activeBg: "#ffa000",
      dot: "#ffd54f",
    },
    {
      label: `> 6 Days Old : ${red}`,
      value: ">6",
      color: "#b71c1c",
      activeColor: "#7f0000",
      bg: "#ffebee",
      activeBg: "#e53935",
      dot: "#ef9a9a",
    },
  ];
 
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ my: 3, mt: -4 }}>
        On Hold List
      </Typography>
 
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        gap={4}
        sx={{ px: 2, mb: 3 }}
      >
        <TextField
          label="Search (Execution Id, Benchmark Type, Benchmark Category)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 500 }}
        />
 
        <Stack direction="row" gap={1.5} sx={{ flexWrap: "wrap" }}>
          {PATCH_FILTERS.map(
            ({ label, value, bg, activeBg, color, activeColor, dot }) => {
              const isActive = filter === value;
 
              return (
                <Box
                  key={value}
                  onClick={() => onFilterChange(value)}
                  sx={{
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
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: isActive ? "#fff" : dot,
                    }}
                  />
                  {label}
                </Box>
              );
            }
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
 
export default OnHoldListHeader;