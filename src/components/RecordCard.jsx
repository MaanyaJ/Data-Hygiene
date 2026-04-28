import React, { useState, useEffect, useRef } from "react";
import InconsistentFieldsList from "./InconsistentFieldsList";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * Derives the progress percentage and display label from the Stage / isValid fields.
 *
 * Stage values (case-insensitive):
 *   validation_inprogress          → 25 %
 *   validation_completed + isValid:true  → show "Valid" message  (no bar)
 *   validation_completed + isValid:false → 50 %
 *   standardization_inprogress     → 75 %
 *   standardization_completed      → 100 % then auto-dismiss after 3 s
 */
const getStageInfo = (record, extraParams) => {
  const stage = record.Stage;
  const isValid = record.isValid;
  if (!stage) return null;

  // Normalize: lowercase, trim, then collapse any run of spaces/underscores → single space
  const s = stage.toLowerCase().trim().replace(/[\s_]+/g, " ");

  const activeStages = extraParams?.stage || "";
  const isValidationFilterActive = activeStages.includes("validation inprogress");
  const isStandardizationFilterActive = activeStages.includes("standardization inprogress");
  const isOnlyStandardization = isStandardizationFilterActive && !isValidationFilterActive;

  console.debug("[RecordCard] Stage raw:", stage, "→ normalized:", s, "isValid:", isValid, "isOnlyStandardization:", isOnlyStandardization);



  if (s === "validation initiated") {
    return { pct: 15, label: "Validation initiated…", color: "#f59e0b", isValid: null };
  }
  if (s === "validation inprogress") {
    return { pct: 25, label: "Validation in progress…", color: "#f59e0b", isValid: null };
  }
  if (s === "validation completed") {
    if (isValid === true)
      return { pct: null, label: "This record is valid", color: "#22c55e", isValid: true };
    
    return { pct: 60, label: "Standardization initiated", color: "#3b82f6", isValid: false };
  }
  if (s === "validation failed") {
    return { pct: 50, label: "Validation failed — review required", color: "#ef4444", isValid: null };
  }
  if (s === "standardization inprogress") {
    return { pct: 75, label: "Standardization in progress…", color: "#3b82f6", isValid: null };
  }
  // standardization completed → show bar ONLY while dismissing (animating fill)
  if (s === "standardization completed") {
    if (record.isDismissing) {
      return { pct: 100, label: "Standardization completed", color: "#22c55e", isValid: null };
    }
    return null;
  }
  if (s === "standardization failed") {
    return { pct: 75, label: "Standardization failed — review required", color: "#ef4444", isValid: null };
  }

  console.warn("[RecordCard] Unrecognised stage value:", stage);
  return null;
};

/** Animated progress bar with label (Reverted from A/B testing) */
const StageProgress = ({ pct, label, color, onDismiss }) => {
  const prevPctRef = useRef(pct);
  const isShrinking = pct < prevPctRef.current;

  // Update ref AFTER the render check above
  useEffect(() => {
    prevPctRef.current = pct;
  }, [pct]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "60%", maxWidth: 200 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: color, mb: 0.5, letterSpacing: 0.2 }}>
        {label}
      </Typography>
      <Box sx={{ height: 4, borderRadius: 99, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            borderRadius: 99,
            backgroundColor: color,
            width: `${pct}%`,
            transition: isShrinking ? "none" : "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </Box>
    </Box>
  );
};

/* 
/** Pipeline style progress (Commented for A/B testing)
const PipelineProgress = ({ pct, label, color }) => {
  const segments = [
    { threshold: 25, name: "Validation InProgress" },
    { threshold: 50, name: "Val. Done" },
    { threshold: 75, name: "Standardization InProgreess" },
    { threshold: 100, name: "Completed" },
  ];

  const themeColor = "#3b82f6";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", maxWidth: 320 }}>
      {/* 4 Pipes }
      <Box sx={{ display: "flex", gap: 0.8, height: 8, mb: 0.8 }}>
        {segments.map((seg) => {
          const isPassed = pct >= seg.threshold;
          const isCurrent = pct === seg.threshold;
          return (
            <Box
              key={seg.name}
              sx={{
                flex: 1,
                borderRadius: "2px",
                backgroundColor: isPassed ? (isCurrent ? color : "#3b82f6") : "#e5e7eb",
                transition: "all 0.5s ease",
                position: "relative",
                overflow: "hidden",
                "&::after": isCurrent ? {
                  content: '""',
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  animation: "shimmer 1.5s infinite",
                } : {},
                "@keyframes shimmer": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(100%)" },
                }
              }}
            />
          );
        })}
      </Box>
      
      {/* Pipe Labels }
      <Box sx={{ display: "flex", gap: 0.8 }}>
        {segments.map((seg) => {
          const isPassed = pct >= seg.threshold;
          const isCurrent = pct === seg.threshold;
          return (
            <Typography
              key={seg.threshold}
              sx={{
                flex: 1,
                fontSize: 10,
                fontWeight: isCurrent ? 700 : 600,
                color: isCurrent ? themeColor : isPassed ? "#6b7280" : "#a1a1aa",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {seg.name}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};
*/

