import { Box, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useContext } from "react";
import { ActionContext } from "./ActionContext";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";

interface Props {
    miembros: any;
    loading: boolean;
    error?: boolean;
}

export const ListaMiembros: React.FC<Props> = ({ miembros, loading }) => {
    const { editMember, handleOpenDialog } = useContext(ActionContext);
    
    const obtenerNacimiento = (nacimiento: Date) => {
        return new Date(nacimiento).toISOString().split('T')[0];
    }

    const obtenerEdad = (nacimiento: Date) => {
        return new Date().getFullYear() - new Date(nacimiento).getFullYear();
    }

    const obtenerUltimoProceso = (resultados: any[]) => {
        return resultados?.length > 0 ? resultados[resultados.length - 1]?.requisito?.nombre : 'NINGUNO';
    }

    const obtenerSupervisor = (historiales: any[]) => {
        const lastHistorial = historiales[historiales.length - 1];
        console.log('lastHistorial', lastHistorial);
        return lastHistorial?.supervisor?.nombre_completo || 'SIN SUPERVISOR';
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table aria-label="tabla de miembros">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nombre Completo</strong></TableCell>
                            <TableCell><strong>Cédula</strong></TableCell>
                            <TableCell><strong>Teléfono</strong></TableCell>
                            <TableCell><strong>Fecha Nacimiento</strong></TableCell>
                            <TableCell><strong>Hijos</strong></TableCell>
                            <TableCell><strong>Resultados</strong></TableCell>
                            <TableCell><strong>Supervisor</strong></TableCell>
                            <TableCell><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Carga de miembros */}
                        {miembros?.map((miembro: any) => (
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
                        {!loading && (!miembros || miembros.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={8} sx={{ padding: 2 }}>
                                    <Box textAlign="center" sx={{ width: '100%' }}>
                                        <Typography variant="body1">No hay miembros registrados</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}