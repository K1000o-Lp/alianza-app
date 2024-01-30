import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

import { CountStatistics } from "../components/CountStatistics";

import { Statistic } from "../../../types";

export const Home: React.FC = () => {
  const statisticsList: Statistic[] = [
    {
      key: "grupo-conexion",
      title: "Grupo de Conexión",
      requisito_id: 1,
      competencia_id: 3,
    },
    {
      key: "primeros-pasos",
      title: "Primeros Pasos",
      requisito_id: 2,
      competencia_id: 3,
    },
    {
      key: "bautizos",
      title: "Bautizos",
      requisito_id: 3,
      competencia_id: 3,
    },
    {
      key: "encuentro",
      title: "Encuentro",
      requisito_id: 4,
      competencia_id: 3,
    },
    {
      key: "pos-encuentro",
      title: "Pos Encuentro",
      requisito_id: 5,
      competencia_id: 3,
    },
    {
      key: "doctrinas-1",
      title: "Doctrinas 1",
      requisito_id: 6,
      competencia_id: 3,
    },
    {
      key: "doctrinas-2",
      title: "Doctrinas 2",
      requisito_id: 7,
      competencia_id: 3,
    },
    {
      key: "entrenamiento-liderazgo",
      title: "Entrenamiento Liderazgo",
      requisito_id: 8,
      competencia_id: 3,
    },
    {
      key: "liderazgo",
      title: "Liderazgo",
      requisito_id: 9,
      competencia_id: 3,
    },
    {
      key: "encuentro-oracion",
      title: "Encuentro de Oración",
      requisito_id: 10,
      competencia_id: 3,
    },
  ];

  return (
    <Grid container spacing={3}>
      {statisticsList.map(({ key, ...statistic }: Statistic) => (
        <Grid key={key} xs={12} md={3}>
          <CountStatistics {...statistic} />
        </Grid>
      ))}
    </Grid>
  );
};
