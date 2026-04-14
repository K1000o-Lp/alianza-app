import React, { useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import DownloadIcon from "@mui/icons-material/Download";
import { QRCodeCanvas } from "qrcode.react";
import { useGetRequirementsQuery } from "../../../redux/services/api";
import { Requirement } from "../../../types";

export const FormacionQR: React.FC = () => {
  const [selected, setSelected] = useState<Requirement | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const { data: requisitos, isLoading, isError } = useGetRequirementsQuery(null);

  const qrUrl = selected
    ? `${window.location.origin}/formacion/registrar?requisito_id=${selected.id}`
    : "";

  const handleDownload = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${selected?.nombre ?? "proceso"}.png`;
    a.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Generar QR de Proceso de Formación
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Selecciona un proceso para mostrar su código QR. Los miembros pueden
        escanearlo para registrar su asistencia.
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          No se pudieron cargar los procesos de formación.
        </Alert>
      )}

      <Grid container spacing={3}>
        {requisitos?.map((requisito) => (
          <Grid item xs={12} sm={6} md={4} key={requisito.id}>
            <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {requisito.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {requisito.descripcion}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<QrCode2Icon />}
                  onClick={() => setSelected(requisito)}
                >
                  Ver QR
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="h6" component="span">
              {selected?.nombre}
            </Typography>
            <Chip label="Escanear para registrar" size="small" sx={{ ml: 1 }} />
          </Box>
          <IconButton size="small" onClick={() => setSelected(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={2}>
            <Box
              sx={{
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <QRCodeCanvas
                ref={qrRef}
                value={qrUrl}
                size={240}
                level="H"
                includeMargin
              />
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              sx={{ wordBreak: "break-all", maxWidth: 260 }}
            >
              {qrUrl}
            </Typography>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              fullWidth
            >
              Descargar QR
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};
