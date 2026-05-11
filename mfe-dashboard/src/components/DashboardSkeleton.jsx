import React from "react";
import { Box, Skeleton, Stack, Paper } from "@mui/material";

const DashboardSkeleton = () => {
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width="40%" sx={{ fontSize: '1.2rem' }} />
            <Skeleton variant="text" width="20%" sx={{ fontSize: '0.8rem' }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Skeleton variant="rounded" width={100} height={32} />
            </Box>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default DashboardSkeleton;
