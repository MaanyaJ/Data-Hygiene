import { useState, useMemo, useCallback } from "react";
import { API_URL } from "../config";

export const STEPS = {
  CHOOSE: "CHOOSE",
  L0_CONFIRM: "L0_CONFIRM",
  DRAFT_FORM: "DRAFT_FORM",
};

export const useRejectDialog = (row, execID, onClose, onL0Data, onDraftSubmit, showNotification) => {
  const [step, setStep] = useState(STEPS.CHOOSE);
  const [detailFields, setDetailFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = useCallback(() => {
    setStep(STEPS.CHOOSE);
    setDetailFields([]);
    setFormValues({});
    onClose();
  }, [onClose]);

  const handleL0Confirm = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/reject-record`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execution_id: execID, currentStatus: "L0 Data" }),
      });
      onL0Data?.(row);
      resetAndClose();
    } catch (error) {
      console.error("Reject L0 API failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [execID, row, onL0Data, resetAndClose]);

  const handleDraftOptionClick = useCallback(async () => {
    setStep(STEPS.DRAFT_FORM);
    setLoadingFields(true);
    try {
      const res = await fetch(`${API_URL}/draft-records/fields?type=${encodeURIComponent(row.fieldName)}`);
      const data = await res.json();
      setDetailFields(data.fields);
    } catch (error) {
      console.error("Fetch draft fields failed:", error);
      setDetailFields([]);
    } finally {
      setLoadingFields(false);
    }
  }, [row?.fieldName]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = { execution_id: execID, ...formValues, currentStatus: "On Hold" };
      const res = await fetch(`${API_URL}/draft-records/${encodeURIComponent(row.fieldName)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        showNotification(data?.message, "error");
        return;
      }
      showNotification("Draft record submitted successfully", "success");
      onDraftSubmit?.(row);
      resetAndClose();
    } catch (error) {
      console.error("Submit draft failed:", error);
    } finally {
      setSubmitting(false);
    }
  }, [execID, formValues, row, onDraftSubmit, resetAndClose]);

  const handleFieldChange = useCallback((name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const allFilled = useMemo(() => 
    detailFields.every((f) => !!formValues[f]?.trim()),
    [detailFields, formValues]
  );

  return {
    step,
    setStep,
    detailFields,
    formValues,
    loadingFields,
    submitting,
    allFilled,
    resetAndClose,
    handleL0Confirm,
    handleDraftOptionClick,
    handleSubmit,
    handleFieldChange,
  };
};
