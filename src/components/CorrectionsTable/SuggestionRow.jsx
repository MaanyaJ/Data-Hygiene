import React from "react";
import { Box, Typography, Stack, Radio, Tooltip } from "@mui/material";
import { capitalize, SELECTED } from "./constants";

const SuggestionRow = ({ suggestion, isSelected, onSelect, isPending = true }) => {
  const p = SELECTED;
  
  // Extract and exclude score from visible columns
  const { score, ...suggestionData } = suggestion;
  const entries = Object.entries(suggestionData);
  
  const [primaryKey, primaryVal] = entries[0] ?? [];
  const secondaryEntries = entries.slice(1);

  const tooltipTitle = score !== undefined ? `Score: ${score}` : "No score available";

  return (
    <Box
      onClick={isPending ? onSelect : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        cursor: isPending ? "pointer" : "not-allowed",
        border: `1.5px solid ${isSelected ? p.accent : "#e2e8f0"}`,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: isSelected ? p.light : "#fff",
        transition: "all 0.15s ease",
        opacity: isPending ? 1 : 0.5,
        ...( isPending && {
          "&:hover": {
            borderColor: p.accent,
            backgroundColor: p.light,
          },
          boxShadow: isSelected ? `0 0 0 3px ${p.accent}20` : "none",
        }),
      }}
    >
      {/* Left — Radio (remains same) */}
      <Box
        sx={{
          width: 44,
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backgroundColor: isSelected ? p.light : "#f1f5f9",
          borderRight: `1.5px solid ${isSelected ? p.accent : "#e2e8f0"}`,
          borderLeft: `3px solid ${isSelected ? p.accent : "transparent"}`,
          transition: "background-color 0.15s ease",
        }}
      >
        <Radio
          checked={isSelected}
          onChange={isPending ? onSelect : undefined}
          disabled={!isPending}
          size="small"
          sx={{
            color: "#cbd5e1",
            "&.Mui-checked": { color: p.accent },
            p: 0.5,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>

      {/* Primary value with score tooltip */}
      <Box sx={{ px: 1.5, py: 0.25, minWidth: 140, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, mb: 0 }}>
          {capitalize(primaryKey)}
        </Typography>
        <Tooltip title={tooltipTitle} arrow placement="top">
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: isSelected ? p.text : "#0f172a" }}>
            {primaryVal || "—"}
          </Typography>
        </Tooltip>
      </Box>

      {/* Vertical divider */}
      {secondaryEntries.length > 0 && (
        <Box sx={{ width: "1px", alignSelf: "stretch", backgroundColor: "#e2e8f0", flexShrink: 0 }} />
      )}

      {/* Secondary fields with score tooltip */}
      <Stack
        direction="row"
        alignItems="center"
        divider={<Box sx={{ width: "1px", alignSelf: "stretch", backgroundColor: "#f1f5f9", flexShrink: 0 }} />}
        sx={{ flex: 1, flexWrap: "wrap" }}
      >
        {secondaryEntries.map(([key, val], i) => (
          <Box key={i} sx={{ px: 1.5, py: 0.25, minWidth: 100 }}>
            <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, mb: 0 }}>
              {capitalize(key)}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: isSelected ? p.text : "#334155" }}>
              {val || "—"}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default SuggestionRow;