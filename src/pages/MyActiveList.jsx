import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import MyActiveListHeader from "../components/MyActiveListHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";
 
const pageSize = 50;
 
const MyActiveList = () => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
 
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [yellow, setYellow] = useState(0);
 
  const handleFilterChange = (value) => {
    setFilter((prev) => (prev === value ? "" : value));
  };
 
  // Use useCallback to memoize fetchRecords
  const fetchRecords = useCallback(async (pageNum, isNew = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        size: pageSize,
        search: search || "",
      });
 
      console.log(`Fetching page ${pageNum} with search: ${search}`); // Debug log
 
      const res = await fetch(
        `http://192.168.0.182:8002/invalid-summary?${queryParams}`
      );
 
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status}`);
      }
 
      const data = await res.json();
      console.log("API Response:", data);
 
      setTotalPages(Math.ceil((data?.total_invalid_records || 0) / pageSize));
      setRecords((prev) =>
        isNew ? data?.data || [] : [...prev, ...(data?.data || [])]
      );
      setTotalRecords(data?.total_invalid_records || 0);
      setRed(data.red || 0);
      setGreen(data.green || 0);
      setYellow(data.yellow || 0);
    } catch (error) {
      console.error("Records API error:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [search]); // search is the only dependency that should trigger a new fetchRecords
 
  // Initial load and search changes
  useEffect(() => {
    // Reset state when search changes
    setRecords([]);
    setPage(1);
    fetchRecords(1, true);
  }, [search, fetchRecords]); // Now fetchRecords is stable due to useCallback
 
  // Handle page changes (but not on initial load)
  useEffect(() => {
    if (page > 1) {
      fetchRecords(page);
    }
  }, [page, fetchRecords]);
 
  const filteredRecords = useMemo(() => {
    if (!filter) return records;
 
    return records.filter((record) => {
      const updatedOn =
        record?.updatedOn ||
        record?.history?.updatedOn ||
        record?.createdOn;
 
      if (!updatedOn) return false;
 
      const recordDate = new Date(updatedOn);
      const now = new Date();
      const diffTime = now - recordDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
 
      if (filter === "<3") return diffDays < 3;
      if (filter === "3-6") return diffDays >= 3 && diffDays <= 6;
      if (filter === ">6") return diffDays > 6;
 
      return true;
    });
  }, [records, filter]);
 
  // Fix the onRetry function in error handler
  const handleRetry = useCallback(() => {
    fetchRecords(page, page === 1);
  }, [fetchRecords, page]);
 
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
      <MyActiveListHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={handleFilterChange}
        red={red}
        green={green}
        yellow={yellow}
        countsLoading={loading} // Pass loading state instead of missing countsLoading
      />
 
      <RecordList
        records={filteredRecords}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={() => setPage((prev) => prev + 1)}
        showAgeColors
      />
 
      {filter &&
        !loading &&
        filteredRecords.length === 0 &&
        records.length > 0 && ( // Only show if there are records but none match filter
          <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
            <Typography>No records match the selected filter</Typography>
          </Box>
        )}
      
      {!loading && records.length === 0 && !error && (
        <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
          <Typography>No records found</Typography>
        </Box>
      )}
    </Box>
  );
};
 
export default MyActiveList;