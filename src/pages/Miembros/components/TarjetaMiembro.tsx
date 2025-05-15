import { Box, Button, ClickAwayListener, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import React, { useContext } from "react";
import { ActionContext } from "./ActionContext";
import { GridSeparatorIcon } from "@mui/x-data-grid";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";

interface Props {
    id: number;
    nombre_completo: string;
    cedula: string;
    telefono: string;
    nacimiento: Date;
    hijos: number;
    resultados: any[];
    historiales: any[];
}

export const TarjetaMiembro: React.FC<Props> = ({ id, nombre_completo, cedula, telefono, nacimiento, hijos, resultados, historiales }) => {
    const { editMember, handleOpenDialog } = useContext(ActionContext);
    const [ tooltipOpen, setTooltipOpen ] = React.useState(false);

    const handleTooltipClose = () => {
        setTooltipOpen(false);
    }

    const handleTooltipOpen = () => {
        setTooltipOpen(true);
    }
    
    const obtenerNacimiento = (nacimiento: Date) => {
        return new Date(nacimiento).toISOString().split('T')[0];
    }

    const obtenerEdad = (nacimiento: Date) => {
        return new Date().getFullYear() - new Date(nacimiento).getFullYear();
    }

    const obtenerUltimoProceso = (resultados: any[]) => {
        return resultados?.length > 0 ? resultados[resultados.length - 1]?.requisito?.nombre : 'NINGUNO';
    }
    
    const obtenerProcesos = (resultados: any[]) => {
        return resultados.map((resultado) => resultado.requisito.nombre).join(', ');
    }

    const obtenerSupervisor = (historiales: any[]) => {
        return historiales?.length > 0 ? historiales[historiales.length - 1]?.supervisor?.nombre_completo : 'SIN SUPERVISOR';
    }

    return (
        <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, display: { md: 'flex' }, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography fontSize={13} width={200} margin={0}>👤 { nombre_completo } </Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />
            
            <Typography fontSize={13}>🆔 { cedula || 'SIN CEDULA' } </Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />

            <Typography fontSize={13}>📱 { telefono }</Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />

            <Typography fontSize={13}>🎂 { obtenerNacimiento(nacimiento) } ({ obtenerEdad(nacimiento) } años) </Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />

            <Typography fontSize={13}>👶 { hijos ?? 0 }</Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography fontSize={13}>📚 <strong>{ obtenerUltimoProceso(resultados) }</strong> </Typography>
                {
                    resultados?.length > 0 && (
                        <ClickAwayListener onClickAway={handleTooltipClose}>
                            <div>
                                <Tooltip
                                    onClose={handleTooltipClose}
                                    open={tooltipOpen}
                                    disableFocusListener
                                    disableHoverListener
                                    disableTouchListener
                                    title={ obtenerProcesos(resultados) }
                                    slotProps={{
                                        popper: {
                                            disablePortal: true,
                                        },
                                    }}
                                >
                                    <Button onClick={handleTooltipOpen}>Ver mas...</Button>
                                </Tooltip>
                            </div>
                        </ClickAwayListener>
                    )
                }
            </Box>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />

            <Typography fontSize={13}>🧑‍💼 <strong>{ obtenerSupervisor(historiales) || 'SIN SUPERVISOR' }</strong></Typography>
            
            <GridSeparatorIcon sx={{ display: { xs: 'none', md: 'inline-block' } }} />
            
            <Box sx={{ display: 'flex', justifyContent: { md: 'space-between', xs: 'space-around' }, marginTop: { md: 0, xs: 4 } }}>
                <IconButton aria-label="edit" onClick={() =>  editMember && editMember(id)} sx={{ marginRight: { md: 1 } }}><EditIcon /></IconButton>
                <IconButton  aria-label="delete" onClick={() => handleOpenDialog && handleOpenDialog(id)} color="error"><DeleteIcon /></IconButton>
            </Box>
        </Paper>
    );
}