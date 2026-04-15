import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';

import { useUniqueValues } from '../../hooks/useUniqueValues';

const isCpuField = (fieldName) => fieldName === "coreCount";

const ChooseValueCell = ({ fieldName, value, onChange }) => {
  const { options, loading: loadingOptions, fetchOptions } = useUniqueValues(fieldName);
  const [open, setOpen] = useState(false);

  const hasValue = !!value;

  const handleOpen = () => {
    setOpen(true);
    fetchOptions();
  };
  
  if (isCpuField(fieldName)) {
    return (
      <TextField
        size="small"
        placeholder="Enter whole number"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || /^\d+$/.test(val)) onChange(val || null);
        }}
        slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
        sx={{
          minWidth: 160,
          "& .MuiOutlinedInput-root": hasValue
            ? {
                backgroundColor: "#e3f2fd",
                "& fieldset": { borderColor: "#1976d2", borderWidth: 2 },
              }
            : {},
        }}
      />
    );
  }

  return (
    <Autocomplete
      size="small"
      open={open}
      onOpen={handleOpen}
      onClose={() => setOpen(false)}
      options={options}
      loading={loadingOptions}
      value={value ?? null}
      onChange={(_, newVal) => onChange(newVal)}
      sx={{
        minWidth: 200,
        "& .MuiOutlinedInput-root": hasValue
          ? {
              backgroundColor: "#e3f2fd",
              "& fieldset": { borderColor: "#1976d2", borderWidth: 2 },
            }
          : {},
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Choose other value"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingOptions ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
};

export default ChooseValueCell;