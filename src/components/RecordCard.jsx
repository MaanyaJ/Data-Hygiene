import React, { useState } from "react";
import { grey } from "@mui/material/colors";
import Errors from "./Errors";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Chip,
    CardContent,
    Typography,
    Divider,
    Stack,
} from "@mui/material";

const RecordCard = ({ record }) => {

    const invalidFields = record["InvalidFields"]
    const navigate = useNavigate()

    return (
        <Stack justifyContent="center" alignItems="center">
            <Card 
            onClick={() => navigate(`/record/${record.ExecutionId}`)}
            sx={{
                width: "50vw",
                backgroundColor: "#f9f9f9",

                boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",

                transition: "all 0.25s ease",

                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0px 6px 20px rgba(0,0,0,0.12)",
                    cursor: "pointer"
                },
            }}>
                <CardContent>

                    <Stack direction="row" alignItems="center" gap={1} >
                        <Typography fontWeight={600}>
                            ExecutionID:
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                            {record.ExecutionId}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Errors invalidFields={invalidFields} />

                </CardContent>
            </Card>
        </Stack>
    );
};

export default RecordCard;