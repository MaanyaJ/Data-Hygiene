import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  TextField,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { API_URL } from "../config";
 
const OptionCard = ({ icon, title, description, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      border: "1.5px solid #e0e0e0",
      borderRadius: 2,
      p: 2.5,
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "#1976d2",
        backgroundColor: "#e3f2fd",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(25,118,210,0.15)",
      },
    }}
  >
    <Stack direction="row" alignItems="center" gap={2}>
      <Box sx={{ color: "#1976d2", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography fontWeight={700} fontSize="0.95rem">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </Box>
    </Stack>
  </Box>
);
 
const STEPS = {
  CHOOSE: "CHOOSE",
  L0_CONFIRM: "L0_CONFIRM",
  DRAFT_FORM: "DRAFT_FORM",
};
 
const RejectDialog = ({ open, onClose, row, onL0Data, onDraftSubmit, execID }) => {
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [detailFields, setDetailFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
 
  const resetAndClose = () => {
    setStep(STEPS.CHOOSE);
    setDetailFields([]);
    setFormValues({});
    onClose();
  };
 
  // Step 1 → L0 Data chosen — now just goes to confirm step
  const handleL0DataClick = () => {
    setStep(STEPS.L0_CONFIRM);
  };
 
  // Confirmation → Yes → call API
  const handleL0Confirm = async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/reject-record`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execution_id: execID, currentStatus: "L0 Data" }),
      });
      onL0Data?.(row);
      resetAndClose();
      console.log({ execution_id: execID, currentStatus: "L0 Data" })
    } catch (error) {
      console.error("Reject L0 API failed:", error);
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleDraftOptionClick = async () => {
    setStep(STEPS.DRAFT_FORM);
    setLoadingFields(true);
    try {
      const res = await fetch(`http://192.168.0.81:8001/draft-records/fields?type=${encodeURIComponent(row.fieldName)}`);
      const data = await res.json();
      setDetailFields(data.fields);
    } catch (error) {
      setDetailFields([]);
      console.log(error);
    } finally {
      setLoadingFields(false);
    }
  };
 
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { execution_id: execID, ...formValues, currentStatus: "On Hold" };
      await fetch(`http://192.168.0.81:8001/draft-records/${encodeURIComponent(row.fieldName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onDraftSubmit?.(row);
      resetAndClose();
      console.log(payload)
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
 
  const allFilled = detailFields.every((f) => !!formValues[f]?.trim());
 
  const getTitle = () => {
    if (step === STEPS.DRAFT_FORM) return "Submit Draft Record";
    if (step === STEPS.L0_CONFIRM) return "Confirm L0 Data";
    return "Reject All Suggestions";
  };
 
  const showBackButton = step === STEPS.DRAFT_FORM || step === STEPS.L0_CONFIRM;
  const backTarget = STEPS.CHOOSE;
 
  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            {showBackButton && (
              <IconButton size="small" onClick={() => setStep(backTarget)} sx={{ mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography fontWeight={700} fontSize="1rem">{getTitle()}</Typography>
              {row && (
                <Typography variant="caption" color="text.secondary">
                  Field: {row.fieldName}
                </Typography>
              )}
            </Box>
          </Stack>
          <IconButton size="small" onClick={resetAndClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
 
      <Divider />
 
      <DialogContent sx={{ pt: 2.5 }}>
        {/* Step 1 — Choose option */}
        {step === STEPS.CHOOSE && (
          <Stack gap={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              How would you like to proceed?
            </Typography>
            <OptionCard
              icon={<StorageIcon />}
              title="L0 Data"
              description="Send this data to L0 dataset without applying any corrections"
              onClick={handleL0DataClick}
            />
            <OptionCard
              icon={<EditNoteIcon />}
              title="Submit Draft Record"
              description="Fill in all required fields to create a new master list value"
              onClick={handleDraftOptionClick}
            />
          </Stack>
        )}
 
        {/* Step 1.5 — L0 Confirmation */}
        {step === STEPS.L0_CONFIRM && (
          <Stack alignItems="center" gap={2} py={1}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "#fff3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningAmberIcon sx={{ color: "#f57c00", fontSize: 28 }} />
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
        )}
 
        {/* Step 2 — Draft form */}
        {step === STEPS.DRAFT_FORM && (
          <>
            {loadingFields ? (
              <Stack alignItems="center" justifyContent="center" py={4} gap={1.5}>
                <CircularProgress size={28} />
                <Typography variant="body2" color="text.secondary">
                  Loading fields...
                </Typography>
              </Stack>
            ) : (
              <Stack gap={2.5} sx={{ mt: 0.5 }}>
                {detailFields.map((field) => (
                  <TextField
                    key={field}
                    label={field === "value" ? row.fieldName : field}
                    size="small"
                    fullWidth
                    value={formValues[field] ?? ""}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </DialogContent>
 
      {/* Footer — L0 confirm step */}
      {step === STEPS.L0_CONFIRM && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={() => setStep(STEPS.CHOOSE)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleL0Confirm}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
            >
              {submitting ? "Submitting..." : "Yes, Confirm"}
            </Button>
          </DialogActions>
        </>
      )}
 
      {/* Footer — Draft form step */}
      {step === STEPS.DRAFT_FORM && !loadingFields && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={resetAndClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!allFilled || submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : null}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
 
export default RejectDialog;