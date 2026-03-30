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
          BrandName
        </Typography>

        {/* Dropdown */}
        <Box>
          <Button
            color="inherit"
            onClick={handleOpen}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
          >
            Navigate
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {NAV_LINKS.map(({ label, path }) => (
              <MenuItem key={path} onClick={() => handleNavigate(path)}>
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;