import * as React from "react";
import Typography from "@mui/material/Typography";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import { useGetCivilStatusesQuery } from "../../../redux/services";
import dayjs from "dayjs";

export const PersonalForm: React.FC = () => {
  const { control, setValue } = useFormContext();

  const {
    data: civilStatuses,
    isLoading: civilstatusesLoading,
    isError: civiliStatusesError,
  } = useGetCivilStatusesQuery();

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Información personal
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 8, md: 4 }}>
          <Controller
            control={control}
            name="cedula"
            defaultValue=""
            rules={{
              pattern: {
                value: /^[0-9,$]*$/,
                message: "Campo solo permite números",
              },
            }}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <TextField
                variant="standard"
                label="Cédula (Opcional)"
                onChange={onChange}
                value={value}
                error={invalid}
                helperText={error?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 4, md: 8 }} />

        <Grid size={{ xs: 11, md: 9 }} >
          <Controller
            control={control}
            name="nombre_completo"
            defaultValue=""
            rules={{ required: "Campo obligatorio" }}
            render={({ field: { value }, fieldState: { invalid, error } }) => (
              <TextField
                variant="standard"
                label="Nombre completo"
                onChange={(e) => {
                  const full_name: string = e.target.value;

                  setValue("nombre_completo", full_name.toUpperCase());
                }}
                value={value}
                error={invalid}
                helperText={error?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 1, md: 3 }} />

        <Grid size={{ xs: 8, md: 5 }} >
          <Controller
            control={control}
            name="telefono"
            defaultValue=""
            rules={{
              pattern: {
                value: /^\d{10}$/,
                message: "Campo solo permite números de 10 dígitos",
              },
            }}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <TextField
                variant="standard"
                label="Teléfono (Opcional)"
                onChange={onChange}
                value={value}
                error={invalid}
                helperText={error?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 4, md: 7 }} />

        <Grid size={{ xs: 10, md: 6 }} >
          <Controller
            control={control}
            name="fecha_nacimiento"
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <DatePicker
                format="DD/MM/YYYY"
                onChange={(date) => onChange(date)}
                value={ value ? dayjs(value) : null }
                slotProps={{
                  textField: {
                    variant: "standard",
                    label: "Fecha de nacimiento (Opcional)",
                    error: invalid,
                    helperText: error?.message,
                    fullWidth: true,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 2, md: 6 }} />

        <Grid size={{ xs:6, md: 4 }} >
          <Controller
            control={control}
            name="estado_civil_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth variant="standard">
                <InputLabel htmlFor="estado_civil_label">
                  Estado civil
                </InputLabel>
                <Select
                  inputProps={{
                    id: "estado_civil_label",
                  }}
                  onChange={onChange}
                  value={value}
                >
                  <MenuItem key="-1" value="" hidden></MenuItem>

                  {civilstatusesLoading && (
                    <MenuItem key="0" value="">
                      Cargando...
                    </MenuItem>
                  )}

                  {!civiliStatusesError &&
                    civilStatuses?.map(({ id, descripcion }) => (
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

        <Grid size={{ xs: 4, md: 2 }} >
          <Controller
            control={control}
            name="hijos"
            rules={{ required: "Campo  obligatorio" }}
            defaultValue="0"
            render={({ field: { value }, fieldState: { invalid, error } }) => (
              <TextField
                variant="standard"
                type="number"
                label="Hijos"
                onChange={(e) => {
                  const value: number = Number(e.target.value);

                  if (value >= 0) {
                    setValue("hijos", value);
                  }
                }}
                value={value}
                error={invalid}
                helperText={error?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 2, md: 6 }} />
      </Grid>
    </React.Fragment>
  );
};
