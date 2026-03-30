import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Paper } from "@mui/material";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import CorrectionsTable from "../components/CorrectionsTable";

// Transforms comparingData: [{ suggestion1, score1 }, ...]
// into a flat array: [{ value, score }, ...]
const parseSuggestions = (comparingData = []) => {
  if (!Array.isArray(comparingData) || comparingData.length === 0) return [];

  // Each object in comparingData has suggestion1/score1, suggestion2/score2, etc.
  // Flatten all of them into a single ordered array
  const suggestions = [];

  for (const entry of comparingData) {
    let i = 1;
    while (entry[`suggestion${i}`] !== undefined) {
      suggestions.push({
        value: entry[`suggestion${i}`],
        score: entry[`score${i}`] ?? null,
      });
      i++;
    }
  }

  return suggestions;
};

const DetailsPage = () => {
  const { id } = useParams();

  const [error, setError] = useState(null);
  const [executionData, setExecutionData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInvalidFields = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://192.168.0.182:8000/snapshot-records/${id}`
      );

      if (!res.ok) throw new Error("Failed to fetch record details");

      const json = await res.json();

      setExecutionData(json.execution_details);
      setData(json.Data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvalidFields();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorPage message={error?.message} onRetry={fetchInvalidFields} />;
  if (!data) return "No invalid data in the response to show";
  if (!executionData) return "No execution data to show";

  const tableRows = Array.isArray(data)
    ? data.map((item, index) => ({
        id: index,
        fieldName: item?.field || "---",
        currentValue: item?.value || "---",
        mapping: item?.mapping || "---",
        suggestions: parseSuggestions(item?.comparingData),
      }))
    : [];

  const handleAccept = (row, acceptedSuggestion) => {
    console.log("Accepted:", row.fieldName, "→", acceptedSuggestion);
    // TODO: call your API to persist the accepted value
  };

  const handleRejectAll = (row) => {
    console.log("Rejected all for:", row.fieldName);
    // TODO: call your API to reject
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={0}>
        <Box sx={{ px: 4, pt: 4, pb: 4 }}>
          <ExecutionInfoBox executionInfo={executionData} />
          <CorrectionsTable
            tableRows={tableRows}
            onAccept={handleAccept}
            onRejectAll={handleRejectAll}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default DetailsPage;