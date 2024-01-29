import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

import { CountStatistics } from "../components/CountStatistics";

import { Statistic } from "../../../types";

export const Home: React.FC = () => {
  const statisticsList: Statistic[] = [
    {
      title: "Grupo de Conexión",
    },
    {
      title: "Primeros Pasos",
    },
    {
      title: "Bautizos",
    },
    {
      title: "Encuentro",
    },
    {
      title: "Pos Encuentro",
    },
    {
      title: "Doctrinas 1",
    },
    {
      title: "Doctrinas 2",
    },
    {
      title: "Entrenamiento Liderazgo",
    },
  ];
  return (
    <Grid container spacing={3}>
      {statisticsList.map((statistic: Statistic) => (
        <CountStatistics {...statistic} />
      ))}
    </Grid>
  );
};
