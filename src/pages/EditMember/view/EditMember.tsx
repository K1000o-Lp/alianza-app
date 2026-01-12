import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import { useParams } from 'react-router-dom';
import { useDeleteConsolidationResultsMutation, useGetMembersWithResultsQuery, useGetRequirementsQuery, usePostConsolidationResultsMutation, usePutMembersMutation } from '../../../redux/services';
import { Controller, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { consolidationForm, MemberForm, snackBarStatus } from '../../../types';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, FormHelperText, Grid2 as Grid, IconButton, Input, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar } from '@mui/material';
import { useRouter } from '../../../router/hooks';
import { PersonalForm } from '../../AddMember/components/PersonalForm';
import { ProfessionForm } from '../../AddMember/components/ProfessionForm';
import { ServiceForm } from '../../AddMember/components/ServiceForm';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import ClearIcon from '@mui/icons-material/Clear';
import { calcularPageParam } from '../../../helpers/calcularPageParam';

dayjs.extend(quarterOfYear);

const getQuarterStartEnd = () => {
  const currentQuarter = dayjs().quarter();
  const startOfQuarter = dayjs().quarter(currentQuarter).startOf('quarter');
  const endOfQuarter = dayjs().quarter(currentQuarter).endOf('quarter');

  return { startOfQuarter, endOfQuarter };
}

const requirementsJson: any = {
  1: 'GRUPO DE CONEXION',
  2: 'PRIMEROS PASOS',
  3: 'BAUTISMO',
  4: 'ENCUENTRO',
  5: 'POS ENCUENTRO',
  6: 'DOCTRINAS 1',
  7: 'DOCTRINAS 2',
  8: 'ENTRENAMIENTO LIDERAZGO',
  9: 'LIDERAZGO',
  10: 'ENCUENTRO DE ORACION',
  11: 'LIDER',
}

interface EditMemberProps {
  id?: string | number;
  isModal?: boolean;
  onClose?: () => void;
}

