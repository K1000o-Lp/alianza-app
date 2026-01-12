import * as React from "react";

import { CountStatistics } from "../components/CountStatistics";

import { Statistic } from "../../../types";
import { Grid2 as Grid } from "@mui/material";

export const Home: React.FC = () => {
  const statisticsList: Statistic[] = [
    {
      key: "grupo-conexion",
      title: "Grupo de Conexión",
      requisito_id: 1,
    },
    {
      key: "primeros-pasos",
      title: "Primeros Pasos",
      requisito_id: 2,
    },
    {
      key: "bautizos",
      title: "Bautizos",
      requisito_id: 3,
    },
    {
      key: "encuentro",
      title: "Encuentro",
      requisito_id: 4,
    },
    {
      key: "pos-encuentro",
      title: "Pos Encuentro",
      requisito_id: 5,
    },
    {
      key: "doctrinas-1",
      title: "Doctrinas 1",
      requisito_id: 6,
    },
    {
      key: "doctrinas-2",
      title: "Doctrinas 2",
      requisito_id: 7,
    },
    {
      key: "entrenamiento-liderazgo",
      title: "Entrenamiento Liderazgo",
      requisito_id: 8,
    },
    {
      key: "liderazgo",
      title: "Liderazgo",
      requisito_id: 9,
    },
    {
      key: "encuentro-oracion",
      title: "Encuentro de Oración",
      requisito_id: 10,
    },
  ];

  return (
    <Grid container spacing={3}>
      {statisticsList.map(({ key, ...statistic }: Statistic) => (
        <Grid key={key} size={{ xs: 12, md: 3 }}>
          <CountStatistics {...statistic} />
        </Grid>
      ))}
    </Grid>
  );
};
