import { Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, FormControl, InputLabel, NativeSelect, Paper, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from "react";
import { useGetMembersWithLastResultQuery, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";
import { filterMembers } from "../../../types";
import { config } from "../../../config";



export const Miembros: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const  [openDialog, setOpenDialog] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ filtersState, setFiltersState ] = React.useState<filterMembers>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 1000,
	});
  
  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const { data, isLoading } = useGetMembersWithLastResultQuery({ zona: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const [ updateMember ] = usePutMembersMutation();

  const router = useRouter();

  const editMember = (id:  GridRowId) => {
    if(!id) return;

    router.push(`${id}/editar`);
  }

  const deleteMember = (id: number) => {
    if(!id) return;

    updateMember({ id, historial: { zona_id: config().ZONA_0 } });
  } 

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement> | any) => {
		const { name, value } = event.target;

		setFiltersState((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}

  const handleCloseDialog = () => {
    setOpenDialog({open: false, id: undefined});
  } 

  const handleOpenDialog = (id: number) => {
    setOpenDialog({open: true, id});
  }

  const handleDeleteMember = () => {
    deleteMember(openDialog.id as number);
    handleCloseDialog();
  }

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 90 
    },
    { 
      field: "cedula", 
      headerName: "CEDULA", 
      valueGetter: (value) => {
        return value || 'SIN CEDULA';
      },
      width: 150 
    },
    { 
      field: "nombre_completo", 
      headerName: "NOMBRE COMPLETO", 
      width: 350 
    },
    {
      field: "telefono",
      headerName: "TELEFONO",
      valueGetter: (value) => {
        return value || 'SIN TELEFONO';
      },
      width: 150,
    },
    { 
      field: "fecha_nacimiento",
      headerName: "FECHA DE NACIMIENTO",
      valueGetter: (value) => {
        return value || 'SIN FECHA';
      },
      width: 180
    },
    { 
      field: "hijos", 
      headerName: "HIJOS", 
      width: 90 
    },
    { 
      field: "ultimo_requisito", 
      valueGetter: (value) => {
        return value || 'SIN PROGRESO';
      },
      headerName: "REQUISITO ALCANZADO", 
      width: 200, 
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editMember(params?.id)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleOpenDialog(params?.id as number)} />,
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

      { user?.zona === null && (
        <Box sx={{ display: 'flex', width: "100%", mb: 2 }}>
          <FormControl sx={{ width: 200 }}>
            <InputLabel htmlFor="zona_native">Zona</InputLabel>
            <NativeSelect
              onChange={handleFilterChange}
              disabled={user?.zona !== null}
              value={filtersState?.zona}
              inputProps={{ id: "zona_native", name: "zona" }}
            >
              {zonesLoading && (
                <option key="0" value="">
                  Cargando...
                </option>
              )}

              {!zonesError && (
                <option key={`zones-all`} value={1000}>
                  {"TODAS"}
                </option>
              )}

              {!zonesError &&
                zones?.map(({ id, descripcion }) => (
                  <option key={`zones-${id}`} value={id}>
                    {descripcion}
                  </option>
                ))}
            </NativeSelect>
          </FormControl>
        </Box>
      ) }

      <Paper
        sx={{
          display: "flex",
          height: "calc(100vh - 240px)",
          flexDirection: "column",
        }}
      >
        {
          isLoading 
          ? (
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <CircularProgress />
            </Box>
          )
          : Array.isArray(data) && data.length > 0 
          ? (
            <DataGrid
              rows={data ?? []}
              columns={columns}
              loading={isLoading}
              getRowId={(row) => row?.id || null}
              slots={{
                noRowsOverlay: () => <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}><Typography>No hay datos</Typography></Box> 
              }}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
              disableRowSelectionOnClick
            />
          )
          : (
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
              <Typography>No hay datos</Typography>
            </Box>
          )
        }
      </Paper>

      <Dialog
        open={openDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Estas seguro de eliminar este miembro?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={handleDeleteMember} autoFocus>
            Si
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
