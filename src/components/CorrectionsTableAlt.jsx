import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Stack,
  IconButton,
  Radio,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RejectDialog from "./RejectDialog";
import { SELECTED, ACCEPTED } from "./CorrectionsTable/constants";
import ExistingDataRow from "./CorrectionsTable/ExistingDataRow";
import EditableField from "./CorrectionsTable/EditableField";
import ChooseOtherValueDropdown from "./CorrectionsTable/ChooseOtherValueDropdown";
import SuggestionRow from "./CorrectionsTable/SuggestionRow";
import { API_URL } from "../config";
import CircularProgress from '@mui/material/CircularProgress';
 
/* ─── Accept Confirmation Dialog ──────────────────────────────── */
const AcceptConfirmDialog = ({ open, onClose, onConfirm, fieldName, isAccepting }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontWeight={700} fontSize="1rem">Confirm Accept</Typography>
        <IconButton size="small" onClick={onClose} disabled={isAccepting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
 
    <Divider />
 
    <DialogContent sx={{ pt: 2.5 }}>
      <Stack alignItems="center" gap={2} py={1}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 28 }} />
        </Box>
        <Box textAlign="center">
          <Typography fontWeight={600} fontSize="0.95rem" gutterBottom>
            Are you sure?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will accept the selected data for{" "}
            <strong>{fieldName}</strong> and apply the correction.
          </Typography>
        </Box>
      </Stack>
    </DialogContent>
 
    <Divider />
 
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" onClick={onClose} disabled={isAccepting}>
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={onConfirm}
        disabled={isAccepting}
        startIcon={
          isAccepting ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <CheckCircleOutlineIcon />
          )
        }
        sx={{
          backgroundColor: "#16a34a",
          "&:hover": { backgroundColor: "#15803d" },
          ...(isAccepting && {
            "&.Mui-disabled": { backgroundColor: "#15803d", color: "white" },
          }),
        }}
      >
        {isAccepting ? "Accepting..." : "Yes, Accept"}
      </Button>
    </DialogActions>
  </Dialog>
);
 
/* ─── Main Component ────────────────────────────────────────── */
 
