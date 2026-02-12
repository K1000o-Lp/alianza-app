import { Box, Chip, IconButton } from "@mui/material";
import React, { useContext, useMemo } from "react";
import { ActionContext } from "./ActionContext";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { InfiniteScrollTable, ColumnDefinition } from "../../../components";
import { ResponseMember } from "../../../types";

interface Props {
    miembros: ResponseMember[];
    loading: boolean;
    onFetchMore?: () => Promise<void>;
    error?: boolean;
}

export const ListaMiembros: React.FC<Props> = ({ miembros, loading, onFetchMore = async () => {} }) => {
    const { editMember, handleOpenDialog } = useContext(ActionContext);
    
    const obtenerNacimiento = (nacimiento: Date) => {
        return new Date(nacimiento).toISOString().split('T')[0];
    }

    const obtenerEdad = (nacimiento: Date) => {
        return new Date().getFullYear() - new Date(nacimiento).getFullYear();
    }

    const obtenerSupervisor = (historiales: any[]) => {
        const lastHistorial = historiales[historiales.length - 1];
        return lastHistorial?.supervisor?.nombre_completo || 'SIN SUPERVISOR';
    }

    // Función para capitalizar solo la primera palabra
    const capitalizeFirstWord = (text: string) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    const requisitosOrdenados = [
        'GRUPO DE CONEXION',
        'PRIMEROS PASOS',
        'BAUTISMO',
        'ENCUENTRO',
        'POS ENCUENTRO',
        'DOCTRINAS 1',
        'DOCTRINAS 2',
        'ENTRENAMIENTO DE LIDERAZGO',
        'LIDERAZGO',
        'ENCUENTRO DE ORACION',
        'LIDER'
    ];

    // Extraer requisitos únicos del backend que existen en los miembros
    const requisitosEncontrados = useMemo(() => {
        const requisitos = new Set<string>();
        miembros?.forEach((miembro: any) => {
            if (miembro.resultadosPorRequisito) {
                Object.keys(miembro.resultadosPorRequisito).forEach(req => requisitos.add(req));
            }
        });
        // Retornar ordenados según requisitosOrdenados
        return requisitosOrdenados.filter(req => requisitos.has(req));
    }, [miembros]);

    const columns: ColumnDefinition<ResponseMember>[] = useMemo(() => {
        const baseColumns: ColumnDefinition<ResponseMember>[] = [
            {
                id: 'nombre_completo',
                label: 'Nombre Completo',
                width: '225px',
                sticky: 'left',
                render: (miembro: ResponseMember) => miembro.nombre_completo,
            },
            {
                id: 'cedula',
                label: 'Cédula',
                width: '80px',
                render: (miembro: ResponseMember) => miembro.cedula || 'SIN CEDULA',
            },
            {
                id: 'telefono',
                label: 'Teléfono',
                width: '100px',
                render: (miembro: ResponseMember) => miembro.telefono || 'SIN TELEFONO',
            },
            {
                id: 'fecha_nacimiento',
                label: 'Fecha Nac.',
                width: '110px',
                render: (miembro: ResponseMember) => `${obtenerNacimiento(miembro.fecha_nacimiento)} (${obtenerEdad(miembro.fecha_nacimiento)}a)`,
            },
            {
                id: 'hijos',
                label: 'Hijos',
                width: '50px',
                render: (miembro: ResponseMember) => miembro.hijos ?? 0,
            },
            {
                id: 'supervisor',
                label: 'Supervisor',
                width: '225px',
                render: (miembro: ResponseMember) => obtenerSupervisor(miembro.historiales || []),
            },
        ];

        // Agregar columnas dinámicas para cada requisito encontrado
        const requisitosColumns = requisitosEncontrados.map((requisito) => {
            const labelCapitalizado = capitalizeFirstWord(requisito);
            
            return {
                id: `requisito_${requisito.replace(/\s+/g, '_')}`,
                label: labelCapitalizado,
                width: '35px',
                render: (miembro: ResponseMember) => {
                    const resultado = miembro.resultadosPorRequisito?.[requisito];
                    return resultado ? (
                        <Chip 
                            label="✓" 
                            size="small" 
                            color="success" 
                            variant="filled"
                            sx={{ minWidth: '32px', fontWeight: 'bold' }}
                        />
                    ) : (
                        <Chip 
                            label="✗" 
                            size="small" 
                            color="default" 
                            variant="outlined"
                            sx={{ minWidth: '32px', fontWeight: 'bold', opacity: 0.5 }}
                        />
                    );
                },
            };
        });

        return [
            ...baseColumns,
            ...requisitosColumns,
            {
                id: 'acciones',
                label: 'Acciones',
                width: '80px',
                sticky: 'right',
                render: (miembro: ResponseMember) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                            size="small" 
                            aria-label="edit" 
                            onClick={() => editMember && editMember(miembro.id)} 
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            aria-label="delete" 
                            onClick={() => handleOpenDialog && handleOpenDialog(miembro.id)} 
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ),
            },
        ];
    }, [editMember, handleOpenDialog, requisitosEncontrados]);

    return (
        <InfiniteScrollTable
            data={miembros}
            loading={loading}
            columns={columns}
            onFetchMore={onFetchMore}
            emptyMessage="No hay miembros registrados"
            rowKey={(item) => item.id}
            tableWidth="100%"
            enableColumnToggle={true}
        />
    );
};
