import { Box, Paper, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as React from "react";
import { useGetMembersQuery } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";



export const Miembros: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetMembersQuery({ zona: user?.zona?.id }, { refetchOnMountOrArgChange: true });

  const router = useRouter();

  const editMember = (id:  GridRowId) => {
    router.push(`${id}/editar`);
  }

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 90 
    },
    { 
      field: "cedula", 
      headerName: "CÉDULA", 
      width: 150 
    },
    { 
      field: "nombre_completo", 
      headerName: "NOMBRE COMPLETO", 
      width: 350 
    },
    {
      field: "telefono",
      headerName: "TELÉFONO",
      width: 150,
    },
    { 
      field: "fecha_nacimiento",
      headerName: "FECHA DE NACIMIENTO",
      width: 180
    },
    { 
      field: "hijos", 
      headerName: "HIJOS", 
      width: 90 
    },
    { 
      field: "ultimo_requisito", 
      valueGetter: ({value}) => {
        if(!value) {
          return 'SIN PROGRESO';
        }

        return value;
      },
      headerName: "REQUISITO ALCANZADO", 
      width: 200, 
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editMember(params.id)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" />,
      ],
  
    },
  ];

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
          height: 500,
          flexDirection: "column",
        }}
      >
        <DataGrid
          rows={data ?? []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 20, 50, 100]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};
