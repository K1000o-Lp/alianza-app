import React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import { useParams } from 'react-router-dom';
import { useDeleteConsolidationResultsMutation, useGetMembersWithResultsQuery, useGetRequirementsQuery, useGetSupervisorsQuery, useGetZonesQuery, usePostConsolidationResultsMutation, usePutMembersMutation } from '../../../redux/services';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { consolidationForm, MemberForm, snackBarStatus } from '../../../types';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Fab, FormControl, FormHelperText, Grid2 as Grid, Input, InputLabel, MenuItem, Select, SelectChangeEvent, Skeleton, Snackbar, TextField, alpha } from '@mui/material';
import { useRouter } from '../../../router/hooks';
import { useAppSelector } from '../../../redux/store';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { Add, Edit as EditIcon, ArrowBack } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import ClearIcon from '@mui/icons-material/Clear';
import { calcularPageParam } from '../../../helpers/calcularPageParam';
import { CustomTimeline } from '../components/CustomTimeline';

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
  const { data: memberData, isLoading: memberIsLoading } = useGetMembersWithResultsQuery({ id: String(id) }, { refetchOnMountOrArgChange: true });
  const [ updateMember, resultMember ] = usePutMembersMutation();
  const [ postConsolidationResults, resultPostConsolidation ] = usePostConsolidationResultsMutation();
  const errorMessageInPostConsolidation = resultPostConsolidation.error && "data" in resultPostConsolidation.error ? (resultPostConsolidation.error.data as { message: string }).message : "Error desconocido";

  const [ deleteConsolidationResults, resultDeleteConsolidation ] = useDeleteConsolidationResultsMutation();
  const errorMessageInDeleteConsolidation = resultDeleteConsolidation.error && "data" in resultDeleteConsolidation.error ? (resultDeleteConsolidation.error.data as { message: string }).message : "Error desconocido";

  const memberFormMethods = useForm<MemberForm>();
  const { control: consolidationControl, handleSubmit: consolidationHandleSubmit, setValue, reset: consolidationReset } = useForm<consolidationForm>({ defaultValues: { miembro_id: Number(id) ?? undefined, fecha_consolidacion: dayjs() }});
  const { user } = useAppSelector((state) => state.auth);
  const zonaId = memberFormMethods.watch('historial.zona_id');
  const { data: zones } = useGetZonesQuery();
  const { data: supervisors, isLoading: supervisorsLoading } = useGetSupervisorsQuery(
    { zona_id: zonaId },
    { skip: !zonaId, refetchOnMountOrArgChange: true }
  );

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
      consolidationReset();
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
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              boxShadow: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: { xs: 'auto', md: 500 }
            }}
          >
            <Skeleton variant='rectangular' height={400} />
          </Paper>
        </Grid>
      </Grid>
    )
  }

  // If in modal mode, show a simplified view
  if (isModal) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: `2px solid ${alpha('#000', 0.05)}`
        }}>
          <Typography component="h1" variant="h6" sx={{ fontWeight: 600 }}>
            ✎ EDITAR: { memberData?.[0]?.nombre_completo ?? '' }
          </Typography>
          <Button 
            variant='outlined' 
            size='small' 
            onClick={onClose}
            startIcon={<ClearIcon />}
          >
            Cerrar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Formulario */}
          <Box sx={{ flex: 1 }}>
            <Paper variant="outlined" sx={{ p: 3, boxShadow: 1, height: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Controller
                    control={memberFormMethods.control}
                    name="nombre_completo"
                    defaultValue=""
                    rules={{ required: "Campo obligatorio" }}
                    render={({ field: { value }, fieldState: { invalid, error } }) => (
                      <TextField
                        variant="standard"
                        label="Nombre completo"
                        onChange={(e) => memberFormMethods.setValue("nombre_completo", e.target.value.toUpperCase())}
                        value={value ?? ""}
                        error={invalid}
                        helperText={error?.message}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={memberFormMethods.control}
                    name="cedula"
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                      <TextField
                        variant="standard"
                        label="Cédula (Opcional)"
                        onChange={onChange}
                        value={value ?? ""}
                        error={invalid}
                        helperText={error?.message}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={memberFormMethods.control}
                    name="telefono"
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                      <TextField
                        variant="standard"
                        label="Teléfono (Opcional)"
                        onChange={onChange}
                        value={value ?? ""}
                        error={invalid}
                        helperText={error?.message}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    control={memberFormMethods.control}
                    name="fecha_nacimiento"
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        label="Fecha de nacimiento (Opcional)"
                        value={value ? dayjs(value as any) : null}
                        onChange={onChange}
                        format="DD/MM/YYYY"
                        slotProps={{ textField: { variant: "standard", fullWidth: true } }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    control={memberFormMethods.control}
                    name="historial.zona_id"
                    defaultValue={undefined}
                    render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                      <FormControl error={invalid} fullWidth variant="standard">
                        <InputLabel htmlFor="zona_edit_modal">Zona</InputLabel>
                        <Select
                          inputProps={{ id: "zona_edit_modal" }}
                          onChange={onChange}
                          value={value ?? ""}
                          disabled={user?.zona !== null}
                        >
                          <MenuItem value="" hidden />
                          {zones?.map(({ id, descripcion }) => (
                            <MenuItem key={id} value={id}>{descripcion}</MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{error?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Controller
                    control={memberFormMethods.control}
                    name="historial.supervisor_id"
                    defaultValue={undefined}
                    render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                      <FormControl error={invalid} fullWidth variant="standard">
                        <InputLabel htmlFor="supervisor_edit_modal">Supervisor (Opcional)</InputLabel>
                        <Select
                          inputProps={{ id: "supervisor_edit_modal" }}
                          onChange={onChange}
                          value={value ?? ""}
                        >
                          <MenuItem value="" />
                          {supervisorsLoading && <MenuItem value="">Cargando...</MenuItem>}
                          {supervisors?.map((supervisor: any) => (
                            <MenuItem key={supervisor?.miembro_id} value={supervisor?.miembro_id}>
                              {supervisor?.nombre_completo}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{error?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: 4, gap: 2}}>
                <Button onClick={onClose} variant='outlined'>
                  Cancelar
                </Button>
                <LoadingButton
                  onClick={handleSubmitUpdateMember}
                  type="submit"
                  variant='contained'
                  loading={resultMember.isLoading}
                  startIcon={<EditIcon />}
                >
                  Guardar Cambios
                </LoadingButton>
              </Box>
            </Paper>
          </Box>

          {/* Timeline */}
          <Box sx={{ flex: { xs: 1, md: 0.9 } }}>
            <Paper variant="outlined" sx={{ p: 3, boxShadow: 1, height: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Typography variant='h6' sx={{ marginBottom: 3, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
                📅 Progreso
              </Typography>
              
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <CustomTimeline 
                  items={(memberData?.[0]?.resultados ?? []).map(({ id, creado_en, requisito: { nombre } }) => ({
                    id,
                    nombre,
                    creado_en: creado_en as Date | null
                  })) as any}
                  onDelete={(id) => setOpenDeleteDialog({ open: true, id })}
                />
              </Box>

              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', pt: 3, mt: 'auto', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                <Fab size="small" color="primary" aria-label="Consolidar resultado" onClick={handleClickOpenDialog}>
                  <Add fontSize='small' />
                </Fab>

                <Dialog
                  open={openDialog}
                  onClose={handleCloseDialog}
                  aria-labelledby='dialog-title'
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle id='dialog-title' sx={{ fontWeight: 600 }}>
                    ➕ Consolidar Resultado
                  </DialogTitle>

                  <DialogContent sx={{ pt: 3 }}>
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
                          <FormControl sx={{ mb: 3 }} error={invalid} fullWidth>
                            <InputLabel id="requisito_multiple">Requisito</InputLabel>
                            <Select
                              labelId='requisito_multiple'
                              multiple
                              onChange={handleMultipleRequirementsChange}
                              value={selectedRequirements}
                              input={<Input id="requisito_multiple" />}
                              renderValue={(selected) => (
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={requirementsJson[value]} size='small' />
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
                        defaultValue={dayjs()}
                        rules={{ required: "Campo obligatorio" }}
                        render={({
                          field: { onChange, value },
                          fieldState: { invalid, error },
                        }) => (
                          <DatePicker
                            sx={{ width: '100%', mb: 2 }}
                            onChange={(date) => onChange(date)}
                            value={ value ? dayjs(value) : null }
                            minDate={startOfQuarter}
                            maxDate={endOfQuarter}
                            format='DD/MM/YYYY'
                            slotProps={{
                              textField: {
                                variant: "outlined",
                                label: "Fecha de Consolidación",
                                error: invalid,
                                helperText: error?.message,
                                fullWidth: true,
                              },
                            }}
                          />
                        )}
                      />

                      <DialogActions sx={{ pt: 2 }}>
                        <Button onClick={handleCloseDialog} variant='outlined'>
                          Cancelar
                        </Button>
                        <LoadingButton 
                          type='submit'
                          variant='contained'
                          loading={resultPostConsolidation.isLoading}
                        >
                          Guardar
                        </LoadingButton>
                      </DialogActions>
                    </form>
                  </DialogContent>

                </Dialog>
              </Box>
            </Paper>
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
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
            ⚠️ Confirmar eliminación
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography>¿Estás seguro de que deseas eliminar este resultado consolidado?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} variant='outlined'>No</Button>
            <Button 
              onClick={handleDeleteConsolidation} 
              variant='contained'
              color='error'
              loading={resultDeleteConsolidation.isLoading}
            >
              Sí, eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Grid size={12}>
        <Button 
          variant='outlined' 
          sx={{ marginLeft: { xs: 0, md: 2 } }}
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          Atrás
        </Button>
      </Grid>

      {/* Título */}
      <Grid size={12}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          py: 2,
          backgroundColor: alpha('#000', 0.02),
          borderRadius: 1,
        }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
            👤 EDITAR MIEMBRO: { memberData?.[0]?.nombre_completo ?? '' }
          </Typography>
        </Box>
      </Grid>

      {/* Formulario */}
      <Grid size={{ xs: 12, md: 7}}>
        <Paper
          variant="outlined"
          sx={{ 
            my: { xs: 1.5, md: 2 }, 
            mx: { md: 2 }, 
            p: { xs: 3, md: 4 },
            boxShadow: 1,
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              <Controller
                control={memberFormMethods.control}
                name="nombre_completo"
                defaultValue=""
                rules={{ required: "Campo obligatorio" }}
                render={({ field: { value }, fieldState: { invalid, error } }) => (
                  <TextField
                    variant="standard"
                    label="Nombre completo"
                    onChange={(e) => memberFormMethods.setValue("nombre_completo", e.target.value.toUpperCase())}
                    value={value ?? ""}
                    error={invalid}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={memberFormMethods.control}
                name="cedula"
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                  <TextField
                    variant="standard"
                    label="Cédula (Opcional)"
                    onChange={onChange}
                    value={value ?? ""}
                    error={invalid}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={memberFormMethods.control}
                name="telefono"
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                  <TextField
                    variant="standard"
                    label="Teléfono (Opcional)"
                    onChange={onChange}
                    value={value ?? ""}
                    error={invalid}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                control={memberFormMethods.control}
                name="fecha_nacimiento"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Fecha de nacimiento (Opcional)"
                    value={value ? dayjs(value as any) : null}
                    onChange={onChange}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { variant: "standard", fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={memberFormMethods.control}
                name="historial.zona_id"
                defaultValue={undefined}
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                  <FormControl error={invalid} fullWidth variant="standard">
                    <InputLabel htmlFor="zona_edit_page">Zona</InputLabel>
                    <Select
                      inputProps={{ id: "zona_edit_page" }}
                      onChange={onChange}
                      value={value ?? ""}
                      disabled={user?.zona !== null}
                    >
                      <MenuItem value="" hidden />
                      {zones?.map(({ id, descripcion }) => (
                        <MenuItem key={id} value={id}>{descripcion}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={memberFormMethods.control}
                name="historial.supervisor_id"
                defaultValue={undefined}
                render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                  <FormControl error={invalid} fullWidth variant="standard">
                    <InputLabel htmlFor="supervisor_edit_page">Supervisor (Opcional)</InputLabel>
                    <Select
                      inputProps={{ id: "supervisor_edit_page" }}
                      onChange={onChange}
                      value={value ?? ""}
                    >
                      <MenuItem value="" />
                      {supervisorsLoading && <MenuItem value="">Cargando...</MenuItem>}
                      {supervisors?.map((supervisor: any) => (
                        <MenuItem key={supervisor?.miembro_id} value={supervisor?.miembro_id}>
                          {supervisor?.nombre_completo}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{display: 'flex', justifyContent: 'flex-end', marginTop: 5, gap: 2, pt: 2}}>
              <Button 
                variant='outlined'
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <LoadingButton 
                onClick={handleSubmitUpdateMember} 
                type="submit" 
                variant='contained' 
                loading={resultMember.isLoading}
                startIcon={<EditIcon />}
              >
                Guardar Cambios
              </LoadingButton>
            </Box>
        </Paper>
      </Grid>

      {/* Timeline */}
      <Grid 
        size={{xs: 12, md: 5}} 
        sx={{ my: { xs: 2, md: 0 } }}
      >
        <Paper
          variant="outlined"
          sx={{ 
            p: { xs: 3, md: 4 },
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            mx: { md: 2 },
            my: { xs: 1.5, md: 2 }
          }}
        >
          <Typography variant='h6' sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}>
            📅 Progreso
          </Typography>

          <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
            <CustomTimeline 
              items={(memberData?.[0]?.resultados ?? []).map(({ id, creado_en, requisito: { nombre } }) => ({
                id,
                nombre,
                creado_en: creado_en as Date | null
              })) as any}
              onDelete={(id) => setOpenDeleteDialog({ open: true, id })}
            />
          </Box>

          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', pt: 3, mt: 'auto', borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
            <Fab size="medium" color="primary" aria-label="Consolidar resultado" onClick={handleClickOpenDialog}>
              <Add />
            </Fab>

            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              aria-labelledby='dialog-title'
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle id='dialog-title' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                ➕ Consolidar Resultado
              </DialogTitle>

              <DialogContent sx={{ pt: 3 }}>
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
                      <FormControl sx={{ mb: 3 }} error={invalid} fullWidth>
                        <InputLabel id="requisito_multiple">Requisito</InputLabel>
                        <Select
                          labelId='requisito_multiple'
                          multiple
                          onChange={handleMultipleRequirementsChange}
                          value={selectedRequirements}
                          input={<Input id="requisito_multiple" />}
                          renderValue={(selected: any[]) => (
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                              {selected.map((value) => (
                                <Chip key={value} label={requirementsJson[value]} size='small' variant='outlined' />
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
                    defaultValue={dayjs()}
                    render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                      <DatePicker
                        sx={{ width: '100%', mb: 2 }}
                        onChange={(date: any) => onChange(date)}
                        value={ value ? dayjs(value) : null }
                        minDate={startOfQuarter}
                        maxDate={endOfQuarter}
                        format='DD/MM/YYYY'
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            label: "Fecha de Consolidación",
                            error: invalid,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    )}
                  />

                  <DialogActions sx={{ pt: 2, gap: 1 }}>
                    <Button onClick={handleCloseDialog} variant='outlined'>
                      Cancelar
                    </Button>
                    <LoadingButton 
                      type='submit'
                      variant='contained'
                      loading={resultPostConsolidation.isLoading}
                      startIcon={<Add />}
                    >
                      Guardar
                    </LoadingButton>
                  </DialogActions>
                </form>
              </DialogContent>

            </Dialog>
          </Box>
        </Paper>
      </Grid>

      {/* Snackbar */}
      <Snackbar 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog.open}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          ⚠️ Confirmar eliminación
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>¿Estás seguro de que deseas eliminar este resultado consolidado?</Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={handleCloseDeleteDialog} variant='outlined'>No</Button>
          <Button 
            onClick={handleDeleteConsolidation} 
            variant='contained'
            color='error'
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
