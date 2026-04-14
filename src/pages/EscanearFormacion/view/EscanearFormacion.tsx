import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChurchIcon from "@mui/icons-material/Church";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import InfoIcon from "@mui/icons-material/Info";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Html5Qrcode } from "html5-qrcode";
import {
  useIniciarSesionMutation,
  usePostResultadoSesionMutation,
  useGetRequirementsQuery,
} from "../../../redux/services/api";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setUser, logOut } from "../../../redux/features/authSlice";
import { IniciarSesionForm, User } from "../../../types";

// ─── Inner QR Scanner ──────────────────────────────────────────────────────────

const SCAN_ID = "alianza-qr-reader";

// Module-level promise chain ensures each start waits for the previous stop (fixes StrictMode double-mount)
let scannerStopChain: Promise<void> = Promise.resolve();

interface QrScannerPanelProps {
  onScan: (text: string) => void;
  onCameraError: (msg: string) => void;
}

const QrScannerPanel: React.FC<QrScannerPanelProps> = ({ onScan, onCameraError }) => {
  const cbRef = useRef({ onScan, onCameraError });
  cbRef.current = { onScan, onCameraError };

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;
    let cancelled = false;

    // Wait for any previous stop to complete before starting
    const startPromise = scannerStopChain.then(async () => {
      if (cancelled) return;
      const el = document.getElementById(SCAN_ID);
      if (!el) return;
      el.innerHTML = "";
      scanner = new Html5Qrcode(SCAN_ID);
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => {
            cbRef.current.onScan(text);
            scanner?.stop().then(() => scanner?.clear()).catch(() => {});
          },
          () => {},
        );
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          typeof err === "string"
            ? err
            : "No se pudo acceder a la cámara. Asegúrate de permitir el acceso.";
        cbRef.current.onCameraError(msg);
      }
    });

    return () => {
      cancelled = true;
      // Chain this stop so the next mount waits for it
      scannerStopChain = startPromise.then(async () => {
        try {
          if (scanner?.isScanning) await scanner.stop();
          scanner?.clear();
        } catch {
          // ignore cleanup errors
        }
      });
    };
  }, []);

  return (
    <Box width="100%">
      <div id={SCAN_ID} style={{ width: "100%" }} />
    </Box>
  );
};

// ─── Helper layout ────────────────────────────────────────────────────────────

const FullScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    minHeight="100vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{ bgcolor: "background.default", px: 2 }}
  >
    {children}
  </Box>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export const EscanearFormacion: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLogged } = useAppSelector((state) => state.auth);

  const [sessionChecked, setSessionChecked] = useState(false);
  const [requisitoId, setRequisitoId] = useState<number | null>(
    searchParams.get("requisito_id") ? Number(searchParams.get("requisito_id")) : null,
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const hasRegisteredRef = useRef(false);

  const { data: requisitos } = useGetRequirementsQuery(null, { skip: !requisitoId });
  const requisito = requisitos?.find((r) => r.id === requisitoId);

  const [iniciarSesion, loginResult] = useIniciarSesionMutation();
  const [registrar, registrarResult] = usePostResultadoSesionMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<IniciarSesionForm>();

  // Restore session from localStorage on direct navigation (e.g., from QR scan)
  useEffect(() => {
    if (!isLogged) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ session: User; exp: number }>(token);
          if (decoded.exp * 1000 >= Date.now()) {
            dispatch(setUser(decoded.session));
          } else {
            dispatch(logOut());
            localStorage.removeItem("token");
          }
        } catch {
          dispatch(logOut());
          localStorage.removeItem("token");
        }
      }
    }
    setSessionChecked(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-register once user is confirmed + requisito is known
  useEffect(() => {
    if (
      sessionChecked &&
      requisitoId &&
      isLogged &&
      user?.miembro &&
      !hasRegisteredRef.current
    ) {
      hasRegisteredRef.current = true;
      registrar({ requisito_id: requisitoId });
    }
  }, [sessionChecked, isLogged, user?.id, requisitoId, registrar]);

  // Handle QR scan: extract requisito_id from the scanned URL
  const handleQrScan = (text: string) => {
    setScanError(null);
    try {
      let rid: string | null = null;
      try {
        rid = new URL(text).searchParams.get("requisito_id");
      } catch {
        if (/^\d+$/.test(text.trim())) rid = text.trim();
      }
      if (rid && !isNaN(Number(rid))) {
        const numId = Number(rid);
        setRequisitoId(numId);
        setSearchParams({ requisito_id: String(numId) });
      } else {
        setScanError("QR no reconocido. Asegúrate de escanear el código correcto.");
      }
    } catch {
      setScanError("QR inválido.");
    }
  };

  const onLoginSubmit: SubmitHandler<IniciarSesionForm> = (data) => iniciarSesion(data);

  const loginError =
    loginResult.isError && (loginResult.error as any)?.data?.message
      ? (loginResult.error as any).data.message
      : "Credenciales incorrectas";

  const alreadyRegistered =
    registrarResult.isError && (registrarResult.error as any)?.data?.statusCode === 400;

  const regError =
    registrarResult.isError && (registrarResult.error as any)?.data?.message
      ? (registrarResult.error as any).data.message
      : "Error al registrar. Intenta de nuevo.";

  // ── Loading while checking session ──
  if (!sessionChecked) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  // ── Congratulations ──
  if (registrarResult.isSuccess) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)",
          px: 2,
        }}
      >
        <Paper sx={{ p: { xs: 4, md: 5 }, maxWidth: 460, textAlign: "center", borderRadius: 4 }}>
          <EmojiEventsIcon sx={{ fontSize: 90, color: "warning.main" }} />
          <Typography variant="h4" fontWeight={800} mt={1} gutterBottom>
            ¡Felicitaciones!
          </Typography>
          {requisito && (
            <Typography variant="h6" color="primary.main" fontWeight={700} mb={1}>
              {requisito.nombre}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            Tu asistencia ha sido registrada exitosamente. ¡Sigue creciendo en tu fe!
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 4 }}
            onClick={() => navigate(isLogged ? "/" : "/auth/signin")}
          >
            {isLogged ? "Ir al inicio" : "Iniciar sesión"}
          </Button>
        </Paper>
      </Box>
    );
  }

  // ── Already registered ──
  if (alreadyRegistered) {
    return (
      <FullScreen>
        <Paper sx={{ p: 4, maxWidth: 400, borderRadius: 3, textAlign: "center", width: "100%" }}>
          <InfoIcon sx={{ fontSize: 60, color: "info.main", mb: 1 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Ya registraste esta formación
          </Typography>
          {requisito && (
            <Typography variant="body1" color="primary.main" fontWeight={600} mb={1}>
              {requisito.nombre}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mb={3}>
            {regError}
          </Typography>
          <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </Paper>
      </FullScreen>
    );
  }

  // ── Error (non-400) ──
  if (registrarResult.isError) {
    return (
      <FullScreen>
        <Paper sx={{ p: 4, maxWidth: 400, borderRadius: 3, textAlign: "center", width: "100%" }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: "error.main", mb: 1 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Error al registrar
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {regError}
          </Typography>
          <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
            Volver
          </Button>
        </Paper>
      </FullScreen>
    );
  }

  // ── Account not linked to a member ──
  if (isLogged && !user?.miembro && requisitoId) {
    return (
      <FullScreen>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
            <WarningAmberIcon sx={{ fontSize: 60, color: "warning.main", mb: 1 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Cuenta sin miembro vinculado
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Tu cuenta no está vinculada a un miembro. Contacta al administrador.
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          </Paper>
        </Container>
      </FullScreen>
    );
  }

  // ── Auto-registering (logged in + miembro + requisito known) ──
  if (isLogged && user?.miembro && requisitoId) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={3}
      >
        <CircularProgress size={56} />
        <Typography variant="body1" color="text.secondary">
          Registrando asistencia...
        </Typography>
        {requisito && (
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            {requisito.nombre}
          </Typography>
        )}
      </Box>
    );
  }

  // ── Inline login form (has requisito_id, not logged in) ──
  if (!isLogged && requisitoId) {
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
        <Container maxWidth="xs">
          <Box textAlign="center" mb={4}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: "white", mx: "auto", mb: 2 }}>
              <ChurchIcon sx={{ fontSize: 36, color: "primary.main" }} />
            </Avatar>
            <Typography variant="h5" fontWeight={700} color="white">
              Registrar asistencia
            </Typography>
            {requisito && (
              <Typography
                variant="subtitle1"
                color="white"
                fontWeight={600}
                sx={{ opacity: 0.9, mt: 0.5 }}
              >
                {requisito.nombre}
              </Typography>
            )}
            <Typography variant="body2" color="white" sx={{ opacity: 0.7, mt: 1 }}>
              Inicia sesión para confirmar tu asistencia
            </Typography>
          </Box>

          <Paper sx={{ borderRadius: 3, p: 3 }}>
            {loginResult.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit(onLoginSubmit)}
              noValidate
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <TextField
                fullWidth
                label="Nombre de usuario"
                autoComplete="username"
                {...register("nombre_usuario", { required: "Campo obligatorio" })}
                error={!!errors.nombre_usuario}
                helperText={errors.nombre_usuario?.message}
              />
              <TextField
                fullWidth
                label="Contraseña"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                {...register("contrasena", { required: "Campo obligatorio" })}
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loginResult.isLoading}
                startIcon={loginResult.isLoading ? <CircularProgress size={18} /> : undefined}
              >
                {loginResult.isLoading ? "Iniciando sesión..." : "Iniciar sesión y registrar"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // ── Camera QR Scanner (no requisito_id) ──
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" sx={{ bgcolor: "background.default" }}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <IconButton color="inherit" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <QrCodeScannerIcon />
        <Typography variant="h6" fontWeight={600}>
          Escanear QR de Formación
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{ py: 3, flex: 1 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Apunta tu cámara al código QR que muestra el pastor para registrar tu asistencia
        </Typography>

        {scanError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setScanError(null)}>
            {scanError}
          </Alert>
        )}

        <QrScannerPanel onScan={handleQrScan} onCameraError={setScanError} />
      </Container>
    </Box>
  );
};
