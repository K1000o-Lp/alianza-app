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
        <Grid size={{ xs: 9, md: 6 }} >
          <Controller
            control={control}
            name="discapacidad_id"
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
                    disabilities?.map(({ id, descripcion }) => (
                      <option key={id} value={id}>{descripcion}</option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 3, md: 6 }} />

        <Grid size={{ xs: 8, md: 6 }} >
          <Controller
            control={control}
            name="educacion_id"
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
                    educations?.map(({ id, descripcion }) => (
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

        <Grid size={{ xs: 4, md: 6 }} />

        <Grid size={{ xs: 12, md: 7 }} >
          <Controller
            control={control}
            name="ocupacion_id"
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
                    occupations?.map(({ id, descripcion }) => (
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

        <Grid size={{ md: 5 }} />
      </Grid>
    </React.Fragment>
  );
};
