import { Box, Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as React from "react";
import { useGetMembersQuery } from "../../../redux/services";

const columns: GridColDef[] = [
  { field: "miembro_id", headerName: "ID", width: 90 },
  { field: "cedula", headerName: "CÉDULA", width: 150 },
  { field: "nombre_completo", headerName: "NOMBRE COMPLETO", width: 350 },
  {
    field: "telefono",
    headerName: "TELÉFONO",
    width: 150,
  },
  { field: "fecha_nacimiento", headerName: "FECHA DE NACIMIENTO", width: 180 },
  { field: "hijos", headerName: "HIJOS", width: 90 },
];

export const Miembros: React.FC = () => {
  const { data, isLoading } = useGetMembersQuery();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", width: "100%", mb: 2 }}>
        <Typography
          component="h1"
          variant="h6"
          color="primary"
          sx={{ flexGrow: 1 }}
        >
          Miembros
        </Typography>
      </Box>

      <Paper
        sx={{
          display: "flex",
          height: 400,
          flexDirection: "column",
        }}
      >
        <DataGrid
          rows={data ?? []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.miembro_id}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};
