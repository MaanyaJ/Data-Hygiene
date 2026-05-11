import React from "react";
import { Box, Skeleton, Stack, Paper } from "@mui/material";

const DetailsSkeleton = () => {
  return (
    <Box sx={{ p: 3, pt: 1 }}>
      {/* Top Info Box Placeholder */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          {[1, 2, 3].map((col) => (
            <Box key={col} sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="80%" height={30} />
              <Skeleton variant="text" width="60%" height={30} />
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Table Placeholder */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={40} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={60} />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default DetailsSkeleton;
