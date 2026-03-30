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

// Derive max number of suggestions across all rows
const getMaxSuggestions = (tableRows) => {
  return Math.max(...tableRows.map((row) => row.suggestions?.length ?? 0), 0);
};

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

const CorrectionsTable = ({ tableRows, onAccept, onRejectAll }) => {
  // { [rowId]: suggestionIndex }
  const [selectedSuggestions, setSelectedSuggestions] = useState({});

  const maxSuggestions = getMaxSuggestions(tableRows);

  const handleSelectSuggestion = (rowId, suggIndex) => {
    setSelectedSuggestions((prev) => {
      // clicking the same one deselects
      if (prev[rowId] === suggIndex) {
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      return { ...prev, [rowId]: suggIndex };
    });
  };

  const handleAccept = (row) => {
    const idx = selectedSuggestions[row.id];
    if (idx === undefined) return;
    const accepted = row.suggestions[idx];
    onAccept?.(row, accepted);
  };

  const handleRejectAll = (row) => {
    setSelectedSuggestions((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
    onRejectAll?.(row);
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "#17233a", mb: 2 }}
      >
        Fields to be Corrected
      </Typography>

      <TableContainer sx={{ mt: 2, overflowX: "auto" }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef3f8" }}>
              {/* Sticky Field Name header */}
              <TableCell sx={{ ...stickyHeadCell, fontWeight: 700, minWidth: 160 }}>
                Field Name
              </TableCell>

              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                Current Value
              </TableCell>

              {Array.from({ length: maxSuggestions }, (_, i) => (
                <TableCell key={i} sx={{ fontWeight: 700, minWidth: 180 }}>
                  Suggestion {i + 1}
                </TableCell>
              ))}

              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableRows.length > 0 ? (
              tableRows.map((row) => {
                const selectedIdx = selectedSuggestions[row.id];
                const hasSelection = selectedIdx !== undefined;

                return (
                  <TableRow key={row.id} hover>
                    {/* Sticky Field Name cell */}
                    <TableCell sx={{ ...stickyCell, fontWeight: 600 }}>
                      <Tooltip
                        title={row.mapping}
                        arrow
                        placement="top"
                        slotProps={{
                          tooltip: { sx: { fontSize: "13px", maxWidth: 400 } },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "fit-content",
                          }}
                        >
                          {row.fieldName}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    <TableCell>{row.currentValue}</TableCell>

                    {/* Dynamic suggestion cells */}
                    {Array.from({ length: maxSuggestions }, (_, i) => {
                      const sugg = row.suggestions?.[i];
                      const isSelected = selectedIdx === i;

                      return (
                        <TableCell key={i}>
                          {sugg ? (
                            <Tooltip
                              title={`Score: ${sugg.score}`}
                              arrow
                              placement="top"
                            >
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

                    {/* Actions cell */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={!hasSelection}
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
                <TableCell
                  colSpan={3 + maxSuggestions}
                  align="center"
                  sx={{ py: 4 }}
                >
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