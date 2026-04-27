import React from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Stack,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorageIcon from "@mui/icons-material/Storage";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { SELECTED, ACCEPTED, ON_HOLD_THEME, STATUS } from "../utils/correctionsTableConstants";
import ExistingDataRow from "./CorrectionsTableComponents/ExistingDataRow";
import EditableField from "./CorrectionsTableComponents/EditableField";
import ChooseOtherValueDropdown from "./CorrectionsTableComponents/ChooseOtherValueDropdown";
import SuggestionRow from "./CorrectionsTableComponents/SuggestionRow";
import { useCorrectionsTable } from "../hooks/useCorrectionsTable";

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
            backgroundColor: "#f1f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleIcon sx={{ color: "#000000", fontSize: 28 }} />
        </Box>
        <Box textAlign="center">
          <Typography fontWeight={600} fontSize="0.95rem" gutterBottom>
            Are you sure?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will accept the selected data for <strong>{fieldName}</strong> and apply the
            correction.
          </Typography>
        </Box>
      </Stack>
    </DialogContent>
    <Divider />
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button
        variant="outlined"
        onClick={onClose}
        disabled={isAccepting}
        sx={{
          borderColor: "#000000",
          color: "#000000",
          "&:hover": { backgroundColor: "#eeeeee" },
        }}
      >
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
          backgroundColor: "#000000",
          "&:hover": { backgroundColor: "#333333" },
          ...(isAccepting && {
            "&.Mui-disabled": { backgroundColor: "#333333", color: "white" },
          }),
        }}
      >
        {isAccepting ? "Accepting..." : "Yes, Accept"}
      </Button>
    </DialogActions>
  </Dialog>
);

