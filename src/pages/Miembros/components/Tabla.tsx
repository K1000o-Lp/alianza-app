import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';

interface Header {
    title: string;
    field: string;
    getValue?: (item: any) => React.ReactNode;
    width?: string | number;
    align?: 'right' | 'left' | 'center';
    getActionButtons?: (item: any) => React.ReactNode;
}

interface Data {
    id: number|string;
    
}

interface Props<T> {
    headers: Header[];
    data: T[];
    loading: boolean;
    emptyMessage?: string;
    sx?: object;
}

export const Tabla = <T,>({ loading, data, headers, emptyMessage, sx }: Props<T>) => {
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
                            <TableCell>{obtenerNacimiento(miembro.fecha_nacimiento)} ({obtenerEdad(miembro.fecha_nacimiento)} años)</TableCell>
                            <TableCell>{miembro.hijos ?? 0}</TableCell>
                            <TableCell>{obtenerUltimoProceso(miembro.resultados) || 'NINGUNO'}</TableCell>
                            <TableCell>{obtenerSupervisor(miembro.historiales || [])}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton aria-label="edit" onClick={() =>  editMember && editMember(miembro.id)} sx={{ marginRight: { md: 1 } }}><EditIcon /></IconButton>
                                    <IconButton  aria-label="delete" onClick={() => handleOpenDialog && handleOpenDialog(miembro.id)} color="error"><DeleteIcon /></IconButton>
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