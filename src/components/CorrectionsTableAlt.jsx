import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Stack,
  Divider,
  IconButton,
  Collapse,
  Radio,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RejectDialog from "./RejectDialog";
import { capitalize, SELECTED } from "./CorrectionsTable/constants";
import ExistingDataRow from "./CorrectionsTable/ExistingDataRow";
import EditableField from "./CorrectionsTable/EditableField";
import ChooseOtherValueDropdown from "./CorrectionsTable/ChooseOtherValueDropdown";
import SuggestionRow from "./CorrectionsTable/SuggestionRow";
import { API_URL } from "../config";

/* ─── Main Component ────────────────────────────────────────── */

const CorrectionsTableAlt = ({ data, execID, sutType, standardizationStatus, reason, fetchData, showNotification }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [editedSuggestions, setEditedSuggestions] = useState({});
  const [customSuggestions, setCustomSuggestions] = useState({});
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries((data ?? []).map((_, i) => [i, false]))
  );
  const [rejectDialogRow, setRejectDialogRow] = useState(null);
  const isPending = standardizationStatus?.toLowerCase() === "pending";

  const handleSelect = (groupIdx, suggIdx) => {
    setSelectedSuggestions((prev) => {
      if (prev[groupIdx] === suggIdx) {
        const next = { ...prev };
        delete next[groupIdx];
        return next;
      }
      return { ...prev, [groupIdx]: suggIdx };
    });
    setEditedSuggestions((prev) => {
      const next = { ...prev };
      delete next[groupIdx];
      return next;
    });
  };

  const handleSelectCustom = (groupIdx) => {
    setSelectedSuggestions((prev) => ({ ...prev, [groupIdx]: "custom" }));
    setEditedSuggestions((prev) => {
      const next = { ...prev };
      delete next[groupIdx];
      return next;
    });
  };

  const handleClearCustom = (groupIdx) => {
    setSelectedSuggestions((prev) => {
      const next = { ...prev };
      if (next[groupIdx] === "custom") {
        delete next[groupIdx];
      }
      return next;
    });
    setCustomSuggestions((prev) => {
      const next = { ...prev };
      delete next[groupIdx];
      return next;
    });
  };

  const handleCustomMetadataFetch = (groupIdx, meta) => {
    setCustomSuggestions((prev) => ({ ...prev, [groupIdx]: meta }));
  };

  const handleEditField = (groupIdx, key, newValue) => {
    setEditedSuggestions(prev => ({
      ...prev,
      [groupIdx]: {
        ...(prev[groupIdx] || {}),
        [key]: newValue,
      }
    }));
  };

  const toggleGroup = (idx) =>
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const handleAccept = async (group, groupIdx) => {
    const suggIdx = selectedSuggestions[groupIdx];
    if (suggIdx === undefined) return;

    // 1. Get base suggestion
    const baseChosen =
      suggIdx === "custom"
        ? customSuggestions[groupIdx] || {}
        : group.suggestions[suggIdx];

    // 2. Apply edits
    const customEdits = editedSuggestions[groupIdx] || {};
    const merged = { ...baseChosen, ...customEdits };

    // 3. Extract main field value
    const primaryField = group.invalid_field;

    const value =
      merged?.[primaryField] ||
      merged?.[primaryField?.toLowerCase()];

    if (!value) return;

    // 4. Build payload
    const payload = {
      execution_id: execID,
      field_name: primaryField,
      accepted_value: value,
    };

    // 5. Add corecount ONLY for VM
    if (sutType?.toLowerCase() === "vm") {
      const coreCountVal =
        merged?.coreCount || merged?.CoreCount;

      if (coreCountVal !== undefined) {
        payload.coreCount = coreCountVal;
      }
    }

    try {
      await fetch(`${API_URL}/approve-suggestion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // reset selection
      setSelectedSuggestions((prev) => {
        const next = { ...prev };
        delete next[groupIdx];
        return next;
      });

      showNotification("Record accepted successfully", "success");
      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error(err);
      showNotification("Failed to accept record", "error");
    }
  };
  const handleReject = (group, groupIdx) => {
    setRejectDialogRow({ ...group, id: groupIdx, fieldName: group.invalid_field });
  };

  if (!data || data.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No invalid fields found.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack gap={0.5}>
        {/* Section header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.25 }}>
              {(() => {
                const status = standardizationStatus?.toLowerCase();
                if (status === "accepted") return "Corrected Fields";
                if (status === "on hold") return "Fields for Review";
                if (status === "rejected") return "Rejected Fields";
                return "Inconsistent Fields"; // Default for pending/rejected
              })()}
            </Typography>
          </Box>
          {standardizationStatus?.toLowerCase() !== "accepted" &&
            standardizationStatus?.toLowerCase() !== "rejected" && (
              <Chip
                label={`${data.length} issue${data.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: 700,
                  border: "1px solid #fca5a5",
                }}
              />
            )}
        </Stack>

        {data.map((group, groupIdx) => {
          const isExpanded = expandedGroups[groupIdx] ?? true;
          const selectedIdx = selectedSuggestions[groupIdx];
          const canAccept = selectedIdx !== undefined;

          return (
            <Paper
              key={groupIdx}
              elevation={0}
              sx={{
                border: "1.5px solid #e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
              }}
            >
              {/* ── Group Header ── */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => toggleGroup(groupIdx)}
                sx={{
                  px: 1.5,
                  height: 38,
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: "#fafafa",
                  borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                    {group.invalid_field}
                  </Typography>

                  {canAccept && (
                    <Chip
                      label="Suggestion selected"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {standardizationStatus?.toLowerCase() === "rejected" && (
                    <>
                      <Chip
                        label="Rejected"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                      <Chip
                        label={reason || "No reason provided"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </>
                  )}

                  {standardizationStatus?.toLowerCase() === "on hold" && (
                    <Chip
                      label="On Hold"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#f5f3ff",
                        color: "#7c3aed",
                        border: "1px solid #ddd6fe",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {standardizationStatus?.toLowerCase() === "accepted" && (
                    <Chip
                      label="Accepted"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}
                </Stack>
                <IconButton size="small" disableRipple>
                  {isExpanded ? (
                    <ExpandLessIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  ) : (
                    <ExpandMoreIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  )}
                </IconButton>
              </Stack>

              {/* ── Collapsible Body ── */}
              <Collapse in={isExpanded}>
                {/* Existing data bar */}
                <ExistingDataRow existingData={group.existing_data ?? []} />

                {/* Suggestion rows */}
                <Stack gap={0.5} sx={{ p: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      mb: 0,
                    }}
                  >
                    Suggestions
                  </Typography>
                  {group.suggestions?.length > 0 ? (
                    group.suggestions.map((sugg, si) => (
                      <SuggestionRow
                        key={si}
                        suggestion={sugg}
                        isSelected={selectedIdx === si}
                        onSelect={() => handleSelect(groupIdx, si)}
                        isPending={isPending}
                      />
                    ))
                  ) : (
                    <Typography sx={{ color: "#94a3b8", fontSize: 13, py: 2, textAlign: "center" }}>
                      No suggestions available
                    </Typography>
                  )}
                </Stack>

                {/* Custom Option Dropdown */}
                <ChooseOtherValueDropdown
                  invalidField={group.invalid_field}
                  isSelected={selectedIdx === "custom"}
                  onSelectCustom={() => handleSelectCustom(groupIdx)}
                  onClearCustom={() => handleClearCustom(groupIdx)}
                  onCustomMetadataFetch={(meta) => handleCustomMetadataFetch(groupIdx, meta)}
                  isPending={isPending}
                />

                {/* Selected Value section */}
                {canAccept && (() => {
                  const sp = SELECTED;
                  let baseSugg = {};
                  if (selectedIdx === "custom") {
                    baseSugg = customSuggestions[groupIdx] || {};
                  } else {
                    baseSugg = group.suggestions[selectedIdx] || {};
                  }

                  const editedSugg = editedSuggestions[groupIdx] || {};
                  const mergedSugg = { ...baseSugg, ...editedSugg };

                  // If custom value is selected but meta is completely empty/fetching
                  if (selectedIdx === "custom" && Object.keys(baseSugg).length === 0) {
                    return null;
                  }

                  return (
                    <Box
                      sx={{
                        mx: 2,
                        mb: 1.5,
                        border: `1.5px solid ${sp.border}`,
                        borderRadius: 2,
                        backgroundColor: sp.light,
                        overflow: "hidden",
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderBottom: `1px solid ${sp.border}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: 13, color: sp.text }} />
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: sp.text,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                          }}
                        >
                          Selected Value
                        </Typography>
                      </Box>

                      {/* Fields — horizontal */}
                      <Stack direction="row" flexWrap="wrap" divider={
                        <Box sx={{ width: "1px", alignSelf: "stretch", backgroundColor: sp.border }} />
                      }>
                        {Object.entries(mergedSugg).map(([key, val]) => (
                          <EditableField
                            key={key}
                            label={capitalize(key)}
                            value={val}
                            color={sp.text}
                            isEditable={key.toLowerCase() === "corecount" && sutType === "vm"}
                            onSave={(newVal) => handleEditField(groupIdx, key, newVal)}
                          />
                        ))}
                      </Stack>
                    </Box>
                  );
                })()}

                {isPending && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap={1}
                    sx={{ px: 1.5, py: 0.5, borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!canAccept}
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleAccept(group, groupIdx)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#16a34a",
                        "&:hover": { backgroundColor: "#15803d" },
                        "&.Mui-disabled": { backgroundColor: "#d1fae5", color: "#6ee7b7" },
                      }}
                    >
                      Accept
                    </Button>
                    {!canAccept && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => handleReject(group, groupIdx)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 1.5,
                          borderColor: "#fca5a5",
                          color: "#dc2626",
                          "&:hover": { backgroundColor: "#fff5f5", borderColor: "#ef4444" },
                        }}
                      >
                        Reject All
                      </Button>
                    )}
                  </Stack>
                )}
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      <RejectDialog
        open={!!rejectDialogRow}
        onClose={() => setRejectDialogRow(null)}
        row={rejectDialogRow}
        onL0Data={() => {
          showNotification("Rejected due to L0 data", "success");
          setRejectDialogRow(null);
          setTimeout(() => fetchData(), 500);
        }}
        onDraftSubmit={() => {
          showNotification("Draft record submitted", "success");
          setRejectDialogRow(null);
          setTimeout(() => fetchData(), 500);
        }}
        execID={execID}
      />
    </>
  );
};

export default CorrectionsTableAlt;
