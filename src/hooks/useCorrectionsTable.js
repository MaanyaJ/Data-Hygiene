import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";
import { STATUS } from "../utils/correctionsTableConstants";
 
export const useCorrectionsTable = (data, history, execID, sutType, fetchData, showNotification) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [editedSuggestions, setEditedSuggestions] = useState({});
  const [customSuggestions, setCustomSuggestions] = useState({});
  const [isAccepting, setIsAccepting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries((data ?? []).map((_, i) => [i, true]))
  );
 
  const [acceptConfirm, setAcceptConfirm] = useState(null);
 
  // Draft dialog state
  const [draftDialog, setDraftDialog] = useState(null); // { group, groupIdx }
  const [draftFields, setDraftFields] = useState([]);
  const [draftFormValues, setDraftFormValues] = useState({});
  const [loadingDraftFields, setLoadingDraftFields] = useState(false);
  const [submittingDraft, setSubmittingDraft] = useState(false);
 
  // L0 confirm dialog state
  const [l0ConfirmDialog, setL0ConfirmDialog] = useState(null); // { group, groupIdx }
  const [submittingL0, setSubmittingL0] = useState(false);
 
  // Auto-selection logic
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (Object.keys(selectedSuggestions).length > 0) return;
 
    const initialSelections = {};
    const initialCustom = {};
    const initialEdited = {};
 
    const extractCoreCount = (obj) => {
      const key = Object.keys(obj).find((k) => k.toLowerCase() === "corecount");
      return key && obj[key] != null ? { [key]: obj[key] } : null;
    };
 
    data.forEach((group, groupIdx) => {
      const gStatus = group.currentStatus;
      if (gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED) {
        const historyObj = {};
        if (history?.changes) {
          group.existing_data?.forEach((item) => {
            const change = history.changes.find((c) => c.field === item.field);
            historyObj[item.field] =
              change && Array.isArray(change.to) ? change.to[0] : null;
          });
        }
 
        const coreCountOverride = extractCoreCount(historyObj);
 
        const acceptedIdx = group.suggestions?.findIndex(
          (s) => s.status === STATUS.ACCEPTED
        );
 
        if (acceptedIdx !== -1 && acceptedIdx !== undefined) {
          initialSelections[groupIdx] = acceptedIdx;
          if (coreCountOverride) initialEdited[groupIdx] = coreCountOverride;
        } else if (Object.keys(historyObj).length > 0) {
          const primaryField = group.invalid_field;
          const acceptedValue = historyObj[primaryField];
          const matchIdx =
            acceptedValue != null
              ? group.suggestions?.findIndex((s) => {
                  const v =
                    s[primaryField] ??
                    s[primaryField?.toLowerCase()] ??
                    s[primaryField?.toUpperCase()];
                  return (
                    String(v ?? "").toLowerCase() ===
                    String(acceptedValue).toLowerCase()
                  );
                })
              : -1;
 
          if (matchIdx !== undefined && matchIdx !== -1) {
            initialSelections[groupIdx] = matchIdx;
            if (coreCountOverride) initialEdited[groupIdx] = coreCountOverride;
          } else {
            initialSelections[groupIdx] = "custom";
            initialCustom[groupIdx] = historyObj;
          }
        }
      }
    });
 
    if (Object.keys(initialSelections).length > 0) setSelectedSuggestions(initialSelections);
    if (Object.keys(initialCustom).length > 0) setCustomSuggestions(initialCustom);
    if (Object.keys(initialEdited).length > 0) setEditedSuggestions(initialEdited);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, history]);
 
  const handleSelect = useCallback((groupIdx, suggIdx) => {
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
  }, []);
 
  const handleSelectCustom = useCallback((groupIdx) => {
    setSelectedSuggestions((prev) => ({ ...prev, [groupIdx]: "custom" }));
    setEditedSuggestions((prev) => {
      const next = { ...prev };
      delete next[groupIdx];
      return next;
    });
  }, []);
 
  const handleClearCustom = useCallback((groupIdx) => {
    setSelectedSuggestions((prev) => {
      const next = { ...prev };
      if (next[groupIdx] === "custom") delete next[groupIdx];
      return next;
    });
    setCustomSuggestions((prev) => {
      const next = { ...prev };
      delete next[groupIdx];
      return next;
    });
  }, []);
 
  const handleCustomMetadataFetch = useCallback((groupIdx, meta) => {
    setCustomSuggestions((prev) => ({ ...prev, [groupIdx]: meta }));
  }, []);
 
  const handleEditField = useCallback((groupIdx, key, newValue) => {
    setEditedSuggestions((prev) => ({
      ...prev,
      [groupIdx]: { ...(prev[groupIdx] || {}), [key]: newValue },
    }));
  }, []);
 
  const toggleGroup = useCallback(
    (idx) => setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] })),
    []
  );
 
  // ── Accept ────────────────────────────────────────────────────
  const handleAcceptConfirm = async () => {
    const { group, groupIdx } = acceptConfirm;
    const suggIdx = selectedSuggestions[groupIdx];
    if (suggIdx === undefined) return;
 
    const baseChosen =
      suggIdx === "custom"
        ? customSuggestions[groupIdx] || {}
        : group.suggestions[suggIdx];
 
    const customEdits = editedSuggestions[groupIdx] || {};
    const merged = { ...baseChosen, ...customEdits };
    const primaryField = group.invalid_field;
    const value = merged?.[primaryField] || merged?.[primaryField?.toLowerCase()];
 
    if (!value) return;
 
    const payload = {
      execution_id: execID,
      field_name: primaryField,
      accepted_value: value,
      currentStatus: STATUS.ACCEPTED,
    };
 
    if (sutType?.toLowerCase() === "vm") {
      const coreCountVal =
        merged?.coreCount || merged?.CoreCount || merged?.corecount;
      if (coreCountVal !== undefined) payload.coreCount = coreCountVal;
    }
 
    try {
      setIsAccepting(true);
      const res = await fetch(`${API_URL}/approve-suggestion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        showNotification(data?.message, "error");
        setAcceptConfirm(null);
        return;
      }
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
 
  // ── L0 ────────────────────────────────────────────────────────
  const openL0Confirm = useCallback((group, groupIdx) => {
    setL0ConfirmDialog({ group, groupIdx });
  }, []);
 
  const handleL0Confirm = useCallback(async () => {
    setSubmittingL0(true);
    try {
      await fetch(`${API_URL}/reject-record`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execution_id: execID, currentStatus: "L0 Data" }),
      });
      setL0ConfirmDialog(null);
      fetchData();
      showNotification("Rejected due to L0 data", "success");
    } catch (error) {
      console.error("Reject L0 API failed:", error);
      showNotification("Failed to send to L0", "error");
    } finally {
      setSubmittingL0(false);
    }
  }, [execID, fetchData, showNotification]);
 
  // ── Draft ─────────────────────────────────────────────────────
  const openDraftDialog = useCallback(
    async (group, groupIdx) => {
      setDraftDialog({ group, groupIdx });
      setDraftFormValues({});
      setLoadingDraftFields(true);
      try {
        const res = await fetch(
          `${API_URL}/draft-records/fields?type=${encodeURIComponent(group.invalid_field)}`
        );
        const data = await res.json();
        setDraftFields(data.fields ?? []);
      } catch (error) {
        console.error("Fetch draft fields failed:", error);
        setDraftFields([]);
      } finally {
        setLoadingDraftFields(false);
      }
    },
    []
  );
 
  const handleDraftFieldChange = useCallback((name, value) => {
    setDraftFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);
 
  const handleDraftSubmit = useCallback(async () => {
    const { group } = draftDialog;
    setSubmittingDraft(true);
    try {
      const payload = {
        execution_id: execID,
        ...draftFormValues,
        currentStatus: "On Hold",
      };
      const res = await fetch(
        `${API_URL}/draft-records/${encodeURIComponent(group.invalid_field)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || data.status === "error") {
        showNotification(data?.message, "error");
        return;
      }
      showNotification("Draft record submitted successfully", "success");
      setDraftDialog(null);
      fetchData();
    } catch (error) {
      console.error("Submit draft failed:", error);
      showNotification("Failed to submit draft", "error");
    } finally {
      setSubmittingDraft(false);
    }
  }, [draftDialog, execID, draftFormValues, fetchData, showNotification]);
 
  const draftAllFilled =
    draftFields.length > 0 &&
    draftFields.every((f) => !!draftFormValues[f]?.trim());
 
  return {
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
    draftFormValues,
    loadingDraftFields,
    submittingDraft,
    draftAllFilled,
    openDraftDialog,
    handleDraftFieldChange,
    handleDraftSubmit,
  };
};