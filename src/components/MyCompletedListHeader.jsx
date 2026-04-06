import React from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const STATUS_FILTERS = [
  { label: "Accepted", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const MyCompletedListHeader = ({ search, onSearchChange, statusFilter, onStatusFilterChange }) => {
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ my: 3 }}>
        My Completed List
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={4}
        sx={{ px: 2, mb: 2, flexWrap: "wrap" }}
      >
        <TextField
          label="Search (Execution Id, Benchmark Type, Benchmark Category)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 500 }}
        />

        <Stack direction="row" alignItems="center">
          {STATUS_FILTERS.map(({ label, value }) => (
            <FormControlLabel
              key={value}
              label={label}
              control={
                <Checkbox
                  checked={statusFilter === value}
                  onChange={() => onStatusFilterChange(statusFilter === value ? null : value)}
                />
              }
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default MyCompletedListHeader;
