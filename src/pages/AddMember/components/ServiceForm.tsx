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
  useGetSuperiorsQuery,
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

  const {
    data: superiors,
    isLoading: superiorsLoading,
    isError: superiorsError,
  } = useGetSuperiorsQuery({ requisito: 11, competencia: 3 });

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Información del servicio
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={12} xs={12}>
          <Controller
            control={control}
            name="historial.lider_fk_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="lider_native">Líder</InputLabel>
                <NativeSelect
                  inputProps={{ id: "lider_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {superiorsLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!superiorsError &&
                    superiors?.map(({ miembro_id, nombre_completo }) => (
                      <option key={miembro_id} value={miembro_id}>
                        {nombre_completo}
                      </option>
                    ))}

                  {/*{disabilitiesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!disabilitiesError &&
                    disabilities?.map(({ discapacidad_id, descripcion }) => (
                      <option key={discapacidad_id}>{descripcion}</option>
                    ))}*/}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <Controller
            control={control}
            name="historial.supervisor_fk_id"
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

                  {superiorsLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!superiorsError &&
                    superiors?.map(({ miembro_id, nombre_completo }) => (
                      <option key={miembro_id} value={miembro_id}>
                        {nombre_completo}
                      </option>
                    ))}

                  {/*{disabilitiesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!disabilitiesError &&
                    disabilities?.map(({ discapacidad_id, descripcion }) => (
                      <option key={discapacidad_id}>{descripcion}</option>
                    ))}*/}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={12} xs={12}>
          <Controller
            control={control}
            name="historial.servicio_fk_id"
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
                    services?.map(({ servicio_id, descripcion }) => (
                      <option key={servicio_id} value={servicio_id}>
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
            name="historial.zona_fk_id"
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
                    zones?.map(({ zona_id, descripcion }) => (
                      <option key={zona_id} value={zona_id}>
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
