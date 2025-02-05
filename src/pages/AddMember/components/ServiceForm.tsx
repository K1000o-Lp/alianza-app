import * as React from "react";
import {
  FormControl,
  FormHelperText,
  Grid2 as Grid,
  InputLabel,
  NativeSelect,
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
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="servicio_native">Servicio</InputLabel>
                <NativeSelect
                  inputProps={{ id: "servicio_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {servicesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!servicesError &&
                    services?.map(({ id, descripcion }) => (
                      <option key={id} value={id}>
                        {descripcion}
                      </option>
                    ))}
                </NativeSelect>
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
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="zona_native">Zona</InputLabel>
                <NativeSelect
                  inputProps={{ id: "zona_native" }}
                  onChange={onChange}
                  value={value}
                  disabled={user?.zona !== null}
                >
                  <option key="-1" value="" hidden></option>

                  {zonesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!zonesError &&
                    zones?.map(({ id, descripcion }) => (
                      <option key={id} value={id}>
                        {descripcion}
                      </option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12} >
          <Controller
            control={control}
            name="historial.supervisor_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
                <NativeSelect
                  inputProps={{ id: "supervisor_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {supervisorsLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!supervisorsError &&
                    supervisors?.map((supervisor: any) => (
                      <option key={supervisor?.miembro_id} value={supervisor?.miembro_id}>
                        {supervisor?.nombre_completo}
                      </option>
                    ))}

                  {!supervisorsError && supervisors?.length === 0 && (
                    <option key="0" value="">
                      No hay supervisores disponibles
                    </option>
                  )}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
