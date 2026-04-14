import { Box, IconButton } from "@mui/material";
import React, { useMemo } from "react";
import { useAppSelector } from "../../../redux/store";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { InfiniteScrollTable, ColumnDefinition } from "../../../components";
import { ResponseMember } from "../../../types";
import dayjs from "dayjs";

interface Props {
    miembros: ResponseMember[];
    loading: boolean;
    onFetchMore?: () => Promise<void>;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export const ListaReportes: React.FC<Props> = ({
    miembros,
    loading,
    onFetchMore = async () => {},
    onEdit,
    onDelete,
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const columns: ColumnDefinition<ResponseMember>[] = useMemo(() => [
        {
            id: 'nombre_completo',
            label: 'Nombre Completo',
            width: '160px',
            sticky: 'left',
            render: (miembro: ResponseMember) => miembro.nombre_completo,
        },
        {
            id: 'cedula',
            label: 'Cédula',
            width: '100px',
            render: (miembro: ResponseMember) => miembro.cedula || 'SIN CEDULA',
        },
        {
            id: 'telefono',
            label: 'Teléfono',
            width: '110px',
            render: (miembro: ResponseMember) => miembro.telefono || 'SIN TELEFONO',
        },
        {
            id: 'requisito_alcanzado',
            label: 'Requisito Alcanzado',
            width: '180px',
            render: (miembro: ResponseMember) => {
                const resultados = miembro.resultados as any[];
                if (!resultados || resultados.length === 0) return 'SIN PROGRESO';
                return resultados[0]?.requisito?.nombre || 'SIN PROGRESO';
            },
        },
        {
            id: 'consolidado_en',
            label: 'Fecha de Consolidación',
            width: '160px',
            render: (miembro: ResponseMember) => {
                const consolidado_en = (miembro as any).consolidado_en;
                if (!consolidado_en) return 'SIN FECHA';
                return dayjs(consolidado_en).format('DD/MM/YYYY');
            },
        },
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
                        onClick={() => onEdit && onEdit(miembro.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    {user?.rol?.nombre === 'admin' && (
                        <IconButton
                            size="small"
                            aria-label="delete"
                            onClick={() => onDelete && onDelete(miembro.id)}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            ),
        },
    ], [onEdit, onDelete, user]);

    return (
        <InfiniteScrollTable
            data={miembros}
            loading={loading}
            columns={columns}
            onFetchMore={onFetchMore}
            emptyMessage="No hay datos registrados"
            rowKey={(item) => item.id}
            tableWidth="100%"
            enableColumnToggle={true}
        />
    );
};
