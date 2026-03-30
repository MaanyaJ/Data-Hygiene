import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import LandingPageHeader from "../components/LandingPageHeader";
import RecordList from "../components/RecordList";
import ErrorPage from "../components/ErrorPage";

export const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const pageSize = 50;

const LandingPage = () => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(""); // "" = All

  const handleFilterChange = (value) => {
    setFilter((prev) => (prev === value ? "" : value));
  };

  const fetchRecords = async (pageNum, isNew = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum,
        size: pageSize,
        search: search || "",
        status: filter,
      });

      const res = await fetch(
        `http://192.168.0.182:8000/invalid-summary?${queryParams}`
      );

      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      setTotalPages(Math.ceil(data.total_invalid_records / pageSize));
      setRecords((prev) => (isNew ? data.data : [...prev, ...data.data]));
      setTotalRecords(data.total_invalid_records);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRecords([]);
    setPage(1);
    fetchRecords(1, true);
  }, [search, filter]);

  useEffect(() => {
    if (page !== 1) {
      fetchRecords(page);
    }
  }, [page]);

  if (error) {
    return (
      <ErrorPage
        message={error?.message || "Something went wrong"}
        onRetry={() => fetchRecords(page)}
      />
    );
  }

  return (
    <Box>
      <LandingPageHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
      <RecordList
        records={records}
        totalRecords={totalRecords}
        totalPages={totalPages}
        page={page}
        loading={loading}
        onLoadMore={() => setPage((prev) => prev + 1)}
      />
    </Box>
  );
};

export default LandingPage;