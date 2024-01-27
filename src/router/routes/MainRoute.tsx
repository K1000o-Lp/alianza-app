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
      element: <div>dashboard</div>,
    },
  ],
};
