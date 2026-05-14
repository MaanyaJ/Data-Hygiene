import React, { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

/**
 * useSnackbar Hook
 * Provides a function to show notifications and a component to render them.
 * 
 * Usage:
 * const { showSnackbar, SnackbarComponent } = useSnackbar();
 * ...
 * showSnackbar("Operation successful", "success");
 * ...
 * return (
 *   <>
 *     {SnackbarComponent}
 *   </>
 * );
 */
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const SnackbarComponent = (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert 
        onClose={handleClose} 
        severity={snackbar.severity} 
        variant="filled" 
        sx={{ 
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: "8px",
          fontWeight: 500
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  return { showSnackbar, SnackbarComponent };
};

export default useSnackbar;
