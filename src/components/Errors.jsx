import React from 'react'
import { Stack, Typography, Chip } from "@mui/material";

const Errors = ({ invalidFields = []}) => {
    const errors = invalidFields

    const MAX_VISIBLE = 8;

    const visibleErrors = errors.slice(0, MAX_VISIBLE);
    const remaining = errors.length - MAX_VISIBLE;

    return (
        <>
            <Stack spacing={1} mt={1}>
                <Typography>Inconsistent Fields:</Typography>

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
                        <Typography sx={{
                            fontSize: "small"
                        }}>{`+${remaining} more`}</Typography>
                    )}
                </Stack>
            </Stack>
        </>
    )
}

export default Errors