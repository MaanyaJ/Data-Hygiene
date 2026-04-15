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
  
  const [rejectDialogRow, setRejectDialogRow] = useState(null);
  const [acceptConfirm, setAcceptConfirm] = useState(null);

  // Auto-selection logic
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (Object.keys(selectedSuggestions).length > 0) return;

    const initialSelections = {};
    const initialCustom = {};
    const initialEdited = {};

    // Helper: find coreCount in a history-built object regardless of key casing
    const extractCoreCount = (obj) => {
      const key = Object.keys(obj).find((k) => k.toLowerCase() === "corecount");
      return key && obj[key] != null ? { [key]: obj[key] } : null;
    };

    data.forEach((group, groupIdx) => {
      const gStatus = group.currentStatus;
      if (gStatus === STATUS.ACCEPTED || gStatus === STATUS.APPROVED) {

        // Always build the history-sourced values (used for coreCount override and custom fallback)
        const historyObj = {};
        if (history?.changes) {
          group.existing_data?.forEach(item => {
            const change = history.changes.find(c => c.field === item.field);
            historyObj[item.field] = (change && Array.isArray(change.to)) ? change.to[0] : null;
          });
        }

        // coreCount always comes from history, regardless of suggestion or custom path
        const coreCountOverride = extractCoreCount(historyObj);

        const acceptedIdx = group.suggestions?.findIndex(
          (s) => s.status === STATUS.ACCEPTED
        );

        if (acceptedIdx !== -1 && acceptedIdx !== undefined) {
          // Backend explicitly marked a suggestion as accepted
          initialSelections[groupIdx] = acceptedIdx;
          if (coreCountOverride) initialEdited[groupIdx] = coreCountOverride;

        } else if (Object.keys(historyObj).length > 0) {
          // No suggestion marked — check if the accepted value matches one by value
          const primaryField = group.invalid_field;
          const acceptedValue = historyObj[primaryField];
          const matchIdx = acceptedValue != null
            ? group.suggestions?.findIndex(s => {
                const v = s[primaryField] ?? s[primaryField?.toLowerCase()] ?? s[primaryField?.toUpperCase()];
                return String(v ?? "").toLowerCase() === String(acceptedValue).toLowerCase();
              })
            : -1;

          if (matchIdx !== undefined && matchIdx !== -1) {
            // Value matches a suggestion — highlight it there, overlay coreCount from history
            initialSelections[groupIdx] = matchIdx;
            if (coreCountOverride) initialEdited[groupIdx] = coreCountOverride;
          } else {
            // Truly custom — coreCount is already inside historyObj
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
    setEditedSuggestions(prev => ({
      ...prev,
      [groupIdx]: { ...(prev[groupIdx] || {}), [key]: newValue }
    }));
  }, []);

  const toggleGroup = useCallback((idx) =>
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] })), []);

  const handleAcceptConfirm = async () => {
    const { group, groupIdx } = acceptConfirm;
    const suggIdx = selectedSuggestions[groupIdx];
    if (suggIdx === undefined) return;

    const baseChosen = suggIdx === "custom"
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
      currentStatus: STATUS.ACCEPTED
    };

    if (sutType?.toLowerCase() === "vm") {
      const coreCountVal = merged?.coreCount || merged?.CoreCount || merged?.corecount;
      if (coreCountVal !== undefined) payload.coreCount = coreCountVal;
    }
    console.log("payload", payload);

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

  return {
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
  };
};