/* ─── L0 Confirmation Dialog ───────────────────────────────────── */
const L0ConfirmDialog = ({ open, onClose, onConfirm, submitting }) => (
  <Dialog
    open={open}
    onClose={() => !submitting && onClose()}
    maxWidth="xs"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography fontWeight={700} fontSize="1rem">Confirm Send to L0</Typography>
        <IconButton size="small" onClick={onClose} disabled={submitting}>
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
            backgroundColor: "#f1f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberIcon sx={{ color: "#000000", fontSize: 28 }} />
        </Box>
        <Box textAlign="center">
          <Typography fontWeight={600} fontSize="0.95rem" gutterBottom>
            Are you sure?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will send the entire execution record to the L0 dataset.
          </Typography>
        </Box>
      </Stack>
    </DialogContent>
    <Divider />
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button
        variant="outlined"
        onClick={onClose}
        disabled={submitting}
        sx={{
          borderColor: "#000000",
          color: "#000000",
          "&:hover": { backgroundColor: "#eeeeee" },
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={onConfirm}
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
        sx={{ backgroundColor: "#000000" }}
      >
        {submitting ? "Submitting..." : "Yes, Confirm"}
      </Button>
    </DialogActions>
  </Dialog>
);

/* ─── Draft Record Dialog ──────────────────────────────────────── */
const DraftRecordDialog = ({
  open,
  onClose,
  fieldName,
  fields,
  loadingFields,
  submitting,
  initialValues,
  onSubmit,
}) => {
  const [formValues, setFormValues] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setFormValues(initialValues || {});
    }
  }, [open, initialValues]);

  const handleFieldChange = React.useCallback((name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const allFilled =
    fields.length > 0 &&
    fields.every((f) => !!formValues[f.fieldname]?.trim());

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography fontWeight={700} fontSize="1rem">Submit Draft Record</Typography>
            {fieldName && (
              <Typography variant="caption" color="text.secondary">
                Field: {fieldName}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose} disabled={submitting}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {loadingFields ? (
          <Stack alignItems="center" justifyContent="center" py={4} gap={1.5}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading fields...
            </Typography>
          </Stack>
        ) : (
          <Stack gap={2.5} sx={{ mt: 0.5 }}>
            {fields.map((field) => (
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#000000",
                  },
                }}
                key={field.fieldname}
                label={
                  field.fieldname === "value"
                    ? fieldName
                    : field.datatype === "integer"
                      ? `${field.fieldname} (integer)`
                      : field.fieldname
                }
                size="small"
                fullWidth
                type={field.datatype === "integer" ? "number" : "text"}
                inputProps={field.datatype === "integer" ? { step: 1, min: 0 } : undefined}
                value={formValues[field.fieldname] ?? ""}
                onChange={(e) => handleFieldChange(field.fieldname, e.target.value)}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      {!loadingFields && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={submitting}
              sx={{
                borderColor: "#000000",
                color: "#000000",
                "&:hover": { backgroundColor: "#eeeeee" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => onSubmit(formValues)}
              disabled={!allFilled || submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{
                color: "#ffffff",
                backgroundColor: "#000000",
                "&.Mui-disabled": { backgroundColor: "#efefef", color: "#888888" },
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

/* ─── Main Component ────────────────────────────────────────────── */
const CorrectionsTable = ({ data, history, execID, sutType, fetchData, showNotification }) => {
  const {
    selectedSuggestions,
    editedSuggestions,
    customSuggestions,
    isAccepting,
    expandedGroups,
    acceptConfirm,
    setAcceptConfirm,
    handleSelect,
    handleSelectCustom,
    handleClearCustom,
    handleCustomMetadataFetch,
    handleEditField,
    toggleGroup,
    handleAcceptConfirm,
    // L0
    l0ConfirmDialog,
    setL0ConfirmDialog,
    submittingL0,
    openL0Confirm,
    handleL0Confirm,
    // Draft
    draftDialog,
    setDraftDialog,
    draftFields,
    loadingDraftFields,
    submittingDraft,
    draftInitialValues,
    getHistoryChangesForField,
    openDraftDialog,
    handleDraftSubmit,
  } = useCorrectionsTable(data, history, execID, sutType, fetchData, showNotification);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No invalid fields found.</Typography>
      </Box>
    );
  }

  const handleAcceptClick = React.useCallback(
    (group, groupIdx) => setAcceptConfirm({ group, groupIdx }),
    [setAcceptConfirm]
  );

  // Helper: check if selectedIdx is a custom record key
  const isCustomSelected = (selectedIdx) =>
    typeof selectedIdx === "string" && selectedIdx.startsWith("custom_");

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
          const isExpanded = expandedGroups[groupIdx] ?? isPending;
          const selectedIdx = selectedSuggestions[groupIdx];
          const canAccept = selectedIdx !== undefined;
          const fieldStatus = group.currentStatus?.toLowerCase();
          const isPending =
            !fieldStatus ||
            fieldStatus.toLowerCase() === STATUS.INVALID ||
            fieldStatus.toLowerCase() === STATUS.PENDING;
          const isAccepted =
            group.currentStatus === STATUS.ACCEPTED ||
            group.currentStatus === STATUS.APPROVED;
          const activeTheme = isAccepted ? ACCEPTED : SELECTED;

          return (
            <Paper
              key={groupIdx}
              elevation={0}
              sx={{
                border: "1.5px solid #878585a2",
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
                  height: 32,
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: "#f2f2f2ff",
                  borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Typography sx={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>
                    {group.invalid_field}
                  </Typography>

                  {fieldStatus === STATUS.L0_DATA && (
                    <Chip
                      label="L0 Data"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        borderRadius: "4px",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {fieldStatus === STATUS.ON_HOLD && (
                    <Chip
                      label="On Hold"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        borderRadius: "4px",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {isPending && (
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        borderRadius: "4px",
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
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          borderRadius: "4px",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                      <Chip
                        label={
                          isCustomSelected(selectedIdx)
                            ? "Custom Masterlist Dropdown Value Selected"
                            : "Suggestion Selected"
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "#000000",
                          color: "#ffffff",
                          borderRadius: "4px",
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
                <ExistingDataRow existingData={group.existing_data ?? []} />

                <Stack gap={0.5} sx={{ p: 1.5 }}>
                  {group.suggestions?.length > 0 && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#303030",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        mb: 0,
                      }}
                    >
                      Suggestions{" "}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 12,
                          fontWeight: 300,
                          fontStyle: "italic",
                          textTransform: "LowerCase",
                        }}
                      >
                        {isPending
                          ? "( Hover over an option to see confidence score )"
                          : ""}
                      </Typography>
                    </Typography>
                  )}

                  {group.suggestions?.length > 0 ? (
                    group.suggestions.map((sugg, si) => {
                      const isSelected = selectedIdx === si;
                      const gStatus = group.currentStatus;
                      const isAcceptedRow =
                        gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED;
                      const rowTheme = isAcceptedRow ? ACCEPTED : SELECTED;

                      const baseSugg = sugg;
                      const editedSugg = isSelected ? editedSuggestions[groupIdx] || {} : {};
                      const mergedSugg = { ...baseSugg, ...editedSugg };

                      // UI Override: Always show History CPU(s) value if it exists for VM
                      if (isSelected && sutType?.toLowerCase() === "vm") {
                        const historyArr = getHistoryChangesForField(group.invalid_field);
                        const historyCpu = historyArr?.find(
                          (c) => c.field?.toLowerCase() === "cpu(s)"
                        );
                        if (historyCpu?.to !== undefined) {
                          const cpuKey =
                            Object.keys(mergedSugg).find(
                              (k) => k.toLowerCase() === "cpu(s)"
                            ) || "cpu(s)";
                          mergedSugg[cpuKey] = historyCpu.to;
                        }
                      }

                      return (
                        <SuggestionRow
                          key={si}
                          suggestion={mergedSugg}
                          isSelected={isSelected}
                          theme={rowTheme}
                          onSelect={() => handleSelect(groupIdx, si)}
                          onEditField={(key, newVal) => handleEditField(groupIdx, key, newVal)}
                          sutType={sutType}
                          isPending={isPending}
                        />
                      );
                    })
                  ) : (
                    <Typography
                      sx={{ color: "#303030", fontSize: 13, py: 2, textAlign: "center" }}
                    >
                      No suggestions available
                    </Typography>
                  )}
                </Stack>

                {/* ── Draft Record (populated when status is ON HOLD) ── */}
                {group.draft_records &&
                  (() => {
                    const draftSugg = { ...group.draft_records };
                    if (sutType?.toLowerCase() === "vm") {
                      const historyArr = getHistoryChangesForField(group.invalid_field);
                      const historyCpu = historyArr?.find(
                        (c) => c.field?.toLowerCase() === "cpu(s)"
                      );
                      if (historyCpu?.to !== undefined) {
                        const cpuKey =
                          Object.keys(draftSugg).find((k) => k.toLowerCase() === "cpu(s)") ||
                          "cpu(s)";
                        draftSugg[cpuKey] = historyCpu.to;
                      }
                    }

                    return (
                      <>
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#303030",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            mt: 2,
                            ml: 1.5,
                          }}
                        >
                          Draft Record
                        </Typography>
                        <Box sx={{ mt: 1, px: 1.5 }}>
                          <SuggestionRow
                            suggestion={draftSugg}
                            isSelected={fieldStatus === STATUS.ON_HOLD}
                            theme={ON_HOLD_THEME}
                            onSelect={() => {}}
                            onEditField={() => {}}
                            sutType={sutType}
                            isPending={false}
                            showRadio={false}
                          />
                        </Box>
                      </>
                    );
                  })()}

                {/* ── "Custom Value" label — shown when a custom row is selected ── */}
                {isCustomSelected(selectedIdx) && (
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#303030",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      mb: 0,
                      ml: 1.5,
                    }}
                  >
                    Custom Value
                  </Typography>
                )}

                {/* ── Dropdown ── */}
                <ChooseOtherValueDropdown
                  invalidField={group.invalid_field}
                  isSelected={isCustomSelected(selectedIdx)}
                  onSelectCustom={() => {}} // no-op — selection happens via row click
                  onClearCustom={() => handleClearCustom(groupIdx)}
                  onCustomMetadataFetch={(metaArray) =>
                    handleCustomMetadataFetch(groupIdx, metaArray)
                  }
                  isPending={isPending}
                  theme={activeTheme}
                />

                {/* ── Custom suggestion rows (one per metadata_record) ── */}
                {customSuggestions[groupIdx]?.length > 0 &&
                  (() => {
                    const gStatus = group.currentStatus;
                    const isAcceptedGroup =
                      gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED;
                    const rowTheme = isAcceptedGroup ? ACCEPTED : SELECTED;

                    return (
                      <Box sx={{ mt: 1, px: 1.5 }}>
                        <Stack gap={0.5}>
                          {customSuggestions[groupIdx].map((baseSugg, ci) => {
                            const key = `custom_${ci}`;
                            const isSelected = selectedIdx === key;
                            const editedSugg = isSelected
                              ? editedSuggestions[groupIdx] || {}
                              : {};
                            const mergedSugg = { ...baseSugg, ...editedSugg };

                            // UI Override: Always show History CPU(s) value if it exists for VM
                            if (isSelected && sutType?.toLowerCase() === "vm") {
                              const historyArr = getHistoryChangesForField(group.invalid_field);
                              const historyCpu = historyArr?.find(
                                (c) => c.field?.toLowerCase() === "cpu(s)"
                              );
                              if (historyCpu?.to !== undefined) {
                                const cpuKey =
                                  Object.keys(mergedSugg).find(
                                    (k) => k.toLowerCase() === "cpu(s)"
                                  ) || "cpu(s)";
                                mergedSugg[cpuKey] = historyCpu.to;
                              }
                            }

                            return (
                              <SuggestionRow
                                key={ci}
                                suggestion={mergedSugg}
                                isSelected={isSelected}
                                theme={rowTheme}
                                onSelect={() => handleSelectCustom(groupIdx, ci)}
                                onEditField={(k, newVal) =>
                                  handleEditField(groupIdx, k, newVal)
                                }
                                sutType={sutType}
                                isPending={isPending}
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    );
                  })()}

                {/* ── Action Buttons ── */}
                {isPending && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap={1}
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderTop: "1px solid #f1f5f9",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!canAccept}
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleAcceptClick(group, groupIdx)}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#333333" },
                        "&.Mui-disabled": { backgroundColor: "#efefef", color: "#888888" },
                      }}
                    >
                      Accept
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={canAccept}
                      startIcon={<EditNoteIcon />}
                      onClick={() => openDraftDialog(group, groupIdx)}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#333333" },
                        "&.Mui-disabled": { backgroundColor: "#efefef", color: "#888888" },
                      }}
                    >
                      Submit Draft Record
                    </Button>

                    <Button
                      variant="contained"
                      size="small"
                      disabled={canAccept}
                      startIcon={<StorageIcon />}
                      onClick={() => openL0Confirm(group, groupIdx)}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 1.5,
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#333333" },
                        "&.Mui-disabled": { backgroundColor: "#efefef", color: "#888888" },
                      }}
                    >
                      Send to L0
                    </Button>
                  </Stack>
                )}
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      {/* ── Accept Confirmation Dialog ── */}
      <AcceptConfirmDialog
        open={!!acceptConfirm}
        onClose={() => !isAccepting && setAcceptConfirm(null)}
        onConfirm={handleAcceptConfirm}
        fieldName={acceptConfirm?.group?.invalid_field}
        isAccepting={isAccepting}
      />

      {/* ── L0 Confirmation Dialog ── */}
      <L0ConfirmDialog
        open={!!l0ConfirmDialog}
        onClose={() => setL0ConfirmDialog(null)}
        onConfirm={handleL0Confirm}
        submitting={submittingL0}
      />

      {/* ── Draft Record Dialog ── */}
      <DraftRecordDialog
        open={!!draftDialog}
        onClose={() => setDraftDialog(null)}
        fieldName={draftDialog?.group?.invalid_field}
        fields={draftFields}
        loadingFields={loadingDraftFields}
        submitting={submittingDraft}
        initialValues={draftInitialValues}
        onSubmit={handleDraftSubmit}
      />
    </>
  );
};

export default CorrectionsTable;