import { Alert, Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import * as React from "react";
import {  useDeleteSupervisorsMutation, useGetMembersWithLastResultQuery, useGetSupervisorsQuery, useGetZonesQuery, usePostSupervisorsMutation } from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";
import { filterMembers, ResponseMember, snackBarStatus, SupervisorForm } from "../../../types";

import AddIcon from "@mui/icons-material/Add";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

export const Supervisores: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [ selectedMembers, setSelectedMembers ] = React.useState<ResponseMember[]>([]);
  const [ snackBarStatus, setSnackBarStatus ] = React.useState<snackBarStatus>({ is_open: false, message: "", severity: "success" });
  const [ openSupervisorDialog, setOpenSupervisorDialog ] = React.useState<boolean>(false);
  const [ deleteDialog, setDeleteDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ filtersState, setFiltersState ] = React.useState<filterMembers>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 0,
	});
  
  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const  {
    data: supervisors,
    isLoading: supervisorsLoading,
  } = useGetSupervisorsQuery({ zona_id: filtersState.zona }, { refetchOnMountOrArgChange: true });

  const { data: members } = useGetMembersWithLastResultQuery({ zona: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const [ postSupervisor, postSupervisorResult ] = usePostSupervisorsMutation();
  const errorMessageInPostSupervisor = postSupervisorResult.error && "data" in postSupervisorResult.error ? (postSupervisorResult.error.data as { message: string }).message : "Error desconocido";


  const [ deleteSupervisor, deleteSupervisorResult ] = useDeleteSupervisorsMutation();
  const errorMessageInDeleteSupervisor = deleteSupervisorResult.error && "data" in deleteSupervisorResult.error ? (deleteSupervisorResult.error.data as { message: string }).message : "Error desconocido";

  const { control: supervisorControl, handleSubmit: supervisorHandleSubmit, setValue: supervisorSetValue, reset: resetSupervisorForm } = useForm<SupervisorForm>({ defaultValues: { zona_id: filtersState.zona ?? undefined } });

  const onSubmitSupervisor: SubmitHandler<SupervisorForm> = async (data) => {
    await postSupervisor(data);
    setOpenSupervisorDialog(false);
    setSelectedMembers([]);
    resetSupervisorForm();
  }
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement> | any) => {
		const { name, value } = event.target;

    if(name === 'zona') {
      supervisorSetValue('zona_id', value);
    }

		setFiltersState((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}

  const handleCloseSnackBar = (event?: React.SyntheticEvent | Event, reason?: string) => {
      event
      
      if(reason === 'clickaway'){
        return;
      }
  
      setSnackBarStatus({ is_open: false, message: "", severity: "success" });
    }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({open: false, id: undefined});
  } 

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteDialog({open: true, id});
  }

  const handleDeleteSupervisor = () => {
    if(deleteDialog.id === undefined) return;

    deleteSupervisor({ id: deleteDialog.id as number });

    setDeleteDialog({open: false, id: undefined});
  }

  const handleOpenSupervisorDialog = () => {
    setOpenSupervisorDialog(true);
  }

  const handleCloseSupervisorDialog = () => {
    setOpenSupervisorDialog(false);
  }

  const handleMultipleMembersChange = (___: any, value: ResponseMember[]) => {
    setSelectedMembers(value);

    supervisorSetValue('miembro_ids', value.map((member) => member.id));
  }

  React.useEffect(()=> {
    if(postSupervisorResult.isSuccess) {
      setSnackBarStatus({ is_open: true, message: "SUPERVISOR REGISTRADO", severity: "success" });
    }
  }, [postSupervisorResult.isSuccess]);
  
  React.useEffect(()=> {
    if(postSupervisorResult.isError) {
      setSnackBarStatus({ is_open: true, message: errorMessageInPostSupervisor, severity: "error" });
    }
  }, [postSupervisorResult.isError]);

  React.useEffect(()=> {
    if(deleteSupervisorResult.isSuccess) {
      setSnackBarStatus({ is_open: true, message: "SUPERVISOR ELIMINADO", severity: "success" });
    }
  }, [deleteSupervisorResult.isSuccess]);
  
  React.useEffect(()=> {
    if(deleteSupervisorResult.isError) {
      setSnackBarStatus({ is_open: true, message: errorMessageInDeleteSupervisor, severity: "error" });
    }
  }, [deleteSupervisorResult.isError]);

  React.useEffect(() => {

    if(!openSupervisorDialog) {
      setSelectedMembers([]);
      supervisorSetValue('miembro_ids', []);
    }
  }, [filtersState])

  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 90 
    },
    { 
      field: "cedula", 
      headerName: "CEDULA", 
      valueGetter: (value: any) => {
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
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleOpenDeleteDialog(params?.id as number)} />,
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
          Supervisores
        </Typography>
      </Box>

      
      <Box sx={{ display: 'flex', width: "100%", mb: 2, justifyContent: user?.zona === null ? 'space-between' : 'flex-end', alignItems: 'end' }}>
        { user?.zona === null && (
          <FormControl sx={{ width: 200 }} variant="standard">
            <InputLabel htmlFor="zona_native">Zona</InputLabel>
            <Select
              onChange={handleFilterChange}
              disabled={user?.zona !== null}
              value={filtersState?.zona}
              inputProps={{ id: "zona_native", name: "zona" }}
            >
              {zonesLoading && (
                <MenuItem key="0" value="">
                  Cargando...
                </MenuItem>
              )}

              {!zonesError && (
                <MenuItem key={`zones-all`} value={0}>
                  {"TODAS"}
                </MenuItem>
              )}

              {!zonesError &&
                zones?.map(({ id, descripcion }) => (
                  <MenuItem key={`zones-${id}`} value={id}>
                    {descripcion}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        ) }

        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenSupervisorDialog}
          >
            Crear Supervisor
          </Button>
        </Box>
      </Box>
      
      <Paper
        sx={{
          display: "flex",
          height: "calc(100vh - 240px)",
          flexDirection: "column",
        }}
      >
        { supervisorsLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        { !supervisorsLoading && (
          <DataGrid
            rows={supervisors || []}
            loading={supervisorsLoading}
            columns={columns}
            getRowId={(row) => row?.id || null}
            slots={{
              noRowsOverlay: () => <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}><Typography>No hay datos</Typography></Box> 
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      <Snackbar 
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} 
        open={snackBarStatus.is_open} 
        autoHideDuration={2000} 
        onClose={handleCloseSnackBar}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarStatus?.severity || "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBarStatus.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openSupervisorDialog}
        onClose={handleCloseSupervisorDialog}
        aria-labelledby='dialog-title'
        aria-describedby='dialog-description'
      >
        <DialogTitle id='dialog-title'>
          {"Agregar Supervisor"}
        </DialogTitle>

        <DialogContent sx={{ minWidth: 250, maxWidth: 500 }}>
          <form id="supervisor_create_form" onSubmit={supervisorHandleSubmit(onSubmitSupervisor)}>
            <Controller
              control={supervisorControl}
              name={`zona_id`}
              render={({ field: { value, onChange } }) => (
                <input type="hidden" value={value} onChange={onChange}/>
              )} 
            />

            <Controller
              control={supervisorControl}
              name='miembro_ids'
              rules={{ required: "Campo obligatorio" }}
              render={({ fieldState: { invalid, error } }) => (
                <FormControl sx={{ mt: 2 }} error={invalid} fullWidth>
                  <Autocomplete
                    multiple
                    id="multiple-members"
                    options={members || []}
                    disableCloseOnSelect
                    getOptionKey={(option) => option.id}
                    getOptionLabel={(option) => option.nombre_completo}
                    value={selectedMembers}
                    onChange={handleMultipleMembersChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.nombre_completo}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Miembros"
                        placeholder="Miembros"
                        error={invalid}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              )} 
            />

            <DialogActions>
              <Button onClick={handleCloseSupervisorDialog} color='primary'>
                Cancelar
              </Button>
              <LoadingButton 
                type='submit'
                variant='contained'
                color='primary'
                loading={postSupervisorResult.isLoading}
              >
                Guardar
              </LoadingButton>
            </DialogActions>
          </form>
        </DialogContent>

      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Estas seguro de eliminar a este miembro como supervisor?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={handleDeleteSupervisor} autoFocus>
            Si
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
