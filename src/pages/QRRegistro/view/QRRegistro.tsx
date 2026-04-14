import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import QrCodeIcon from "@mui/icons-material/QrCode2";
import { QRCodeCanvas } from "qrcode.react";
import { useGetZonesQuery } from "../../../redux/services/api";

export const QRRegistro: React.FC = () => {
  const { data: zonas, isLoading } = useGetZonesQuery();
  const [openZona, setOpenZona] = React.useState<{ id: number; descripcion: string } | null>(
    null
  );
  const [openGeneral, setOpenGeneral] = React.useState(false);

  const baseUrl = `${window.location.origin}/auth/registro-completo`;
  const qrValue = openZona ? `${baseUrl}?zona_id=${openZona.id}` : baseUrl;

  const handleDownload = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      `#qr-canvas-${openZona?.id ?? "general"} canvas`
    );
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = openZona
      ? `QR_Registro_Zona_${openZona.descripcion}.png`
      : "QR_Registro_General.png";
    a.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={700}>
          QR de Registro
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Genera códigos QR para que nuevos miembros se registren directamente desde su
          dispositivo.
        </Typography>
      </Box>

      {/* General QR */}
      <Card sx={{ mb: 4, borderRadius: 2, border: "1px solid", borderColor: "primary.light" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            QR General
          </Typography>
          <Typography variant="body2" color="text.secondary">
            El miembro podrá seleccionar su zona durante el registro.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            startIcon={<QrCodeIcon />}
            variant="outlined"
            onClick={() => setOpenGeneral(true)}
          >
            Ver QR
          </Button>
        </CardActions>
      </Card>

      <Divider sx={{ mb: 4 }}>
        <Typography variant="caption" color="text.secondary">
          QRs por zona
        </Typography>
      </Divider>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {zonas?.map((zona) => (
            <Grid item xs={12} sm={6} md={4} key={zona.id}>
              <Card sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Zona {zona.descripcion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize={12} mt={0.5}>
                    {`${baseUrl}?zona_id=${zona.id}`}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<QrCodeIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setOpenZona(zona)}
                  >
                    Ver QR
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* QR Dialog for zone */}
      <Dialog
        open={!!openZona || openGeneral}
        onClose={() => {
          setOpenZona(null);
          setOpenGeneral(false);
        }}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {openZona ? `QR — Zona ${openZona.descripcion}` : "QR — Registro General"}
        </DialogTitle>
        <DialogContent>
          <Box
            id={`qr-canvas-${openZona?.id ?? "general"}`}
            display="flex"
            justifyContent="center"
            p={2}
            bgcolor="white"
            borderRadius={2}
          >
            <QRCodeCanvas
              value={qrValue}
              size={260}
              level="H"
              includeMargin
              imageSettings={{
                src: "/vite.svg",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
            mt={1}
          >
            {qrValue}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Tooltip title="Descargar como PNG">
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            onClick={() => {
              setOpenZona(null);
              setOpenGeneral(false);
            }}
          >
            Cerrar
          </Button>
          <Button variant="contained" onClick={handleDownload} startIcon={<DownloadIcon />}>
            Descargar QR
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
