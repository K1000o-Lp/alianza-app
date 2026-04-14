import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../redux/store";

export const HomeMiembro: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const firstName =
    (user?.miembro as any)?.nombre_completo?.split(" ")[0] ??
    user?.nombre_usuario ??
    "";

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={700}>
          ¡Hola, {firstName}!
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Bienvenido/a a la plataforma de Iglesia Alianza.
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          cursor: "pointer",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 8 },
        }}
        onClick={() => navigate("/formacion/escanear")}
      >
        <CardContent sx={{ textAlign: "center", pt: 5, pb: 2 }}>
          <QrCodeScannerIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Registrar Asistencia a Formación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escanea el código QR que muestra tu pastor para registrar tu asistencia
            a un proceso de formación.
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "center", pb: 4 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<QrCodeScannerIcon />}
            onClick={(e) => {
              e.stopPropagation();
              navigate("/formacion/escanear");
            }}
          >
            Escanear QR
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};
