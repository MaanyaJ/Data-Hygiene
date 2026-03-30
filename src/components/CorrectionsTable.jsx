import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Button,
  Chip,
  Box,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const getMaxSuggestions = (tableRows) =>
  Math.max(...tableRows.map((row) => row.suggestions?.length ?? 0), 0);

const stickyCell = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  backgroundColor: "#fff",
};

const stickyHeadCell = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  backgroundColor: "#eef3f8",
};

const isCpuField = (fieldName) => fieldName === "CPUs";

// Per-row Choose Value input — kept separate so fetch state is isolated per row
const ChooseValueCell = ({ fieldName, value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    if (options.length > 0) return;
    setLoadingOptions(true);
    try {
      const res = await fetch(
        `http://192.168.0.182:8000/unique-values?parameterName=${encodeURIComponent(fieldName)}`
      );
      const data = await res.json();
      setOptions(data?.data ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  if (isCpuField(fieldName)) {
    return (
      <TextField
        size="small"
        placeholder="Enter whole number"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || /^\d+$/.test(val)) onChange(val || null);
        }}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        sx={{ minWidth: 160 }}
      />
    );
  }

  return (
    <Autocomplete
      size="small"
      open={open}
      onOpen={handleOpen}
      onClose={() => setOpen(false)}
      options={options}
      loading={loadingOptions}
      value={value ?? null}
      onChange={(_, newVal) => onChange(newVal)}
      sx={{ minWidth: 200 }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Choose value"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loadingOptions ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

const CorrectionsTable = ({ tableRows, onAccept, onRejectAll }) => {
  // { [rowId]: number } — which suggestion chip is selected
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  // { [rowId]: string | null } — value in the Choose Value input
  const [chosenValues, setChosenValues] = useState({});

  const maxSuggestions = getMaxSuggestions(tableRows);

  // Clicking a suggestion chip toggles selection and always clears the Choose Value input
  const handleSelectSuggestion = (rowId, suggIndex) => {
    setChosenValues((prev) => ({ ...prev, [rowId]: null }));
    setSelectedSuggestions((prev) => {
      if (prev[rowId] === suggIndex) {
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      return { ...prev, [rowId]: suggIndex };
    });
  };

  // Typing/selecting in Choose Value input:
  // - clears any selected suggestion chip (they're mutually exclusive)
  const handleChosenValueChange = (rowId, val) => {
    setChosenValues((prev) => ({ ...prev, [rowId]: val }));
    setSelectedSuggestions((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleAccept = (row) => {
    const chosen = chosenValues[row.id];
    const suggIdx = selectedSuggestions[row.id];
    const value = chosen ?? (suggIdx !== undefined ? row.suggestions[suggIdx]?.value : null);
    if (!value) return;
    onAccept?.(row, value);
  };

  const handleRejectAll = (row) => {
    setSelectedSuggestions((prev) => { const n = { ...prev }; delete n[row.id]; return n; });
    setChosenValues((prev) => ({ ...prev, [row.id]: null }));
    onRejectAll?.(row);
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#17233a", mb: 2 }}>
        Fields to be Corrected
      </Typography>

      <TableContainer sx={{ mt: 2, overflowX: "auto" }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef3f8" }}>
              <TableCell sx={{ ...stickyHeadCell, fontWeight: 700, minWidth: 160 }}>
                Field Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Current Value</TableCell>
              {Array.from({ length: maxSuggestions }, (_, i) => (
                <TableCell key={i} sx={{ fontWeight: 700, minWidth: 180 }}>
                  Suggestion {i + 1}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Choose Value</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.length > 0 ? (
              tableRows.map((row) => {
                const selectedIdx = selectedSuggestions[row.id];
                const chosenValue = chosenValues[row.id];
                // Accept enabled if either a suggestion chip or a choose value is set
                const canAccept = selectedIdx !== undefined || !!chosenValue;

                return (
                  <TableRow key={row.id} hover>
                    {/* Sticky Field Name */}
                    <TableCell sx={{ ...stickyCell, fontWeight: 600 }}>
                      <Tooltip
                        title={row.mapping}
                        arrow
                        placement="top"
                        slotProps={{ tooltip: { sx: { fontSize: "13px", maxWidth: 400 } } }}
                      >
                        <Typography sx={{ fontWeight: 600, cursor: "pointer", width: "fit-content" }}>
                          {row.fieldName}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    <TableCell>{row.currentValue}</TableCell>

                    {/* Dynamic suggestion chips */}
                    {Array.from({ length: maxSuggestions }, (_, i) => {
                      const sugg = row.suggestions?.[i];
                      const isSelected = selectedIdx === i;
                      return (
                        <TableCell key={i}>
                          {sugg ? (
                            <Tooltip title={`Score: ${sugg.score}`} arrow placement="top">
                              <Chip
                                label={sugg.value}
                                clickable
                                onClick={() => handleSelectSuggestion(row.id, i)}
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{ maxWidth: 160 }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography color="text.disabled">---</Typography>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* key changes when a chip is selected, forcing Autocomplete to fully remount and clear */}
                    <TableCell>
                      <ChooseValueCell
                        key={`${row.id}-${selectedIdx ?? "none"}`}
                        fieldName={row.fieldName}
                        value={chosenValue ?? null}
                        onChange={(val) => handleChosenValueChange(row.id, val)}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={!canAccept}
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleAccept(row)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => handleRejectAll(row)}
                        >
                          Reject All
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4 + maxSuggestions} align="center" sx={{ py: 4 }}>
                  No invalid fields found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CorrectionsTable;