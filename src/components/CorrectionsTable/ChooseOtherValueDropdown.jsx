import React, { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField, CircularProgress, Radio, Stack } from "@mui/material";
import { SELECTED } from "./constants";
import { API_URL } from "../../config";

const ChooseOtherValueDropdown = ({
  invalidField,
  isSelected,
  onCustomMetadataFetch,
  onSelectCustom,
  onClearCustom,
  isPending = true,
}) => {

  if(!isPending) return;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);



  const primaryField = invalidField?.split(",")[0].trim() || "";

  const handleOpen = async () => {
    if (!isPending) return;
    setOpen(true);
    if (options.length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/unique-values?parameterName=${encodeURIComponent(primaryField)}`);
      const json = await res.json();

      let parsedOptions = [];
      if (json?.unique_values) {
        const objVals = Object.values(json.unique_values);
        if (objVals.length > 0 && Array.isArray(objVals[0])) {
          parsedOptions = objVals[0];
        }
      } else if (Array.isArray(json?.data)) {
        parsedOptions = json.data;
      } else if (Array.isArray(json)) {
        parsedOptions = json;
      }

      setOptions(parsedOptions);
    } catch (err) {
      console.error("unique-values API fetch error:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (newVal) => {
    if (!isPending) return;
    setValue(newVal);
    if (!newVal) {
      if (onClearCustom) onClearCustom();
      return;
    }

    onSelectCustom();
    setFetchingMeta(true);
    try {
      const res = await fetch(`${API_URL}/metadata-values/${encodeURIComponent(primaryField)}/${encodeURIComponent(newVal)}`);
      const json = await res.json();

      let meta = json;
      if (json?.metadata_records && Array.isArray(json.metadata_records) && json.metadata_records.length > 0) {
        meta = json.metadata_records[0].metadata || json.metadata_records[0];
      } else if (json?.data) {
        meta = json.data;
      } else if (json?.metadata) {
        meta = json.metadata;
      }

      onCustomMetadataFetch({ [primaryField]: newVal, ...meta });
    } catch (err) {
      console.error("metadata-values fetch error:", err);
    } finally {
      setFetchingMeta(false);
    }
  };

  const p = SELECTED;

  return (
    <Box
      sx={{
        mx: 1.5,
        mb: 1,
        py: 0.5,
        px: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: `1.5px solid ${isSelected ? p.accent : "#e2e8f0"}`,
        borderRadius: 2,
        backgroundColor: isSelected ? p.light : "#fff",
        boxShadow: isSelected ? `0 0 0 3px ${p.accent}20` : "none",
        transition: "all 0.15s ease",
        opacity: isPending ? 1 : 0.5,
        pointerEvents: isPending ? "auto" : "none",
      }}
    >
      {/* Main Content */}

      <Box sx={{ flex: 1, px: 1.5, py: 0.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#64748b", mb: 0.5 }}>
          Choose other {invalidField}:
        </Typography>
        <Autocomplete
          size="small"
          open={open}
          onOpen={handleOpen}
          onClose={() => setOpen(false)}
          options={options}
          loading={loading}
          value={value}
          disabled={!isPending}
          onChange={(_, newVal) => handleChange(newVal)}
          sx={{ maxWidth: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search or select..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading || fetchingMeta ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default ChooseOtherValueDropdown;