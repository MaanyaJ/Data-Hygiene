import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const COLUMNS = 3;

const ExecutionInfoBox = ({ executionInfo }) => {
  const entries = Object.entries(executionInfo);

  return (
    <Box
      sx={{
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        borderRadius: 2,
        p: 2,
        mb: 3,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: 13 }}>
        Execution Information
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          bgcolor: "#f8fafc",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: `repeat(${COLUMNS}, 1fr)` },
          }}
        >
          {entries.map(([key, value], index) => {
            const isLastInRow = (index + 1) % COLUMNS === 0;
            const isLastRow = index >= entries.length - (entries.length % COLUMNS || COLUMNS);

            return (
              <Box
                key={key}
                sx={{
                  p: 1.5,
                  borderRight: { md: isLastInRow ? "none" : "1px solid #e2e8f0" },
                  borderBottom: isLastRow ? "none" : "1px solid #e2e8f0",
                }}
              >
                <Typography sx={{ fontSize: 10, color: "#64748b", fontWeight: 700, mb: 0.25, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {key}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>
                  {value ? value : "-"}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default ExecutionInfoBox;