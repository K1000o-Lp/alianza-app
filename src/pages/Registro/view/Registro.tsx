import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Derechos de autor © "}
      <Link color="inherit" href="https://github.com/K1000o-Lp">
        K1000o-lp
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { RegistroForm } from "../../../types";
import { useRegistrarUsuarioMutation, useGetZonesQuery } from "../../../redux/services";

interface RegistroFormWithConfirm extends RegistroForm {
  confirmar_contrasena: string;
}

export function Registro() {
  const navigate = useNavigate();
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<RegistroFormWithConfirm>();
  const [registrar, result] = useRegistrarUsuarioMutation();
  const { data: zonas, isLoading: zonasLoading } = useGetZonesQuery();

  const errorMessage =
    result.error && "data" in result.error
      ? (result.error.data as { message: string }).message
      : "Error al crear cuenta";

  const onSubmit: SubmitHandler<RegistroFormWithConfirm> = ({ confirmar_contrasena: _, ...data }) => registrar(data);

  React.useEffect(() => {
    if (result.isSuccess) {
      setTimeout(() => navigate("/"), 1500);
    }
  }, [result.isSuccess]);

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "url(/cuadruple_bg.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <HowToRegIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Crear cuenta
          </Typography>

          {result.isError && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {errorMessage}
            </Alert>
          )}

          {result.isSuccess && (
            <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
              Cuenta creada exitosamente. Redirigiendo...
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="Cédula"
              autoComplete="off"
              helperText="Ingresa tu cédula para verificar tu identidad"
              {...register("cedula", {
                pattern: { value: /^[0-9]*$/, message: "Solo se permiten números" },
              })}
              error={!!errors.cedula}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Nombre completo (si no tienes cédula)"
              autoComplete="off"
              {...register("nombre_completo")}
            />

            <Controller
              control={control}
              name="zona_id"
              render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
                <FormControl fullWidth margin="normal" error={invalid}>
                  <InputLabel>Zona (Opcional)</InputLabel>
                  <Select onChange={onChange} value={value ?? ""} label="Zona (Opcional)">
                    <MenuItem value="" />
                    {zonasLoading && <MenuItem value="">Cargando...</MenuItem>}
                    {zonas?.map(({ id, descripcion }) => (
                      <MenuItem key={id} value={id}>
                        {descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre de usuario"
              autoComplete="username"
              {...register("nombre_usuario", {
                required: "Campo obligatorio",
                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: "Solo letras minúsculas, números y guión bajo",
                },
              })}
              error={!!errors.nombre_usuario}
              helperText={errors.nombre_usuario?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              {...register("contrasena", {
                required: "Campo obligatorio",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              error={!!errors.contrasena}
              helperText={errors.contrasena?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              {...register("confirmar_contrasena", {
                required: "Campo obligatorio",
                validate: (val) =>
                  val === watch("contrasena") || "Las contraseñas no coinciden",
              })}
              error={!!errors.confirmar_contrasena}
              helperText={errors.confirmar_contrasena?.message}
            />

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              loading={result.isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              Crear cuenta
            </LoadingButton>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/auth/signin" variant="body2">
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </Grid>
            </Grid>

            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
