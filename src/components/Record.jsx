import React, { useState } from "react";
import { execMD, invalidFields } from "../../dummyData";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Box, Card, CardContent, Typography, TextField, Button, Divider, Stack, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const Record = () => {
    const [option, setOption] = useState(invalidFields[0])
    const [showMD, setShowMD] = useState(false)

    const handleChange = (e, val) => {
        setOption(val)
    }

    return (
        <Stack justifyContent="center" alignItems="center">
            <Card sx={{ width: "60vw" }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography fontWeight={600}>
                                {execMD[0].name}
                            </Typography>
                            <Typography variant="body2">
                                {execMD[0].value}
                            </Typography>
                        </Box>

                        <Autocomplete
                            options={invalidFields}
                            value={option}
                            onChange={handleChange}
                            getOptionLabel={(option) => option?.name || ""}
                            renderInput={(params) => (
                                <TextField {...params} label="Invalid Field" />
                            )}
                            sx={{ width: 200 }}
                        />
                    </Stack>

                    {option && <>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={600}>Existing Value:</Typography>
                                <Typography variant="body2" color="red">
                                    {option?.previousValue}
                                </Typography>
                            </Stack>

                            <Button onClick={() => setShowMD(true)}>Metadata</Button>
                        </Stack>
                    </>}

                    <Dialog
                        open={showMD}
                        onClose={() => setShowMD(false)}
                        maxWidth="md"
                        disableRestoreFocus
                    >
                        <DialogTitle>Metadata</DialogTitle>

                        <DialogContent dividers>
                           {invalidFields.map((e)=>{
                            <Box>
                                <Typography fontWeight={600}>{e.name}</Typography>
                                <Typography variant="body2" color="red">
                                    {e.previousValue}
                                </Typography>
                            </Box>
                           })}
                                
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setShowMD(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>

                </CardContent>
            </Card>
        </Stack>
    );
}

export default Record;