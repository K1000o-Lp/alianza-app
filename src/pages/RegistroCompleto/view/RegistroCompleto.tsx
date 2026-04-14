import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChurchIcon from "@mui/icons-material/Church";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useRegistroCompletoMutation, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services/api";
import { useAppSelector } from "../../../redux/store";
import { User } from "../../../types";

interface RegistroCompletoForm {
  nombre_completo: string;
  cedula: string;
  telefono: string;
  fecha_nacimiento: any;
  zona_id: number | "";
  nombre_usuario: string;
  contrasena: string;
  confirmar_contrasena: string;
}

type ExistingMember = {
  id: number;
  nombre_completo: string;
  zona: { id: number; descripcion: string } | null;
};

const STEPS = ["Información personal", "Cuenta de acceso"];

export const RegistroCompleto: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const zonaIdParam = searchParams.get("zona_id");
  const zonaFija = zonaIdParam ? Number(zonaIdParam) : null;

  const [activeStep, setActiveStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [existingMember, setExistingMember] = useState<ExistingMember | null>(null);
  const [pendingFormData, setPendingFormData] = useState<Omit<RegistroCompletoForm, 'confirmar_contrasena'> | null>(null);

  const { user, isLogged } = useAppSelector((state) => state.auth);

  // This route is public, so PrivateRoute never runs and Redux may not have decoded the token yet.
  // Fall back to decoding localStorage token directly.
  const tokenUser = React.useMemo<User | null>(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode<{ session: User; exp: number }>(token);
      if (decoded.exp * 1000 > Date.now()) return decoded.session;
    } catch {}
    return null;
  }, []);

  const effectiveUser = user ?? tokenUser;
  const effectivelyLogged = isLogged || !!tokenUser;

  const [putMember, putResult] = usePutMembersMutation();

  const { data: zonas } = useGetZonesQuery();
  const [registrar, { isLoading, isSuccess, isError, error }] = useRegistroCompletoMutation();

  const zonaNombre = zonas?.find((z) => z.id === zonaFija)?.descripcion;

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegistroCompletoForm>({
    defaultValues: { zona_id: zonaFija ?? "" },
  });

  const errorMessage =
    isError && (error as any)?.data?.message
      ? (error as any).data.message
      : "Ocurrió un error. Intenta de nuevo.";

  const handleNext = async () => {
    const valid = await trigger(["nombre_completo", "cedula", "telefono", "fecha_nacimiento", "zona_id"]);
    if (valid) setActiveStep(1);
  };

  const onSubmit: SubmitHandler<RegistroCompletoForm> = ({ confirmar_contrasena: _, ...data }) => {
    const payload = {
      nombre_completo: data.nombre_completo,
      cedula: data.cedula,
      telefono: data.telefono,
      fecha_nacimiento: dayjs(data.fecha_nacimiento).toDate(),
      zona_id: Number(data.zona_id),
      nombre_usuario: data.nombre_usuario.toLowerCase(),
      contrasena: data.contrasena,
    };
    setPendingFormData(data);
    registrar(payload).unwrap().catch((err: any) => {
      if (err?.status === 409 && err?.data?.miembro) {
        setExistingMember(err.data.miembro as ExistingMember);
      }
    });
  };

  const handleTransferir = () => {
    if (!pendingFormData) return;
    registrar({
      nombre_completo: pendingFormData.nombre_completo,
      cedula: pendingFormData.cedula,
      telefono: pendingFormData.telefono,
      fecha_nacimiento: dayjs(pendingFormData.fecha_nacimiento).toDate(),
      zona_id: Number(pendingFormData.zona_id),
      nombre_usuario: pendingFormData.nombre_usuario.toLowerCase(),
      contrasena: pendingFormData.contrasena,
      transferir: true,
    });
    setExistingMember(null);
  };

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => navigate("/"), 3000);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (putResult.isSuccess) {
      setTimeout(() => navigate("/"), 2500);
    }
  }, [putResult.isSuccess]);

  // Usuario ya autenticado: ofrecer transferencia de zona
  if (effectivelyLogged && zonaFija) {
    const wrapperSx = {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1565c0 0%, #283593 50%, #0d47a1 100%)",
      px: 2,
    };

    if (putResult.isSuccess) {
      return (
        <Box sx={wrapperSx}>
          <Paper sx={{ p: 5, maxWidth: 440, textAlign: "center", borderRadius: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
            <Typography variant="h5" fontWeight={700} mt={2}>
              ¡Transferencia exitosa!
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              Ahora perteneces a la zona <strong>{zonaNombre}</strong>.
            </Typography>
            <Typography variant="caption" color="text.disabled" mt={2} display="block">
              Redirigiendo al inicio...
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={wrapperSx}>
        <Paper sx={{ p: 5, maxWidth: 440, textAlign: "center", borderRadius: 4 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", mx: "auto", mb: 2 }}>
            <ChurchIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            Cambio de zona
          </Typography>
          {zonaNombre && (
            <Typography variant="body1" color="text.secondary" mt={1}>
              ¿Deseas unirte a la zona <strong>{zonaNombre}</strong>?
            </Typography>
          )}
          {putResult.isError && (
            <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
              Ocurrió un error. Intenta de nuevo.
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              disabled={putResult.isLoading}
            >
              No, volver al inicio
            </Button>
            <Button
              variant="contained"
              disabled={putResult.isLoading || !effectiveUser?.miembro?.id}
              onClick={() =>
                putMember({ id: effectiveUser!.miembro.id, historial: { zona_id: zonaFija } })
              }
            >
              {putResult.isLoading ? <CircularProgress size={20} /> : "Sí, transferirme"}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (isSuccess) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: "primary.main" }}
      >
        <Paper sx={{ p: 5, maxWidth: 440, textAlign: "center", borderRadius: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
          <Typography variant="h5" fontWeight={700} mt={2}>
            ¡Bienvenido/a a Alianza!
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Tu cuenta ha sido creada exitosamente. Estamos felices de tenerte con nosotros.
          </Typography>
          <Typography variant="caption" color="text.disabled" mt={2} display="block">
            Redirigiendo al inicio...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "linear-gradient(135deg, #1565c0 0%, #283593 50%, #0d47a1 100%)",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: "white", mx: "auto", mb: 2 }}>
            <ChurchIcon sx={{ fontSize: 42, color: "primary.main" }} />
          </Avatar>
          <Typography variant="h4" fontWeight={700} color="white">
            Iglesia Alianza
          </Typography>
          {zonaFija && zonaNombre && (
            <Typography variant="subtitle1" color="primary.100" sx={{ opacity: 0.85, mt: 0.5 }}>
              Zona {zonaNombre}
            </Typography>
          )}
          <Typography variant="body2" color="white" sx={{ opacity: 0.75, mt: 1 }}>
            Crea tu cuenta y forma parte de nuestra comunidad
          </Typography>
        </Box>

        <Paper sx={{ borderRadius: 3, p: { xs: 3, md: 4 } }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {isError && !existingMember && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {existingMember && (
            <Alert
              severity="warning"
              sx={{ mb: 3 }}
              action={
                zonaFija && existingMember.zona?.id !== zonaFija ? (
                  <Button color="inherit" size="small" onClick={handleTransferir} disabled={isLoading}>
                    Transferir
                  </Button>
                ) : undefined
              }
            >
              <strong>{existingMember.nombre_completo}</strong> ya está registrado/a
              {existingMember.zona ? (
                <> en la zona <strong>{existingMember.zona.descripcion}</strong></>
              ) : (
                " sin zona asignada"
              )}.
              {zonaFija && existingMember.zona?.id !== zonaFija && (
                <> ¿Deseas transferirte a esta zona?</>
              )}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0 – Personal info */}
            {activeStep === 0 && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Nombre completo *"
                  autoComplete="off"
                  {...register("nombre_completo", {
                    required: "Campo obligatorio",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                  })}
                  error={!!errors.nombre_completo}
                  helperText={errors.nombre_completo?.message}
                  inputProps={{ style: { textTransform: "uppercase" } }}
                />

                <TextField
                  fullWidth
                  label="Cédula *"
                  autoComplete="off"
                  {...register("cedula", {
                    required: "Campo obligatorio",
                    pattern: { value: /^[0-9]+$/, message: "Solo números" },
                  })}
                  error={!!errors.cedula}
                  helperText={errors.cedula?.message}
                />

                <TextField
                  fullWidth
                  label="Teléfono *"
                  autoComplete="tel"
                  type="tel"
                  {...register("telefono", {
                    required: "Campo obligatorio",
                    pattern: { value: /^[0-9+\-\s()]+$/, message: "Número de teléfono inválido" },
                  })}
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                />

                <Controller
                  control={control}
                  name="fecha_nacimiento"
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field: { onChange, value }, fieldState: { error: err } }) => (
                    <DatePicker
                      label="Fecha de nacimiento *"
                      value={value ? dayjs(value) : null}
                      onChange={onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!err,
                          helperText: err?.message,
                        },
                      }}
                    />
                  )}
                />

                {!zonaFija && (
                  <Controller
                    control={control}
                    name="zona_id"
                    rules={{ required: "Selecciona tu zona" }}
                    render={({ field, fieldState: { error: err } }) => (
                      <FormControl fullWidth error={!!err}>
                        <InputLabel>Zona *</InputLabel>
                        <Select {...field} label="Zona *">
                          <MenuItem value="" />
                          {zonas?.map((z) => (
                            <MenuItem key={z.id} value={z.id}>
                              {z.descripcion}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{err?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                )}

                <Button variant="contained" size="large" onClick={handleNext} fullWidth>
                  Siguiente
                </Button>
              </Box>
            )}

            {/* Step 1 – Account */}
            {activeStep === 1 && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Nombre de usuario *"
                  autoComplete="username"
                  {...register("nombre_usuario", {
                    required: "Campo obligatorio",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                    pattern: {
                      value: /^[a-z0-9_]+$/,
                      message: "Solo letras minúsculas, números y _",
                    },
                  })}
                  error={!!errors.nombre_usuario}
                  helperText={errors.nombre_usuario?.message ?? "Ej: camilo1234"}
                />

                <TextField
                  fullWidth
                  label="Contraseña *"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("contrasena", {
                    required: "Campo obligatorio",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                  error={!!errors.contrasena}
                  helperText={errors.contrasena?.message}
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

                <TextField
                  fullWidth
                  label="Confirmar contraseña *"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmar_contrasena", {
                    required: "Campo obligatorio",
                    validate: (val) =>
                      val === watch("contrasena") || "Las contraseñas no coinciden",
                  })}
                  error={!!errors.confirmar_contrasena}
                  helperText={errors.confirmar_contrasena?.message}
                />

                <Divider />

                <Box display="flex" gap={1}>
                  <Button variant="outlined" fullWidth onClick={() => setActiveStep(0)}>
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
                  >
                    {isLoading ? "Registrando..." : "Crear cuenta"}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
