import React from 'react'
import { Stack, Typography, Chip } from "@mui/material";

const Errors = ({ invalidFields }) => {
    const errors = invalidFields
    // const errors = ["error1", "error2", "error3", "error4", "error5", "error6", "error7", "error8", "error9", "error10",]

    const MAX_VISIBLE = 7;

    const visibleErrors = errors.slice(0, MAX_VISIBLE);
    const remaining = errors.length - MAX_VISIBLE;

    return (
        <>
            <Stack spacing={1} mt={1}>
                <Typography>Invalid Fields:</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {visibleErrors.map((e, i) => (
                        <Chip
                            key={i}
                            label={e}
                            size="small"
                            color="error"
                            variant="outlined"
                        />
                    ))}

                    {remaining > 0 && (
                        <Chip
                            label={`+${remaining} more`}
                            size="small"
                            sx={{ bgcolor: "grey.200" }}
                        />
                    )}
                </Stack>
            </Stack>
        </>
    )
}

export default Errors