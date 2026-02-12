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
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="discpacidad_native">
                  Discapacidad
                </InputLabel>
                <Select
                  inputProps={{ id: "discpacidad_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {disabilitiesLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!disabilitiesError &&
                    disabilities?.map(({ id, descripcion }) => (
                      <MenuItem key={id} value={id}>{descripcion}</MenuItem>
                    ))}
                </Select>
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
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="educacion_native">Educación</InputLabel>
                <Select
                  inputProps={{ id: "educacion_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {educationsLoading && (
                    <MenuItem key="0" value="" hidden>
                      Cargando...
                    </MenuItem>
                  )}

                  {!educationsError &&
                    educations?.map(({ id, descripcion }) => (
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
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="ocupacion_native">Ocupación</InputLabel>
                <Select
                  inputProps={{ id: "ocupacion_native" }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {occupationsLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!occupationsError &&
                    occupations?.map(({ id, descripcion }) => (
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

        <Grid size={{ md: 5 }} />
      </Grid>
    </React.Fragment>
  );
};
