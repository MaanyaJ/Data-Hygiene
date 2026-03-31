import React from "react";
import Errors from "./Errors";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
} from "@mui/material";

const STATUS_COLOR = {
  pending:  "#ed6c02",
  approved: "#2e7d32",
  rejected: "#d32f2f",
};

const RecordCard = ({ record, ageColor }) => {
  const invalidFields = record["InvalidFields"];
  const navigate = useNavigate();

  const status = record.Status?.toLowerCase();
  const statusColor = STATUS_COLOR[status] ?? "text.primary";

  return (
    <Stack justifyContent="center" alignItems="center">
      <Card
        onClick={() => navigate(`/${record.ExecutionId}`)}
        sx={{
          width: "60vw",
          backgroundColor: ageColor ? ageColor.bg : "#f9f9f9",
          borderLeft: ageColor ? `5px solid ${ageColor.border}` : "5px solid transparent",
          boxShadow: ageColor
            ? `0px 2px 8px ${ageColor.border}33`
            : "0px 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: ageColor
              ? `0px 6px 20px ${ageColor.border}55`
              : "0px 6px 20px rgba(0,0,0,0.12)",
            cursor: "pointer",
          },
        }}
      >
        <CardContent>
          <Stack direction="row" gap={8} alignItems="flex-start">
            <Stack>
              <Typography fontWeight={600}>ExecutionID:</Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {record.ExecutionId}
              </Typography>
            </Stack>

            <Stack>
              <Typography fontWeight={600}>Benchmark Category:</Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {record.BenchmarkCategory}
              </Typography>
            </Stack>

            <Stack>
              <Typography fontWeight={600}>Benchmark Type:</Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {record.BenchmarkType}
              </Typography>
            </Stack>

            <Stack>
              <Typography fontWeight={600}>Status:</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: statusColor }}>
                {record.Status}
              </Typography>
            </Stack>
          </Stack>

          {/* {status !== "approved" && <Divider sx={{ my: 1 }} />}
          {status !== "approved" && <Errors invalidFields={invalidFields} /> } */}

          <Divider sx={{ my: 1 }} />
          <Errors invalidFields={invalidFields} /> 
        </CardContent>
      </Card>
    </Stack>
  );
};

export default RecordCard;