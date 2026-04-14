import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  alpha,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import {
  useGetMembersWithResultsQuery,
  useGetRequirementsQuery,
  usePostConsolidationResultsMutation,
  useDeleteConsolidationResultsMutation,
} from "../../../redux/services/api";
import { consolidationForm } from "../../../types";
import { CustomTimeline } from "../../EditMember/components/CustomTimeline";

dayjs.extend(quarterOfYear);

const requirementsJson: Record<number, string> = {
  1: "GRUPO DE CONEXION",
  2: "PRIMEROS PASOS",
  3: "BAUTISMO",
  4: "ENCUENTRO",
  5: "POS ENCUENTRO",
  6: "DOCTRINAS 1",
  7: "DOCTRINAS 2",
  8: "ENTRENAMIENTO LIDERAZGO",
  9: "LIDERAZGO",
  10: "ENCUENTRO DE ORACION",
  11: "LIDER",
};

const getQuarterStartEnd = () => {
  const q = dayjs().quarter();
  return {
    startOfQuarter: dayjs().quarter(q).startOf("quarter"),
    endOfQuarter: dayjs().quarter(q).endOf("quarter"),
  };
};

export const RegistrarFormacion: React.FC = () => {
  const { miembro_id } = useParams<{ miembro_id: string }>();
  const navigate = useNavigate();
  const { startOfQuarter, endOfQuarter } = getQuarterStartEnd();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState<{ open: boolean; id?: number }>({ open: false });
  const [selectedRequirements, setSelectedRequirements] = React.useState<string[]>([]);

  const { data: memberData, isLoading: memberIsLoading } = useGetMembersWithResultsQuery(
    { id: miembro_id },
    { skip: !miembro_id, refetchOnMountOrArgChange: true },
  );

  const member = memberData?.[0];
  const completedIds = member?.resultados?.map((r) => r.requisito.id) ?? [];

  const { data: requirementsData, isLoading: requirementsIsLoading, isError: requirementsError } =
    useGetRequirementsQuery(
      { requisitos: completedIds },
      { skip: !miembro_id, refetchOnMountOrArgChange: true },
    );

  const [postConsolidationResults, resultPostConsolidation] = usePostConsolidationResultsMutation();
  const [deleteConsolidationResults, resultDeleteConsolidation] = useDeleteConsolidationResultsMutation();

  const { control, handleSubmit, reset } = useForm<consolidationForm>({
    defaultValues: {
      miembro_id: miembro_id ? Number(miembro_id) : undefined,
      requisito_ids: [],
      fecha_consolidacion: dayjs().toDate(),
    },
  });

  const handleClickOpenDialog = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequirements([]);
    reset({ miembro_id: Number(miembro_id), requisito_ids: [], fecha_consolidacion: dayjs().toDate() });
  };

  const handleMultipleRequirementsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const { value } = event.target;
    setSelectedRequirements(typeof value === "string" ? value.split(",") : (value as string[]));
  };

  const onSubmitConsolidation: SubmitHandler<consolidationForm> = async (data) => {
    await postConsolidationResults({ ...data, requisito_ids: selectedRequirements.map(Number) }).unwrap();
    handleCloseDialog();
  };

  const handleConfirmDelete = async () => {
    if (openDeleteDialog.id) {
      await deleteConsolidationResults({ id: openDeleteDialog.id, pageParam: 0 }).unwrap();
    }
    setOpenDeleteDialog({ open: false });
  };

  if (memberIsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!member) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Miembro no encontrado.
        </Typography>
        <Box mt={2}>
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />} variant="text">
          Volver
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          color="primary.main"
          textAlign="center"
          mb={0.5}
        >
          Progreso de Formacion
        </Typography>
        <Typography variant="subtitle1" textAlign="center" fontWeight={600} mb={3}>
          {member.nombre_completo}
        </Typography>

        <Box sx={{ overflowY: "auto", pr: 1, mb: 2 }}>
          <CustomTimeline
            items={(member.resultados ?? []).map(({ id, creado_en, requisito: { nombre } }) => ({
              id,
              nombre,
              creado_en: creado_en as Date | null,
            }))}
            onDelete={(id) => setOpenDeleteDialog({ open: true, id })}
          />
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          pt={2}
          sx={{ borderTop: `1px solid ${alpha("#000", 0.08)}` }}
        >
          <Fab
            size="small"
            color="primary"
            aria-label="Consolidar resultado"
            onClick={handleClickOpenDialog}
          >
            <Add fontSize="small" />
          </Fab>
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Consolidar Resultado</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <form id="consolidation_form" onSubmit={handleSubmit(onSubmitConsolidation)}>
            <Controller
              control={control}
              name="miembro_id"
              render={({ field: { value, onChange } }) => (
                <input type="hidden" value={value} onChange={onChange} />
              )}
            />

            <Controller
              control={control}
              name="requisito_ids"
              rules={{ required: "Campo obligatorio" }}
              render={({ fieldState: { invalid, error } }) => (
                <FormControl sx={{ mb: 3 }} error={invalid} fullWidth>
                  <InputLabel id="req-label">Requisito</InputLabel>
                  <Select
                    labelId="req-label"
                    multiple
                    value={selectedRequirements}
                    onChange={handleMultipleRequirementsChange as any}
                    input={<Input />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((v) => (
                          <Chip key={v} label={requirementsJson[Number(v)]} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="" hidden />
                    {requirementsIsLoading && <MenuItem value="">Cargando...</MenuItem>}
                    {!requirementsError &&
                      requirementsData?.map(({ id, nombre }) => (
                        <MenuItem key={`req-${id}`} value={id}>
                          {nombre}
                        </MenuItem>
                      ))}
                    {!requirementsError && requirementsData?.length === 0 && (
                      <MenuItem value="">No hay requisitos disponibles</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="fecha_consolidacion"
              defaultValue={dayjs().toDate()}
              rules={{ required: "Campo obligatorio" }}
              render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                <DatePicker
                  sx={{ width: "100%", mb: 2 }}
                  onChange={(date) => onChange(date)}
                  value={value ? dayjs(value) : null}
                  minDate={startOfQuarter}
                  maxDate={endOfQuarter}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      variant: "outlined",
                      label: "Fecha de Consolidacion",
                      error: invalid,
                      helperText: error?.message,
                      fullWidth: true,
                    },
                  }}
                />
              )}
            />

            <DialogActions sx={{ pt: 2 }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Cancelar
              </Button>
              <LoadingButton
                loading={resultPostConsolidation.isLoading}
                type="submit"
                form="consolidation_form"
                variant="contained"
              >
                Guardar
              </LoadingButton>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDeleteDialog.open}
        onClose={() => setOpenDeleteDialog({ open: false })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar resultado</DialogTitle>
        <DialogContent>
          <Typography>Estas seguro de que deseas eliminar este resultado?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog({ open: false })} variant="outlined">
            Cancelar
          </Button>
          <LoadingButton
            loading={resultDeleteConsolidation.isLoading}
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Eliminar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
