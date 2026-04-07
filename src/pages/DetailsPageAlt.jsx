import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import CorrectionsTableAlt from "../components/CorrectionsTableAlt";
import Navbar from "../components/Navbar";
import { USE_MOCK_ALT_DETAILS } from "../config";
import mockData from "../mock/recordDetails.json";

/**
 * Transforms OLD API format (json.Data) → CorrectionsTableAlt shape.
 *
 * OLD format:
 *   Data[]: { field, value, validation_status, comparing_data: [{ suggestion1, score1 }, ...] }
 *
 * NEW format (recordDetails.json shape):
 *   data[]: { invalid_field, existing_data[], suggestions[{ fieldA, fieldB, ... }] }
 *
 * All non-valid fields appear in every suggestion row (fields with no
 * comparing_data get "—" so their column is still visible).
 */
const transformOldApiData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  const existing_data = rawData.map((item) => ({
    field: item.field,
    value: item.value,
    validation_status: item.validation_status,
  }));

  const nonValidFields = rawData.filter((item) => item.validation_status !== "valid");
  if (nonValidFields.length === 0) return [];

  const maxSuggestions = Math.max(
    ...nonValidFields.map((item) =>
      Array.isArray(item.comparing_data) ? item.comparing_data.length : 0
    ),
    1
  );

  const suggestions = [];
  for (let i = 0; i < maxSuggestions; i++) {
    const sugg = {};
    nonValidFields.forEach((item) => {
      const entry = (item.comparing_data ?? [])[i];
      const suggKey = `suggestion${i + 1}`;
      sugg[item.field.toLowerCase()] =
        entry && entry[suggKey] !== undefined ? entry[suggKey] : "—";
    });
    suggestions.push(sugg);
  }

  const groupLabel = nonValidFields.map((item) => item.field).join(", ");
  return [{ invalid_field: groupLabel, existing_data, suggestions }];
};

/* ─────────────────────────────────────────────────────────────── */

const DetailsPageAlt = () => {
  const { id } = useParams();

  const [error, setError] = useState(null);
  const [executionData, setExecutionData] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [standardizationStatus, setStandardizationStatus] = useState("")

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ── Mock mode (USE_MOCK_ALT_DETAILS = true in config.js) ──────────────
      if (USE_MOCK_ALT_DETAILS) {
        // Simulate a small network delay for realism
        await new Promise((r) => setTimeout(r, 300));
        setExecutionData(mockData.execution_details);
        // recordDetails.json already has the new format — use directly
        setData(mockData.data);
        return;
      }

      // ── Real API ──────────────────────────────────────────────────────────
      const res = await fetch(
        `http://10.222.237.123:8001/snapshot-records/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch record details");

      const json = await res.json();
      console.log("API response:", json);

      setExecutionData(json.execution_details);
      setStandardizationStatus(json.standardization_status)

      // New API format: json.data[] with invalid_field key → use directly
      if (
        Array.isArray(json.data) &&
        json.data.length > 0 &&
        json.data[0]?.invalid_field !== undefined
      ) {
        setData(json.data);
      }
      // Old API format: json.Data[] → transform
      else if (Array.isArray(json.Data)) {
        setData(transformOldApiData(json.Data));
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorPage message={error?.message} onRetry={fetchData} />;
  if (!data) return "No invalid data in the response to show";
  if (!executionData) return "No execution data to show";

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 4, mt: 5 }}>
        <ExecutionInfoBox executionInfo={executionData} />
        <Box sx={{ mt: -2}}>
        <CorrectionsTableAlt 
          data={data}
          execID={executionData.execution_id}
          sutType = {executionData.sutType}
          standardizationStatus = {standardizationStatus}
        />
        </Box>
      </Box>
    </Box>
  );
};

export default DetailsPageAlt;