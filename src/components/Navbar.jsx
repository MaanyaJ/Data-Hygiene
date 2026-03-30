import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
    { label: "All", path: "/" },
  { label: "Active List", path: "/" },
  { label: "Completed List", path: "/" },
];

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#17233a" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ cursor: "pointer", letterSpacing: 1 }}
          onClick={() => navigate("/")}
        >
          Logo
        </Typography>

        {/* Dropdown */}
        <Box sx={{ display: "flex", gap: 4 }}>
  {NAV_LINKS.map(({ label, path }) => (
    <NavLink
      key={label}
      to={path}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: "#fff",
        fontWeight: 600,
        fontSize: "0.95rem",
        opacity: isActive ? 1 : 0.7,
        borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
        paddingBottom: "4px",
        transition: "all 0.2s ease",
      })}
    >
      {label}
    </NavLink>
  ))}
</Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;