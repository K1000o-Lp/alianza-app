import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Alert, Autocomplete, Collapse, IconButton, TextField, Typography } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { AsistenciasForm } from '../../../types';
import { LoadingButton } from '@mui/lab';
import { GridCloseIcon } from '@mui/x-data-grid';
import { useGetMembersWithLastResultQuery } from '../../../redux/services';

export const Attendance: React.FC = () => {

  const [ open, setOpen ] = React.useState<boolean>(false);
  const { control, handleSubmit } = useForm<AsistenciasForm>({ defaultValues: {} });

  const { data: membersData } = useGetMembersWithLastResultQuery({});
  
  const options: any = membersData?.map(({ nombre_completo, id }) => ({
    nombre_completo, 
    miembro_id: id,
  }))

  const onSubmit: SubmitHandler<AsistenciasForm> = (data) => console.log(data);

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
            Marcar Asistencia
          </Typography>

          <form onSubmit={ handleSubmit(onSubmit) }>
            <Controller
              control={control}
              name={'miembros'}
              defaultValue={[]}
              render={({field: { onChange }}) => (
                <Autocomplete
                  options={options}
                  getOptionLabel={(option: any) => `${option.nombre_completo}`}
                  renderInput={(params) => <TextField {...params} variant='standard' label="Miembros" margin="normal" />}
                  onChange={(_, data) => onChange(data)}
                />
              )}
            />

            <Box width="100%" sx={{mt: 3}}>
              <Box sx={{display: "flex", justifyContent: "end"}}>
                <LoadingButton
                  variant="contained"
                >
                  Guardar
                </LoadingButton>
              </Box>
            </Box>
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
