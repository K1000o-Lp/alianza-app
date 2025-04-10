import { Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, FormControl, InputLabel, NativeSelect, Paper, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbarContainer, useGridApiRef } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from "react";
import { useGetMembersWithLastResultQuery, useGetSupervisorsQuery, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";
import { filterMembers, ScrollPosition } from "../../../types";
import { config } from "../../../config";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import queryString from "query-string";
import dayjs from "dayjs";

export const Miembros: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [ openDialog, setOpenDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ filtersState, setFiltersState ] = React.useState<filterMembers>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 0,
    supervisor: undefined,
	});
  
  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();
  
  const { data: supervisors, isLoading: supervisorsLoading, isError: supervisorsError } = useGetSupervisorsQuery({ zona_id: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const { data, isLoading } = useGetMembersWithLastResultQuery({ zona: filtersState?.zona, supervisor: filtersState.supervisor }, { refetchOnMountOrArgChange: true });

  const [ updateMember ] = usePutMembersMutation();

  const router = useRouter();

  const apiRef = useGridApiRef();

  const editMember = (id:  GridRowId) => {
    if(!id) return;

    const scrollPosition = apiRef.current.getScrollPosition();
    sessionStorage.setItem('scrollPosition', JSON.stringify(scrollPosition));

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
      width: 50 
    },
    { 
      field: "cedula", 
      headerName: "CEDULA", 
      valueGetter: (value) => {
        return value || 'SIN CEDULA';
      },
      width: 120 
    },
    { 
      field: "nombre_completo", 
      headerName: "NOMBRE COMPLETO", 
      width: 300 
    },
    {
      field: "telefono",
      headerName: "TELEFONO",
      valueGetter: (value) => {
        return value || 'SIN TELEFONO';
      },
      width: 120,
    },
    { 
      field: "fecha_nacimiento",
      headerName: "F. NACIMIENTO",
      valueGetter: (value) => {
        return value || 'SIN FECHA';
      },
      width: 120
    },
    { 
      field: "edad",
      headerName: "EDAD",
      valueGetter: (value) => {
        return value || 'N/S';
      },
      width: 70
    },
    { 
      field: "hijos", 
      headerName: "HIJOS", 
      width: 75 
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
      field: "historiales", 
      valueGetter: (value: any) => {
        const historial = value[0] ?? null;
        return historial?.supervisor?.nombre_completo || 'SIN SUPERVISOR';
      },
      headerName: "SUPERVISOR", 
      width: 300, 
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

  React.useEffect(() => {
    const scrollStorage = sessionStorage.getItem('scrollPosition');
    const scrollObject = JSON.parse(scrollStorage || '{}') as ScrollPosition;
    sessionStorage.removeItem('scrollPosition');
    
    if(!scrollStorage) {
      return;
    }

    setTimeout(() => {
      apiRef.current.scroll(scrollObject);
    }, 0);
  }, [apiRef]);

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button color="primary" variant="text" startIcon={<FileDownloadIcon />} onClick={handleClickExportToExcel}>
          Exportar a Excel
        </Button>
      </GridToolbarContainer>
    );
  }

  const handleClickExportToExcel = () => {
    const api = config().BACKEND_URL;

    fetch(`${api}persona/miembros/reportes?${queryString.stringify(filtersState)}`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_miembros_${dayjs().format('DD/MM/YYYY HH:mm:ss')}.xlsx`;
      a.click();
    })
    .catch(error => console.error(error));
  }

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

      <Box sx={{ display: 'flex', width: "100%", mb: 2 }}>
      { user?.zona === null && (
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
              <option key={`zones-all`} value={0}>
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
      )}

        <FormControl sx={{ width: 300, ml: 2 }}>
          <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
          <NativeSelect
            onChange={handleFilterChange}
            value={filtersState?.supervisor ?? 0}
            inputProps={{ id: "supervisor_native", name: "supervisor" }}
          >
            {supervisorsLoading && (
              <option key="0" value="">
                Cargando...
              </option>
            )}

            {!supervisorsError && (
              <option key={`supervisor-none`} value={0}>
                {"NINGUNO"}
              </option>
            )}

            {!supervisorsError &&
              supervisors?.map((supervisor: any) => (
                <option key={`zones-${supervisor?.miembro_id}`} value={supervisor?.miembro_id}>
                  {supervisor.nombre_completo}
                </option>
              ))}
          </NativeSelect>
        </FormControl>
      </Box>

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
              apiRef={apiRef}
              rows={data ?? []}
              columns={columns}
              loading={isLoading}
              getRowId={(row) => row?.id || null}
              slots={{
                toolbar: CustomToolbar,
                noRowsOverlay: () => <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}><Typography>No hay datos</Typography></Box> 
              }}
              initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
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
