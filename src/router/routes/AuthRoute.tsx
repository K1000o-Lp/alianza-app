import { Outlet, RouteObject } from "react-router-dom";
import { SignIn } from "../../pages/SignIn";
import { Registro } from "../../pages/Registro";
import { PublicRoute } from "../components";

export const AuthRoute: RouteObject = {
  path: "auth",
  element: (
    <PublicRoute>
      <Outlet />
    </PublicRoute>
  ),
  children: [
    {
      index: true,
      path: "signin",
      element: <SignIn />,
    },
    {
      path: "registro",
      element: <Registro />,
    },
  ],
};
