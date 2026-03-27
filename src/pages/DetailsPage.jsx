import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container, Paper } from "@mui/material";
import mockData from "../mock/details.json";
import ErrorPage from "../components/ErrorPage";
import Loader from "../components/Loader";
import DetailsPageHeader from "../components/DetailsPageHeader";
import ExecutionInfoBox from "../components/ExecutionInfoBox";
import CorrectionsTable from "../components/CorrectionsTable";
 
const USE_MOCK = false;
 
const DetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
 
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
 
  const fetchInvalidFields = async () => {
    setLoading(true);
    setError(null);
 
    try {
      if (USE_MOCK) {
        console.log("Using MOCK data");
 
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 500);
 
        return;
      }
 
      const res = await fetch(`http://192.168.0.182:8000/snapshot-records/${id}`);
 
      if (!res.ok) {
        throw new Error("Failed to fetch record details");
      }
 
      const result = await res.json();
      console.log("API response:", result);
 
      setData(result.Execution_data);
    } catch (err) {
      console.log(err);
      setError(err);
      setLoading(false);
    } finally {
      if (!USE_MOCK) {
        setLoading(false);
      }
    }
  };
 
  useEffect(() => {
    fetchInvalidFields();
  }, [id]);
 
  if (loading) return <Loader />;
  if (error) return <ErrorPage />;
  if (!data) return null;
 
  const executionInfo = {
    executionId: data?.execution_id || "-",
    benchmarkType: data?.benchmarkType || "-",
    sutType: data?.sutType || "-",
    runCategory: data?.runCategory || "-",
    createdOn: data?.createdOn || "-",
    tester: data?.tester || "-",
    resultType: data?.resultType || "-",
    invalidFields: data?.invalidFields || [],
  };
 
  const tableRows = Array.isArray(data?.Data)
    ? data.Data.map((item, index) => ({
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
    // <Box
    //   sx={{
    //     minHeight: "100vh",
    //     bgcolor: "#f5f7fb",
    //     py: 4,
    //   }}
    // >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
         
        >
          <DetailsPageHeader
            navigate={navigate}
            executionId={executionInfo.executionId}
            invalidCount={executionInfo.invalidFields.length}
            resultType={executionInfo.resultType}
          />
 
          <Box sx={{ px: 4, pt: 4, pb: 4 }}>
            <ExecutionInfoBox executionInfo={executionInfo} />
            <CorrectionsTable tableRows={tableRows} />
          </Box>
        </Paper>
      </Container>
    // </Box>
  );
};
 
export default DetailsPage;