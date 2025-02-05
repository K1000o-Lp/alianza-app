import React from "react";
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogTitle, FormControl, FormControlLabel, Grid2 as Grid, InputLabel, NativeSelect, Paper, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbarContainer } from "@mui/x-data-grid";
import { useGetMembersWithResultsQuery, useGetRequirementsQuery, useGetSupervisorsQuery, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppSelector } from "../../../redux/store";
import { filterConsolidation } from "../../../types";
import { useRouter } from "../../../router/hooks";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import { config } from "../../../config";

dayjs.extend(quarterOfYear);

const getQuarterStartEnd = () => {
  const currentQuarter = dayjs().quarter();
  const startOfQuarter = dayjs().quarter(currentQuarter).startOf('quarter');
  const endOfQuarter = dayjs().quarter(currentQuarter).endOf('quarter');

  return { startOfQuarter, endOfQuarter };
}

export const ReportesConsolidaciones: React.FC = () => {

  const { user } = useAppSelector((state) => state.auth);
  const { startOfQuarter,  endOfQuarter } = getQuarterStartEnd();
  const router = useRouter();
  const location = useLocation();

  const { requisito, zona, desde, hasta, no_completado, supervisor } = queryString.parse(location.search);

  const obtenerRequisito = () => {
    if(requisito) {
      return requisito as unknown as number;
    }

    return 1;
  }

  const obtenerZona = () => {
    if(zona) {
      return zona as unknown as number;
    }

    if(user?.zona !== null) {
      return user?.zona.id as number;
    }

    return 0;
  }

  const obtenerSupervisor = () => {
    if(supervisor) {
      return supervisor as unknown as number;
    }

    return 0;
  }

  const obtenerDesde = () => {
    if(desde) {
      return dayjs(desde as string);
    }

    return startOfQuarter;
  }

  const obtenerHasta = () => {
    if(hasta) {
      return dayjs(hasta as string);
    }

    return endOfQuarter;
  }

	const [ filtersState, setFiltersState ] = React.useState<filterConsolidation>({ 
		zona: obtenerZona(), 
    supervisor: obtenerSupervisor(),
		requisito: obtenerRequisito(), 
		no_completado: no_completado == 'true' ? true : false,
		desde: obtenerDesde(), 
		hasta: obtenerHasta() 
	});
  
  const  [openDialog, setOpenDialog] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });

	const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const { 
    data: supervisors, 
    isLoading: supervisorsLoading, 
    isError: supervisorsError 
  } = useGetSupervisorsQuery({ zona_id: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const { 
		data: requirementsData, 
		isLoading: requirementsIsLoading, 
		isError: requirementsError 
	} = useGetRequirementsQuery();

  const { 
		data: memberData, 
		isLoading: memberIsLoading,
	} = useGetMembersWithResultsQuery({ 
    zona: filtersState?.zona, 
    supervisor: filtersState?.supervisor,
    no_completado: filtersState?.no_completado,
		requisito: filtersState?.requisito,
		results_since: filtersState?.desde?.format('YYYY-MM-DD'),
		results_until: filtersState?.hasta?.format('YYYY-MM-DD'),
	}, { refetchOnMountOrArgChange: true });
  
  const [ updateMember, updateMemberResult ] = usePutMembersMutation();
  const { isLoading: updateMemberIsLoading } = updateMemberResult;

	const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement> | any) => {
		const { name, value } = event.target;

		setFiltersState((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}

	const handleFilterDateChange = (date: Date | dayjs.Dayjs | null, name: string) => {
		setFiltersState((prevState) => ({
			...prevState,
			[name]: date,
		}));
	}

  const handleNoCompletadoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFiltersState((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  }

  const editMember = (id:  GridRowId | null) => {
    if(!id) return;

    router.push(`/miembros/${id}/editar`);
  }

  const deleteMember = async (id: GridRowId | null) => {
    if(!id) return;

    updateMember({ id: id as number, historial: { zona_id: config().ZONA_0 } });
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

  const handleClickExportToExcel = () => {
    const api = config().BACKEND_URL;

    fetch(`${api}persona/miembros/reportes?${queryString.stringify(filtersState)}`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_consolidaciones_${dayjs().format('DD/MM/YYYY HH:mm:ss')}.xlsx`;
      a.click();
    })
    .catch(error => console.error(error));
  }

  const handleClickExportResumeToExcel = () => {
    const api = config().BACKEND_URL;

    fetch(`${api}persona/estadisticas/reportes?zona=${filtersState?.zona}`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estadisticas_resumen_${dayjs().format('DD/MM/YYYY HH:mm:ss')}.xlsx`;
      a.click();
    })
    .catch(error => console.error(error));
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
      width: 120 
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
      field: "resultados", 
		  valueGetter: (value) => {
			  const resultados = value as Array<any>;
			  if(resultados.length === 0) return 'SIN PROGRESO';

				return resultados[0]?.requisito?.nombre;
			},
      headerName: "REQUISITO ALCANZADO", 
      width: 200, 
    },
    {
      field: "consolidado_en",
      valueGetter: (value) => {

        if(!value) return 'SIN FECHA';

        return dayjs(value).format("DD/MM/YYYY");
      },
      headerName: "FECHA DE CONSOLIDACION",
      width: 200
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editMember(params?.id)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleOpenDialog(params.id as number)} />,
      ],
	  },
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button color="primary" variant="text" startIcon={<FileDownloadIcon />} onClick={handleClickExportToExcel}>
          Exportar lista a Excel
        </Button>
        <Button color="primary" variant="text" startIcon={<FileDownloadIcon />} onClick={handleClickExportResumeToExcel}>
          Exportar resumen a Excel
        </Button>
      </GridToolbarContainer>
    );
  }

  React.useEffect(() => {
    const query = queryString.stringify(filtersState);

    router.push(`?${query}`);

  }, [filtersState])

	return (
		<Grid container spacing={1}>
			<Grid size={12}>
				<Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
					<Typography component="h1" variant="h5">
						Reportes de Consolidaciones
					</Typography>
				</Box>
			</Grid>

			<Grid size={12}>
				<Paper
					variant="outlined"
					sx={{ 
						display: 'flex',
						alignItems: {
							xs: 'start',
							md: 'center'
						},
						justifyContent: {
							xs: 'space-between',
							md: 'start'
						},
						flexDirection: {
							xs: "column",
							md: "row"
						},
						my: { 
							xs: 1.5, 
							md: 3 
						},
						p: 2,
						height: {
							xs: 270,
							md: 50
						},
					}}
				>
					<Box>
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
					</Box>

          <Box>
            <FormControl sx={{ width: 300, ml: 2 }}>
              <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
              <NativeSelect
                onChange={handleFilterChange}
                value={filtersState?.supervisor}
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

					<Box sx={{ marginLeft: { md: 1, xs: 0 } }}>
						<FormControl sx={{ width: 180 }}>
							<FormControlLabel
								control={
									<Checkbox checked={filtersState.no_completado == true ? true : false} onChange={handleNoCompletadoChange} name="no_completado" />
								}
								label="NO COMPLETADO"
							/>
						</FormControl>
					</Box>

					<Box>
						<FormControl sx={{ width: 250 }}>
							<InputLabel htmlFor="requisito_native">Proceso de formacion</InputLabel>
							<NativeSelect
								onChange={handleFilterChange}
								value={filtersState?.requisito}
								inputProps={{ id: "requisito_native", name: "requisito" }}
							>
								{requirementsIsLoading && (
									<option key="0" value="">
										Cargando...
									</option>
								)}

								{!requirementsError &&
									requirementsData?.map(({ id, nombre }) => (
										<option key={`requisitos-${id}`} value={id}>
											{nombre}
										</option>
									))}
							</NativeSelect>
						</FormControl>
					</Box>

					<Box sx={{ marginLeft: { md: 2, xs: 0 }, marginRight: 1 }}>
						<DatePicker
							onChange={(value) => handleFilterDateChange(value, "desde")}
							value={ filtersState.desde ? dayjs(filtersState.desde) : null }
							minDate={dayjs('2024-01-01')}
							maxDate={endOfQuarter}
              format="DD/MM/YYYY"
							slotProps={{
								textField: {
									variant: "standard",
									label: "Fecha inicial",
								},
							}}
						/>
					</Box>

					<Box sx={{ marginLeft: {md: 1, xs: 0 } }}>
						<DatePicker
								onChange={(value) => handleFilterDateChange(value, "hasta")}
								value={ filtersState.hasta ? dayjs(filtersState.hasta) : null }
								minDate={filtersState.desde as unknown as dayjs.Dayjs}
								maxDate={endOfQuarter}
                format="DD/MM/YYYY"
								slotProps={{
									textField: {
										variant: "standard",
										label: "Fecha final",
									},
								}}
							/>
					</Box>
					
				</Paper>
			</Grid>

			<Grid size={12}>
				<Paper
					sx={{ 
						display: "flex",
						height: "calc(100vh - 310px)",
						flexDirection: "column",
					}}
				>
          {
            memberIsLoading || updateMemberIsLoading 
            ? (
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <CircularProgress />
              </Box>
            )
            : Array.isArray(memberData) && memberData.length > 0 
            ? (
              <DataGrid
                rows={memberData ?? []}
                columns={columns}
                loading={memberIsLoading || updateMemberIsLoading}
                getRowId={(row) => row?.id || null}
                slots={{ 
                  toolbar: CustomToolbar, 
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
			</Grid>
		</Grid>
	);
}