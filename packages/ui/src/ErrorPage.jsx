import React from "react";
import { Box, Typography, Button } from "@mui/material";

const ErrorPage = ({ message }) => {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" sx={{ color: "error.main", fontWeight: 600 }}>
        Oops! Something went wrong
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      
    </Box>
  );
};

export default ErrorPage;