export const EditMember: React.FC<EditMemberProps> = ({ id: propId, isModal = false, onClose }) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const router = useRouter();
  
  const [ snackBarStatus, setSnackBarStatus ] = React.useState<snackBarStatus>({ is_open: false, message: "", severity: "success" });
  const [ selectedRequirements, setSelectedRequirements ] = React.useState<string[]>([]);
  const [ requirements, setRequirements ] = React.useState<number[] | undefined>([]);
  const [ openDialog, setOpenDialog ] = React.useState<boolean>(false);
  const [ openDeleteDialog, setOpenDeleteDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });

  
  const { startOfQuarter,  endOfQuarter } = getQuarterStartEnd();

  const { data: requirementsData, isLoading: requirementsIsLoading, isError: requirementsError } = useGetRequirementsQuery({ requisitos: requirements }, { refetchOnMountOrArgChange: true });
  const { data: memberData, isLoading: memberIsLoading, isError: memberIsError } = useGetMembersWithResultsQuery({ id: String(id) }, { refetchOnMountOrArgChange: true });
  const [ updateMember, resultMember ] = usePutMembersMutation();
  const [ postConsolidationResults, resultPostConsolidation ] = usePostConsolidationResultsMutation();
  const errorMessageInPostConsolidation = resultPostConsolidation.error && "data" in resultPostConsolidation.error ? (resultPostConsolidation.error.data as { message: string }).message : "Error desconocido";

  const [ deleteConsolidationResults, resultDeleteConsolidation ] = useDeleteConsolidationResultsMutation();
  const errorMessageInDeleteConsolidation = resultDeleteConsolidation.error && "data" in resultDeleteConsolidation.error ? (resultDeleteConsolidation.error.data as { message: string }).message : "Error desconocido";

  const memberFormMethods = useForm<MemberForm>();
  const { control: consolidationControl, handleSubmit: consolidationHandleSubmit, setValue } = useForm<consolidationForm>({ defaultValues: { miembro_id: Number(id) ?? undefined }});

  const onSubmitUpdateMember: SubmitHandler<MemberForm> = async (data) => {
    const pageParam = calcularPageParam(Number(id));
    await updateMember({ ...data, id: Number(id), pageParam });
  }
  const onSubmitConsolidation: SubmitHandler<consolidationForm> = async (data) => {
    const pageParam = calcularPageParam(Number(id));
    await postConsolidationResults({... data, pageParam });
    setOpenDialog(false);
  };

  const handleCloseSnackBar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    event
    
    if(reason === 'clickaway'){
      return;
    }

    setSnackBarStatus({ is_open: false, message: "", severity: "success" });
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog({open: false, id: undefined});
  }

  const handleSubmitUpdateMember = () => {
    memberFormMethods.handleSubmit(onSubmitUpdateMember)();
  }

  const handleDeleteConsolidation = async () => {
    const pageParam = calcularPageParam(openDeleteDialog.id as number);
    await deleteConsolidationResults({id: openDeleteDialog.id as number, pageParam});
    setOpenDeleteDialog({ open: false, id: undefined });
  }

  const handleMultipleRequirementsChange = (event: SelectChangeEvent<typeof selectedRequirements>) => {
    const { target: { value } } = event;

    setSelectedRequirements(
      typeof value === 'string' ? value.split(',') : value
    );

    setValue('requisito_ids', typeof value === 'string' ? value.split(',') : value);
  }

  React.useEffect(()=>{
    if(resultMember.isSuccess){
      setSnackBarStatus({ is_open: true, message: "MIEMBRO ACTUALIZADO", severity: "success" });
    }
  }, [resultMember.isSuccess]);

  React.useEffect(()=> {
    if(resultPostConsolidation.isSuccess) {
      setSnackBarStatus({ is_open: true, message: "RESULTADO CONSOLIDADO", severity: "success" });
    }
  }, [resultPostConsolidation.isSuccess]);

  React.useEffect(()=> {
    if(resultPostConsolidation.isError) {
      setSnackBarStatus({ is_open: true, message: errorMessageInPostConsolidation, severity: "error" });
    }
  }, [resultPostConsolidation.isError]);

  React.useEffect(() => {
    if(resultDeleteConsolidation.isSuccess) {
      setSnackBarStatus({ is_open: true, message: "RESULTADO ELIMINADO", severity: "success" });
    }
  }, [resultDeleteConsolidation.isSuccess]);

  React.useEffect(() => {
    if(resultDeleteConsolidation.isError) {
      setSnackBarStatus({ is_open: true, message: errorMessageInDeleteConsolidation, severity: "error" });
    }
  }, [resultDeleteConsolidation.isError]);

  React.useEffect(()=> {
    if(memberData && Array.isArray(memberData)) {
      memberFormMethods.reset({ ...memberData[0] ? {
      cedula: memberData[0].cedula ?? "",
      nombre_completo: memberData[0].nombre_completo,
      telefono: memberData[0].telefono ?? "",
      fecha_nacimiento: dayjs(memberData[0].fecha_nacimiento),
      hijos: memberData[0].hijos,
      educacion_id: memberData[0].educacion?.id ?? undefined,
      estado_civil_id: memberData[0].estado_civil?.id ?? undefined,
      ocupacion_id: memberData[0].ocupacion?.id ?? undefined,
      discapacidad_id: memberData[0].discapacidad?.id ?? undefined,
      historial: memberData[0].historiales[0] ? { 
        servicio_id: memberData[0].historiales[0].servicio?.id ?? undefined, 
        zona_id: memberData[0].historiales[0].zona?.id ?? undefined, 
        supervisor_id: memberData[0].historiales[0].supervisor?.id ?? undefined,
      } 
      : undefined } 
      : undefined });
    }
  }, [memberData, memberFormMethods]);

  React.useEffect(()=> {
    const requirements = memberData?.[0]?.resultados.map(({ requisito }) => requisito.id);

    setRequirements(requirements);
  }, [memberData])

  React.useEffect(() => {

    if(!openDialog) {
      consolidationControl._reset();
      setSelectedRequirements([]);
    }

  }, [openDialog]);

  if(memberIsLoading && !memberData) {
    return (
      <Grid container spacing={1}>
        <Grid size={12}>
          <Box sx={{ marginLeft: { xs: 0, md: 5 }, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Skeleton variant='rounded' height={50} width={100} />
          </Box>
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Skeleton variant='rounded' height={50}  width={350} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
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
            <Skeleton variant='rectangular' height={500} />
          </Paper>
        </Grid>
        <Grid 
          size={{ xs: 12, md: 5 }} 
          sx={{ 
            my: { 
              xs: 3, 
              md: 6 
            }, 
          }} 
        >
          <Typography variant='h5' sx={{ marginBottom: 5, textAlign: 'center' }}>
            Linea de tiempo
          </Typography>
          <Timeline>
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                <Skeleton variant='text' width={100} />
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Skeleton variant='text' width={200} />
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Grid>
      </Grid>
    )
  }

  // If in modal mode, show a simplified view
  if (isModal) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h6">
            EDITAR MIEMBRO: { memberData?.[0]?.nombre_completo ?? '' }
          </Typography>
          <Button variant='outlined' size='small' onClick={onClose}>
            Cerrar
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
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
                <Box sx={{display: 'flex', justifyContent: 'end', marginTop: 5}}>
                  <LoadingButton onClick={handleSubmitUpdateMember} type="submit" variant='contained' loading={resultMember.isLoading}>
                    Guardar Informacion
                  </LoadingButton>
                </Box>
              </FormProvider>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: 1, md: 0.8 } }}>
            <Typography variant='h6' sx={{ marginBottom: 3, textAlign: 'center' }}>
              Linea de tiempo
            </Typography>
            <Timeline>
              {
                !memberIsError && (memberData?.[0]?.resultados ?? []).map(({ id, creado_en, requisito: { nombre } }, index) => (
                  <TimelineItem key={`resultados-${index}`}>
                    <TimelineOppositeContent color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      { dayjs(creado_en).format('DD/MM/YYYY') }
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ width: 24, height: 24 }} />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ fontSize: '0.875rem' }}>
                      { nombre }
                      <IconButton onClick={() => setOpenDeleteDialog({ open: true, id})} aria-label="clear" color='error' size='small'>
                        <ClearIcon fontSize='small' />
                      </IconButton>
                    </TimelineContent>
                  </TimelineItem>
                ))
              }
            </Timeline>

            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
              <Fab size="small" color="primary" aria-label="Consolidar resultado" onClick={handleClickOpenDialog}>
                <Add fontSize='small' />
              </Fab>

              <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby='dialog-title'
                aria-describedby='dialog-description'
              >
                <DialogTitle id='dialog-title'>
                  {"Consolidar Resultado"}
                </DialogTitle>

                <DialogContent sx={{ maxWidth: 500 }}>
                  <form id="consolidation_results_form" onSubmit={consolidationHandleSubmit(onSubmitConsolidation)}>
                    <Controller
                      control={consolidationControl}
                      name={`miembro_id`}
                      render={({ field: { value, onChange } }) => (
                        <input type="hidden" value={value} onChange={onChange}/>
                      )} 
                    />

                    <Controller
                      control={consolidationControl}
                      name='requisito_ids'
                      rules={{ required: "Campo obligatorio" }}
                      render={({ fieldState: { invalid, error } }) => (
                        <FormControl sx={{ mt: 2 }} error={invalid} fullWidth>
                          <InputLabel id="requisito_multiple" htmlFor="requisito_multiple">Requisito</InputLabel>
                          <Select
                            labelId='requisito_multiple'
                            multiple
                            onChange={handleMultipleRequirementsChange}
                            value={selectedRequirements}
                            input={<Input id="requisito_multiple" />}
                            renderValue={(selected) => (
                              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                {selected.map((value) => (
                                  <Chip key={value} label={requirementsJson[value]} />
                                ))}
                              </Box>
                            )}
                          >
                            <MenuItem key="-1" value="" hidden></MenuItem>

                            {requirementsIsLoading && (
                              <MenuItem key="0" value="">
                                Cargando...
                              </MenuItem>
                            )}

                            {!requirementsError &&
                              requirementsData?.map(({ id, nombre }) => (
                                <MenuItem key={`requisitos-${id}`} value={id}>
                                  {nombre}
                                </MenuItem>
                              ))}

                            {!requirementsError && requirementsData?.length === 0 && (
                              <MenuItem key="0" value="">
                                {"No hay requisitos disponibles para consolidar"}
                              </MenuItem>
                            )}  
                          </Select>
                          <FormHelperText>{error?.message}</FormHelperText>
                        </FormControl>
                      )} 
                    />

                    <Controller
                      control={consolidationControl}
                      name="fecha_consolidacion"
                      rules={{ required: "Campo obligatorio" }}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <DatePicker
                          sx={{ mt: 2 }}
                          onChange={(date) => onChange(date)}
                          value={ value ? dayjs(value) : null }
                          defaultValue={dayjs()}
                          minDate={startOfQuarter}
                          maxDate={endOfQuarter}
                          format='DD/MM/YYYY'
                          slotProps={{
                            textField: {
                              variant: "standard",
                              label: "Fecha",
                              error: invalid,
                              helperText: error?.message,
                              fullWidth: true,
                            },
                          }}
                        />
                      )}
                    />

                    <DialogActions>
                      <Button onClick={handleCloseDialog} color='primary'>
                        Cancelar
                      </Button>
                      <LoadingButton 
                        type='submit'
                        variant='contained'
                        color='primary'
                        loading={resultPostConsolidation.isLoading}
                      >
                        Guardar
                      </LoadingButton>
                    </DialogActions>
                  </form>
                </DialogContent>

              </Dialog>
            </Box>
          </Box>
        </Box>

        <Snackbar 
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} 
          open={snackBarStatus.is_open} 
          autoHideDuration={2000} 
          onClose={handleCloseSnackBar}
        >
          <Alert
            onClose={handleCloseSnackBar}
            severity={snackBarStatus?.severity || "success"}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackBarStatus.message}
          </Alert>
        </Snackbar>

        <Dialog
          open={openDeleteDialog.open}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Estas seguro de eliminar el resultado consolidado actual?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>No</Button>
            <Button onClick={handleDeleteConsolidation} autoFocus>
              Si
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <Button variant='outlined' sx={{ marginLeft: { xs: 0, md: 5 } }} onClick={() => router.back()}>
          Atras
        </Button>
      </Grid>
      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            MIEMBRO { memberData?.[0]?.nombre_completo ?? '' }
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
            <Box sx={{display: 'flex', justifyContent: 'end', marginTop: 5}}>
              <LoadingButton onClick={handleSubmitUpdateMember} type="submit" variant='contained' loading={resultMember.isLoading}>
                Guardar Informacion
              </LoadingButton>
            </Box>
          </FormProvider>
        </Paper>
      </Grid>
      <Grid 
        size={{xs: 12, md: 5}} 
        sx={{ 
          my: { 
            xs: 3, 
            md: 6 
          },
        }}
      >
        <Typography variant='h5' sx={{ marginBottom: 5, textAlign: 'center' }}>
          Linea de tiempo
        </Typography>
        <Timeline>
          {
            !memberIsError && (memberData?.[0]?.resultados ?? []).map(({ id, creado_en, requisito: { nombre } }, index) => (
              <TimelineItem key={`resultados-${index}`}>
                <TimelineOppositeContent color="text.secondary">
                  { dayjs(creado_en).format('DD/MM/YYYY') }
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  { nombre }
                  <IconButton onClick={() => setOpenDeleteDialog({ open: true, id})} aria-label="clear" color='error' size='small'>
                    <ClearIcon fontSize='small' />
                  </IconButton>
                </TimelineContent>
              </TimelineItem>
            ))
          }
        </Timeline>

        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Fab size="medium" color="primary" aria-label="Consolidar resultado" onClick={handleClickOpenDialog}>
            <Add />
          </Fab>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby='dialog-title'
            aria-describedby='dialog-description'
          >
            <DialogTitle id='dialog-title'>
              {"Consolidar Resultado"}
            </DialogTitle>

            <DialogContent sx={{ maxWidth: 500 }}>
              <form id="consolidation_results_form" onSubmit={consolidationHandleSubmit(onSubmitConsolidation)}>
                <Controller
                  control={consolidationControl}
                  name={`miembro_id`}
                  render={({ field: { value, onChange } }) => (
                    <input type="hidden" value={value} onChange={onChange}/>
                  )} 
                />

                <Controller
                  control={consolidationControl}
                  name='requisito_ids'
                  rules={{ required: "Campo obligatorio" }}
                  render={({ fieldState: { invalid, error } }) => (
                    <FormControl sx={{ mt: 2 }} error={invalid} fullWidth>
                      <InputLabel id="requisito_multiple" htmlFor="requisito_multiple">Requisito</InputLabel>
                      <Select
                        labelId='requisito_multiple'
                        multiple
                        onChange={handleMultipleRequirementsChange}
                        value={selectedRequirements}
                        input={<Input id="requisito_multiple" />}
                        renderValue={(selected) => (
                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                            {selected.map((value) => (
                              <Chip key={value} label={requirementsJson[value]} />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem key="-1" value="" hidden></MenuItem>

                        {requirementsIsLoading && (
                          <MenuItem key="0" value="">
                            Cargando...
                          </MenuItem>
                        )}

                        {!requirementsError &&
                          requirementsData?.map(({ id, nombre }) => (
                            <MenuItem key={`requisitos-${id}`} value={id}>
                              {nombre}
                            </MenuItem>
                          ))}

                        {!requirementsError && requirementsData?.length === 0 && (
                          <MenuItem key="0" value="">
                            {"No hay requisitos disponibles para consolidar"}
                          </MenuItem>
                        )}  
                      </Select>
                      <FormHelperText>{error?.message}</FormHelperText>
                    </FormControl>
                  )} 
                />

                <Controller
                  control={consolidationControl}
                  name="fecha_consolidacion"
                  rules={{ required: "Campo obligatorio" }}
                  render={({
                    field: { onChange, value },
                    fieldState: { invalid, error },
                  }) => (
                    <DatePicker
                      sx={{ mt: 2 }}
                      onChange={(date) => onChange(date)}
                      value={ value ? dayjs(value) : null }
                      defaultValue={dayjs()}
                      minDate={startOfQuarter}
                      maxDate={endOfQuarter}
                      format='DD/MM/YYYY'
                      slotProps={{
                        textField: {
                          variant: "standard",
                          label: "Fecha",
                          error: invalid,
                          helperText: error?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />

                <DialogActions>
                  <Button onClick={handleCloseDialog} color='primary'>
                    Cancelar
                  </Button>
                  <LoadingButton 
                    type='submit'
                    variant='contained'
                    color='primary'
                    loading={resultPostConsolidation.isLoading}
                  >
                    Guardar
                  </LoadingButton>
                </DialogActions>
              </form>
            </DialogContent>

          </Dialog>
        </Box>

      </Grid>
      <Snackbar 
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} 
        open={snackBarStatus.is_open} 
        autoHideDuration={2000} 
        onClose={handleCloseSnackBar}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarStatus?.severity || "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackBarStatus.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDeleteDialog.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Estas seguro de eliminar el resultado consolidado actual?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>No</Button>
          <Button onClick={handleDeleteConsolidation} autoFocus>
            Si
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
