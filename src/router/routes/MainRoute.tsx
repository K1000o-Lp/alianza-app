import { Outlet, RouteObject } from "react-router-dom";

import { PrivateRoute } from "../components";
import { Layout } from "../../layout";
import { Home } from "../../pages/Home/view/Home";
import { Miembros } from "../../pages/Miembros/view/Miembros";
import { AddMember } from "../../pages/AddMember/view/AddMember";

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
      path: "miembros/agregar",
      element: <AddMember />,
    },
    {
      path: "reportes",
      element: <div>Reporte de Miembros</div>,
    },
  ],
};
