import { Outlet, RouteObject } from "react-router-dom";

import { PrivateRoute } from "../components";
import { Layout } from "../../layout";
import { Home } from "../../pages/Home/view/Home";
import { Miembros } from "../../pages/Miembros/view/Miembros";
import { AddMember } from "../../pages/AddMember/view/AddMember";
import { Attendance } from "../../pages/Asistencias/view/Attendance";
import { Eventos } from "../../pages/Eventos/view/Eventos";
import { EditMember } from "../../pages/EditMember/view/EditMember";
import { ReportesConsolidaciones } from "../../pages/ReportesConsolidaciones/view/ReportesConsolidaciones";

export const MainRoute: RouteObject = {
  path: "/",
  element: (
    <PrivateRoute>
      <Layout>
        <Outlet />
      </Layout>
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <Home />,
    },
    {
      path: "miembros",
      element: <Miembros />,
    },
    {
      path: "miembros/crear",
      element: <AddMember />,
    },
    {
      path: "miembros/:id/editar",
      element: <EditMember />,
    },
    {
      path: "eventos/crear",
      element: <Eventos />,
    },
    {
      path: "asistencias/crear",
      element: <Attendance />
    },
    {
      path: "reportes/consolidaciones",
      element: <ReportesConsolidaciones />,
    },
  ],
};
