import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from "@mui/material/Typography";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

import { PersonalForm } from "../components/PersonalForm";
import { ProfessionForm } from "../components/ProfessionForm";

import { MemberForm } from "../../../types";
import { ServiceForm } from "../components/ServiceForm";
import { usePostMembersMutation } from "../../../redux/services";
import { useRouter } from "../../../router/hooks";
import { useAppSelector } from "../../../redux/store";

const steps = [
  "Información personal",
  "Historial profesional",
  "Información del servicio",
];

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <PersonalForm />;
    case 1:
      return <ProfessionForm />;
    case 2:
      return <ServiceForm />;
    default:
      throw new Error("Unknown step");
  }
}

export const AddMember: React.FC = () => {
  const [ activeStep, setActiveStep ] = React.useState<number>(0);
  const { user } = useAppSelector((state) => state.auth);
  const methods = useForm<MemberForm>({ defaultValues: { historial: { zona_id: user?.zona?.id } } });

  const router = useRouter();
  const [postMember, result] = usePostMembersMutation();
  const { data: memberData, isLoading: postMemberLoading, error: memberError } = result;
  const errorMessage = memberError && "data" in memberError ? (memberError.data as { message: string }).message : "Error desconocido";

  const onSubmit: SubmitHandler<MemberForm> = async (data) => postMember(data).unwrap().catch((err) => {console.error(err)});

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNext = async () => {
    const formInputs: any = [
      [
        "cedula",
        "nombre_completo",
        "telefono",
        "fecha_nacimiento",
        "estado_civil_id",
        "hijos",
      ],
      ["educacion_id", "ocupacion_id", "discapacidad_id"],
      [
        "historial.servicio_id",
        "historial.zona_id",
      ],
    ];

    const lastStep = activeStep == formInputs.length - 1 ? true : false;
    const inputs = formInputs[activeStep];
    const isValid = await methods.trigger(inputs);

    if (!isValid) {
      return;
    }

    if (lastStep) {
      await methods.handleSubmit(onSubmit)();
    }

    setActiveStep(activeStep + 1);
  };

  React.useEffect(() => {
    if(result.isSuccess) {
      setTimeout(() => {
        router.reload();
      }, 2500);
    }
  }, [result.isSuccess]);

  return (
    <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
      <FormProvider {...methods}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 1.5, md: 3 }, width: 600, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h5" align="center">
            Pasos
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            result.isError ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Error al registrar miembro.
                </Typography>
                <Typography variant="subtitle1" sx={{mb: 2}}>
                  { errorMessage }
                </Typography>
                <Box width="100%" sx={{ display: "flex", justifyContent: "center" }}>
                  <Button variant="contained" onClick={() => setActiveStep(0)}>Volver a intentar</Button>
                </Box>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Miembro registrado exitosamente.
                </Typography>
                <Typography variant="subtitle1">
                  {memberData?.nombre_completo} ha sido registrada/o exitosamente
                </Typography>
              </React.Fragment> 
            )
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Atrás
                  </Button>
                )}
                <LoadingButton
                  variant="contained"
                  onClick={handleNext}
                  loading={postMemberLoading}
                  disabled={postMemberLoading}
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? "Registrar" : "Siguiente"}
                </LoadingButton>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </FormProvider>
    </Box>
  );
};
