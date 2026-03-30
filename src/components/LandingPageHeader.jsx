import React from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
} from "@mui/material";

const FILTER_LABELS = ["filter1", "Pending", "Success", "Failed"];

const LandingPageHeader = ({ search, onSearchChange, filter, onFilterChange }) => {
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ my: 3 }}>
        Data Hygiene
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={5}
        sx={{ px: 2, mb: 2 }}
      >
        <TextField
          label="Search (Execution Id, Benchmark Type, Benchmark Category)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ mb: 2, width: 500 }}
        />

        <FormGroup row>
          {FILTER_LABELS.map((item) => (
            <FormControlLabel
              key={item}
              control={
                <Checkbox
                  checked={filter.includes(item)}
                  onChange={() => onFilterChange(item)}
                />
              }
              label={item === "filter1" ? "All" : item}
            />
          ))}
        </FormGroup>
      </Stack>
    </Box>
  );
};

export default LandingPageHeader;