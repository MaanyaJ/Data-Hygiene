import React from "react";
import { Box, Paper, Typography } from "@mui/material";

const COLUMNS = 3;

const ExecutionInfoBox = ({ executionInfo }) => {
  const entries = Object.entries(executionInfo);

  return (
    <Box
      sx={{
        border: "1px solid #a9acafff",
        background:"#f8fafc",
        borderRadius: 2,
        p: 3,
        mb: 5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#17233a", mb: 2 }}>
        Execution Information
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #c8cacdff",
          borderRadius: 2,
          bgcolor: "#e7e5e5ff",
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
                  p: 2,
                  borderRight: { md: isLastInRow ? "none" : "1px solid #b9b5b5ff" },
                  borderBottom: isLastRow ? "none" : "1px solid #b9b5b5ff",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#5b6b82", fontWeight: 600, mb: 0.5 }}>
                  {key}
                </Typography>
                <Typography sx={{ fontSize: 16, color: "#17233a", fontWeight: 600 }}>
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