const CorrectionsTableAlt = ({ data, history, execID, sutType, standardizationStatus, reason, fetchData, showNotification }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [editedSuggestions, setEditedSuggestions] = useState({});
  const [customSuggestions, setCustomSuggestions] = useState({});
  const [isAccepting, setIsAccepting] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries((data ?? []).map((_, i) => [i, false]))
  );
  const [rejectDialogRow, setRejectDialogRow] = useState(null);
  // null when closed, { group, groupIdx } when open
  const [acceptConfirm, setAcceptConfirm] = useState(null);
  const isPending = standardizationStatus?.toLowerCase() === "pending";
 
  // Initial auto-selection logic based on provided status & history
  useEffect(() => {
    if (!data || data.length === 0) return;
 
    // Only run if selectedSuggestions is currently empty to avoid overwriting user interactions
    if (Object.keys(selectedSuggestions).length > 0) return;
 
    const initialSelections = {};
    const initialCustom = {};
 
    data.forEach((group, groupIdx) => {
      const gStatus = group.currentStatus?.toLowerCase();
      if (gStatus === "accepted" || gStatus === "approved") {
        // Find index of suggestion with "Accepted" status
        const acceptedIdx = group.suggestions?.findIndex(
          (s) => s.status?.toLowerCase() === "accepted"
        );
 
        if (acceptedIdx !== -1 && acceptedIdx !== undefined) {
          initialSelections[groupIdx] = acceptedIdx;
        } else {
          // Fallback to history fallback (custom option)
          initialSelections[groupIdx] = "custom";
          
          // Build custom object from history changes
          const changes = history?.changes || [];
          const customObj = {};
          changes.forEach(c => {
            if (c.field && Array.isArray(c.to) && c.to.length > 0) {
              customObj[c.field] = c.to[0];
            }
          });
          
          if (Object.keys(customObj).length > 0) {
            initialCustom[groupIdx] = customObj;
          }
        }
      }
    });
 
    if (Object.keys(initialSelections).length > 0) {
      setSelectedSuggestions(initialSelections);
    }
    if (Object.keys(initialCustom).length > 0) {
      setCustomSuggestions(initialCustom);
    }
  }, [data, history]);
 
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
 
  // Opens the confirmation dialog instead of calling API directly
  const handleAcceptClick = (group, groupIdx) => {
    setAcceptConfirm({ group, groupIdx });
  };
 
  // Called when user clicks "Yes, Accept" in the confirm dialog
  const handleAcceptConfirm = async () => {
    const { group, groupIdx } = acceptConfirm;
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
 
    payload.currentStatus = "Accepted"
 
    try {
      setIsAccepting(true);
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
 
      setAcceptConfirm(null);
      fetchData();
      showNotification("Data accepted successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to accept data", "error");
    } finally {
      setIsAccepting(false);
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
                      label={selectedIdx === "custom" ? "Custom value chosen" : "Suggestion selected"}
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
                    group.suggestions.map((sugg, si) => {
                      const isSelected = selectedIdx === si;
                      const gStatus = group.currentStatus?.toLowerCase();
                      const isAccepted = gStatus === "accepted" || gStatus === "approved";
                      const activeTheme = isAccepted ? ACCEPTED : SELECTED;
                      
                      // Merge edits if selected
                      const baseSugg = sugg;
                      const editedSugg = isSelected ? (editedSuggestions[groupIdx] || {}) : {};
                      const mergedSugg = { ...baseSugg, ...editedSugg };

                      return (
                        <SuggestionRow
                          key={si}
                          suggestion={mergedSugg}
                          isSelected={isSelected}
                          theme={activeTheme}
                          onSelect={() => handleSelect(groupIdx, si)}
                          onEditField={(key, newVal) => handleEditField(groupIdx, key, newVal)}
                          sutType={sutType}
                          isPending={isPending}
                        />
                      );
                    })
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
 
                {/* Persistent Custom Selection row (styled exactly like SuggestionRow) */}
                {customSuggestions[groupIdx] &&
                  Object.keys(customSuggestions[groupIdx]).length > 0 && (() => {
                    const isSelected = selectedIdx === "custom";
                    const gStatus = group.currentStatus?.toLowerCase();
                    const isAccepted = gStatus === "accepted" || gStatus === "approved";
                    const activeTheme = isAccepted ? ACCEPTED : SELECTED;

                    const baseSugg = customSuggestions[groupIdx];
                    const editedSugg = isSelected ? (editedSuggestions[groupIdx] || {}) : {};
                    const mergedSugg = { ...baseSugg, ...editedSugg };

                    return (
                      <Box sx={{ mt: 1, px: 1.5 }}>
                        <SuggestionRow
                          suggestion={mergedSugg}
                          isSelected={isSelected}
                          theme={activeTheme}
                          onSelect={() => handleSelectCustom(groupIdx)}
                          onEditField={(key, newVal) => handleEditField(groupIdx, key, newVal)}
                          sutType={sutType}
                          isPending={isPending}
                        />
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
                      onClick={() => handleAcceptClick(group, groupIdx)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#16a34a",
                        "&:hover": { backgroundColor: "#15803d" },
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      disabled={canAccept}
                      variant="contained"
                      size="small"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => handleReject(group, groupIdx)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#dc2626",
                        "&:hover": {
                          backgroundColor: "#b91c1c",
                        }
                      }}
                    >
                      Reject All
                    </Button>
                  </Stack>
                )}
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
 
      {/* Accept Confirmation Dialog */}
      <AcceptConfirmDialog
        open={!!acceptConfirm}
        onClose={() => !isAccepting && setAcceptConfirm(null)}
        onConfirm={handleAcceptConfirm}
        fieldName={acceptConfirm?.group?.invalid_field}
        isAccepting={isAccepting}
      />
 
      <RejectDialog
        open={!!rejectDialogRow}
        onClose={() => setRejectDialogRow(null)}
        row={rejectDialogRow}
        onL0Data={() => {
          setRejectDialogRow(null);
          fetchData();
          showNotification("Rejected due to L0 data", "success");
        }}
        onDraftSubmit={() => {
          setRejectDialogRow(null);
          fetchData();
          showNotification("Draft record submitted", "success");
        }}
        execID={execID}
      />
    </>
  );
};
 
export default CorrectionsTableAlt;
 