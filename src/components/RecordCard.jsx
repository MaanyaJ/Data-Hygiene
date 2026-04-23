import React, { useState } from "react";
import InconsistentFieldsList from "./InconsistentFieldsList";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

const RecordCard = ({ record, index = 0 }) => {
  const [isClicked, setIsClicked] = useState(false);
  const invalidFields = record["InvalidFields"];
  const navigate = useNavigate();
  const status = record.Status?.toLowerCase();
  const isCompleted = status === "accepted" || status === "approved";
  const isEven = index % 2 === 0;

  const handleClick = () => navigate(`/${record.ExecutionId}`);

  const stopAndNavigate = (e) => {
    e.stopPropagation();
    setIsClicked(true);
    navigate(`/${record.ExecutionId}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        px: 3,
        height: 78, // Fixed height for uniformity
        width: "97%",
        mb: "6px",   // Uniform gap
        py:2,
        backgroundColor: isEven ? "#ffffff" : "#fafafa",
        boxShadow:"0 2px 8px rgba(0,0,0,0.07)",
        transition: "background-color 0.1s ease, box-shadow 0.1s ease",
        gap: 2
    
      }}
    >
      {/* Execution ID */}
      <Box sx={{ width: "18%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Execution ID
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", wordBreak: "break-all", lineHeight: 1.2 }}>
          {record.ExecutionId}
        </Typography>
      </Box>

      {/* updated on */}
      <Box sx={{ width: "7%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Updated On
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {new Date(record.updatedOn).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Benchmark Category */}
      <Box sx={{ width: "8%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
         Benchmark Category
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkCategory}
        </Typography>
      </Box>

      {/* Benchmark Type */}
      <Box sx={{ width: "10%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
         Benchmark Type
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkType}
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ width: "6%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
            textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Status
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.Status?.toLowerCase() === "rejected" ? "L0 Data" : record.Status}
        </Typography>
      </Box>

      {/* Inconsistent Fields */}
      <Box sx={{width: "39%", pr: 2, flexShrink: 0 }}>
        <Typography
          sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
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
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", pt: 0.5 }}>
      
        <IconButton
          size="medium"
          onClick={stopAndNavigate}
          title="View Details"
          sx={{
            border: "1px solid #c8c8c8",
            borderRadius: "2px",
            p: 0.5,
            mt:1,
        
            backgroundColor: isClicked? "#fef7f7ff": "#000", color: "#ffffffff", borderColor: "#000",
            "&:hover": { backgroundColor: "#fef7f7ff", color: "#000", borderColor: "#000" },
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RecordCard;
