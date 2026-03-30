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
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ChooseValueCell from "./ChooseValueCell";

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


// Score 0→1 maps to red→yellow→green
const scoreToColor = (score) => {
  if (score === null || score === undefined) return "#9e9e9e";
  const s = Math.max(0, Math.min(1, score));
  if (s <= 0.5) {
    // red → yellow
    const r = 220;
    const g = Math.round(s * 2 * 200);
    return `rgb(${r}, ${g}, 0)`;
  } else {
    // yellow → green
    const r = Math.round((1 - (s - 0.5) * 2) * 200);
    const g = 160;
    return `rgb(${r}, ${g}, 0)`;
  }
};


const CorrectionsTable = ({ tableRows, onAccept, onRejectAll }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState({});
  const [chosenValues, setChosenValues] = useState({});

  const maxSuggestions = getMaxSuggestions(tableRows);

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
              <TableCell sx={{ fontWeight: 700, minWidth: 250 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.length > 0 ? (
              tableRows.map((row) => {
                const selectedIdx = selectedSuggestions[row.id];
                const chosenValue = chosenValues[row.id];
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
                      const chipColor = sugg ? scoreToColor(sugg.score) : null;

                      return (
                        <TableCell key={i}>
                          {sugg ? (
                            <Tooltip
                              title={`Confidence: ${Math.round(sugg.score * 100)}%`}
                              arrow
                              placement="top"
                            >
                              <Chip
                                label={sugg.value}
                                clickable
                                onClick={() => handleSelectSuggestion(row.id, i)}
                                variant={isSelected ? "filled" : "outlined"}
                                sx={{
                                  maxWidth: 160,
                                  borderColor: chipColor,
                                  color: isSelected ? "#fff" : chipColor,
                                  backgroundColor: isSelected ? chipColor : "transparent",
                                  fontWeight: 600,
                                  "& .MuiChip-label": { fontWeight: 600 },
                                  "&:hover": {
                                    backgroundColor: isSelected ? chipColor : `${chipColor}22`,
                                  },
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography color="text.disabled">---</Typography>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Choose Value */}
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
                          variant="contained"
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