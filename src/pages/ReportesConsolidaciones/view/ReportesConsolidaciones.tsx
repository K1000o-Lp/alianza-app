import { Box, FormControl, Grid2 as Grid, InputLabel, NativeSelect, Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useGetMembersWithResultsQuery, useGetRequirementsQuery, useGetZonesQuery } from "../../../redux/services";
import React from "react";
import { filterConsolidation } from "../../../types";
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { DatePicker } from "@mui/x-date-pickers";
import { useAppSelector } from "../../../redux/store";

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

	const [ filtersState, setFiltersState ] = React.useState<filterConsolidation>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 1, 
		requisito: 1, 
		results_since: startOfQuarter, 
		results_until: endOfQuarter 
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
		requisito: filtersState?.requisito,
		results_since: filtersState?.results_since,
		results_until: filtersState?.results_until
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

	const dataForGrid = memberData?.map((member) => {
		return {
			...member,
			resultados: member?.resultados?.[0].requisito.nombre,
			consolidado_en: member.resultados?.[0]?.creado_en
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

				return dayjs(value).format("DD/MM/YYYY");
			},
			headerName: "FECHA DE CONSOLIDACION",
			width: 200
		}
  ];



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
						<FormControl sx={{ width: 150 }}>
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

								{!zonesError &&
									zones?.map(({ id, descripcion }) => (
										<option key={`zones-${id}`} value={id}>
											{descripcion}
										</option>
									))}
							</NativeSelect>
						</FormControl>
					</Box>

					<Box sx={{ marginLeft: { md: 2, xs: 0 } }}>
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
							onChange={(value) => handleFilterDateChange(value, "results_since")}
							value={ filtersState.results_since ? dayjs(filtersState.results_since) : null }
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
								onChange={(value) => handleFilterDateChange(value, "results_until")}
								value={ filtersState.results_until ? dayjs(filtersState.results_until) : null }
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