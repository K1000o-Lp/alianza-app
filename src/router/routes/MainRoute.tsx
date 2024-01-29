import { Outlet, RouteObject } from "react-router-dom";
import { PrivateRoute } from "../components";
import { Layout } from "../../layout";

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
      element: <div>Dashboard</div>,
    },
    {
      path: "miembros",
      element: <div>Lista de Miembros</div>,
    },
    {
      path: "reportes",
      element: <div>Reporte de Miembros</div>,
    },
  ],
};
