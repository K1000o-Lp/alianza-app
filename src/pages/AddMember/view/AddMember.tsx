import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FormProvider, useForm } from "react-hook-form";

import { PersonalForm } from "../components/PersonalForm";
import { ProfessionForm } from "../components/ProfessionForm";

import { MemberForm } from "../../../types";
import { ServiceForm } from "../components/ServiceForm";

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
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const methods = useForm<MemberForm>({ defaultValues: {} });

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleNext = async () => {
    const formInputs = [
      [
        "cedula",
        "nombre_completo",
        "telefono",
        "fecha_nacimiento",
        "estado_civil_fk_id",
        "hijos",
      ],
      ["educacion_fk_id", "ocupacion_fk_id", "discapacidad_fk_id"],
      [
        "historial.lider_fk_id",
        "historial.supervisor_fk_id",
        "historial.servicio_fk_id",
        "historial.zona_fk_id",
      ],
    ];

    const isValid = await methods.trigger(formInputs[activeStep]);

    if (!isValid) {
      return;
    }

    if (activeStep == formInputs.length - 1) {
    }

    setActiveStep(activeStep + 1);
  };

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
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                Thank you for your order.
              </Typography>
              <Typography variant="subtitle1">
                Your order number is #2001539. We have emailed your order
                confirmation, and will send you an update when your order has
                shipped.
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Atrás
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? "Registrar" : "Siguiente"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </FormProvider>
    </Box>
  );
};
