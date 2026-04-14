import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LoadingButton from "@mui/lab/LoadingButton";
import { useImportarMiembrosMutation } from "../../../redux/services";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FilaImport {
  nombre_completo: string;
  zona_id: number;
  cedula?: string;
  telefono?: string;
  bautizado?: boolean;
  fecha_nacimiento?: string;
}

interface ResultadoItem {
  nombre_completo: string;
  cedula?: string;
  exito: boolean;
  error?: string;
  transferido?: boolean;
  omitido?: boolean;
}

interface Resultado {
  importados: number;
  transferidos: number;
  omitidos: number;
  fallidos: number;
  detalle: ResultadoItem[];
}

function parseBautizado(val: string): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === "si" || v === "sí" || v === "true" || v === "1" || v === "ok";
}

function parseCSV(text: string): FilaImport[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Detect separator (comma or semicolon)
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));

  const idx = (name: string) => headers.indexOf(name);

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const nombre = cols[idx("nombre_completo")]?.toUpperCase();
    const zona_id = Number(cols[idx("zona")]);
    if (!nombre || !zona_id) return [];
    const rawFecha = cols[idx("fecha_nacimiento")] || "";
    return [{
      nombre_completo: nombre,
      zona_id,
      cedula: cols[idx("cedula")] || undefined,
      telefono: cols[idx("telefono")] || undefined,
      bautizado: parseBautizado(cols[idx("bautizado")] ?? ""),
      fecha_nacimiento: rawFecha || undefined,
    }];
  });
}

function descargarEjemplo() {
  const header = "nombre_completo,zona,cedula,telefono,bautizado,fecha_nacimiento";
  const rows = [
    "ANDREA CATALINA AREVALO MENDEZ,1,1072593132,3122981322,OK,1995-06-14",
    "LUZ MARINA ROMERO,1,52190626,3052908799,SI,1980-03-22",
    "YUSNAY ANDREINA RAMIREZ ESPINOZA,1,5270413,3214511661,NO,2001-11-05",
    "ARTURO MENDOZA GUZMAN,3,7697693,3155341119,,",
  ];
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ejemplo_importacion_miembros.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export const ImportarMiembros: React.FC<Props> = ({ open, onClose }) => {
  const [filas, setFilas] = React.useState<FilaImport[]>([]);
  const [fileName, setFileName] = React.useState<string>("");
  const [transferir, setTransferir] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [resultado, setResultado] = React.useState<Resultado | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [importar, { isLoading }] = useImportarMiembrosMutation();

  const handleClose = () => {
    setFilas([]);
    setFileName("");
    setTransferir(false);
    setParseError(null);
    setResultado(null);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    setResultado(null);
    setFilas([]);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError("No se encontraron filas válidas. Verifica que el archivo tenga las columnas requeridas: nombre_completo, zona.");
        } else {
          setFilas(parsed);
        }
      } catch {
        setParseError("Error al leer el archivo. Usa formato CSV (separado por coma o punto y coma).");
      }
    };
    reader.readAsText(file, "utf-8");
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleImportar = async () => {
    if (filas.length === 0) return;
    const res = await importar({ miembros: filas, transferir }).unwrap().catch((err) => {
      setParseError(err?.data?.message ?? "Error al importar. Intenta de nuevo.");
      return null;
    });
    if (res) setResultado(res);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar miembros</DialogTitle>
      <DialogContent dividers>
        {/* Download example */}
        <Button
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={descargarEjemplo}
          sx={{ mb: 2 }}
        >
          Descargar ejemplo CSV
        </Button>

        {/* File picker */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.xlsx"
          style={{ display: "none" }}
          onChange={handleFile}
        />
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            mb: 2,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <UploadFileIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body1">
            {fileName ? fileName : "Haz clic para seleccionar un archivo CSV"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Columnas requeridas: nombre_completo, zona — opcionales: cedula, telefono, bautizado, fecha_nacimiento (YYYY-MM-DD)
          </Typography>
        </Box>

        {parseError && <Alert severity="error" sx={{ mb: 2 }}>{parseError}</Alert>}

        {filas.length > 0 && !resultado && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {filas.length} fila{filas.length !== 1 ? "s" : ""} listas para importar.
          </Alert>
        )}

        {/* Transfer option */}
        {filas.length > 0 && !resultado && (
          <FormControlLabel
            control={
              <Checkbox
                checked={transferir}
                onChange={(e) => setTransferir(e.target.checked)}
              />
            }
            label="Transferir automáticamente miembros ya existentes a la zona indicada"
          />
        )}

        {/* Result summary */}
        {resultado && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Resumen de importación
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              <Chip
                icon={<CheckCircleOutlineIcon />}
                label={`${resultado.importados} importados`}
                color="success"
                variant="outlined"
              />
              {resultado.transferidos > 0 && (
                <Chip
                  icon={<SwapHorizIcon />}
                  label={`${resultado.transferidos} transferidos`}
                  color="info"
                  variant="outlined"
                />)}
              {resultado.omitidos > 0 && (
                <Chip
                  label={`${resultado.omitidos} ya en zona`}
                  color="default"
                  variant="outlined"
                />
              )}
              {resultado.fallidos > 0 && (
                <Chip
                  icon={<ErrorOutlineIcon />}
                  label={`${resultado.fallidos} fallidos`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>

            {resultado.fallidos > 0 && (
              <>
                <Typography variant="body2" color="error" gutterBottom>
                  No se pudieron importar:
                </Typography>
                <List dense disablePadding>
                  {resultado.detalle
                    .filter((d) => !d.exito)
                    .map((d, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText
                          primary={d.nombre_completo}
                          secondary={d.error}
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{ color: "error", variant: "caption" }}
                        />
                      </ListItem>
                    ))}
                </List>
              </>
            )}

            {resultado.omitidos > 0 && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: resultado.fallidos > 0 ? 1 : 0 }}>
                  Ya registrados en su zona:
                </Typography>
                <List dense disablePadding>
                  {resultado.detalle
                    .filter((d) => d.omitido)
                    .map((d, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText
                          primary={d.nombre_completo}
                          secondary={d.error}
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{ variant: "caption" }}
                        />
                      </ListItem>
                    ))}
                </List>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cerrar</Button>
        {!resultado && (
          <LoadingButton
            variant="contained"
            loading={isLoading}
            disabled={filas.length === 0}
            onClick={handleImportar}
          >
            Importar {filas.length > 0 ? `(${filas.length})` : ""}
          </LoadingButton>
        )}
      </DialogActions>
    </Dialog>
  );
};
