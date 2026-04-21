import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const ExistingDataRow = ({ existingData, theme }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 1.75,
      py: 0.5,
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        Existing Data
      </Typography>
    </Box>

    <Box sx={{ width: "1px", height: 20, backgroundColor: "#cbd5e1" }} />

    <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap">
      {existingData.map((item, i) => (
        <Stack key={i} direction="row" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5 }}>
            {item.field}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                // Monochrome: underline instead of red for invalid, dark for valid
                color: item.validation_status === "invalid" ?"#990c0cff" :"#0f172a",
                
              }}
            >
              {(() => {
                if (item.history && Array.isArray(item.history) && item.history.length > 0) {
                  return item.history[item.history.length - 1].from || "—";
                }
                return item.value || "—";
              })()}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  </Box>
);

export default ExistingDataRow;
