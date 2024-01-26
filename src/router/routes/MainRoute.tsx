import { Outlet, RouteObject } from "react-router-dom";
import { PrivateRoute } from "../components";

export const MainRoute: RouteObject = {
  path: "/",
  element: (
    <PrivateRoute>
      <Outlet />
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <div>dashboard</div>,
    },
  ],
};
