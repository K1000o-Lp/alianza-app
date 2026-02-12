import * as React from "react";
import {
  FormControl,
  FormHelperText,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import {
  useGetServicesQuery,
  useGetSupervisorsQuery,
  useGetZonesQuery,
} from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";

export const ServiceForm: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { control, watch } = useFormContext();
  const zona = watch("historial.zona_id");

  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const {
    data: services,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetServicesQuery();

  const {
    data: supervisors,
    isLoading: supervisorsLoading,
    isError: supervisorsError,
  } = useGetSupervisorsQuery({ zona_id: zona }, { refetchOnMountOrArgChange: true });

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Información del servicio
      </Typography>

      <Grid container spacing={3}>
        <Grid size={12} >
          <Controller
            control={control}
            name="historial.servicio_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="servicio_native">Servicio</InputLabel>
                <Select
                  inputProps={{ id: "servicio_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {servicesLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!servicesError &&
                    services?.map(({ id, descripcion }) => (
                      <MenuItem key={id} value={id}>
                        {descripcion}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12} >
          <Controller
            control={control}
            name="historial.zona_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="zona_native">Zona</InputLabel>
                <Select
                  inputProps={{ id: "zona_native" }}
                  onChange={onChange}
                  value={value}
                  disabled={user?.zona !== null}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {zonesLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!zonesError &&
                    zones?.map(({ id, descripcion }) => (
                      <MenuItem key={id} value={id}>
                        {descripcion}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12} >
          <Controller
            control={control}
            name="historial.supervisor_id"
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
                <Select
                  inputProps={{ id: "supervisor_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {supervisorsLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!supervisorsError &&
                    supervisors?.map((supervisor: any) => (
                      <MenuItem key={supervisor?.miembro_id} value={supervisor?.miembro_id}>
                        {supervisor?.nombre_completo}
                      </MenuItem>
                    ))}

                  {!supervisorsError && supervisors?.length === 0 && (
                    <MenuItem key="0" value="">
                      No hay supervisores disponibles
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
