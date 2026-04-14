import React from "react";
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
import RejectDialog from "./CorrectionsTableComponents/RejectDialog";
import { SELECTED, ACCEPTED, STATUS } from "../utils/correctionsTableConstants";
import ExistingDataRow from "./CorrectionsTableComponents/ExistingDataRow";
import EditableField from "./CorrectionsTableComponents/EditableField";
import ChooseOtherValueDropdown from "./CorrectionsTableComponents/ChooseOtherValueDropdown";
import SuggestionRow from "./CorrectionsTableComponents/SuggestionRow";
import { API_URL } from "../config";
import CircularProgress from '@mui/material/CircularProgress';
 
/* ─── Accept Confirmation Dialog ──────────────────────────────── */
const AcceptConfirmDialog = ({ open, onClose, onConfirm, fieldName, isAccepting }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}
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
 
import { useCorrectionsTable } from "../hooks/useCorrectionsTable";

const CorrectionsTable = ({ data, history, execID, sutType, fetchData, showNotification }) => {
  const {
    selectedSuggestions,
    editedSuggestions,
    customSuggestions,
    isAccepting,
    expandedGroups,
    rejectDialogRow,
    acceptConfirm,
    setRejectDialogRow,
    setAcceptConfirm,
    handleSelect,
    handleSelectCustom,
    handleClearCustom,
    handleCustomMetadataFetch,
    handleEditField,
    toggleGroup,
    handleAcceptConfirm,
  } = useCorrectionsTable(data, history, execID, sutType, fetchData, showNotification);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No invalid fields found.</Typography>
      </Box>
    );
  }

  const handleAcceptClick = React.useCallback((group, groupIdx) => {
    setAcceptConfirm({ group, groupIdx });
  }, [setAcceptConfirm]);

  const handleReject = React.useCallback((group, groupIdx) => {
    setRejectDialogRow({ ...group, id: groupIdx, fieldName: group.invalid_field });
  }, [setRejectDialogRow]);
 
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
              Inconsistent Fields
            </Typography>
          </Box>
        </Stack>
 
        {data.map((group, groupIdx) => {
          const isExpanded = expandedGroups[groupIdx] ?? true;
          const selectedIdx = selectedSuggestions[groupIdx];
          const canAccept = selectedIdx !== undefined;
          const fieldStatus = group.currentStatus?.toLowerCase();
          const isPending = !fieldStatus || fieldStatus === STATUS.INVALID;
          
 
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
 
                  {fieldStatus === STATUS.L0_DATA && (
                    <>
                      <Chip
                        label="L0 Data"
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
 
                  {fieldStatus === STATUS.ON_HOLD && (
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
 
                  {fieldStatus === STATUS.ACCEPTED && (
                    <>
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
                      <Chip
                        label={
                          typeof selectedIdx === "number"
                            ? "Suggestion Selected"
                            : "Custom Masterlist Dropdown Value Selected"
                        }
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
                    </>
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
                      const gStatus = group.currentStatus;
                      const isAccepted = gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED;
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
               
               {selectedIdx === "custom" && (
                <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        mb: 0,
                        ml:1.5
                      }}
                    >
                      Custom Value
                    </Typography>
                    )}
                {/* Custom Option Dropdown */}
                <ChooseOtherValueDropdown
                  invalidField={group.invalid_field}
                  isSelected={selectedIdx === "custom"}
                  onSelectCustom={() => handleSelectCustom(groupIdx)}
                  onClearCustom={() => handleClearCustom(groupIdx)}
                  onCustomMetadataFetch={(meta) => handleCustomMetadataFetch(groupIdx, meta)}
                  isPending={isPending}
                />
 
                {customSuggestions[groupIdx] &&
                  Object.keys(customSuggestions[groupIdx]).length > 0 && (() => {
                    const isSelected = selectedIdx === "custom";
                    const gStatus = group.currentStatus;
                    const isAccepted = gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED;
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
                  })()
                }
 
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
        }}
        execID={execID}
        showNotification={showNotification}
      />
    </>
  );
};
 
export default CorrectionsTable;
 