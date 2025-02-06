import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useGetCountStatisticsQuery } from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";
import { Link } from "react-router-dom";
import queryString from "query-string";
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

interface Props {
  title: string;
  requisito_id?: number;
  resultado?: boolean;
}

dayjs.extend(quarterOfYear);

const getEndOfQuarter = () => {
  const currentQuarter = dayjs().quarter();
  const endOfQuarter = dayjs().quarter(currentQuarter).endOf('quarter');

  return endOfQuarter;
}

export const CountStatistics: React.FC<Props> = ({
  title,
  requisito_id,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const zona = user?.zona?.id;

  const zonaAnalizada = () => {
    if(!zona) return 0;

    return zona;
  }

  const { data } = useGetCountStatisticsQuery(
    { requisito: requisito_id, zona },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <Link 
      style={{ textDecoration: 'none' }} 
      to={`/reportes/consolidaciones?${queryString.stringify({ 
        zona: zonaAnalizada(), 
        requisito: requisito_id, 
        desde: dayjs("2024-01-01"),
        hasta: getEndOfQuarter(),
      })}`}
    >
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
          {data?.cantidad ?? 0}
        </Typography>
        <Typography color="text.secondary" sx={{ flex: 1 }}>
          {`de ${data?.total_miembros ?? 0} miembros`}
        </Typography>
      </Paper>
    </Link>
  );
};
