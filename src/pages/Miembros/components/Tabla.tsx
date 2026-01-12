import { Box, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { ActionContext } from './ActionContext';

interface Header {
    title: string;
    field?: string;
    getValue?: (item: any) => React.ReactNode;
    width?: string | number;
    align?: 'right' | 'left' | 'center';
    getActionButtons?: (item: any) => React.ReactNode;
}

interface Member {
    id: number | string;
    nombre_completo?: string;
    cedula?: string | null;
    telefono?: string | null;
    fecha_nacimiento?: string | Date | null;
    hijos?: number | null;
    resultados?: any[];
    historiales?: any[];
}

interface Props<T extends Member> {
    headers: Header[];
    data: T[];
    loading: boolean;
    emptyMessage?: string;
    sx?: object;
}

// Local helpers (kept simple and consistent with ListaMiembros)
const obtenerNacimiento = (nacimiento: Date | string | null | undefined) => {
    if (!nacimiento) return '';
    return new Date(nacimiento).toISOString().split('T')[0];
}

const obtenerEdadLocal = (nacimiento: Date | string | null | undefined) => {
    if (!nacimiento) return '';
    return new Date().getFullYear() - new Date(nacimiento).getFullYear();
}

const obtenerUltimoProceso = (resultados: any[] = []) => {
    return resultados?.length > 0 ? resultados[resultados.length - 1]?.requisito?.nombre : 'NINGUNO';
}

const obtenerSupervisor = (historiales: any[] = []) => {
    const last = historiales[historiales.length - 1];
    return last?.supervisor?.nombre_completo || 'SIN SUPERVISOR';
}

export const Tabla = <T extends Member>({ loading, data, headers, emptyMessage, sx }: Props<T>) => {
  const { editMember, handleOpenDialog } = useContext(ActionContext);

  return (
    <>
        <TableContainer component={Paper} sx={sx}>
            <Table aria-label="tabla de miembros">
                <TableHead>
                    <TableRow>
                        {headers.map((header, index) => (
                            <TableCell key={index}><strong>{header.title}</strong></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Carga de miembros */}
                    {data?.map((miembro: T) => (
                        <TableRow 
                            key={miembro.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell>{miembro.nombre_completo}</TableCell>
                            <TableCell>{miembro.cedula || 'SIN CEDULA'}</TableCell>
                            <TableCell>{miembro.telefono || 'SIN TELEFONO'}</TableCell>
                            <TableCell>{obtenerNacimiento(miembro.fecha_nacimiento)} ({obtenerEdadLocal(miembro.fecha_nacimiento)} años)</TableCell>
                            <TableCell>{miembro.hijos ?? 0}</TableCell>
                            <TableCell>{obtenerUltimoProceso(miembro.resultados) || 'NINGUNO'}</TableCell>
                            <TableCell>{obtenerSupervisor(miembro.historiales || [])}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton aria-label="edit" onClick={() =>  editMember && editMember(Number(miembro.id))} sx={{ marginRight: { md: 1 } }}><EditIcon /></IconButton>
                                    <IconButton  aria-label="delete" onClick={() => handleOpenDialog && handleOpenDialog(Number(miembro.id))} color="error"><DeleteIcon /></IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}

                    {/* Skeleton de carga */}
                    {loading && (
                        <TableRow>
                            <TableCell sx={{ padding: 2 }} colSpan={8}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Si no hay datos, mostrar mensaje de feedback */}
                    {!loading && (!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={8} sx={{ padding: 2 }}>
                                <Box textAlign="center" sx={{ width: '100%' }}>
                                    <Typography variant="body1">{ emptyMessage || 'No hay miembros registrados'}</Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>
  )
};