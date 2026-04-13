import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';

const isCpuField = (fieldName) => fieldName === "coreCount";

const ChooseValueCell = ({ fieldName, value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [open, setOpen] = useState(false);

  const hasValue = !!value;

  const handleOpen = async () => {
    setOpen(true);
    if (options.length > 0) return;

    setLoadingOptions(true);
    try {
      const res = await fetch(
        `http://192.168.0.82:8001/unique-values?parameterName=${encodeURIComponent(fieldName)}`
      );
      const data = await res.json();
      setOptions(data?.data ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
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