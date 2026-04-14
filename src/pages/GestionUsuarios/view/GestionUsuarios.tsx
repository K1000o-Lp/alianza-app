import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import LockResetIcon from "@mui/icons-material/LockReset";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  useGetUsuariosQuery,
  useGetRolesQuery,
  useGetZonesQuery,
  useCrearUsuarioMutation,
  useActualizarRolUsuarioMutation,
  useResetContrasenaUsuarioMutation,
  useEliminarUsuarioMutation,
} from "../../../redux/services/api";
import { UsuarioAdmin } from "../../../types";
import AddIcon from "@mui/icons-material/Add";

const ROL_COLOR: Record<string, "error" | "warning" | "info" | "default"> = {
  admin: "error",
  pastores: "warning",
  miembros: "info",
};

export const GestionUsuarios: React.FC = () => {
  const { data: usuarios, isLoading } = useGetUsuariosQuery();
  const { data: roles } = useGetRolesQuery();
  const { data: zonas } = useGetZonesQuery();

  const [actualizarRol] = useActualizarRolUsuarioMutation();
  const [resetContrasena] = useResetContrasenaUsuarioMutation();
  const [eliminarUsuario] = useEliminarUsuarioMutation();
  const [crearUsuario] = useCrearUsuarioMutation();

  // Crear usuario dialog
  const [crearOpen, setCrearOpen] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre_usuario: "", contrasena: "", rol_nombre: "", zona_id: "" as number | "" });
  const [showNuevoPass, setShowNuevoPass] = useState(false);
  const [crearLoading, setCrearLoading] = useState(false);

  const necesitaZona = nuevoUsuario.rol_nombre === 'miembros' || nuevoUsuario.rol_nombre === 'pastores';

  const resetCrear = () => { setCrearOpen(false); setNuevoUsuario({ nombre_usuario: "", contrasena: "", rol_nombre: "", zona_id: "" }); };

  // Reset password dialog
  const [resetTarget, setResetTarget] = useState<UsuarioAdmin | null>(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Change role dialog
  const [rolTarget, setRolTarget] = useState<UsuarioAdmin | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<number | "">("");
  const [rolLoading, setRolLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UsuarioAdmin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });

  const showSnack = (message: string, severity: "success" | "error") =>
    setSnack({ open: true, message, severity });

  const handleCrearUsuario = async () => {
    if (!nuevoUsuario.nombre_usuario || !nuevoUsuario.contrasena || !nuevoUsuario.rol_nombre) return;
    setCrearLoading(true);
    try {
      await crearUsuario({
        nombre_usuario: nuevoUsuario.nombre_usuario,
        contrasena: nuevoUsuario.contrasena,
        rol_nombre: nuevoUsuario.rol_nombre,
        ...(nuevoUsuario.zona_id ? { zona_id: nuevoUsuario.zona_id as number } : {}),
      }).unwrap();
      showSnack(`Usuario ${nuevoUsuario.nombre_usuario} creado`, "success");
      resetCrear();
    } catch (err: any) {
      showSnack(err?.data?.message ?? "Error al crear el usuario", "error");
    } finally {
      setCrearLoading(false);
    }
  };

  const handleResetContrasena = async () => {
    if (!resetTarget || !nuevaContrasena) return;
    setResetLoading(true);
    try {
      await resetContrasena({ id: resetTarget.id, nueva_contrasena: nuevaContrasena }).unwrap();
      showSnack(`Contraseña de ${resetTarget.nombre_usuario} actualizada`, "success");
      setResetTarget(null);
      setNuevaContrasena("");
    } catch {
      showSnack("Error al actualizar la contraseña", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleActualizarRol = async () => {
    if (!rolTarget || rolSeleccionado === "") return;
    setRolLoading(true);
    try {
      await actualizarRol({ id: rolTarget.id, rol_id: Number(rolSeleccionado) }).unwrap();
      showSnack(`Rol de ${rolTarget.nombre_usuario} actualizado`, "success");
      setRolTarget(null);
      setRolSeleccionado("");
    } catch {
      showSnack("Error al actualizar el rol", "error");
    } finally {
      setRolLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await eliminarUsuario(deleteTarget.id).unwrap();
      showSnack(`Usuario ${deleteTarget.nombre_usuario} eliminado`, "success");
      setDeleteTarget(null);
    } catch {
      showSnack("Error al eliminar el usuario", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "#",
      width: 70,
    },
    {
      field: "nombre_usuario",
      headerName: "Usuario",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "miembro",
      headerName: "Nombre completo",
      flex: 1.5,
      minWidth: 180,
      valueGetter: (_, row: UsuarioAdmin) => row.miembro?.nombre_completo ?? "—",
    },
    {
      field: "zona",
      headerName: "Zona",
      width: 110,
      valueGetter: (_, row: UsuarioAdmin) =>
        row.zona ? row.zona.descripcion : "—",
    },
    {
      field: "rol",
      headerName: "Rol",
      width: 130,
      renderCell: (params: GridRenderCellParams<UsuarioAdmin>) => {
        const rolNombre = params.row.rol?.nombre ?? "sin rol";
        return (
          <Chip
            label={rolNombre}
            size="small"
            color={ROL_COLOR[rolNombre] ?? "default"}
          />
        );
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<UsuarioAdmin>) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Cambiar rol">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setRolTarget(params.row);
                setRolSeleccionado(params.row.rol?.id ?? "");
              }}
            >
              <ManageAccountsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Resetear contraseña">
            <IconButton
              size="small"
              color="warning"
              onClick={() => setResetTarget(params.row)}
            >
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" fontWeight={600}>
          Gestión de Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCrearOpen(true)}>
          Crear usuario
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={usuarios ?? []}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
          }}
          disableRowSelectionOnClick
        />
      )}

      {/* Reset contraseña */}
      <Dialog open={!!resetTarget} onClose={() => { setResetTarget(null); setNuevaContrasena(""); }} maxWidth="xs" fullWidth>
        <DialogTitle>Resetear contraseña — {resetTarget?.nombre_usuario}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nueva contraseña"
            type={showPass ? "text" : "password"}
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            sx={{ mt: 1 }}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setResetTarget(null); setNuevaContrasena(""); }}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={!nuevaContrasena || resetLoading}
            onClick={handleResetContrasena}
            startIcon={resetLoading ? <CircularProgress size={16} /> : <LockResetIcon />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cambiar rol */}
      <Dialog open={!!rolTarget} onClose={() => { setRolTarget(null); setRolSeleccionado(""); }} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar rol — {rolTarget?.nombre_usuario}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={rolSeleccionado}
              label="Rol"
              onChange={(e) => setRolSeleccionado(Number(e.target.value))}
            >
              {roles?.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRolTarget(null); setRolSeleccionado(""); }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={rolSeleccionado === "" || rolLoading}
            onClick={handleActualizarRol}
            startIcon={rolLoading ? <CircularProgress size={16} /> : <ManageAccountsIcon />}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs">
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de eliminar a <strong>{deleteTarget?.nombre_usuario}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading}
            onClick={handleEliminar}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Crear usuario */}
      <Dialog open={crearOpen} onClose={resetCrear} maxWidth="xs" fullWidth>
        <DialogTitle>Crear usuario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nombre de usuario"
            value={nuevoUsuario.nombre_usuario}
            onChange={(e) => setNuevoUsuario((p) => ({ ...p, nombre_usuario: e.target.value }))}
            sx={{ mt: 1 }}
            inputProps={{ autoComplete: "off" }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type={showNuevoPass ? "text" : "password"}
            value={nuevoUsuario.contrasena}
            onChange={(e) => setNuevoUsuario((p) => ({ ...p, contrasena: e.target.value }))}
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowNuevoPass((s) => !s)}>
                    {showNuevoPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={nuevoUsuario.rol_nombre}
              label="Rol"
              onChange={(e) => setNuevoUsuario((p) => ({ ...p, rol_nombre: e.target.value, zona_id: "" }))}
            >
              {roles?.map((r) => (
                <MenuItem key={r.id} value={r.nombre}>
                  {r.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {necesitaZona && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Zona</InputLabel>
              <Select
                value={nuevoUsuario.zona_id}
                label="Zona"
                onChange={(e) => setNuevoUsuario((p) => ({ ...p, zona_id: e.target.value as number }))}
              >
                <MenuItem value="" />
                {zonas?.map((z) => (
                  <MenuItem key={z.id} value={z.id}>
                    {z.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetCrear}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!nuevoUsuario.nombre_usuario || !nuevoUsuario.contrasena || !nuevoUsuario.rol_nombre || crearLoading}
            onClick={handleCrearUsuario}
            startIcon={crearLoading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
