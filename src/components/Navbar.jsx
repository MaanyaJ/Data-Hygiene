import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import UploadJSON from "./UploadJSON";

const NAV_LINKS = [
  { label: "All", path: "/" },
  { label: "Active List", path: "/active" },
  { label: "Completed List", path: "/completed" },
  { label: "On Hold", path: "/on-hold" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const activeLink = NAV_LINKS.find((l) => l.path === location.pathname);
  // Exclude the currently selected route from the dropdown
  const dropdownLinks = NAV_LINKS.filter((l) => l.path !== location.pathname);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ backgroundColor: "#000000", borderBottom: "1px solid #222" }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "55px !important", px: 3 }}>
        {/* Left: Logo + Dropdown trigger box */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* AMD Wordmark */}
          <Typography
            variant="h6"
            fontWeight={800}
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              letterSpacing: -0.5,
              fontSize: "1.1rem",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              "&:hover": { color: "#ccc" },
            }}
          >
            AMD_DH
          </Typography>

          {/* Thin vertical divider */}
          <Box sx={{ width: "1px", height: 18, backgroundColor: "#444" }} />

          {/* Dropdown trigger — full-height dark box, label left, arrow right */}
          <Box
            onClick={handleOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minWidth: 180,
              px: 2,
              height: "55px",
              cursor: "pointer",
              backgroundColor: "#000000ff",
              transition: "background-color 0.15s ease",
              "&:hover": { color: "#1d1c1cff" },
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontSize: "0.78rem",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              {activeLink ? activeLink.label : "Lists"}
            </Typography>

            <KeyboardArrowDownIcon
              sx={{
                fontSize: 16,
                color: "#fff",
                
                transition: "transform 0.2s ease",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Box>

          {/* Dropdown panel — seamless extension of the trigger box */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disableScrollLock
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 0,
                width: anchorEl?.offsetWidth ?? 180,
                borderRadius: 0,
                backgroundColor: "#111",
                border: "none",
                borderTop: "1px solid #2a2a2a",
                "& .MuiList-root": { py: 0 },
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                transformOrigin: "top left",
                animation: "rollDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                "@keyframes rollDown": {
                  from: { transform: "scaleY(0)", opacity: 0 },
                  to: { transform: "scaleY(1)", opacity: 1 },
                },
              },
            }}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          >
            {dropdownLinks.map(({ label, path }, idx) => (
              <MenuItem
                key={path}
                onClick={() => handleNavigate(path)}
                sx={{
                  fontSize: "0.78rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  backgroundColor: "transparent",
                  px: 2,
                  py: 1.25,
                  borderBottom: idx < dropdownLinks.length - 1 ? "1px solid #1e1e1e" : "none",
                  transition: "all 0.12s ease",
                  "&:hover": {
                    backgroundColor: "#1c1c1c",
                    color: "#fff",
                  },
                }}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Right: Upload */}
        <UploadJSON />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;