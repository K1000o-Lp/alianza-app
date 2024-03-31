import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import { useParams } from 'react-router-dom';
import { useGetEvaluationsQuery, useUpdateEvaluationsMutation } from '../../../redux/services';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { EvaluacionInput } from '../../../types';
import { Alert, Button, Snackbar, Stack, Switch } from '@mui/material';
import { useRouter } from '../../../router/hooks';

export const EditMember:React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [open, setOpen] = React.useState<boolean>(false);
  const { data } = useGetEvaluationsQuery({ id }, { refetchOnMountOrArgChange: true });
  const [ updateEvaluations, result ] = useUpdateEvaluationsMutation();
  const { control, handleSubmit } = useForm<EvaluacionInput[]>();

  const onSubmit: SubmitHandler<EvaluacionInput[]> = (data) => updateEvaluations(Object.values(data)); 

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {

    if(reason === 'clickaway'){
      return;
    }

    setOpen(false);
  }
  
  React.useEffect(()=>{
    if(result.isSuccess){
      setOpen(true);
    }
  },[result.isSuccess]);

  if(!data) {
    return (
      <div>
        Cargando...
      </div>
    )
  }



  return (
    <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 1.5, md: 3 }, width: 600, p: { xs: 5, md: 8 } }}
        >
          <Typography component="h1" variant="h5" align="center" mb={10}>
            Progreso de { data[0].nombre_completo }
          </Typography>

          <form id='edit_member_form' onSubmit={handleSubmit(onSubmit)}>
            {
              data[0]?.evaluaciones?.map((evaluacion, index) => (
                <Box key={evaluacion?.id} sx={{display: "flex", justifyContent: 'space-between', alignItems: "center", margin: 1 }}>
                  <Typography color="primary">
                    { evaluacion?.requisito?.nombre }
                  </Typography>

                  <Controller
                    control={control}
                    name={`${index}.id`}
                    defaultValue={evaluacion.id}
                    render={({ field: { value, onChange } }) => (
                      <input type="hidden" value={value} onChange={onChange}/>
                    )}
                  />

                  <Controller
                    control={control}
                    name={`${index}.resultado`}
                    defaultValue={evaluacion.resultado}
                    render={({ field: { value, onChange } }) => (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>No</Typography>
                          <Switch value={true} onChange={onChange} checked={value} />
                        <Typography>Si</Typography>
                      </Stack>
                    )}
                  />
                </Box>
              ))
            }

            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 5}}>
              <Button variant='outlined' onClick={() => router.back()}>
                Cancelar
              </Button>

              <LoadingButton type="submit" variant='contained' loading={result.isLoading}>
                Guardar
              </LoadingButton>
            </Box>
          </form>

          <Snackbar 
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} 
            open={open} 
            autoHideDuration={2000} 
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              EVALUACION GUARDADA
            </Alert>
          </Snackbar>
        </Paper>
    </Box>
  )
}
