import React from "react";
import { Box, Checkbox, FormControl, FormControlLabel, Grid2 as Grid, InputLabel, NativeSelect, Paper, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { useGetMembersWithResultsQuery, useGetRequirementsQuery, useGetZonesQuery } from "../../../redux/services";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import EditIcon from '@mui/icons-material/Edit';
import { useAppSelector } from "../../../redux/store";
import { filterConsolidation } from "../../../types";
import { useRouter } from "../../../router/hooks";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

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

  const { requisito, zona, desde, hasta, no_completado } = queryString.parse(location.search);

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

    return 1000;
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
		requisito: obtenerRequisito(), 
		no_completado: no_completado as unknown as boolean,
		desde: obtenerDesde(), 
		hasta: obtenerHasta() 
	});	

	const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const { 
		data: requirementsData, 
		isLoading: requirementsIsLoading, 
		isError: requirementsError 
	} = useGetRequirementsQuery();

  const { 
		data: memberData, 
		isLoading: memberIsLoading 
	} = useGetMembersWithResultsQuery({ 
		zona: filtersState?.zona, 
    no_completado: filtersState?.no_completado,
		requisito: filtersState?.requisito,
		results_since: filtersState?.desde?.format('YYYY-MM-DD'),
		results_until: filtersState?.hasta?.format('YYYY-MM-DD'),
	}, { refetchOnMountOrArgChange: true });

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

  const editMember = (id:  GridRowId) => {
    router.push(`/miembros/${id}/editar`);
  }

	const dataForGrid = memberData?.map((member) => {
		return {
			...member,
			resultados: member.resultados.length > 0 ? member?.resultados?.[0].requisito?.nombre : null,
			consolidado_en: member.resultados.length > 0 ? member.resultados?.[0]?.creado_en : null
		}
	});

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
				
				return value || 'SIN PROGRESO';
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
		  <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => editMember(params.id)} />,
		],
	
	  },
  ];

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

					<Box sx={{ marginLeft: { md: 1, xs: 0 } }}>
						<FormControl sx={{ width: 180 }}>
							<FormControlLabel
								control={
									<Checkbox checked={filtersState.no_completado} onChange={handleNoCompletadoChange} name="no_completado" />
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
						height: 500,
						flexDirection: "column",
					}}
				>
					<DataGrid
						rows={dataForGrid ?? []}
						columns={columns}
						loading={memberIsLoading}
						getRowId={(row) => row?.id}
						slots={{ toolbar: GridToolbar }}
						initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
						pageSizeOptions={[10, 20, 50, 100]}
						disableRowSelectionOnClick
					/>
				</Paper>
			</Grid>
		</Grid>
	);
}