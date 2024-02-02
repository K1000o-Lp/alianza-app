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
  useGetDisabilitiesQuery,
  useGetEducationsQuery,
  useGetOccupationsQuery,
} from "../../../redux/services";

export const ProfessionForm: React.FC = () => {
  const { control } = useFormContext();

  const {
    data: disabilities,
    isLoading: disabilitiesLoading,
    isError: disabilitiesError,
  } = useGetDisabilitiesQuery();

  const {
    data: educations,
    isLoading: educationsLoading,
    isError: educationsError,
  } = useGetEducationsQuery();

  const {
    data: occupations,
    isLoading: occupationsLoading,
    isError: occupationsError,
  } = useGetOccupationsQuery();

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Historial profesional
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={6} xs={9}>
          <Controller
            control={control}
            name="discapacidad_fk_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="discpacidad_native">
                  Discapacidad
                </InputLabel>
                <NativeSelect
                  inputProps={{ id: "discpacidad_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {disabilitiesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!disabilitiesError &&
                    disabilities?.map(({ discapacidad_id, descripcion }) => (
                      <option key={discapacidad_id}>{descripcion}</option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={6} xs={3} />

        <Grid item md={6} xs={8}>
          <Controller
            control={control}
            name="educacion_fk_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="educacion_native">Educación</InputLabel>
                <NativeSelect
                  inputProps={{ id: "educacion_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {educationsLoading && (
                    <option key="0" value="" hidden>
                      Cargando...
                    </option>
                  )}

                  {!educationsError &&
                    educations?.map(({ educacion_id, descripcion }) => (
                      <option key={educacion_id} value={educacion_id}>
                        {descripcion}
                      </option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={6} xs={4} />

        <Grid item md={7} xs={12}>
          <Controller
            control={control}
            name="ocupacion_fk_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="ocupacion_native">Ocupación</InputLabel>
                <NativeSelect
                  inputProps={{ id: "ocupacion_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {occupationsLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!occupationsError &&
                    occupations?.map(({ ocupacion_id, descripcion }) => (
                      <option key={ocupacion_id} value={ocupacion_id}>
                        {descripcion}
                      </option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={5} />
      </Grid>
    </React.Fragment>
  );
};
