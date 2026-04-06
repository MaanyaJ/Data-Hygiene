import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import Navbar from "../components/Navbar";
import { USE_MOCK } from "../config";
import mockDetails from "../mock/mockDetails.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * From a comparing_data array, return the value of the suggestion whose
 * status === "ACCEPTED" (case-insensitive).
 */
const getAcceptedSuggestion = (comparingData = []) => {
  if (!Array.isArray(comparingData)) return "—";
  const idx = comparingData.findIndex(
    (entry) => entry.status?.toUpperCase() === "ACCEPTED"
  );
  if (idx === -1) return "—";
  return comparingData[idx][`suggestion${idx + 1}`] ?? "—";
};

// ── Table ─────────────────────────────────────────────────────────────────────

const CELL_SX = { fontWeight: 600, fontSize: 13 };
const HEAD_SX = { fontWeight: 700, bgcolor: "#f8fafc", fontSize: 13 };

const CompletedTable = ({ dataRows, status, reason }) => {
  const isApproved = status?.toUpperCase() === "APPROVED";

  const thirdHeader = isApproved ? "Accepted Suggestion" : "Reason";

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#17233a", mb: 2 }}>
        Field Corrections
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e5eaf2", borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={HEAD_SX}>Field Name</TableCell>
              <TableCell sx={HEAD_SX}>Incorrect Value</TableCell>
              <TableCell sx={HEAD_SX}>{thirdHeader}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {dataRows.map((row, i) => (
              <TableRow
                key={i}
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                {/* Col 1 – always: Field Name */}
                <TableCell sx={CELL_SX}>{row.field ?? "—"}</TableCell>

                {/* Col 2 – always: Incorrect Value */}
                <TableCell sx={{ fontSize: 13 }}>{row.value ?? "—"}</TableCell>

                {/* Col 3 – dynamic */}
                {isApproved ? (
                  <TableCell sx={{ fontSize: 13 }}>
                    <Chip
                      label={getAcceptedSuggestion(row.comparing_data)}
                      size="small"
                      sx={{
                        bgcolor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                ) : (
                  <TableCell sx={{ fontSize: 13, color: "#b71c1c" }}>
                    {/* Reason is a top-level field on the record, not per-row */}
                    {reason ?? "—"}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CompletedDetailsPage = () => {
  const { id } = useParams();
  const [executionData, setExecutionData] = useState(null);
  const [dataRows,      setDataRows]      = useState([]);
  const [status,        setStatus]        = useState(null);
  const [reason,        setReason]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      let json;

      if (USE_MOCK) {
        // ── Mock path ──────────────────────────────────────────────────────
        json = mockDetails[id];
        if (!json) throw new Error(`No mock data found for id "${id}"`);
      } else {
        // ── Real API path ──────────────────────────────────────────────────
        const res = await fetch(`http://192.168.0.182:8003/snapshot-records/${id}`);
        if (!res.ok) throw new Error("Failed to fetch record details");
        json = await res.json();
      }

      setExecutionData(json.execution_details);
      setDataRows(Array.isArray(json.Data) ? json.Data : []);
      setStatus(json.standardization_status);
      setReason(json.reason ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (error)   return <ErrorPage message={error?.message} onRetry={fetchDetails} />;
  if (!executionData) return null;

  return (
    <Box>
      <Navbar />
      <Container maxWidth="xl">
        <Paper elevation={0} sx={{ px: 4, pt: 4, pb: 6 }}>
          <ExecutionInfoBox executionInfo={executionData} />
          <CompletedTable
            dataRows={dataRows}
            status={status}
            reason={reason}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default CompletedDetailsPage;
