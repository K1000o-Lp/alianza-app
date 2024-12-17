import * as React from "react";
import Typography from "@mui/material/Typography";
import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  Grid2 as Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useGetRequirementsQuery } from "../../../redux/services";

const requirementsJson: any = {
    1: 'GRUPO DE CONEXION',
    2: 'PRIMEROS PASOS',
    3: 'BAUTISMO',
    4: 'ENCUENTRO',
    5: 'POS ENCUENTRO',
    6: 'DOCTRINAS 1',
    7: 'DOCTRINAS 2',
    8: 'ENTRENAMIENTO LIDERAZGO',
    9: 'LIDERAZGO',
    10: 'ENCUENTRO DE ORACION',
    11: 'LIDER',
  }

export const FormationForm: React.FC = () => {
  const { control, setValue } = useFormContext();
  const [selectedRequirements, setSelectedRequirements] = React.useState<string[]>([]);

  const { data: requirementsData, isLoading: requirementsIsLoading, isError: requirementsError } = useGetRequirementsQuery({}, { refetchOnMountOrArgChange: true });

  const handleMultipleRequirementsChange = (event: SelectChangeEvent<typeof selectedRequirements>) => {
    const { target: { value } } = event;

    setSelectedRequirements(
      typeof value === 'string' ? value.split(',') : value
    );

    setValue('requisito.requisito_ids', typeof value === 'string' ? value.split(',') : value);
  } 

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Procesos de formacion
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 4, md: 8 }}>
            <Controller
                control={control}
                name='requisito.requisito_ids'
                render={({ fieldState: { invalid, error } }) => (
                <FormControl sx={{ mt: 2 }} error={invalid} fullWidth>
                    <InputLabel id="requisito_multiple" htmlFor="requisito_multiple">Requisito</InputLabel>
                    <Select
                    labelId='requisito_multiple'
                    multiple
                    onChange={handleMultipleRequirementsChange}
                    value={selectedRequirements}
                    input={<Input id="requisito_multiple" />}
                    renderValue={(selected) => (
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                            {selected.map((value) => (
                                <Chip key={value} label={requirementsJson[value]} />
                            ))}
                        </Box>
                    )}
                    >
                        <MenuItem key="-1" value="" hidden></MenuItem>

                        {requirementsIsLoading && (
                            <MenuItem key="0" value="">
                            Cargando...
                            </MenuItem>
                        )}

                        {!requirementsError &&
                            requirementsData?.map(({ id, nombre }) => (
                            <MenuItem key={`requisitos-${id}`} value={id}>
                                {nombre}
                            </MenuItem>
                            ))}

                        {!requirementsError && requirementsData?.length === 0 && (
                            <MenuItem key="0" value="">
                            {"No hay requisitos disponibles para consolidar"}
                            </MenuItem>
                        )}  
                    </Select>
                    <FormHelperText>{error?.message}</FormHelperText>
                </FormControl>
                )} 
            />
        </Grid>

        <Grid size={{ xs: 8, md: 4 }} />
      </Grid>
    </React.Fragment>
  );
};
