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
import { FILTERS } from "../pages/LandingPage";

const LandingPageHeader = ({ search, onSearchChange, filter, onFilterChange }) => {
  return (
    <Box>
      <Typography variant="h3" align="center" sx={{ my: 3,mt:-4 }}>
        Data Hygiene
      </Typography>

      <Stack
        direction="column"
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
        
        <FormGroup row sx={{mt: -5}}>
          {FILTERS.map(({ label, value }) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={filter === value}
                  onChange={() => onFilterChange(value)}
                />
              }
              label={label}
            />
          ))}
        </FormGroup>
        
      </Stack>
    </Box>
  );
};

export default LandingPageHeader;