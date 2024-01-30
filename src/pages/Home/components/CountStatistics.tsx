import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useGetCountStatisticsQuery } from "../../../redux/services";

interface Props {
  key: string;
  title: string;
  requisito_id?: number;
  competencia_id?: number;
}

export const CountStatistics: React.FC<Props> = ({
  key,
  title,
  requisito_id,
  competencia_id,
}) => {
  const { data } = useGetCountStatisticsQuery(
    { requisito_id, competencia_id },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <Grid key={key} xs={12} md={3}>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: 150,
        }}
      >
        <Typography component="h1" variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
        <Typography component="p" variant="h4">
          {data?.cantidad}
        </Typography>
        <Typography color="text.secondary" sx={{ flex: 1 }}>
          {`de ${data?.total_miembros} miembros`}
        </Typography>
      </Paper>
    </Grid>
  );
};
