import React from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
 
 
const DetailsPageHeader = ({ navigate, executionId, invalidCount, resultType }) => {
  return (
    <>
      <Box
        sx={{
         
          py: 2,
          borderBottom: "1px solid #e5eaf2",
         
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            fontSize: 16,
            fontWeight: 600,
            color: "#1f5fbf",
            p: 0,
            minWidth: "auto",
          }}
        >
          Back
        </Button>
      </Box>
 
      <Box
        sx={{
          px: 4,
          pt: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#17233a",
            wordBreak: "break-word",
          }}
        >
          Execution ID: {executionId}
        </Typography>
 
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
        </Box>
      </Box>
    </>
  );
};
 
export default DetailsPageHeader;