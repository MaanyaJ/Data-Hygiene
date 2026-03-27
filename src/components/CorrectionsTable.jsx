import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";
 
const CorrectionsTable = ({ tableRows }) => {
  return (
    <>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#17233a",
          mb: 2,
        }}
      >
        Feilds to be Corrected
      </Typography>
 
      <TableContainer
        sx={{
          mt: 2,
          overflowX: "auto",
        }}
      >
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#eef3f8" }}>
              <TableCell sx={{ fontWeight: 700 }}>Field Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Suggestion 1</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Suggestion 2</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Suggestion 3</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Accepted Value</TableCell>
            </TableRow>
          </TableHead>
 
          <TableBody>
            {tableRows.length > 0 ? (
              tableRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Tooltip
                      title={row.mapping}
                      arrow
                      placement="top"
                      slotProps={{
                        tooltip: {
                          sx: {
                            fontSize: "13px",
                            maxWidth: 400,
                          },
                        },
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
                  <TableCell>{row.suggestion1 || "---"}</TableCell>
                  <TableCell>{row.suggestion2 || "---"}</TableCell>
                  <TableCell>{row.suggestion3 || "---"}</TableCell>
                  <TableCell>{row.acceptedValue || "---"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
 