import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Paper } from "@mui/material";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import CorrectionsTable from "../components/CorrectionsTable";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

const parseSuggestions = (comparingData = []) => {
  if (!Array.isArray(comparingData)) return [];

  return comparingData
    .map((entry, i) => ({
      value: entry[`suggestion${i + 1}`] ?? null,
      score: entry[`score${i + 1}`] ?? null,
    }))
    .filter((s) => s.value !== null);
};

const DetailsPage = () => {
  const { id } = useParams();

  const [error, setError] = useState(null);
  const [executionData, setExecutionData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState([])

  const fetchInvalidFields = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/snapshot-records/${id}`
      );

      if (!res.ok) throw new Error("Failed to fetch record details");

      const json = await res.json();

      setInvalidFields(json.invalidFields)

      setExecutionData(json.execution_details);
      setData(json.Data);
      console.log(json)
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
        OriginalValue: item?.value || "---",
        mapping: item?.mapping || "---",
        suggestions: parseSuggestions(item?.comparing_data),
        valid: item?.validation_status
      }))
    : [];

  return (
        <Box>
          <Navbar/>
          <Box sx={{ p:4}}>
          <ExecutionInfoBox executionInfo={executionData} />
          <CorrectionsTable
            tableRows={tableRows}
            invalidFields = {invalidFields}
            execID = {executionData.execution_id}
          />
        </Box>
        </Box>
  );
};

export default DetailsPage;