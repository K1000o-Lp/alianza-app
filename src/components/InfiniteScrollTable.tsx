import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Popover,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "@mui/icons-material";

export interface ColumnDefinition<T> {
  id: string;
  label: string;
  width?: string;
  render: (item: T, index: number) => React.ReactNode;
  sticky?: 'left' | 'right'; // Posición sticky si aplica
  visible?: boolean; // Visible por defecto
}

interface InfiniteScrollTableProps<T> {
  data: T[];
  loading: boolean;
  columns: ColumnDefinition<T>[];
  onFetchMore: () => Promise<void>;
  emptyMessage?: string;
  rowKey?: (item: T, index: number) => string | number;
  sx?: any;
  tableWidth?: string;
  enableColumnToggle?: boolean; // Habilitar control de visibilidad
}

export const InfiniteScrollTable = React.forwardRef<HTMLDivElement, InfiniteScrollTableProps<any>>(
  (
    {
      data,
      loading,
      columns,
      onFetchMore,
      emptyMessage = "No hay datos registrados",
      rowKey = (_item, index) => index,
      sx,
      tableWidth = '100%',
      enableColumnToggle = false,
    },
    _ref
  ) => {
    // Estado para columnas visibles (por defecto todas visibles excepto las marcadas como visible: false)
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
      new Set(columns.filter(col => col.visible !== false).map(col => col.id))
    );
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleCloseSettings = () => {
      setAnchorEl(null);
    };

    const handleColumnToggle = (columnId: string) => {
      const newVisible = new Set(visibleColumns);
      if (newVisible.has(columnId)) {
        newVisible.delete(columnId);
      } else {
        newVisible.add(columnId);
      }
      setVisibleColumns(newVisible);
    };

    const filteredColumns = columns.filter(col => visibleColumns.has(col.id));

    const open = Boolean(anchorEl);
    const id = open ? 'column-settings-popover' : undefined;
    useEffect(() => {
      const handleScroll = async () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const nearBottom = scrollPosition >= document.body.scrollHeight - 200;

        if (nearBottom && data && data.length > 0 && !loading) {
          await onFetchMore();
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [data, loading, onFetchMore]);

    // Calcular posiciones sticky
    const getStickyStyle = (column: ColumnDefinition<any>, _index: number) => {
      if (!column.sticky) return {};

      const stickyColumns = filteredColumns.filter(col => col.sticky === column.sticky);
      const columnIndex = stickyColumns.findIndex(col => col.id === column.id);

      if (column.sticky === 'left') {
        let leftOffset = 0;
        for (let i = 0; i < columnIndex; i++) {
          const width = stickyColumns[i].width || 'auto';
          leftOffset += parseInt(width) || 100;
        }
        return {
          position: 'sticky' as const,
          left: `${leftOffset}px`,
          zIndex: 10,
          backgroundColor: '#ffffff',
        };
      } else if (column.sticky === 'right') {
        let rightOffset = 0;
        for (let i = stickyColumns.length - 1; i > columnIndex; i--) {
          const width = stickyColumns[i].width || 'auto';
          rightOffset += parseInt(width) || 100;
        }
        return {
          position: 'sticky' as const,
          right: `${rightOffset}px`,
          zIndex: 10,
          backgroundColor: '#ffffff',
        };
      }
      return {};
    };

    return (
      <Box sx={{ width: tableWidth, overflowX: 'auto', ...sx }}>
        {enableColumnToggle && (
          <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              onClick={handleOpenSettings}
              variant="outlined"
            >
              Mostrar/Ocultar Columnas
            </Button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseSettings}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                {columns.map((column) => (
                  <Box key={column.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Checkbox
                      size="small"
                      checked={visibleColumns.has(column.id)}
                      onChange={() => handleColumnToggle(column.id)}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {column.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Popover>
          </Box>
        )}
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table aria-label="tabla generica" sx={{ minWidth: 'max-content' }}>
            <TableHead>
              <TableRow>
                {filteredColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      width: column.width || "auto",
                      padding: "12px 8px",
                      whiteSpace: 'nowrap',
                      ...getStickyStyle(column, 0),
                    }}
                  >
                    <strong>{column.label}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Filas de datos */}
              {data?.map((item, index) => (
                <TableRow
                  key={rowKey(item, index)}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {filteredColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      sx={{
                        width: column.width || "auto",
                        padding: "10px 8px",
                        ...getStickyStyle(column, 0),
                      }}
                    >
                      {column.render(item, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}

              {/* Loading */}
              {loading && (
                <TableRow>
                  <TableCell sx={{ padding: 2 }} colSpan={filteredColumns.length}>
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {/* Empty state */}
              {!loading && (!data || data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={filteredColumns.length} sx={{ padding: 2 }}>
                    <Box textAlign="center" sx={{ width: "100%" }}>
                      <Typography variant="body1">{emptyMessage}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
);

InfiniteScrollTable.displayName = "InfiniteScrollTable";
