import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
 
const InfoItem = ({ label, value, borderRight = false, borderBottom = false }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRight: { md: borderRight ? "1px solid #e5eaf2" : "none" },
        borderBottom: {
          xs: borderBottom ? "1px solid #e5eaf2" : "none",
          md: "none",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "#5b6b82",
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
 
      <Typography
        sx={{
          fontSize: 16,
          color: "#17233a",
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};
 
const ExecutionInfoBox = ({ executionInfo }) => {
  return (
    <Box
      sx={{
        border: "1px solid #e5eaf2",
        borderRadius: 2,
        p: 3,
        mb: 5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
       
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#17233a",
          }}
        >
          Execution Information
        </Typography>
      </Box>
 
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e5eaf2",
          borderRadius: 2,
          bgcolor: "#f8fafc",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            borderBottom: { md: "1px solid #e5eaf2" },
          }}
        >
          <InfoItem
            label="Benchmark Type"
            value={executionInfo.benchmarkType}
            borderRight
            borderBottom
          />
          <InfoItem
            label="SUT Type"
            value={executionInfo.sutType}
            borderRight
            borderBottom
          />
          <InfoItem
            label="Run Category"
            value={executionInfo.runCategory}
            borderBottom
          />
        </Box>
 
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          <InfoItem
            label="Created On"
            value={executionInfo.createdOn}
            borderRight
            borderBottom
          />
          <InfoItem
            label="Tester"
            value={executionInfo.tester}
            borderRight
            borderBottom
          />
          <InfoItem label="Result Type" value={executionInfo.resultType} />
        </Box>
      </Paper>
    </Box>
  );
};
 
export default ExecutionInfoBox;