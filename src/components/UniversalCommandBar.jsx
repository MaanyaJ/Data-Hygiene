import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const UniversalCommandBar = ({
  views,
  selectedView,
  selectedFilter,
  defaultFilters,
  onViewSelect,
  onFilterSelect,
  onSearchChange,
  onViewClear,
  onFilterClear,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const blurTimerRef = useRef(null);

  // ── Focus / blur ──────────────────────────────────────────────────────────
  // Standard "delayed blur" pattern: close only if focus left the entire bar.
  // onMouseDown on dropdown items calls e.preventDefault() which prevents
  // the input from losing focus, making the blur timer unnecessary for clicks.
  // The timer is a safety-net for edge cases (keyboard navigation, etc.).
  const handleFocus = () => {
    clearTimeout(blurTimerRef.current);
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const focusInput = () => {
    clearTimeout(blurTimerRef.current);
    // Synchronous focus keeps the dropdown open without waiting a tick
    inputRef.current?.focus();
  };

  // ── Token Parsing ──────────────────────────────────────────────────────────
  // We locate the last "word" in the input to see if it's a command
  const lastSpaceIdx = inputValue.lastIndexOf(" ");
  const lastWord = lastSpaceIdx === -1 ? inputValue : inputValue.slice(lastSpaceIdx + 1);
  const precedingText = lastSpaceIdx === -1 ? "" : inputValue.slice(0, lastSpaceIdx + 1);

  // ── Dropdown decision ─────────────────────────────────────────────────────
  const activeFilters = selectedView ? selectedView.filters : defaultFilters;

  // View mode triggers only if they type '#'
  const isViewMode = !selectedView && lastWord.startsWith("#");
  const isFilterMode = !selectedFilter && !!activeFilters?.length && lastWord.startsWith("/");

  // ── Filtered dropdown items ───────────────────────────────────────────────
  const viewQuery = isViewMode && lastWord.startsWith("#") ? lastWord.slice(1).toLowerCase() : "";
  const filteredViews = views.filter(
    (v) => !viewQuery || v.label.toLowerCase().includes(viewQuery)
  );

  const filterQuery = isFilterMode ? lastWord.slice(1).toLowerCase() : "";
  const filteredFilters = (activeFilters ?? []).filter(
    (f) => !filterQuery || f.label.toLowerCase().includes(filterQuery)
  );

  // Only show dropdowns if there are actually items matching
  const showViewDropdown = isOpen && isViewMode && filteredViews.length > 0;
  const showFilterDropdown = isOpen && isFilterMode && filteredFilters.length > 0;
  const showDropdown = showViewDropdown || showFilterDropdown;

  // ── Input change ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    const spaceIdx = val.lastIndexOf(" ");
    const currentWord = spaceIdx === -1 ? val : val.slice(spaceIdx + 1);

    // Don't send the active command token to the text search API
    let textToSearch = val;
    if ((!selectedView && currentWord.startsWith("#")) ||
        (!selectedFilter && currentWord.startsWith("/"))) {
      textToSearch = spaceIdx === -1 ? "" : val.slice(0, spaceIdx);
    }
    
    // Normal text search updates based on text minus commands
    onSearchChange(textToSearch.trim());
  };

  // ── Enter key: select top dropdown item ──────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    if (showFilterDropdown) {
      e.preventDefault();
      // Select first matching filter
      if (filteredFilters.length > 0) handleFilterSelect(filteredFilters[0]);
    } else if (showViewDropdown) {
      e.preventDefault();
      // Select first matching view
      if (filteredViews.length > 0) handleViewSelect(filteredViews[0]);
    }
  };

  // ── Selection handlers ────────────────────────────────────────────────────
  const handleViewSelect = (view) => {
    onViewSelect(view);
    
    // Remove the `#...` token, keep the preceding text search
    setInputValue(precedingText);
    onSearchChange(precedingText.trim());
    
    focusInput();
    // Re-open for immediate filters discovery if applicable
    setIsOpen(true);
  };

  const handleFilterSelect = (filter) => {
    onFilterSelect(filter);
    
    // Remove the `/...` token, keep the preceding text search
    setInputValue(precedingText);
    onSearchChange(precedingText.trim());
    
    focusInput();
    setIsOpen(false);
  };

  const handleViewClear = (e) => {
    e.stopPropagation();
    onViewClear();
    onFilterClear();
    setInputValue("");
    onSearchChange("");
    focusInput();
    setIsOpen(true);
  };

  const handleFilterClear = (e) => {
    e.stopPropagation();
    onFilterClear();
    setInputValue("");
    onSearchChange("");
    focusInput();
    setIsOpen(true);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 700, mx: "auto" }}>
      {/* ── Search bar ── */}
      <Paper
        elevation={0}
        onClick={focusInput}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          borderRadius: "14px",
          px: 2,
          py: 1,
          gap: 1,
          minHeight: 56,
          cursor: "text",
          border: "2px solid",
          borderColor: isOpen ? "#1976d2" : "#e0e0e0",
          boxShadow: isOpen
            ? "0 4px 24px 0 rgba(25,118,210,0.14)"
            : "0 2px 8px 0 rgba(0,0,0,0.06)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          bgcolor: "#fff",
        }}
      >
        <SearchIcon
          sx={{
            color: isOpen ? "#1976d2" : "#9e9e9e",
            flexShrink: 0,
            transition: "color 0.2s",
          }}
        />

        {/* View chip */}
        {selectedView && (
          <Chip
            label={selectedView.label}
            onDelete={handleViewClear}
            size="small"
            sx={{
              bgcolor: "#1565c0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              "& .MuiChip-deleteIcon": {
                color: "#90caf9",
                "&:hover": { color: "#fff" },
              },
            }}
          />
        )}

        {/* Filter chip */}
        {selectedFilter && (
          <Chip
            label={selectedFilter.label}
            onDelete={handleFilterClear}
            size="small"
            sx={{
              bgcolor: selectedFilter.chipBg ?? "#f5f5f5",
              color: selectedFilter.chipColor ?? "#333",
              fontWeight: 700,
              fontSize: 13,
              border: `1.5px solid ${selectedFilter.chipColor ?? "#ccc"}`,
              "& .MuiChip-deleteIcon": {
                color: selectedFilter.chipColor ?? "#999",
                "&:hover": { color: "#333" },
              },
            }}
          />
        )}

        {/* "/" hint — shown when view is set but no filter and no text */}
        {selectedView &&
          !selectedFilter &&
          !!selectedView.filters?.length &&
          !inputValue && (
            <Typography
              sx={{
                color: "#bdbdbd",
                fontSize: 12,
                userSelect: "none",
                fontFamily: "monospace",
              }}
            >
              type "/" for filters
            </Typography>
          )}

        {/* Text input */}
        <InputBase
          inputRef={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={
            !selectedView && !selectedFilter
              ? "Search... (Type # for views, / for filters)"
              : !selectedFilter
              ? "Search... (Type / for filters)"
              : "Search..."
          }
          sx={{ flex: 1, minWidth: 100, fontSize: 15, "& input": { p: 0 } }}
        />
      </Paper>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <Paper
          elevation={12}
          sx={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            borderRadius: "14px",
            overflow: "hidden",
            zIndex: 1400,
            maxHeight: 360,
            overflowY: "auto",
            border: "1px solid #e8eaf0",
          }}
        >
          {/* View list */}
          {showViewDropdown && (
            <>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  letterSpacing={1.2}
                  textTransform="uppercase"
                >
                  Select View
                </Typography>
              </Box>
              <List dense disablePadding>
                {filteredViews.map((view) => (
                  <ListItemButton
                    key={view.id}
                    onMouseDown={(e) => {
                      // Prevent input blur so isOpen stays true
                      e.preventDefault();
                      handleViewSelect(view);
                    }}
                    sx={{ px: 2.5, py: 1.5, "&:hover": { bgcolor: "#e3f2fd" } }}
                  >
                    <ListItemText
                      primary={view.label}
                      secondary={
                        view.filters?.length > 0
                          ? `${view.filters.length} filters · type "/" after selecting`
                          : "No filters"
                      }
                      primaryTypographyProps={{ fontWeight: 600, fontSize: 15 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}

          {/* Filter list */}
          {showFilterDropdown && (
            <>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "#fafafa",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  letterSpacing={1.2}
                  textTransform="uppercase"
                >
                  Filters · {selectedView ? selectedView.label : "All"}
                </Typography>
              </Box>
              <List dense disablePadding>
                {filteredFilters.map((filter) => (
                  <ListItemButton
                    key={filter.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleFilterSelect(filter);
                    }}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      "&:hover": { bgcolor: filter.chipBg ?? "#f5f5f5" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: filter.chipColor,
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={filter.label}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: filter.chipColor,
                        fontSize: 15,
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UniversalCommandBar;
