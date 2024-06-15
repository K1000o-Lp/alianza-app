import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { EventForm } from '../../../types';
import { Alert, Collapse, FormControl, FormHelperText, Grid, IconButton, InputLabel, NativeSelect, TextField, Typography } from '@mui/material';
import { useGetZonesQuery, usePostEventsMutation } from '../../../redux/services';
import { LoadingButton } from '@mui/lab';
import { GridCloseIcon } from '@mui/x-data-grid';

export const Eventos: React.FC = () => {

  const [ open, setOpen ] = React.useState<boolean>(false);
  const { control, setValue, handleSubmit, reset } = useForm<EventForm>({ defaultValues: {} });

  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();

  const [ postEvent, result ] = usePostEventsMutation();
  const { isLoading: postEventLoading } = result;

  const onSubmit: SubmitHandler<EventForm> = async (data) => postEvent(data);

  React.useEffect(() => {

    if(result.isSuccess) {
      setOpen(true);
      reset();

      setTimeout(() => {
        setOpen(false);
      }, 2500)
    }
  }, [result.isSuccess])
  
  return (
    <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <Paper
            variant="outlined"
            sx={{ my: { xs: 1.5, md: 3 }, width: 600, p: { xs: 2, md: 3 } }}
        >
          <Typography
            component="h1"
            variant="h6"
            color="primary"
            sx={{ flexGrow: 1, mb: 3 }}
          >
            Eventos
          </Typography>

          <form onSubmit={ handleSubmit(onSubmit) }>
            <Grid container spacing={3}>
              <Grid item md={12} xs={12}>
                <Controller
                  control={control}
                  name="nombre"
                  defaultValue=""
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field: { value }, fieldState: { invalid, error } }) => (
                    <TextField
                      variant="standard"
                      label="Nombre del evento"
                      onChange={(e) => {
                        const full_name: string = e.target.value;

                        setValue("nombre", full_name.toUpperCase());
                      }}
                      value={value}
                      error={invalid}
                      helperText={error?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <Controller
                  control={control}
                  name="descripcion"
                  defaultValue=""
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field: { value, onChange }, fieldState: { invalid, error } }) => (
                    <TextField
                      variant="standard"
                      label="Descripcion del evento"
                      value={value}
                      onChange={onChange}
                      error={invalid}
                      helperText={error?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item md={12} xs={12}>
                <Controller
                  control={control}
                  name="zona_id"
                  rules={{ required: "Campo obligatorio" }}
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

              <Box width="100%" sx={{mt: 5}}>
                <Box sx={{display: "flex", justifyContent: "end"}}>
                  <LoadingButton 
                    type='submit' 
                    variant="contained"
                    loading={postEventLoading}
                    disabled={postEventLoading}
                  >
                    Crear Evento
                  </LoadingButton>
                </Box>
              </Box>
            </Grid>
          </form>

          <Collapse in={open}>
            <Alert
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <GridCloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ my: 3 }}
            >
              Evento creado exitosamente!
            </Alert>
          </Collapse>
        </Paper>
    </Box>
  )
}
