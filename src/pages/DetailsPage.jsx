import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container, Paper } from "@mui/material";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import CorrectionsTable from "../components/CorrectionsTable";
  
const DetailsPage = () => {
  const { id } = useParams();
   
  const [error, setError] = useState(null);
  const [executionData, setExecutionData] = useState(null);
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false);
 
  const fetchInvalidFields = async () => {
    setLoading(true);
    setError(null);
 
    try {
 
      const res = await fetch(`http://192.168.0.182:8000/snapshot-records/${id}`);
 
      if (!res.ok) {
        throw new Error("Failed to fetch record details");
      }
 
      const data = await res.json();

      console.log("API response:", data);
 
      setExecutionData(data.Execution_data);
      setData(data.Data)

    } catch (err) {
      console.log(err);
      setError(err);

    } finally {
        setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchInvalidFields();
  }, [id]);
 
  if (loading) return <Loader />;
  if (error) return <ErrorPage />;
  if (!data) return "No data to show";
 
  const tableRows = Array.isArray(data)
    ? data.map((item, index) => ({
        id: index,
        fieldName: item?.field || "---",
        currentValue: item?.value || "---",
        mapping: item?.mapping || "---",
        suggestion1: "",
        suggestion2: "",
        suggestion3: "",
        acceptedValue: "",
      }))
    : [];
 
  return (
      <Container maxWidth="xl">
        <Paper
          elevation={0}
        >
          <Box sx={{ px: 4, pt: 4, pb: 4 }}>
            <ExecutionInfoBox executionInfo={executionData} />
            <CorrectionsTable tableRows={tableRows} />
          </Box>
        </Paper>
      </Container>
  );
};
 
export default DetailsPage;