const RecordCard = ({ record, index = 0, extraParams }) => {
  const [isClicked, setIsClicked] = useState(false);
  const invalidFields = record["InvalidFields"];
  const navigate = useNavigate();
  const status = record.Status?.toLowerCase();
  const isCompleted = status === "accepted" || status === "approved";
  const isEven = index % 2 === 0;

  const stageInfo = getStageInfo(record, extraParams);

  // Show the stage panel only when there is actionable stage info
  const showStagePanelInsteadOfStatus = !!stageInfo;

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
        height: 78,
        width: "97%",
        mb: "6px",
        py: 2,
        backgroundColor: isEven ? "#ffffff" : "#fafafa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        transition: "background-color 0.1s ease, box-shadow 0.1s ease",
        gap: 2,
        alignItems: "center",
      }}
    >
      {/* Execution ID */}
      <Box sx={{ width: "18%", pr: 2, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Execution ID
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", wordBreak: "break-all", lineHeight: 1.2 }}>
          {record.ExecutionId}
        </Typography>
      </Box>

      {/* Updated On */}
      <Box sx={{ width: "7%", pr: 2, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Updated On
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {new Date(record.updatedOn).toLocaleString()}
        </Typography>
      </Box>

      {/* Benchmark Category */}
      <Box sx={{ width: "8%", pr: 2, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Benchmark Category
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkCategory}
        </Typography>
      </Box>

      {/* Benchmark Type */}
      <Box sx={{ width: "10%", pr: 2, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Benchmark Type
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
          {record.BenchmarkType}
        </Typography>
      </Box>

      {/* ──────────────────────────────────────────────────────────
           STAGE PANEL  ↔  STATUS + INCONSISTENT FIELDS
          When stage info is present (and not yet dismissed), we
          replace the right section with the progress panel.
      ────────────────────────────────────────────────────────── */}
      {showStagePanelInsteadOfStatus ? (
        /* ── Stage progress / valid message ── */
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pr: 2,
            overflow: "hidden",
          }}
        >
          {stageInfo.isValid === true ? (
            /* "This record is valid" message */
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#22c55e" }} />
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#22c55e" }}>
                This record is valid
              </Typography>
            </Box>
          ) : (
            /* 25 / 50 / 75 % bars */
            <StageProgress pct={stageInfo.pct} label={stageInfo.label} color={stageInfo.color} />
          )}
        </Box>
      ) : (
        /* ── Normal: Status + Inconsistent Fields ── */
        <>
          {/* Status */}
          <Box sx={{ width: "6%", pr: 2, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Status
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
              {record.Status?.toLowerCase() === "rejected"
                ? "L0 Data"
                : record.Status?.toLowerCase() === "pending"
                ? "ACTION REQUIRED"
                : record.Status}
            </Typography>
          </Box>

          {/* Inconsistent Fields */}
          <Box sx={{ width: "39%", pr: 2, flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: 11, color: "#777", fontWeight: 700, mb: 0.3,
                textTransform: "uppercase", letterSpacing: 0.5,
                visibility: isCompleted ? "hidden" : "visible",
              }}
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
        </>
      )}

      {/* Actions — hide when record is still in-pipeline (stage panel showing) or has no valid status */}
      {!showStagePanelInsteadOfStatus && record.Status && record.Status !== "N/A" && (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", pt: 0.5, flexShrink: 0 }}>
          <IconButton
            size="medium"
            onClick={stopAndNavigate}
            title="View Details"
            sx={{
              border: "1px solid #c8c8c8",
              borderRadius: "2px",
              p: 0.5,
              mt: 1,
              backgroundColor: isClicked ? "#fef7f7ff" : "#000",
              color: "#ffffffff",
              borderColor: "#000",
              "&:hover": { backgroundColor: "#fef7f7ff", color: "#000", borderColor: "#000" },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default RecordCard;
