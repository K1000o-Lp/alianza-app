import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Controller, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  NativeSelect,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import { useGetCivilStatusesQuery } from "../../../redux/services";

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
        <Grid item md={4} xs={8}>
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

        <Grid item md={8} xs={4} />

        <Grid item md={9} xs={11}>
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

        <Grid item md={3} xs={1} />

        <Grid item md={5} xs={8}>
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

        <Grid item md={7} xs={4} />

        <Grid item md={6} xs={10}>
          <Controller
            control={control}
            name="fecha_nacimiento"
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <DatePicker
                onChange={onChange}
                value={value}
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

        <Grid item md={6} xs={2} />

        <Grid item md={4} xs={6}>
          <Controller
            control={control}
            name="estado_civil_fk_id"
            rules={{ required: "Campo obligatorio" }}
            defaultValue=""
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <FormControl error={invalid} fullWidth>
                <InputLabel htmlFor="estado_civil_label">
                  Estado civil
                </InputLabel>
                <NativeSelect
                  inputProps={{
                    id: "estado_civil_label",
                  }}
                  onChange={onChange}
                  value={value}
                >
                  <option key="-1" value="" hidden></option>

                  {civilstatusesLoading && (
                    <option key="0" value="">
                      Cargando...
                    </option>
                  )}

                  {!civiliStatusesError &&
                    civilStatuses?.map(({ estado_civil_id, descripcion }) => (
                      <option key={estado_civil_id} value={estado_civil_id}>
                        {descripcion}
                      </option>
                    ))}
                </NativeSelect>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item md={2} xs={4}>
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

        <Grid item md={6} xs={2} />
      </Grid>
    </React.Fragment>
  );
};
