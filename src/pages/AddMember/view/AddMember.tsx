import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import {
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2 as Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import { MemberForm } from "../../../types";
import { config } from "../../../config";
import { usePostMembersMutation, useGetSupervisorsQuery, useGetZonesQuery, useCrearUsuarioMutation, useGetRequirementsQuery, usePutMembersMutation, useCrearSolicitudTransferenciaMutation } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";

type ExistingMember = {
  id: number;
  nombre_completo: string;
  zona: { id: number; descripcion: string } | null;
};

export const AddMember: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const zonaIdUsuario = user?.zona?.id;
  const esAdmin = user?.rol?.nombre === 'admin';

  // Admin no tiene zona: permite seleccionar; pastores usan la suya
  const [zonaSeleccionada, setZonaSeleccionada] = React.useState<number | "">(zonaIdUsuario ?? "");

  const { control, handleSubmit, setValue } = useForm<MemberForm>({
    defaultValues: { historial: { zona_id: zonaIdUsuario } },
  });

  const router = useRouter();
  const [postMember, result] = usePostMembersMutation();
  const [putMember, putResult] = usePutMembersMutation();
  const [crearSolicitud, solicitudResult] = useCrearSolicitudTransferenciaMutation();
  const [crearUsuario] = useCrearUsuarioMutation();
  const { isLoading, isSuccess, isError, error, data: memberData } = result;
  const [existingMember, setExistingMember] = React.useState<ExistingMember | null>(null);
  const [solicitudDuplicada, setSolicitudDuplicada] = React.useState(false);
  const errorMessage = error && "data" in error
    ? (error.data as { message: string }).message
    : "Error desconocido";

  // Procesos de formación
  const [selectedRequirements, setSelectedRequirements] = React.useState<string[]>([]);
  const { data: requirementsData, isLoading: requirementsIsLoading, isError: requirementsError } = useGetRequirementsQuery({}, { refetchOnMountOrArgChange: true });

  const handleRequirementsChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    const next = typeof value === "string" ? value.split(",") : value;
    setSelectedRequirements(next);
    setValue("requisito.requisito_ids", next.map(Number));
  };

  // Crear cuenta de usuario opcional
  const [crearCuenta, setCrearCuenta] = React.useState(false);
  const [nombreUsuario, setNombreUsuario] = React.useState("");
  const [contrasena, setContrasena] = React.useState("");
  const [confirmarContrasena, setConfirmarContrasena] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirmPass, setShowConfirmPass] = React.useState(false);

  const contrasenasMismatch = crearCuenta && contrasena.length > 0 && confirmarContrasena.length > 0 && contrasena !== confirmarContrasena;

  const { data: zonas } = useGetZonesQuery();
  const { data: supervisors, isLoading: supervisorsLoading } = useGetSupervisorsQuery(
    { zona_id: zonaSeleccionada as number },
    { skip: !zonaSeleccionada },
  );

  const handleZonaChange = (zonaId: number | "") => {
    setZonaSeleccionada(zonaId);
    setValue("historial.zona_id", zonaId || undefined);
    setValue("historial.supervisor_id", undefined);
  };

  const onSubmit: SubmitHandler<MemberForm> = async (data) => {
    try {
      const miembro = await postMember(data).unwrap();
      if (crearCuenta && nombreUsuario && contrasena && miembro?.id) {
        await crearUsuario({
          nombre_usuario: nombreUsuario.toLowerCase(),
          contrasena,
          rol_nombre: 'miembros',
          miembro_id: miembro.id,
          ...(zonaSeleccionada ? { zona_id: zonaSeleccionada as number } : {}),
        }).catch(() => {}); // usuario creation is non-blocking
      }
    } catch (err: any) {
      if (err?.status === 409 && err?.data?.miembro) {
        setExistingMember(err.data.miembro as ExistingMember);
      }
    }
  };

  const zona0Id = Number(config().ZONA_0);

  const handleTransferir = async () => {
    if (!existingMember || !zonaSeleccionada) return;
    const enZona0 = !existingMember.zona || existingMember.zona.id === zona0Id;
    if (esAdmin || enZona0) {
      // Admin or member in zona_0: direct transfer
      await putMember({ id: existingMember.id, historial: { zona_id: zonaSeleccionada as number } }).unwrap().catch(() => {});
    } else {
      // Pastor: member is in another zone → create a transfer request
      await crearSolicitud({
        miembro_id: existingMember.id,
        zona_origen_id: existingMember.zona!.id,
        zona_destino_id: zonaSeleccionada as number,
        solicitante_id: user?.id,
      }).unwrap().catch((err: any) => {
        if (err?.status === 409) setSolicitudDuplicada(true);
      });
    }
  };

  React.useEffect(() => {
    if (putResult.isSuccess) {
      setTimeout(() => router.reload(), 2500);
    }
  }, [putResult.isSuccess]);



  React.useEffect(() => {
    if (isSuccess) {
      setTimeout(() => router.reload(), 2500);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <Paper variant="outlined" sx={{ my: { xs: 1.5, md: 3 }, width: 500, p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Miembro registrado exitosamente.
          </Typography>
          <Typography variant="subtitle1">
            {memberData?.nombre_completo} ha sido registrada/o exitosamente.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (isError && existingMember) {
    const puedeAccionar = zonaSeleccionada && existingMember.zona?.id !== zonaSeleccionada;
    const enZona0 = !existingMember.zona || existingMember.zona.id === zona0Id;
    const transfereDirectamente = esAdmin || enZona0;
    const accionPendiente = transfereDirectamente ? putResult : solicitudResult;

    return (
      <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <Paper variant="outlined" sx={{ my: { xs: 1.5, md: 3 }, width: 500, p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Miembro ya registrado
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>{existingMember.nombre_completo}</strong> ya se encuentra registrado/a
            {existingMember.zona ? (
              <> en la zona <strong>{existingMember.zona.descripcion}</strong></>
            ) : (
              " sin zona asignada"
            )}.
          </Typography>

          {solicitudDuplicada ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" color="warning.main" sx={{ mb: 2 }}>
                Ya existe una solicitud de transferencia pendiente para este miembro. Puedes verla en el listado de solicitudes.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" onClick={() => router.push("/miembros/crear")}>
                  Agregar otro miembro
                </Button>
                <Button variant="outlined" onClick={() => router.push("/solicitudes/transferencia")}>
                  Ver solicitudes de transferencia
                </Button>
              </Box>
            </Box>
          ) : (
            <>
          {puedeAccionar && !accionPendiente.isSuccess && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {transfereDirectamente
                ? "¿Desea transferirlo/a a la zona seleccionada?"
                : "¿Desea enviar una solicitud de transferencia a la zona de origen para aprobación?"}
            </Typography>
          )}

          {accionPendiente.isSuccess ? (
            <Box sx={{ mt: 1 }}>
              {esAdmin ? (
                <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                  Transferencia realizada exitosamente.
                </Typography>
              ) : (
                <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                  Solicitud de transferencia enviada. El pastor de la zona de origen debe aprobarla.
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" onClick={() => router.push("/miembros/crear")}>
                  Agregar otro miembro
                </Button>
                {!transfereDirectamente && (
                  <Button variant="outlined" onClick={() => router.push("/solicitudes/transferencia")}>
                    Ver solicitudes de transferencia
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {puedeAccionar && (
                <LoadingButton
                  variant="contained"
                  loading={accionPendiente.isLoading}
                  onClick={handleTransferir}
                >
                  {transfereDirectamente ? "Transferir" : "Solicitar transferencia"}
                </LoadingButton>
              )}
              <LoadingButton variant="outlined" onClick={() => router.reload()}>
                Volver
              </LoadingButton>
            </Box>
          )}
            </>
          )}
        </Paper>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
        <Paper variant="outlined" sx={{ my: { xs: 1.5, md: 3 }, width: 500, p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Error al registrar miembro.
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
          <LoadingButton variant="contained" onClick={() => router.reload()}>
            Volver a intentar
          </LoadingButton>
        </Paper>
      </Box>
    );
  }

  return (
    <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
      <Paper
        variant="outlined"
        sx={{ my: { xs: 1.5, md: 3 }, width: 500, p: { xs: 2, md: 3 } }}
      >
        <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
          Registrar miembro
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Controller
              control={control}
              name="nombre_completo"
              defaultValue=""
              rules={{ required: "Campo obligatorio" }}
              render={({ field: { value }, fieldState: { invalid, error } }) => (
                <TextField
                  variant="standard"
                  label="Nombre completo"
                  onChange={(e) => setValue("nombre_completo", e.target.value.toUpperCase())}
                  value={value}
                  error={invalid}
                  helperText={error?.message}
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              control={control}
              name="cedula"
              defaultValue=""
              rules={{
                pattern: { value: /^[0-9]*$/, message: "Solo se permiten números" },
              }}
              render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              control={control}
              name="telefono"
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              control={control}
              name="fecha_nacimiento"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label="Fecha de nacimiento (Opcional)"
                  value={value ? dayjs(value as any) : null}
                  onChange={onChange}
                  slotProps={{
                    textField: { variant: "standard", fullWidth: true },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <FormControl fullWidth variant="standard" required error={zonaSeleccionada === ""}>
              <InputLabel htmlFor="zona_select">Zona</InputLabel>
              <Select
                inputProps={{ id: "zona_select" }}
                value={zonaSeleccionada}
                onChange={(e) => handleZonaChange(e.target.value as number | "")}
                disabled={!!zonaIdUsuario}
              >
                <MenuItem value="" />
                {zonas?.map(({ id, descripcion }) => (
                  <MenuItem key={id} value={id}>
                    {descripcion}
                  </MenuItem>
                ))}
              </Select>
              {zonaSeleccionada === "" && (
                <FormHelperText>Campo obligatorio</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={12}>
            <Controller
              control={control}
              name="historial.supervisor_id"
              render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                <FormControl error={invalid} fullWidth variant="standard">
                  <InputLabel htmlFor="supervisor_native">
                    Supervisor (Opcional)
                  </InputLabel>
                  <Select
                    inputProps={{ id: "supervisor_native" }}
                    onChange={onChange}
                    value={value ?? ""}
                  >
                    <MenuItem value="" hidden />
                    {supervisorsLoading && (
                      <MenuItem value="">Cargando...</MenuItem>
                    )}
                    {supervisors?.map(({ id, miembro }) => (
                      <MenuItem key={id} value={id}>
                        {miembro.nombre_completo}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              control={control}
              name="requisito.requisito_ids"
              render={({ fieldState: { invalid, error } }) => (
                <FormControl error={invalid} fullWidth variant="standard">
                  <InputLabel id="req-label">Procesos de formación (Opcional)</InputLabel>
                  <Select
                    labelId="req-label"
                    multiple
                    value={selectedRequirements}
                    onChange={handleRequirementsChange}
                    input={<Input />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((v) => (
                          <Chip key={v} label={requirementsData?.find((r) => String(r.id) === String(v))?.nombre ?? v} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="" hidden />
                    {requirementsIsLoading && <MenuItem value="">Cargando...</MenuItem>}
                    {!requirementsError && requirementsData?.map(({ id, nombre }) => (
                      <MenuItem key={id} value={String(id)}>{nombre}</MenuItem>
                    ))}
                    {!requirementsError && requirementsData?.length === 0 && (
                      <MenuItem value="">No hay requisitos disponibles</MenuItem>
                    )}
                  </Select>
                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <FormControlLabel
          control={<Checkbox checked={crearCuenta} onChange={(e) => setCrearCuenta(e.target.checked)} />}
          label="Crear cuenta de usuario para este miembro"
        />

        <Collapse in={crearCuenta}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="standard"
                label="Nombre de usuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                inputProps={{ autoComplete: "off" }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="standard"
                label="Contraseña"
                type={showPass ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                inputProps={{ autoComplete: "new-password" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass((s) => !s)}>
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                variant="standard"
                label="Confirmar contraseña"
                type={showConfirmPass ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                error={contrasenasMismatch}
                helperText={contrasenasMismatch ? "Las contraseñas no coinciden" : ""}
                inputProps={{ autoComplete: "new-password" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPass((s) => !s)}>
                        {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Collapse>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            disabled={isLoading || zonaSeleccionada === "" || (crearCuenta && (!nombreUsuario || !contrasena || !confirmarContrasena || contrasenasMismatch))}
          >
            Registrar
          </LoadingButton>
        </Box>
        </Box>
      </Paper>
    </Box>
  );
};

