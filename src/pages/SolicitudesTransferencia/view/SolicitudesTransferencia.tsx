import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useSearchParams } from "react-router-dom";
import {
  useGetSolicitudesTransferenciaQuery,
  useAprobarSolicitudTransferenciaMutation,
  useRechazarSolicitudTransferenciaMutation,
  useGetZonesQuery,
} from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";
import { EstadoSolicitud, SolicitudTransferencia } from "../../../types";
import dayjs from "dayjs";

const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

const ESTADO_COLORS: Record<EstadoSolicitud, "warning" | "success" | "error"> = {
  pendiente: "warning",
  aprobada: "success",
  rechazada: "error",
};

interface TablaProps {
  data: SolicitudTransferencia[];
  isLoading: boolean;
  isError: boolean;
  conAcciones: boolean;
  aprobarResult: { isLoading: boolean };
  rechazarResult: { isLoading: boolean };
  onAprobar: (id: number) => void;
  onRechazar: (id: number) => void;
}

const TablaSolicitudes: React.FC<TablaProps> = ({
  data,
  isLoading,
  isError,
  conAcciones,
  aprobarResult,
  rechazarResult,
  onAprobar,
  onRechazar,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) {
    return <Alert severity="error">Error al cargar las solicitudes. Intenta de nuevo.</Alert>;
  }
  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No hay solicitudes que coincidan con los filtros.
      </Typography>
    );
  }
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Miembro</TableCell>
            <TableCell>Cédula</TableCell>
            <TableCell>Zona origen</TableCell>
            <TableCell>Zona destino</TableCell>
            <TableCell>Solicitante</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha solicitud</TableCell>
            <TableCell>Fecha resolución</TableCell>
            {conAcciones && <TableCell align="right">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.miembro.nombre_completo}</TableCell>
              <TableCell>{s.miembro.cedula ?? "—"}</TableCell>
              <TableCell>{s.zona_origen.descripcion}</TableCell>
              <TableCell>{s.zona_destino.descripcion}</TableCell>
              <TableCell>{s.solicitante?.miembro?.nombre_completo ?? "—"}</TableCell>
              <TableCell>
                <Chip
                  label={ESTADO_LABELS[s.estado]}
                  color={ESTADO_COLORS[s.estado]}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{dayjs(s.creado_en).format("DD/MM/YYYY HH:mm")}</TableCell>
              <TableCell>
                {s.aprobado_en ? dayjs(s.aprobado_en).format("DD/MM/YYYY HH:mm") : "—"}
              </TableCell>
              {conAcciones && (
                <TableCell align="right">
                  {s.estado === "pendiente" && (
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        disabled={aprobarResult.isLoading || rechazarResult.isLoading}
                        onClick={() => onAprobar(s.id)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        disabled={aprobarResult.isLoading || rechazarResult.isLoading}
                        onClick={() => onRechazar(s.id)}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export const SolicitudesTransferencia: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const esAdmin = user?.rol?.nombre === "admin";
  const zonaIdUsuario = user?.zona?.id;

  const [searchParams, setSearchParams] = useSearchParams();

  // Tab: 0 = "para aprobar" (origen = mi zona), 1 = "mis solicitudes" (destino = mi zona)
  const tab = Number(searchParams.get("tab") ?? "0");

  const setTab = (value: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", String(value));
      return next;
    }, { replace: true });
  };

  // Admin filters
  const [filtroZonaOrigen, setFiltroZonaOrigen] = React.useState<number | "">("");
  const [filtroZonaDestino, setFiltroZonaDestino] = React.useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = React.useState<EstadoSolicitud | "">("");

  const { data: zonas } = useGetZonesQuery();

  // Pastor: tab 0 → filter by zona_origen; tab 1 → filter by zona_destino
  const queryParams = esAdmin
    ? {
        zona_origen_id: filtroZonaOrigen || undefined,
        zona_destino_id: filtroZonaDestino || undefined,
        estado: filtroEstado || undefined,
      }
    : tab === 0
    ? { zona_origen_id: zonaIdUsuario, estado: filtroEstado || undefined }
    : { zona_destino_id: zonaIdUsuario, estado: filtroEstado || undefined };

  const { data, isLoading, isError, refetch } = useGetSolicitudesTransferenciaQuery(queryParams);

  const [aprobar, aprobarResult] = useAprobarSolicitudTransferenciaMutation();
  const [rechazar, rechazarResult] = useRechazarSolicitudTransferenciaMutation();

  const handleAprobar = async (id: number) => {
    await aprobar({ id, aprobador_id: user!.id });
  };

  const handleRechazar = async (id: number) => {
    await rechazar({ id, aprobador_id: user!.id });
  };

  // Pastores can approve/reject only on tab 0 (origin zone = their zone)
  const conAcciones = esAdmin || tab === 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", mb: 2, alignItems: "center" }}>
        <Typography component="h1" variant="h6" color="primary" sx={{ flexGrow: 1 }}>
          Solicitudes de transferencia
        </Typography>
        <Button size="small" onClick={() => refetch()}>
          Actualizar
        </Button>
      </Box>

      {/* Tabs — only for pastores */}
      {!esAdmin && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Para aprobar (mi zona de origen)" />
          <Tab label="Mis solicitudes (hacia mi zona)" />
        </Tabs>
      )}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {esAdmin && (
          <>
            <FormControl variant="standard" sx={{ minWidth: 200 }}>
              <InputLabel>Zona de origen</InputLabel>
              <Select
                value={filtroZonaOrigen}
                onChange={(e) => setFiltroZonaOrigen(e.target.value as number | "")}
              >
                <MenuItem value="">Todas</MenuItem>
                {zonas?.map((z) => (
                  <MenuItem key={z.id} value={z.id}>{z.descripcion}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="standard" sx={{ minWidth: 200 }}>
              <InputLabel>Zona de destino</InputLabel>
              <Select
                value={filtroZonaDestino}
                onChange={(e) => setFiltroZonaDestino(e.target.value as number | "")}
              >
                <MenuItem value="">Todas</MenuItem>
                {zonas?.map((z) => (
                  <MenuItem key={z.id} value={z.id}>{z.descripcion}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <FormControl variant="standard" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoSolicitud | "")}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="aprobada">Aprobada</MenuItem>
            <MenuItem value="rechazada">Rechazada</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TablaSolicitudes
        data={data ?? []}
        isLoading={isLoading}
        isError={isError}
        conAcciones={conAcciones}
        aprobarResult={aprobarResult}
        rechazarResult={rechazarResult}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
      />
    </Box>
  );
};
