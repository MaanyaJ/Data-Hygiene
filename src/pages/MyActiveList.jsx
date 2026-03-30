import React, { useEffect, useState, useMemo } from "react";
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
 
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
 
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [yellow, setYellow] = useState(0);
 
  const handleFilterChange = (value) => {
    setFilter((prev) => (prev === value ? "" : value));
  };
 
  const fetchCounts = async () => {
    setCountsLoading(true);
    try {
      const res = await fetch(
        "http://192.168.0.182:8001/invalid-summary/counts"
      );
 
      if (!res.ok) {
        throw new Error("Failed to fetch counts");
      }
 
      const data = await res.json();
      console.log("Counts API response:", data);
 
      setCounts(data);
 
      setRed(data?.red ?? 0);
      setYellow(data?.yellow ?? 0);
      setGreen(data?.green ?? 0);
    } catch (error) {
      console.error("Counts API error:", error);
      setError(error);
    } finally {
      setCountsLoading(false);
    }
  };
 
  const fetchRecords = async (pageNum, isNew = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        size: pageSize,
        search: search || "",
      });
 
      const res = await fetch(
        `http://192.168.0.141:8001/invalid-summary?${queryParams}`
      );
 
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
 
      const data = await res.json();
 
      console.log("Records API response:", data);
      console.log("Records API data.data:", data?.data);
      console.log(
        "Records API total_invalid_records:",
        data?.total_invalid_records
      );
 
      setTotalPages(Math.ceil((data?.total_invalid_records || 0) / pageSize));
      setRecords((prev) =>
        isNew ? data?.Data || [] : [...prev, ...(data?.Data || [])]
      );
      setTotalRecords(data?.total_invalid_records || 0);
    } catch (error) {
      console.error("Records API error:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchCounts();
  }, []);
 
  useEffect(() => {
    setRecords([]);
    setPage(1);
    fetchRecords(1, true);
  }, [search]);
 
  useEffect(() => {
    if (page !== 1) {
      fetchRecords(page);
    }
  }, [page]);
 
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
 
  console.log("Current counts state:", counts);
  console.log("Current red:", red);
  console.log("Current yellow:", yellow);
  console.log("Current green:", green);
  console.log("Current records state:", records);
  console.log("Current filteredRecords:", filteredRecords);
 
  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={() => {
          fetchCounts();
          fetchRecords(page, page === 1);
        }}
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
        countsLoading={countsLoading}
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
        filteredRecords.length < 1 &&
        page < totalPages && (
          <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
            <Typography>No Records Found</Typography>
          </Box>
        )}
    </Box>
  );
};
 
export default MyActiveList;