
import React from "react";

import Errors from "./Errors";

import { useNavigate } from "react-router-dom";

import { Card, CardContent, Typography, Divider, Stack } from "@mui/material";

 

const STATUS_STYLES = {

  pending:  { color: "#e65100", bg: "#fff8e1", border: "#ffa000", dot: "#ffd54f" },

  approved: { color: "#2e7d32", bg: "#e8f5e9", border: "#43a047", dot: "#66bb6a" },

  accepted: { color: "#2e7d32", bg: "#e8f5e9", border: "#43a047", dot: "#66bb6a" },

  rejected: { color: "#b71c1c", bg: "#ffebee", border: "#e53935", dot: "#ef9a9a" },

  "on hold":{ color: "#5b21b6", bg: "#ede9fe", border: "#7c3aed", dot: "#a78bfa" },

};

 

const RecordCard = ({ record, ageColor }) => {

  const invalidFields = record["InvalidFields"];

  const navigate = useNavigate();

 

  const status = record.Status?.toLowerCase();

  const statusStyle = STATUS_STYLES[status];

  const statusColor = statusStyle?.color ?? "text.primary";

  const isCompleted = status === "accepted" || status === "approved";

 

  const cardBg    = ageColor ? ageColor.bg     : statusStyle?.bg     ?? "#f9f9f9";

  const cardBorder= ageColor ? ageColor.border  : statusStyle?.border ?? "transparent";

 

  const handleClick = () => navigate(`/alt/${record.ExecutionId}`);

 

  return (

    <Stack justifyContent="center" alignItems="center">

      <Card

        onClick={handleClick}

        sx={{

          width: "65vw",

          backgroundColor: cardBg,

          borderLeft: `5px solid ${cardBorder}`,

          boxShadow: `0px 2px 8px ${cardBorder}33`,

          transition: "all 0.25s ease",

          "&:hover": {

            transform: "scale(1.02)",

            boxShadow: `0px 6px 20px ${cardBorder}55`,

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

 

          {!isCompleted && (

            <>

              <Divider sx={{ my: 1 }} />

              <Errors invalidFields={invalidFields} />

            </>

          )}

        </CardContent>

      </Card>

    </Stack>

  );

};

 

export default RecordCard;

