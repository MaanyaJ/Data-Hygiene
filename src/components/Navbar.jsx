import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { label: "All", path: "/" },
  { label: "Active List", path: "/active" },
  { label: "Completed List", path: "/completed" },
  { label: "On Hold", path: "/on-hold" },
];

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ backgroundColor: "#000000", borderBottom: "1px solid #222" }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: "48px !important", px: 3 }}>
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
          AMD
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 6,
              height: 6,
              backgroundColor: "#fff",
              borderRadius: "50%",
              mb: "2px",
              mx: "1px",
              verticalAlign: "bottom",
            }}
          />
        </Typography>

        {/* Nav Links */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {NAV_LINKS.map(({ label, path }) => (
            <NavLink
              key={label}
              to={path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.8rem",
                opacity: isActive ? 1 : 0.65,
                borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
                paddingBottom: "2px",
                transition: "all 0.15s ease",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: 0.3,
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