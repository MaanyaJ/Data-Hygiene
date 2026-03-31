import React from "react";
import { Box, Typography, TextField, Stack } from "@mui/material";

const MyCompletedListHeader = ({ search, onSearchChange }) => {
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ my: 3 }}>
        My Completed List
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{ px: 2, mb: 2 }}
      >
        <TextField
          label="Search (Execution Id, Benchmark Type, Benchmark Category)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 500 }}
        />
      </Stack>
    </Box>
  );
};

export default MyCompletedListHeader;