import { Box, Button, Dialog, DialogActions, DialogTitle, FormControl, InputLabel, NativeSelect, Typography } from "@mui/material";
import * as React from "react";
import { useGetMembersWithResultsAndPaginationInfiniteQuery, useGetSupervisorsQuery, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";
import { filterMembers } from "../../../types";
import { config } from "../../../config";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import queryString from "query-string";
import dayjs from "dayjs";
import { ListaMiembros } from "../components/ListaMiembros";
import { ActionContext } from "../components/ActionContext";

export const Miembros: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [ openDialog, setOpenDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ filtersState, setFiltersState ] = React.useState<filterMembers>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 0,
    supervisor: undefined,
    limite: 24,
    desplazamiento: 0,
	});
  
  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();
  
  const { data: supervisors, isLoading: supervisorsLoading, isError: supervisorsError } = useGetSupervisorsQuery({ zona_id: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const { data, isFetching, fetchNextPage, refetch } = useGetMembersWithResultsAndPaginationInfiniteQuery({ ...filtersState }, { refetchOnMountOrArgChange: true });

  const [ updateMember ] = usePutMembersMutation();

  const router = useRouter();

  const editMember = (id:  number) => {
    if(!id) return;

    router.push(`${id}/editar`);
  }

  const deleteMember = async (id: number) => {
    if(!id) return;
    await updateMember({ id, historial: { zona_id: config().ZONA_0 } });
    refetch();
  } 

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement> | any) => {
		const { name, value } = event.target;

		setFiltersState((prevState) => ({
			...prevState,
			[name]: value,
		}));
	}

  const handleCloseDialog = () => {
    setOpenDialog({open: false, id: undefined});
  } 

  const handleOpenDialog = (id: number) => {
    setOpenDialog({open: true, id});
  }

  const handleDeleteMember = () => {
    deleteMember(openDialog.id as number);
    handleCloseDialog();
  }

  React.useEffect(() => {
    const handleScroll = async () => {
      // Check if we're near the bottom of the page
      const scrollPosition = window.scrollY + window.innerHeight;
      const nearBottom = scrollPosition >= document.body.scrollHeight - 200; // 200px from bottom
      // Check if we have data and are near the bottom
      if (nearBottom && data?.pages && data?.pages?.length > 0 && !isFetching) {
        await fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [data?.pages, isFetching]);

  const handleClickExportToExcel = () => {
    const api = config().BACKEND_URL;

    fetch(`${api}persona/miembros/reportes?${queryString.stringify(filtersState)}`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_miembros_${dayjs().format('DD/MM/YYYY HH:mm:ss')}.xlsx`;
      a.click();
    })
    .catch(error => console.error(error));
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", width: "100%", mb: 2 }}>
        <Typography
          component="h1"
          variant="h6"
          color="primary"
          sx={{ flexGrow: 1 }}
        >
          Miembros
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', width: "100%", mb: 2, alignItems: 'end' }}>
        { user?.zona === null && (
          <FormControl sx={{ width: 200 }}>
            <InputLabel htmlFor="zona_native">Zona</InputLabel>
            <NativeSelect
              onChange={handleFilterChange}
              disabled={user?.zona !== null}
              value={filtersState?.zona}
              inputProps={{ id: "zona_native", name: "zona" }}
            >
              {zonesLoading && (
                <option key="0" value="">
                  Cargando...
                </option>
              )}

              {!zonesError && (
                <option key={`zones-all`} value={0}>
                  {"TODAS"}
                </option>
              )}

              {!zonesError &&
                zones?.map(({ id, descripcion }) => (
                  <option key={`zones-${id}`} value={id}>
                    {descripcion}
                  </option>
                ))}
            </NativeSelect>
          </FormControl>
        )}

        <FormControl sx={{ width: 300, ml: 2 }}>
          <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
          <NativeSelect
            onChange={handleFilterChange}
            value={filtersState?.supervisor ?? 0}
            inputProps={{ id: "supervisor_native", name: "supervisor" }}
          >
            {supervisorsLoading && (
              <option key="0" value="">
                Cargando...
              </option>
            )}

            {!supervisorsError && (
              <option key={`supervisor-none`} value={0}>
                {"NINGUNO"}
              </option>
            )}

            {!supervisorsError &&
              supervisors?.map((supervisor: any) => (
                <option key={`zones-${supervisor?.miembro_id}`} value={supervisor?.miembro_id}>
                  {supervisor.nombre_completo}
                </option>
              ))}
          </NativeSelect>
        </FormControl>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={handleClickExportToExcel}
            sx={{ ml: 2 }}
            startIcon={<FileDownloadIcon /> }
          >
            Exportar a Excel
          </Button>
        </Box>
      </Box>

      <ActionContext.Provider value={{ editMember, handleOpenDialog }}>
        <ListaMiembros miembros={(data?.pages?.flat() || [])} loading={isFetching} />
      </ActionContext.Provider>

      <Dialog
        open={openDialog.open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Estas seguro de eliminar este miembro?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button onClick={handleDeleteMember} autoFocus>
            Si
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
