import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import { useParams } from 'react-router-dom';
import { useGetEvaluationsQuery, usePutMembersMutation, useUpdateEvaluationsMutation } from '../../../redux/services';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { EvaluacionInput, MemberForm, snackBarStatus } from '../../../types';
import { Alert, Button, Grid2 as Grid, Snackbar, Stack, Switch } from '@mui/material';
import { useRouter } from '../../../router/hooks';
import { PersonalForm } from '../../AddMember/components/PersonalForm';
import { ProfessionForm } from '../../AddMember/components/ProfessionForm';
import { ServiceForm } from '../../AddMember/components/ServiceForm';
import dayjs from 'dayjs';

export const EditMember:React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [ snackBarStatus, setSnackBarStatus ] = React.useState<snackBarStatus>({ is_open: false, message: "" });
  const { data: memberData, isSuccess: memberIsSuccess } = useGetEvaluationsQuery({ id }, { refetchOnMountOrArgChange: true });
  const [ updateEvaluations, resultEvaluations ] = useUpdateEvaluationsMutation();
  const [ updateMember, resultMember ] = usePutMembersMutation();
  const { control: evaFormControl, handleSubmit: evaFormSubmit } = useForm<EvaluacionInput[]>();
  const memberFormMethods = useForm<MemberForm>();

  const onSubmitEvaluations: SubmitHandler<EvaluacionInput[]> = (data) => updateEvaluations(Object.values(data)); 
  const onSubmitUpdateMember: SubmitHandler<MemberForm> = (data) => updateMember({ id: Number(id), ...data });

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    event
    
    if(reason === 'clickaway'){
      return;
    }

    setSnackBarStatus({ is_open: false, message: "" });
  }

  const handleSubmitUpdateMember = () => {
    memberFormMethods.handleSubmit(onSubmitUpdateMember)();
  }
  
  React.useEffect(()=>{
    if(resultEvaluations.isSuccess){
      setSnackBarStatus({ is_open: true, message: "EVALUACION GUARDADA" });
    }
  },[resultEvaluations.isSuccess]);

  React.useEffect(()=>{
    if(resultMember.isSuccess){
      setSnackBarStatus({ is_open: true, message: "MIEMBRO ACTUALIZADO" });
    }
  }, [resultMember.isSuccess]);

  React.useEffect(()=>{ 
    if(memberIsSuccess){
      console.log(memberData);
    }
  }, [memberIsSuccess, memberData]);

  React.useEffect(()=> {
    if(memberData && Array.isArray(memberData)) {
      memberFormMethods.reset({ ...memberData[0] ? {
      cedula: memberData[0].cedula ?? "",
      nombre_completo: memberData[0].nombre_completo,
      telefono: memberData[0].telefono ?? "",
      fecha_nacimiento: dayjs(memberData[0].fecha_nacimiento),
      hijos: memberData[0].hijos,
      educacion_id: memberData[0].educacion.id ?? null,
      estado_civil_id: memberData[0].estado_civil.id ?? null,
      ocupacion_id: memberData[0].ocupacion.id ?? null,
      discapacidad_id: memberData[0].discapacidad.id ?? null,
      historial: memberData[0].historiales[0] ? { 
        servicio_id: memberData[0].historiales[0].servicio?.id ?? null, 
        zona_id: memberData[0].historiales[0].zona?.id ?? null 
      } 
      : undefined } 
      : undefined });
    }
  }, [memberData, memberFormMethods]);

  if(!memberData) {
    return (
      <div>
        Cargando...
      </div>
    )
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Button variant='outlined' sx={{ marginLeft: { xs: 0, md: 5 } }} onClick={() => router.back()}>
          Atras
        </Button>
      </Grid>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            MIEMBRO { memberData[0].nombre_completo }
          </Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 7}}>
        <Paper
          variant="outlined"
          sx={{ 
            my: { 
              xs: 1.5, 
              md: 3 
            }, 
            mx: { 
              md: 5 
            }, 
            p: { 
              xs: 5,
              md: 8 
            } 
          }}
        >
          <FormProvider {...memberFormMethods} >
            <Box sx={{ marginBottom: 5 }} >
              <PersonalForm />
            </Box>
            <Box sx={{ marginBottom: 5 }} >
              <ProfessionForm />
            </Box>
            <Box>
              <ServiceForm />
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'end', mt: 5}}>
              <LoadingButton onClick={handleSubmitUpdateMember} type="submit" variant='contained' loading={resultMember.isLoading}>
                Guardar Informacion
              </LoadingButton>
            </Box>
          </FormProvider>
        </Paper>
      </Grid>
      <Grid size={{xs: 12, md: 5}}>
        <Paper
          variant="outlined"
          sx={{ 
            my: { 
              xs: 1.5, 
              md: 3 
            },
            p: { 
              xs: 5, 
              md: 8 
            } 
          }}
        >
          <form id='edit_member_eva_form' onSubmit={evaFormSubmit(onSubmitEvaluations)}>
            {
              memberData[0]?.evaluaciones?.map((evaluacion, index) => (
                <Box key={evaluacion?.id} sx={{display: "flex", justifyContent: 'space-between', alignItems: "center", margin: 1 }}>
                  <Typography color="primary">
                    { evaluacion?.requisito?.nombre }
                  </Typography>

                  <Controller
                    control={evaFormControl}
                    name={`${index}.id`}
                    defaultValue={evaluacion.id}
                    render={({ field: { value, onChange } }) => (
                      <input type="hidden" value={value} onChange={onChange}/>
                    )}
                  />

                  <Controller
                    control={evaFormControl}
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

            <Box sx={{display: 'flex', justifyContent: 'end', mt: 5}}>
              <LoadingButton type="submit" variant='contained' loading={resultEvaluations.isLoading}>
                Actualizar Evaluaciones
              </LoadingButton>
            </Box>
          </form>

          <Snackbar 
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} 
            open={snackBarStatus.is_open} 
            autoHideDuration={2000} 
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackBarStatus.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Grid>
    </Grid>
  )
}
