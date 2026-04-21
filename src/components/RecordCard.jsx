import React from "react";
import InconsistentFieldsList from "./InconsistentFieldsList";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

const RecordCard = ({ record, index = 0 }) => {
  const invalidFields = record["InvalidFields"];
  const navigate = useNavigate();
  const status = record.Status?.toLowerCase();
  const isCompleted = status === "accepted" || status === "approved";
  const isEven = index % 2 === 0;

  const handleClick = () => navigate(`/${record.ExecutionId}`);

  const stopAndNavigate = (e) => {
    e.stopPropagation();
    navigate(`/${record.ExecutionId}`);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 3,
        height: 74, // Fixed height for uniformity
        mb: "6px",   // Uniform gap
        backgroundColor: isEven ? "#ffffff" : "#fafafa",
        border: "1px solid #e0e0e0",
        cursor: "pointer",
        transition: "background-color 0.1s ease, box-shadow 0.1s ease",
        "&:hover": { backgroundColor: "#eef2f6", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" },
      }}
    >
      {/* Execution ID */}
      <Box sx={{ width: "18%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 10, color: "#888", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Execution ID
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#000", wordBreak: "break-all", lineHeight: 1.2 }}>
          {record.ExecutionId}
        </Typography>
      </Box>

      {/* Benchmark Category */}
      <Box sx={{ width: "15%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 10, color: "#888", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Category
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkCategory}
        </Typography>
      </Box>

      {/* Benchmark Type */}
      <Box sx={{ width: "15%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 10, color: "#888", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Type
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkType}
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ width: "12%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 10, color: "#888", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Status
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#000", lineHeight: 1.2 }}>
          {record.Status?.toLowerCase() === "rejected" ? "L0 Data" : record.Status}
        </Typography>
      </Box>

      {/* Inconsistent Fields */}
      <Box sx={{ flex: 1, pr: 2, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 10, color: "#888", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5,
            visibility: isCompleted ? "hidden" : "visible" }}
        >
          Inconsistent Fields
        </Typography>
        <Box sx={{ visibility: isCompleted ? "hidden" : "visible", minHeight: 22 }}>
          <InconsistentFieldsList
            invalidFields={invalidFields}
            SuggestionsCount={record.suggestionsCount}
            status={record.Status}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexShrink: 0, pt: 0.5 }}>
        <IconButton
          size="small"
          onClick={stopAndNavigate}
          title="Open Record"
          sx={{
            border: "1px solid #c8c8c8",
            borderRadius: "2px",
            p: 0.5,
            color: "#555",
            "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#000" },
          }}
        >
          <ArticleOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={stopAndNavigate}
          title="View Details"
          sx={{
            border: "1px solid #c8c8c8",
            borderRadius: "2px",
            p: 0.5,
            color: "#555",
            "&:hover": { backgroundColor: "#000", color: "#fff", borderColor: "#000" },
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RecordCard;
