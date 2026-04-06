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

// Step 1: Choose between L0 Data or Submit Draft Record
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
  DRAFT_FORM: "DRAFT_FORM",
};

const RejectDialog = ({ open, onClose, row, onL0Data, onDraftSubmit }) => {
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [detailFields, setDetailFields] = useState([]); // fields returned by API
  const [formValues, setFormValues] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setStep(STEPS.CHOOSE);
    setDetailFields([]);
    setFormValues({});
    onClose();
  };

  // Step 1 → L0 Data chosen
  const handleL0Data = () => {
    onL0Data?.(row);
    resetAndClose();
  };

  // Step 1 → Submit Draft Record chosen
  // TODO: replace URL with actual API endpoint
  const handleDraftOptionClick = async () => {
    setStep(STEPS.DRAFT_FORM);
    setLoadingFields(true);
    try {
      // TODO: call your API with row.fieldName to get the detail fields
      // e.g. GET /draft-fields?fieldName=CPUModel
      // const res = await fetch(`http://192.168.0.182:8003/draft-fields?fieldName=${encodeURIComponent(row.fieldName)}`);
      // const data = await res.json();
      // setDetailFields(data.fields); // expected: [{ name: string, label: string, type?: string }]

      // ---- placeholder until API is ready ----
      await new Promise((r) => setTimeout(r, 800)); // fake delay
      setDetailFields([
        { name: "field1", label: "Fieldname1" },
        { name: "field2", label: "fieldname2" },
      ]);
      // ----------------------------------------
    } catch {
      setDetailFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  // Step 2 → Submit form
  // TODO: replace with actual submit API call
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: call your submit API with formValues + row details
      // e.g. POST /submit-draft
      // await fetch("http://192.168.0.182:8003/submit-draft", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ fieldName: row.fieldName, ...formValues }),
      // });

      await new Promise((r) => setTimeout(r, 600)); // fake delay
      onDraftSubmit?.(row, formValues);
      resetAndClose();
    } catch {
      // TODO: handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const allFilled = detailFields.every((f) => !!formValues[f.name]?.trim());

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
            {step === STEPS.DRAFT_FORM && (
              <IconButton size="small" onClick={() => setStep(STEPS.CHOOSE)} sx={{ mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Box>
              <Typography fontWeight={700} fontSize="1rem">
                {step === STEPS.CHOOSE ? "Reject All Suggestions" : "Submit Draft Record"}
              </Typography>
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
              onClick={handleL0Data}
            />
            <OptionCard
              icon={<EditNoteIcon />}
              title="Submit Draft Record"
              description="Fill in all required fields to create a new master list value"
              onClick={handleDraftOptionClick}
            />
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
                    key={field.name}
                    label={field.label}
                    size="small"
                    fullWidth
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      {/* Footer — only shown on draft form step */}
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