import * as React from "react";
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  NativeSelect,
  Typography,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import {
  useGetServicesQuery,
  useGetZonesQuery,
} from "../../../redux/services";

export const ServiceForm: React.FC = () => {
  const { control } = useFormContext();

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

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Información del servicio
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={12} xs={12}>
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

        <Grid item md={12} xs={12}>
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
      </Grid>
    </React.Fragment>
  );
};
