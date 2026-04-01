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
        const approvedParams = new URLSearchParams({
          status: "APPROVED",
          page: pageNum,
          size: pageSize,
          search: search || "",
        });

        const rejectedParams = new URLSearchParams({
          status: "REJECTED",
          page: pageNum,
          size: pageSize,
          search: search || "",
        });

        const [approvedRes, rejectedRes] = await Promise.all([
          fetch(`http://192.168.0.182:8000/invalid-summary?${approvedParams.toString()}`),
          fetch(`http://192.168.0.182:8000/invalid-summary?${rejectedParams.toString()}`),
        ]);

        if (!approvedRes.ok || !rejectedRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const approvedData = await approvedRes.json();
        const rejectedData = await rejectedRes.json();

        const approvedRecords = approvedData?.data || [];
        const rejectedRecords = rejectedData?.data || [];

        const mergedRecords = [...approvedRecords, ...rejectedRecords];

        mergedRecords.sort(
          (a, b) => new Date(b.updatedOn || 0) - new Date(a.updatedOn || 0)
        );

        setRecords((prev) =>
          isNew ? mergedRecords : [...prev, ...mergedRecords]
        );

        const approvedTotal = approvedData?.total_invalid_records || 0;
        const rejectedTotal = rejectedData?.total_invalid_records || 0;
        const total = approvedTotal + rejectedTotal;

        setTotalRecords(total);
        setTotalPages(Math.ceil(total / pageSize));
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
      fetchRecords(page, false);
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
        showCount={true}
      />

      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No completed records found</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyCompletedList;