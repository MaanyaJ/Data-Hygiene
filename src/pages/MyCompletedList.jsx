
import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import MyCompletedListHeader from "../components/MyCompletedListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
import Navbar from "../components/Navbar";

const pageSize = 50;

const MyCompletedList = () => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRecords = useCallback(
    async (pageNum, isNew = false) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          status: "APPROVED",
          page: pageNum,
          size: pageSize,
          search: search || "",
        });

        const res = await fetch(
          `http://192.168.0.182:8000/invalid-summary?${queryParams.toString()}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await res.json();
        console.log("Completed list response:", data);

        const approvedRecords = (data?.data || []).filter(
          (record) => (record?.Status || "").toUpperCase() === "APPROVED"
        );

        setTotalPages(Math.ceil((data?.total_invalid_records || 0) / pageSize));
        setRecords((prev) =>
          isNew ? approvedRecords : [...prev, ...approvedRecords]
        );
        setTotalRecords(data?.total_invalid_records || 0);
      } catch (error) {
        console.error("Completed list API error:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    setRecords([]);
    setPage(1);
    fetchRecords(1, true);
  }, [search, fetchRecords]);

  useEffect(() => {
    if (page > 1) {
      fetchRecords(page);
    }
  }, [page, fetchRecords]);

  const handleRetry = () => {
    fetchRecords(page, page === 1);
  };

  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Box>
      <Navbar />

      <MyCompletedListHeader
        search={search}
        onSearchChange={setSearch}
      />

      <RecordList
        records={records}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={() => setPage((prev) => prev + 1)}
      />

      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No approved records found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyCompletedList;

