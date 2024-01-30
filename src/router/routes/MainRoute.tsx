import { Outlet, RouteObject } from "react-router-dom";

import { PrivateRoute } from "../components";
import { Layout } from "../../layout";
import { Home } from "../../pages/Home/view/Home";
import { Miembros } from "../../pages/Miembros/view/Miembros";

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
      path: "reportes",
      element: <div>Reporte de Miembros</div>,
    },
  ],
};
