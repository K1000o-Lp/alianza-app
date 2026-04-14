import { Navigate, useRoutes } from "react-router-dom";
import { AuthRoute, MainRoute } from "./routes";
import { RegistroCompleto } from "../pages/RegistroCompleto/view/RegistroCompleto";
import { EscanearFormacion } from "../pages/EscanearFormacion";

export const Router = () => {
  const router = useRoutes([
    MainRoute,
    AuthRoute,
    { path: "/auth/registro-completo", element: <RegistroCompleto /> },
    { path: "/formacion/escanear", element: <EscanearFormacion /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return router;
};
