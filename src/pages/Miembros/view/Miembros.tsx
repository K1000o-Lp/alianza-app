import { Box, Button, Dialog, DialogActions, DialogTitle, Divider, FormControl, IconButton, InputBase, InputLabel, MenuItem, Paper, Select, Typography } from "@mui/material";
import * as React from "react";
import { useGetMembersWithResultsAndPaginationInfiniteQuery, useGetSupervisorsQuery, useGetZonesQuery, usePutMembersMutation } from "../../../redux/services";
import { useAppSelector } from "../../../redux/store";
import { filterMembers } from "../../../types";
import { config } from "../../../config";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import queryString from "query-string";
import dayjs from "dayjs";
import { ListaMiembros } from "../components/ListaMiembros";
import { ActionContext } from "../components/ActionContext";
import { EditMember } from "../../EditMember/view/EditMember";

export const Miembros: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [ openDialog, setOpenDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ openEditDialog, setOpenEditDialog ] = React.useState<{open: boolean, id?: number}>({ open: false, id: undefined });
  const [ filtersState, setFiltersState ] = React.useState<filterMembers>({ 
		zona: user?.zona !== null ? user?.zona.id as number : 0,
    supervisor: undefined,
    limite: 24,
    desplazamiento: 0,
    q: undefined,
	});
  const [ search, setSearch ] = React.useState<string>("");
  
  const {
    data: zones,
    isLoading: zonesLoading,
    isError: zonesError,
  } = useGetZonesQuery();
  
  const { data: supervisors, isLoading: supervisorsLoading, isError: supervisorsError } = useGetSupervisorsQuery({ zona_id: filtersState?.zona }, { refetchOnMountOrArgChange: true });

  const { data, isFetching, fetchNextPage, refetch } = useGetMembersWithResultsAndPaginationInfiniteQuery({ ...filtersState }, { refetchOnMountOrArgChange: true });

  const [ updateMember ] = usePutMembersMutation();

  const editMember = (id:  number) => {
    if(!id) return;
    setOpenEditDialog({ open: true, id });
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog({ open: false, id: undefined });
  }

  const deleteMember = async (id: number) => {
    if(!id) return;
    await updateMember({ id, historial: { zona_id: config().ZONA_0 } });
    refetch();
  } 

  const handleFetchMore = async () => {
    await fetchNextPage();
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
          <FormControl sx={{ width: 200 }} variant="standard">
            <InputLabel htmlFor="zona_native">Zona</InputLabel>
            <Select
              onChange={handleFilterChange}
              disabled={user?.zona !== null}
              value={filtersState?.zona}
              inputProps={{ id: "zona_native", name: "zona" }}
            >
              {zonesLoading && (
                <MenuItem key="0" value="">
                  Cargando...
                </MenuItem>
              )}

              {!zonesError && (
                <MenuItem key={`zones-all`} value={0}>
                  {"TODAS"}
                </MenuItem>
              )}

              {!zonesError &&
                zones?.map(({ id, descripcion }) => (
                  <MenuItem key={`zones-${id}`} value={id}>
                    {descripcion}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

        <FormControl sx={{ width: 300, ml: 2 }} variant="standard">
          <InputLabel htmlFor="supervisor_native">Supervisor</InputLabel>
          <Select
            onChange={handleFilterChange}
            value={filtersState?.supervisor ?? 0}
            inputProps={{ id: "supervisor_native", name: "supervisor" }}
          >
            {supervisorsLoading && (
              <MenuItem key="0" value="">
                Cargando...
              </MenuItem>
            )}

            {!supervisorsError && (
              <MenuItem key={`supervisor-none`} value={0}>
                {"NINGUNO"}
              </MenuItem>
            )}

            {!supervisorsError &&
              supervisors?.map((supervisor: any) => (
                <MenuItem key={`zones-${supervisor?.miembro_id}`} value={supervisor?.miembro_id}>
                  {supervisor.nombre_completo}
                </MenuItem>
              ))}
          </Select>
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

      <Box sx={{ display: "flex", width: "auto", mb: 2, justifyContent: "end" }}>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Buscar Miembro"
            inputProps={{ 'aria-label': 'buscar miembro' }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if(e.target.value === "") setFiltersState((prev) => ({ ...prev, q: undefined }));
            }}

          />
          <IconButton 
            type="button" 
            sx={{ p: '10px' }} 
            aria-label="buscar" 
            onClick={() => {
              setFiltersState((prev) => ({ ...prev, q: search }));
            }}
          >
            <SearchIcon />
          </IconButton>
          <Divider sx={{ height: 27, m: 0.5 }} orientation="vertical" />
          <IconButton 
            color="error" 
            sx={{ p: '10px' }}
            aria-label="delete"
            disabled={search === ""}
            onClick={() => {
              setSearch("");
              setFiltersState((prev) => ({ ...prev, q: undefined }));
            }}
          >
            <CloseIcon />
          </IconButton>
        </Paper>
      </Box>

      <ActionContext.Provider value={{ editMember, handleOpenDialog }}>
        <ListaMiembros miembros={(data?.pages?.flat() || [])} loading={isFetching} onFetchMore={handleFetchMore} />
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

      <Dialog
        open={openEditDialog.open}
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
        aria-labelledby="edit-member-dialog"
      >
        {openEditDialog.id && (
          <EditMember 
            id={openEditDialog.id} 
            isModal={true} 
            onClose={handleCloseEditDialog}
          />
        )}
      </Dialog>
    </Box>
  );
};
