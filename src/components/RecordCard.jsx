import React, { useState } from "react";
import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Divider,
    Stack,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";

const RecordCard = ({ record }) => {

    const invalidFields = record["Invalid Records"]

    const [option, setOption] = useState(invalidFields[0] || null);
    const [showMD, setShowMD] = useState(false);

    const handleChange = (e, val) => {
        setOption(val);
    };

    return (
        <Stack justifyContent="center" alignItems="center">
            <Card sx={{ width: "60vw", backgroundColor: "#f9f9f9" }}>
                <CardContent>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography fontWeight={600}>
                                ExecutionID
                            </Typography>
                            <Typography variant="body2">
                                {record.ExecutionId}
                            </Typography>
                        </Box>

                        <Autocomplete
                            options={invalidFields}
                            value={option}
                            onChange={handleChange}
                            getOptionLabel={(option) => option?.field || ""}
                            renderInput={(params) => (
                                <TextField {...params} label="Invalid Field" />
                            )}
                            sx={{ width: 200 }}
                        />
                    </Stack>

                    {option && (
                        <>
                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" spacing={4}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography fontWeight={600}>
                                        Existing Value:
                                    </Typography>
                                    <Typography variant="body2" color="red">
                                        {option.value}
                                    </Typography>
                                </Stack>

                                <Button onClick={() => setShowMD(true)}>
                                    Metadata
                                </Button>
                            </Stack>
                        </>
                    )}

                    <Dialog
                        open={showMD}
                        onClose={() => setShowMD(false)}
                        disableRestoreFocus
                    >
                        <DialogTitle>Metadata</DialogTitle>

                        <DialogContent dividers>
                            {option?.metadata?.map((item, i) => (
                                <Stack
                                    direction="row"
                                    gap={1}
                                    alignItems="center"
                                    key={i}
                                >
                                    <Typography fontWeight={600}>
                                        {item.name}:
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setShowMD(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                </CardContent>
            </Card>
        </Stack>
    );
};

export default RecordCard;