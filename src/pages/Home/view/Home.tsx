import * as React from "react";
import Grid from "@mui/material/Grid";

import { CountStatistics } from "../components/CountStatistics";

import { Statistic } from "../../../types";

export const Home: React.FC = () => {
  const statisticsList: Statistic[] = [
    {
      key: "grupo-conexion",
      title: "Grupo de Conexión",
      requisito_id: 1,
      resultado: true,
    },
    {
      key: "primeros-pasos",
      title: "Primeros Pasos",
      requisito_id: 2,
      resultado: true,
    },
    {
      key: "bautizos",
      title: "Bautizos",
      requisito_id: 3,
      resultado: true,
    },
    {
      key: "encuentro",
      title: "Encuentro",
      requisito_id: 4,
      resultado: true,
    },
    {
      key: "pos-encuentro",
      title: "Pos Encuentro",
      requisito_id: 5,
      resultado: true,
    },
    {
      key: "doctrinas-1",
      title: "Doctrinas 1",
      requisito_id: 6,
      resultado: true,
    },
    {
      key: "doctrinas-2",
      title: "Doctrinas 2",
      requisito_id: 7,
      resultado: true,
    },
    {
      key: "entrenamiento-liderazgo",
      title: "Entrenamiento Liderazgo",
      requisito_id: 8,
      resultado: true,
    },
    {
      key: "liderazgo",
      title: "Liderazgo",
      requisito_id: 9,
      resultado: true,
    },
    {
      key: "encuentro-oracion",
      title: "Encuentro de Oración",
      requisito_id: 10,
      resultado: true,
    },
  ];

  return (
    <Grid container spacing={3}>
      {statisticsList.map(({ key, ...statistic }: Statistic) => (
        <Grid item key={key} xs={12} md={3}>
          <CountStatistics {...statistic} />
        </Grid>
      ))}
    </Grid>
  );
};
