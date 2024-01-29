import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface Props {
  title: string;
  requisito_id?: number;
  competencia_id?: number;
}

export const CountStatistics: React.FC<Props> = ({ title }) => {
  return (
    <Grid xs={12} md={3}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 200,
        }}
      >
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
};
