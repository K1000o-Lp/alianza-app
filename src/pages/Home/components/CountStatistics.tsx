import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useGetCountStatisticsQuery } from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";

interface Props {
  title: string;
  requisito_id?: number;
  resultado?: boolean;
}

export const CountStatistics: React.FC<Props> = ({
  title,
  requisito_id,
  resultado,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { data } = useGetCountStatisticsQuery(
    { requisito: requisito_id, resultado, zona: user?.zona?.id },
    { refetchOnMountOrArgChange: true }
  );

  return (
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
  );
};
